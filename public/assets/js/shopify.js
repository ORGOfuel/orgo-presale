/* =====================================================================
   ORGO ⇄ Shopify (Storefront API)
   Shopify is the backend for products, prices, inventory, subscriptions,
   orders, payments, taxes, shipping and customer accounts. This file:
     • loads the five products + their 12/24 variants and subscription plans
     • pushes live Shopify prices into the site (window.ORGO_APP.applyPrices)
     • turns the on-site cart into a Shopify cart (cartCreate) with preorder +
       survey details attached, then sends the buyer to Shopify's hosted checkout
     • notices when the buyer comes back after paying and clears the site cart
   No secret keys here: the Storefront *public* token is made for browsers.
   ===================================================================== */
(function () {
  'use strict';
  const C = window.ORGO_CONFIG = window.ORGO_CONFIG || {};

  // Developer override for testing in one browser only:
  // localStorage.setItem('orgo-config-override', JSON.stringify({ shopify: { endpointOverride: 'https://mock.shop/api' }, products: {...} }))
  try {
    const o = JSON.parse(localStorage.getItem('orgo-config-override') || 'null');
    if (o && typeof o === 'object') {
      const merge = (a, b) => { Object.keys(b).forEach(k => { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) { a[k] = a[k] || {}; merge(a[k], b[k]); } else a[k] = b[k]; }); };
      merge(C, o); console.info('[ORGO] Using config override from localStorage', o);
    }
  } catch (e) {}

  const S = C.shopify || {};
  const API_VERSION = S.apiVersion || '2026-10';
  const endpoint = S.endpointOverride || (S.storeDomain ? `https://${S.storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')}/api/${API_VERSION}/graphql.json` : '');
  const enabled = !!endpoint && (!!S.endpointOverride || !!S.storefrontToken);
  const CART_KEY = 'orgo-shopify-cart';

  class OrgoCheckoutError extends Error {
    constructor(message, userMessage) { super(message); this.userMessage = userMessage; }
  }

  async function gql(query, variables = {}) {
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (S.storefrontToken && !S.endpointOverride) headers['X-Shopify-Storefront-Access-Token'] = S.storefrontToken;
    const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
    if (!res.ok) throw new Error(`Shopify responded ${res.status}`);
    const json = await res.json();
    if (json.errors && json.errors.length) throw new Error(json.errors.map(e => e.message).join('; '));
    return json.data;
  }

  /* ---------- catalog ---------- */
  const PLAN_FIELDS = `sellingPlanGroups(first: 5) { nodes { name sellingPlans(first: 12) { nodes { id name options { name value }
      priceAdjustments { orderCount adjustmentValue { __typename
        ... on SellingPlanPercentagePriceAdjustment { adjustmentPercentage }
        ... on SellingPlanFixedAmountPriceAdjustment { adjustmentAmount { amount } }
        ... on SellingPlanFixedPriceAdjustment { price { amount } } } } } } } }`;
  const productFields = withPlans => `id handle title availableForSale
    variants(first: 25) { nodes { id title availableForSale price { amount currencyCode } compareAtPrice { amount } selectedOptions { name value } } }
    ${withPlans ? PLAN_FIELDS : ''}`;
  const productsQuery = (withPlans, withContext) => {
    const ids = Object.entries(C.products || {});
    const ctx = withContext ? ` @inContext(country: ${(S.country || 'US').toUpperCase()})` : '';
    return `query OrgoProducts${ctx} {\n${ids.map(([id, handle], i) => `  p${i}: product(handle: ${JSON.stringify(handle)}) { ${productFields(withPlans)} }`).join('\n')}\n}`;
  };

  const sizeOf = (variant) => {
    const opts = variant.selectedOptions || [];
    const want = (C.sizeOptionName || '').toLowerCase();
    const ordered = [...opts.filter(o => o.name.toLowerCase() === want), ...opts.filter(o => o.name.toLowerCase() !== want)];
    for (const o of ordered.concat([{ value: variant.title || '' }])) {
      const m = String(o.value).match(/(^|\D)(12|24)(\D|$)/);
      if (m) return +m[2];
    }
    return null;
  };
  const weeksOf = (plan) => {
    const text = [plan.name, ...(plan.options || []).map(o => o.value)].join(' ');
    const w = text.match(/(\d+)\s*-?\s*(week|wk)/i); if (w) return +w[1];
    if (/\bweekly\b/i.test(text)) return 1;
    const m = text.match(/(\d+)\s*-?\s*month/i); if (m) return +m[1] * 4;
    if (/\bmonthly\b|\bevery month\b/i.test(text)) return 4;
    return null;
  };
  const planPrice = (plan, base) => {
    // The ongoing subscriber price is the LAST adjustment. Presale plans use two: box 1 at the presale price
    // (orderCount 1), then the subscriber price from box 2 on.
    const list = plan.priceAdjustments || [];
    const adj = list.length && list[list.length - 1].adjustmentValue;
    if (!adj) return base;
    if (adj.__typename === 'SellingPlanPercentagePriceAdjustment') return Math.round(base * (100 - adj.adjustmentPercentage)) / 100;
    if (adj.__typename === 'SellingPlanFixedAmountPriceAdjustment') return Math.round((base - +adj.adjustmentAmount.amount) * 100) / 100;
    if (adj.__typename === 'SellingPlanFixedPriceAdjustment') return +adj.price.amount;
    return base;
  };

  let catalog = null, loadPromise = null, hasPlans = false;
  function load() {
    if (!enabled) return Promise.resolve(null);
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      let data = null, lastErr = null;
      // Try the full query first; fall back for stores/APIs without subscriptions or @inContext.
      for (const [plans, ctx] of [[true, true], [true, false], [false, false]]) {
        try { data = await gql(productsQuery(plans, ctx)); hasPlans = plans; break; } catch (e) { lastErr = e; }
      }
      if (!data) throw lastErr;
      catalog = {};
      Object.keys(C.products || {}).forEach((id, i) => {
        const p = data[`p${i}`];
        if (!p) { console.warn(`[ORGO] Shopify product not found for "${id}" (handle "${C.products[id]}"). Check the handle in config.js and that the product is published to the Headless channel.`); return; }
        const variants = {}, list = p.variants.nodes;
        list.forEach(v => { const n = sizeOf(v); if (n && !variants[n]) variants[n] = { id: v.id, price: +v.price.amount, reg: v.compareAtPrice ? +v.compareAtPrice.amount : 0, currency: v.price.currencyCode, available: v.availableForSale }; });
        if (!variants[12] || !variants[24]) {
          console.warn(`[ORGO] "${p.handle}": couldn't find both a 12 and a 24 pack variant from the option values; using variant order instead.`);
          const pick = v => v && { id: v.id, price: +v.price.amount, reg: v.compareAtPrice ? +v.compareAtPrice.amount : 0, currency: v.price.currencyCode, available: v.availableForSale };
          variants[12] = variants[12] || pick(list[0]);
          variants[24] = variants[24] || pick(list[1] || list[0]);
        }
        const plans = [];
        ((p.sellingPlanGroups && p.sellingPlanGroups.nodes) || []).forEach(g => g.sellingPlans.nodes.forEach(pl => plans.push({ id: pl.id, name: pl.name, weeks: weeksOf(pl), plan: pl })));
        catalog[id] = { id: p.id, handle: p.handle, title: p.title, available: p.availableForSale, variants, plans };
      });
      return prices();
    })().catch(e => { console.error('[ORGO] Could not load products from Shopify:', e); loadPromise = null; return null; });
    return loadPromise;
  }

  // 12/24 one-time prices and subscription prices, taken from the price-source product.
  function prices() {
    const p = catalog && (catalog[C.priceSourceProduct] || catalog[Object.keys(catalog)[0]]);
    if (!p) return null;
    const out = { price: {}, reg: {}, subp: {}, currency: (p.variants[12] || {}).currency };
    [12, 24].forEach(n => {
      const v = p.variants[n]; if (!v) return;
      out.price[n] = v.price; if (v.reg > v.price) out.reg[n] = v.reg;
      const plan = p.plans.find(x => x.weeks === 4) || p.plans[0];
      if (plan) out.subp[n] = planPrice(plan.plan, v.price);
    });
    return out;
  }

  /* ---------- checkout ---------- */
  const CART_CREATE = `mutation OrgoCartCreate($input: CartInput!) {
    cartCreate(input: $input) { cart { id checkoutUrl totalQuantity } userErrors { field message } } }`;

  async function checkout(lines, { attributes = [], note = '' } = {}) {
    if (!enabled) throw new OrgoCheckoutError('Shopify not configured', 'Checkout opens once the store is connected.');
    await load();
    if (!catalog) throw new OrgoCheckoutError('Catalog unavailable', 'We couldn’t reach the store. Please try again in a moment.');
    const shipNote = (C.presale && C.presale.shipNote) || '';
    const flavorName = id => ({ 'wild-berries': 'Wild Berries', 'blood-orange': 'Blood Orange', 'blue-pomegranate': 'Blue Pomegranate', lemonade: 'Lemonade' })[id] || id;
    const cartLines = [], problems = [];
    lines.forEach(l => {
      const p = catalog[l.flavor], v = p && p.variants[l.size];
      if (!v) { problems.push(`no Shopify variant for ${l.flavor} · ${l.size}`); return; }
      const line = { merchandiseId: v.id, quantity: Math.max(1, l.qty | 0), attributes: [] };
      if (shipNote) line.attributes.push({ key: 'Preorder', value: shipNote });
      if (l.custom && Array.isArray(l.mix)) line.attributes.push({ key: 'Mix', value: ['wild-berries', 'blood-orange', 'blue-pomegranate', 'lemonade'].map((id, j) => l.mix[j] ? `${l.mix[j]} ${flavorName(id)}` : '').filter(Boolean).join(', ') });
      if (l.sub) {
        const plan = p.plans.find(x => x.weeks === l.cad);
        if (!plan) { problems.push(`no subscription plan "every ${l.cad} weeks" on ${p.handle}`); return; }
        line.sellingPlanId = plan.id;
      }
      cartLines.push(line);
    });
    if (problems.length) {
      console.error('[ORGO] Checkout setup problem:', problems);
      const subIssue = problems.some(x => x.includes('subscription'));
      throw new OrgoCheckoutError(problems.join('; '), subIssue ? 'Subscriptions aren’t available yet — switch to one-time to preorder now.' : 'Something in your cart isn’t available right now.');
    }
    const input = { lines: cartLines, attributes: attributes.filter(a => a && a.key && a.value != null).map(a => ({ key: String(a.key), value: String(a.value) })) };
    if (note) input.note = note;
    if (!S.endpointOverride) input.buyerIdentity = { countryCode: (S.country || 'US').toUpperCase() };
    const data = await gql(CART_CREATE, { input });
    const r = data.cartCreate;
    if (r.userErrors && r.userErrors.length) throw new OrgoCheckoutError(r.userErrors.map(e => e.message).join('; '), r.userErrors[0].message);
    if (!r.cart || !r.cart.checkoutUrl) throw new OrgoCheckoutError('No checkout URL returned', 'Checkout is unavailable right now. Please try again.');
    try { localStorage.setItem(CART_KEY, JSON.stringify({ id: r.cart.id, at: Date.now() })); } catch (e) {}
    return { checkoutUrl: r.cart.checkoutUrl, cart: r.cart };
  }

  // After paying, Shopify retires the cart: if the cart we sent the buyer to no longer exists, the order went through.
  async function checkReturn() {
    if (!enabled) return null;
    let s = null; try { s = JSON.parse(localStorage.getItem(CART_KEY) || 'null'); } catch (e) {}
    if (!s || !s.id) return null;
    try {
      const d = await gql('query OrgoCart($id: ID!) { cart(id: $id) { id totalQuantity } }', { id: s.id });
      if (d.cart) return 'open';
      localStorage.removeItem(CART_KEY);
      return Date.now() - s.at < 9 * 864e5 ? 'completed' : 'expired';
    } catch (e) { return null; }
  }

  window.OrgoShopify = { enabled, load, checkout, checkReturn, get catalog() { return catalog; }, get hasPlans() { return hasPlans; }, OrgoCheckoutError };
})();
