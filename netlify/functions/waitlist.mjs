/* =====================================================================
   POST /api/waitlist  — footer "Join" form (email + optional SMS)
   Adds/updates the person in Shopify → Customers with marketing consent and tags
   (presale-waitlist, drop-12-20, sms-optin). Runs on Netlify (server side), so the
   Admin API credentials never reach the browser.

   Netlify → Site configuration → Environment variables:
     SHOPIFY_STORE_DOMAIN        your-store.myshopify.com
     SHOPIFY_CLIENT_ID           } from the app you create in Shopify's Dev Dashboard
     SHOPIFY_CLIENT_SECRET       } (scopes: write_customers, read_customers)
   or, if you already have a legacy custom app made before 2026:
     SHOPIFY_ADMIN_ACCESS_TOKEN  shpat_…
   Optional: SHOPIFY_ADMIN_API_VERSION (default 2026-10), WAITLIST_TAGS (comma list)
   ===================================================================== */

const VERSION = process.env.SHOPIFY_ADMIN_API_VERSION || '2026-10';
const SHOP = (process.env.SHOPIFY_STORE_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
let cached = { token: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '', exp: Infinity };

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

async function adminToken() {
  if (cached.token && Date.now() < cached.exp) return cached.token;
  const id = process.env.SHOPIFY_CLIENT_ID, secret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error('Missing SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET (or SHOPIFY_ADMIN_ACCESS_TOKEN)');
  // Client credentials grant (apps created in the Dev Dashboard). Tokens last ~24h, so cache and refresh.
  const res = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret })
  });
  if (!res.ok) throw new Error(`token request failed (${res.status})`);
  const t = await res.json();
  cached = { token: t.access_token, exp: Date.now() + Math.max(60, (t.expires_in || 86400) - 300) * 1000 };
  return cached.token;
}

async function admin(query, variables) {
  const res = await fetch(`https://${SHOP}/admin/api/${VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'X-Shopify-Access-Token': await adminToken() },
    body: JSON.stringify({ query, variables })
  });
  const out = await res.json();
  if (!res.ok || out.errors) throw new Error(JSON.stringify(out.errors || res.status));
  return out.data;
}

const now = () => new Date().toISOString();
const emailConsent = () => ({ marketingState: 'SUBSCRIBED', marketingOptInLevel: 'SINGLE_OPT_IN', consentUpdatedAt: now() });
const smsConsent = () => ({ marketingState: 'SUBSCRIBED', marketingOptInLevel: 'SINGLE_OPT_IN', consentUpdatedAt: now() });

export default async (req) => {
  if (req.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
  if (!SHOP) return json({ ok: false, error: 'not_configured' }, 501);
  let b; try { b = await req.json(); } catch { return json({ ok: false, error: 'bad_json' }, 400); }
  if (b.company) return json({ ok: true }); // honeypot field: bots fill it, people never see it
  const email = String(b.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) return json({ ok: false, error: 'email' }, 400);
  const wantsSms = !!b.sms && !!b.phone;
  const phone = wantsSms ? String(b.phone).replace(/[^\d+]/g, '') : '';
  const e164 = phone ? (phone.startsWith('+') ? phone : (phone.length === 10 ? '+1' + phone : '+' + phone)) : '';
  const tags = ['presale-waitlist', 'drop-12-20', ...(process.env.WAITLIST_TAGS || '').split(',').map(s => s.trim()).filter(Boolean)];
  if (wantsSms) tags.push('sms-optin');
  if (b.source) tags.push(`source:${String(b.source).slice(0, 30).replace(/[^\w-]/g, '')}`);

  try {
    const input = { email, tags, emailMarketingConsent: emailConsent() };
    if (e164) { input.phone = e164; input.smsMarketingConsent = smsConsent(); }
    const c = await admin(`mutation C($input: CustomerInput!) { customerCreate(input: $input) { customer { id } userErrors { field message } } }`, { input });
    const errs = c.customerCreate.userErrors || [];
    if (!errs.length) return json({ ok: true, created: true });

    // Already a customer (or phone already used): find them, add tags + consent instead.
    const f = await admin(`query F($q: String!) { customers(first: 1, query: $q) { nodes { id } } }`, { q: `email:"${email.replace(/"/g, '')}"` });
    const id = f.customers.nodes[0] && f.customers.nodes[0].id;
    if (!id) return json({ ok: false, error: errs.map(e => e.message).join('; ') }, 422);
    await admin(`mutation T($id: ID!, $tags: [String!]!) { tagsAdd(id: $id, tags: $tags) { userErrors { message } } }`, { id, tags });
    await admin(`mutation E($input: CustomerEmailMarketingConsentUpdateInput!) { customerEmailMarketingConsentUpdate(input: $input) { userErrors { message } } }`,
      { input: { customerId: id, emailMarketingConsent: emailConsent() } });
    return json({ ok: true, created: false });
  } catch (err) {
    console.error('waitlist error', err);
    return json({ ok: false, error: 'server' }, 502);
  }
};

export const config = { path: '/api/waitlist' };
