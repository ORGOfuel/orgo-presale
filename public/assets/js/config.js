/* =====================================================================
   ORGO presale — site settings
   This is the only file you need to edit to connect the site to Shopify.
   Everything here is safe to be public (the Storefront token is a PUBLIC
   token, made for browsers). Never put an Admin API token or client
   secret in this file — those go in Netlify environment variables.
   ===================================================================== */
window.ORGO_CONFIG = {

  /* ---------- Shopify (Storefront API) ---------- */
  shopify: {
    // Your *.myshopify.com domain, e.g. 'orgo-fuel.myshopify.com'. Leave empty = demo mode (no real checkout).
    storeDomain: 'b00p1g-jc.myshopify.com',
    // Public access token from Shopify admin → Sales channels → Headless → your storefront → Storefront API.
    storefrontToken: '5b2cb14de57b1edebed2a90b09e45f62',
    // Storefront API version (Shopify releases a new one every quarter; 2026-10 is the latest stable).
    apiVersion: '2026-10',
    // Two-letter country used for prices and checkout.
    country: 'US',
    // Testing only: point at Shopify's public demo store ('https://mock.shop/api') to try the cart flow
    // before your own store is set up. Leave empty for real use.
    endpointOverride: ''
  },

  /* Shopify product handles for each flavor (Products → open product → "Search engine listing" shows the handle).
     Each product needs two variants for the pack size, e.g. an option "Pack size" with values "12" and "24"
     (any value that contains 12 / 24 works: "12 pouches", "24-pack", …).
     These match the handles Shopify creates automatically from the titles Wild Berries, Blood Orange,
     Blue Pomegranate, Lemonade and Variety Pack. */
  products: {
    'wild-berries':     'wild-berries',
    'blood-orange':     'blood-orange',
    'blue-pomegranate': 'blue-pomegranate',
    'lemonade':         'lemonade',
    'variety':          'variety-pack'
  },
  // Name of the product option that holds the pack size (only used to pick the right variant; matching is forgiving).
  sizeOptionName: 'Pack size',
  // Live prices: when connected, the site reads the 12/24 prices from Shopify (this flavor's product) instead of the defaults in app.js.
  priceSourceProduct: 'lemonade',

  /* ---------- Presale ---------- */
  presale: {
    // When the drop happens (the countdown counts down to this moment). 12:00 AM Eastern on December 20, 2026.
    launchAt: '2026-12-20T00:00:00-05:00',
    dropLabel: '12.20',
    shipNote: 'Ships December 20',          // shown on product page, cart and attached to every order line
    // Hero background photo. Leave empty to show the placeholder; set to e.g. 'assets/img/hero.jpg' once you have it.
    heroImage: ''
  },

  /* ---------- Customer accounts ----------
     Shopify-hosted customer accounts (order status, preorder tracking). Find it in Shopify admin →
     Settings → Customer accounts (looks like https://shopify.com/<shop-id>/account). Empty = the account icon
     shows "Accounts open soon". */
  customerAccountUrl: 'https://shopify.com/96800375085/account',

  /* ---------- Subscription management ----------
     The "Your subscription" card on the Profile page. Paste the customer portal link of the subscription app
     you use in Shopify (Shopify Subscriptions: https://shopify.com/<shop-id>/account/subscriptions ·
     Recharge / Skio / Loop: their customer portal link). With it, Change flavor or size, Change timing and
     Cancel open the real subscription in Shopify. Empty = falls back to customerAccountUrl; if both are
     empty (preview), changes are saved on this device only. */
  subscriptionPortalUrl: '',

  /* ---------- Shopify sign-in on the Profile page (Customer Account API) ----------
     Shopify admin → Sales channels → Headless → your storefront → Customer Account API:
     set the client to Public and paste its Client ID here. With it, the Profile page signs in with the
     shopper's Shopify account and shows/updates their real details, orders and tracking.
     Empty = profile is kept on the shopper's device only. See SHOPIFY_SETUP.md. */
  customerAccount: {
    clientId: '',
    redirectUri: '',   // blank = this site's home URL (must also be added as a Callback URI in Shopify)
  },

  /* ---------- Email / SMS drop list (footer form) ----------
     Netlify Function that adds the person to Shopify Customers with marketing consent + tags.
     Works once the Netlify environment variables in SHOPIFY_SETUP.md are set. */
  waitlistEndpoint: '/api/waitlist',

  /* ---------- Pre-checkout survey ----------
     Shown once, right after the customer taps "Claim my preorder" and before Shopify checkout opens.
     Every question is one tap and can be skipped. Answers are saved on the Shopify order (Order → Additional details)
     as order attributes, so every answer is tied to a real purchase. Edit freely; keep it to 3–5 questions. */
  survey: {
    enabled: true,
    title: 'Help us build your drop',
    subtitle: '4 quick taps. Skip any time.',
    questions: [
      { key: 'Sport', q: 'What do you train for?',
        options: ['Running', 'Lifting & gym', 'Tennis & pickleball', 'Team sports', 'Cycling & tri', 'Something else'] },
      { key: 'Training days', q: 'How often do you train?',
        options: ['1–2 days a week', '3–4 days a week', '5–6 days a week', 'Every day'] },
      { key: 'Flavor to try', q: 'Which flavor are you most excited to try?',
        options: ['Wild Berries', 'Blood Orange', 'Blue Pomegranate', 'Lemonade', 'Can’t pick — all of them'] },
      { key: 'Heard about ORGO', q: 'How did you hear about ORGO?',
        options: ['Instagram', 'TikTok', 'Pinterest', 'Facebook', 'Friend or teammate', 'Coach, club or gym', 'At an event', 'Other'] }
    ]
  }
};
