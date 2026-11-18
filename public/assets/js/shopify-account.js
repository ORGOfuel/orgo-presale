/* =====================================================================
   ORGO ⇄ Shopify customer accounts (Customer Account API, public client + PKCE)

   When config.js → customerAccount.clientId is set, the Profile page signs
   shoppers in with their Shopify account and reads/writes real Shopify data:
     • name, email, phone and default shipping address  (read + update)
     • orders with fulfillment status and carrier tracking (read)
   Without a client ID the profile falls back to the on-device profile.

   Setup (Shopify admin → Sales channels → Headless → your storefront →
   Customer Account API settings):
     1. Client type: Public. Copy the Client ID into config.js.
     2. Callback URI: https://YOUR-DOMAIN/  (must match customerAccount.redirectUri,
        or the site's home URL when that is left blank)
     3. JavaScript origin: https://YOUR-DOMAIN
     4. Logout URI: https://YOUR-DOMAIN/
   ===================================================================== */
(function () {
  'use strict';
  const C = window.ORGO_CONFIG || {};
  const S = C.shopify || {};
  const A = C.customerAccount || {};
  const shopDomain = (S.storeDomain || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const enabled = !!(A.clientId && shopDomain);
  const redirectUri = A.redirectUri || (location.origin + location.pathname);
  const KEY = 'orgo-ca-session', PKCE = 'orgo-ca-pkce';

  // ---------- small helpers ----------
  const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const rand = n => b64url(crypto.getRandomValues(new Uint8Array(n)));
  async function challenge(verifier) { return b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))); }
  const getSession = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const setSession = s => { try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch (e) {} };

  // ---------- discovery (endpoints come from the shop, never hard-coded) ----------
  let discovered = null;
  async function discover() {
    if (discovered) return discovered;
    const [oid, api] = await Promise.all([
      fetch(`https://${shopDomain}/.well-known/openid-configuration`).then(r => r.json()),
      fetch(`https://${shopDomain}/.well-known/customer-account-api`).then(r => r.json())
    ]);
    discovered = { authorize: oid.authorization_endpoint, token: oid.token_endpoint, logout: oid.end_session_endpoint, graphql: api.graphql_api };
    return discovered;
  }

  // ---------- sign in / out ----------
  async function login() {
    const d = await discover();
    const verifier = rand(32), state = rand(16), nonce = rand(16);
    try { sessionStorage.setItem(PKCE, JSON.stringify({ verifier, state, back: location.hash || '#profile' })); } catch (e) {}
    const u = new URL(d.authorize);
    u.searchParams.set('scope', 'openid email customer-account-api:full');
    u.searchParams.set('client_id', A.clientId);
    u.searchParams.set('response_type', 'code');
    u.searchParams.set('redirect_uri', redirectUri);
    u.searchParams.set('state', state);
    u.searchParams.set('nonce', nonce);
    u.searchParams.set('code_challenge', await challenge(verifier));
    u.searchParams.set('code_challenge_method', 'S256');
    location.href = u.toString();
  }
  async function tokenRequest(params) {
    const d = await discover();
    const res = await fetch(d.token, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: A.clientId, ...params }) });
    if (!res.ok) throw new Error('token ' + res.status);
    const t = await res.json();
    const s = { access: t.access_token, refresh: t.refresh_token || (getSession() || {}).refresh, idToken: t.id_token || (getSession() || {}).idToken, exp: Date.now() + (t.expires_in || 3600) * 1000 - 60000 };
    setSession(s); return s;
  }
  // Shopify redirects back here with ?code=…&state=… after login
  async function handleCallback() {
    if (!enabled) return false;
    const q = new URLSearchParams(location.search);
    if (!q.get('code') || !q.get('state')) return false;
    let p = null; try { p = JSON.parse(sessionStorage.getItem(PKCE) || 'null'); sessionStorage.removeItem(PKCE); } catch (e) {}
    history.replaceState(null, '', location.pathname + ((p && p.back) || '#profile'));
    if (!p || p.state !== q.get('state')) { console.warn('[ORGO] Sign-in state mismatch, ignoring callback'); return false; }
    try { await tokenRequest({ grant_type: 'authorization_code', redirect_uri: redirectUri, code: q.get('code'), code_verifier: p.verifier }); return true; }
    catch (e) { console.error('[ORGO] Could not finish Shopify sign-in', e); return false; }
  }
  async function token() {
    let s = getSession(); if (!s) return null;
    if (Date.now() > s.exp && s.refresh) { try { s = await tokenRequest({ grant_type: 'refresh_token', refresh_token: s.refresh }); } catch (e) { setSession(null); return null; } }
    return s.access;
  }
  async function logout() {
    const s = getSession(); setSession(null);
    try { const d = await discover(); if (d.logout && s && s.idToken) { const u = new URL(d.logout); u.searchParams.set('id_token_hint', s.idToken); u.searchParams.set('post_logout_redirect_uri', redirectUri); location.href = u.toString(); return; } } catch (e) {}
    location.hash = '#home';
  }

  // ---------- GraphQL ----------
  async function gql(query, variables = {}) {
    const t = await token(); if (!t) throw new Error('signed-out');
    const d = await discover();
    const res = await fetch(d.graphql, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: t }, body: JSON.stringify({ query, variables }) });
    if (res.status === 401) { setSession(null); throw new Error('signed-out'); }
    const j = await res.json();
    if (j.errors && j.errors.length) throw new Error(j.errors.map(e => e.message).join('; '));
    return j.data;
  }
  const CUSTOMER = `query OrgoCustomer {
    customer {
      id firstName lastName creationDate
      emailAddress { emailAddress }
      phoneNumber { phoneNumber }
      defaultAddress { id firstName lastName address1 address2 city zoneCode zip territoryCode phoneNumber }
      orders(first: 20, sortKey: PROCESSED_AT, reverse: true) { nodes {
        id name processedAt
        totalPrice { amount currencyCode }
        lineItems(first: 20) { nodes { title variantTitle quantity } }
        fulfillments(first: 5) { nodes { status latestShipmentStatus estimatedDeliveryAt trackingInformation { company number url } } }
      } }
    } }`;

  // Shopify's own customer-facing order steps: Confirmed → On its way → Out for delivery → Delivered
  function stepOf(order) {
    const f = (order.fulfillments && order.fulfillments.nodes) || [];
    if (!f.length) return 0;
    const s = f.map(x => x.latestShipmentStatus || '');
    if (s.some(v => v === 'DELIVERED' || v === 'PICKED_UP')) return 3;
    if (s.some(v => v === 'OUT_FOR_DELIVERY' || v === 'ATTEMPTED_DELIVERY' || v === 'READY_FOR_PICKUP')) return 2;
    return 1;   // a fulfillment exists: label created, picked up or in transit
  }
  const FLAVORS = [['wild-berries', /berr/i], ['blood-orange', /orange/i], ['blue-pomegranate', /pomegranate/i], ['lemonade', /lemon/i], ['variety', /variety|mix/i]];
  const flavorOf = t => (FLAVORS.find(f => f[1].test(t)) || ['variety'])[0];

  async function load() {
    const d = await gql(CUSTOMER), c = d.customer, a = c.defaultAddress || {};
    return {
      shopify: true,
      name: [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Athlete',
      email: (c.emailAddress && c.emailAddress.emailAddress) || '',
      since: (c.creationDate || new Date().toISOString()).slice(0, 10),
      no: (String(c.id).replace(/\D/g, '').slice(-8).padStart(8, '0').replace(/(\d{4})(\d{4})/, '$1 $2')) + ' 2026',
      addr: { id: a.id, street: a.address1 || '', city: a.city || '', state: a.zoneCode || '', zip: a.zip || '', country: a.territoryCode || 'US', phone: a.phoneNumber || (c.phoneNumber && c.phoneNumber.phoneNumber) || '' },
      logs: { 'wild-berries': 0, 'blood-orange': 0, 'blue-pomegranate': 0, 'lemonade': 0 },
      orders: c.orders.nodes.map(o => {
        const f = (o.fulfillments.nodes || [])[0] || {}, tr = (f.trackingInformation || [])[0] || {};
        return {
          id: o.name, gid: o.id, date: o.processedAt.slice(0, 10), step: stepOf(o),
          eta: f.estimatedDeliveryAt ? f.estimatedDeliveryAt.slice(0, 10) : null,
          total: +o.totalPrice.amount, trackingUrl: tr.url || '', tracking: tr.number ? `${tr.company ? tr.company + ' ' : ''}${tr.number}` : '',
          items: o.lineItems.nodes.map(l => ({ flavor: flavorOf(l.title + ' ' + (l.variantTitle || '')), size: /24/.test(l.variantTitle || l.title) ? 24 : 12, sub: false, qty: l.quantity }))
        };
      })
    };
  }

  // ---------- update details (name, phone, default shipping address) ----------
  const UPDATE_CUSTOMER = `mutation OrgoCustomerUpdate($input: CustomerUpdateInput!) { customerUpdate(input: $input) { userErrors { field message } } }`;
  const UPDATE_ADDRESS = `mutation OrgoAddressUpdate($addressId: ID!, $address: CustomerAddressInput!) { customerAddressUpdate(addressId: $addressId, address: $address, defaultAddress: true) { userErrors { field message } } }`;
  const CREATE_ADDRESS = `mutation OrgoAddressCreate($address: CustomerAddressInput!) { customerAddressCreate(address: $address, defaultAddress: true) { userErrors { field message } } }`;
  async function save(p) {
    const [firstName, ...rest] = (p.name || '').trim().split(/\s+/), lastName = rest.join(' ');
    const errs = [];
    const r1 = await gql(UPDATE_CUSTOMER, { input: { firstName, lastName } });
    errs.push(...((r1.customerUpdate && r1.customerUpdate.userErrors) || []));
    if (p.addr && p.addr.street) {
      const address = { firstName, lastName, address1: p.addr.street, city: p.addr.city, zoneCode: p.addr.state, zip: p.addr.zip, territoryCode: p.addr.country || 'US', phoneNumber: p.addr.phone || null };
      const r2 = p.addr.id ? await gql(UPDATE_ADDRESS, { addressId: p.addr.id, address }) : await gql(CREATE_ADDRESS, { address });
      const k = p.addr.id ? 'customerAddressUpdate' : 'customerAddressCreate';
      errs.push(...((r2[k] && r2[k].userErrors) || []));
    }
    if (errs.length) throw new Error(errs.map(e => e.message).join('; '));
  }

  window.OrgoAccount = { enabled, signedIn: () => enabled && !!getSession(), login, logout, handleCallback, load, save };
})();
