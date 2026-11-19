# Connecting ORGO presale to Shopify

The site is your front end. Shopify is the back end: products, prices, inventory, payment, checkout, orders, customers and email marketing all live there. The site never touches card data. When someone presses **Claim my preorder**, the site builds a Shopify cart and sends them to Shopify's own checkout.

```
Netlify (orgo site) ──Storefront API──▶ Shopify: products, prices, cart ──▶ Shopify Checkout ──▶ Order
        └─ /api/waitlist (Netlify Function) ──Admin API──▶ Shopify Customers (tags + marketing consent)
```

You only need to edit **one file**, `public/assets/js/config.js`, plus a few Netlify environment variables.

---

## 1. Create the products in Shopify

Create these 5 products. The **handle** (the URL slug, under "Search engine listing") must match `config.js`. You can change the handles in either place, as long as they match.

| Flavor | Handle |
|---|---|
| Wild Berries | `wild-berries` |
| Blood Orange | `blood-orange` |
| Blue Pomegranate | `blue-pomegranate` |
| Lemonade | `lemonade` |
| Variety Pack | `variety-pack` |

Give each product one option called **Pack size**, with the values **12** and **24** (e.g. "12-pack", "24-pack"; the site looks for the number). Prices set here replace the prices on the site automatically; the site reads them from the Lemonade product (`priceSourceProduct`).

**Preorder settings, per variant:**
- Track quantity **on**, and tick **"Continue selling when out of stock"**. This lets people buy before stock arrives. Alternatively, enter your real presale allocation as the stock count, so it sells out when the allocation is gone.
- Every line already carries the note **"Preorder: Ships December 20"**, and this shows on the order. You can also add the same text to the product description.
- In **Settings → Checkout**, you can add an order note so the confirmation email mentions the December 20 ship date.

Make sure the products are published to the **Headless** sales channel (step 2).

### Presale pricing (set these in Shopify; the site reads them live)

| Variant | Price (presale, 10% off) | Compare-at price (regular, shown crossed out) | Subscription price from box 2 (15% off) |
|---|---|---|---|
| 12-pack | **$36.99** | **$41.49** | **$34.99** |
| 24-pack | **$49.99** | **$55.99** | **$46.99** |

- **Compare-at price** creates the crossed-out regular price. It must be the real price you'll charge after launch.
- **Subscriptions: 15% starts with box 2.** Box 1 of every subscription is charged at the presale price ($36.99 / $49.99), the same as a one-time preorder. From box 2 on, subscribers pay $34.99 / $46.99. This way nobody gains anything by subscribing and cancelling after one box.
- How to set it in the subscription app: give each plan **two pricing policies** (Shopify supports this natively; the Shopify Subscriptions app calls it a discount that changes after a number of orders):
  1. **First order:** no discount (the variant price, $36.99 / $49.99).
  2. **After 1 order (from order 2 on):** a **fixed price** of $34.99 (12-pack) / $46.99 (24-pack). Use a fixed price, not "15% off": a percentage would be taken off the variant price, which is already the presale price.
- The site reads the plan's last (ongoing) price for the "$34.99 from box 2" figures, and checkout charges box 1 at the variant price, so the store and the site always match.
- **Shipping:** add a free shipping rate for all orders during the presale (Settings → Shipping and delivery). The site already shows "Free shipping on every preorder".
- **At launch (12.20):** set Price = Compare-at ($41.49 / $55.99) and clear the compare-at. Existing presale subscribers keep their $34.99 / $46.99. New subscribers get your standard plan, e.g. 10%.
- **When plans repeat:** set presale subscriptions so the next delivery is counted from **December 20** (the first ship date), not the order date. After launch, count from the order date.

## 2. Get the Storefront token (public, safe in the browser)

1. In Shopify admin, open **Sales channels → Add → Headless** and install it from the Shopify App Store.
2. **Create storefront**, then copy the **Public access token**.
3. In the Headless channel's storefront settings, enable the permissions for products, product listings, cart and checkouts. These are usually on by default.
4. Fill in `public/assets/js/config.js`:

```js
shopify: {
  storeDomain: 'your-store.myshopify.com',   // the .myshopify.com domain, not your custom one
  storefrontToken: 'PASTE_PUBLIC_TOKEN',
  apiVersion: '2026-10',
  country: 'US',
}
```

That's it: the site switches from demo mode to live. Until these are filled in, the site runs in demo mode: pressing "Claim my preorder" shows *"Checkout opens once the store is connected"*.

## 3. Subscriptions (optional)

The "Claim subscriber pricing" plans (every 2, 4 or 6 weeks) need a subscription app that creates **selling plans**, for example Shopify Subscriptions (free), Recharge, Loop or Skio.

- Create a plan group on each flavor product with delivery intervals of **2, 4 and 6 weeks** and your discount (the site currently advertises up to 10%). The site matches plans by their week count.
- If no selling plans exist, the site still works: subscription lines go to checkout as a one-time purchase, so nobody is blocked.
- **Presale caveat:** a subscription normally bills its first order right away and then counts from that date. Set the first renewal so it lines up with the December 20 ship, or keep subscriptions as one-time preorders until launch. Ask your subscription app's support how to delay the first renewal.

## 4. Waitlist / newsletter form → Shopify customers

The footer email form posts to `/api/waitlist`, a Netlify Function in `netlify/functions/waitlist.mjs`. It creates the customer in Shopify with marketing consent, plus tags (`presale-waitlist`, `drop-12-20`, `sms-optin` if they ticked SMS, `source:…`). If the customer already exists, it adds the tags and updates their consent. You can email them with **Shopify Email** or Klaviyo.

This needs an **Admin API** credential, which must stay secret. It goes in Netlify, never in `config.js`.

1. Go to **Shopify Dev Dashboard → Create app**, configure the Admin API scopes **`write_customers`** and **`read_customers`**, then install it on your store.
2. In **Netlify → Site configuration → Environment variables**, add:

| Variable | Value |
|---|---|
| `SHOPIFY_STORE_DOMAIN` | `your-store.myshopify.com` |
| `SHOPIFY_CLIENT_ID` | the app's Client ID |
| `SHOPIFY_CLIENT_SECRET` | the app's Client secret |
| `SHOPIFY_ADMIN_API_VERSION` | optional, defaults to `2026-10` |
| `WAITLIST_TAGS` | optional extra tags, comma-separated |

*(If you have an older custom app with a fixed `shpat_…` token, set `SHOPIFY_ADMIN_ACCESS_TOKEN` instead of the client ID and secret.)*

3. Redeploy so the function picks up the variables.

## 5. Customer accounts

The account icon goes to Shopify's customer accounts. Set `customerAccountUrl` in `config.js`, e.g. `https://shopify.com/12345678/account` or `https://account.yourdomain.com`. You can find it in **Settings → Customer accounts**. If it is left blank, the icon shows *"Accounts open soon — your preorder receipt comes by email"*.

### Profile page ⇄ Shopify customer accounts

The **Profile** page shows the ID card, current order with tracking, order history and the shopper's details. It can run two ways:

**Connected to Shopify (recommended).** Shoppers sign in with their Shopify customer account. The page then reads and writes real Shopify data through the Customer Account API:
- **Details:** name, phone and default shipping address. Changes save straight to the customer in Shopify. Email is the sign-in identity, so it's shown but can't be edited here.
- **Orders:** every order with its Shopify order number, total and items.
- **Tracking:** the steps match Shopify's own order-status page (**Confirmed → On its way → Out for delivery → Delivered**), driven by the fulfillment's shipment status. It also shows the carrier and tracking number, and "Track package" opens the carrier's tracking link.

To set it up:
1. **Settings → Customer accounts:** use the new customer accounts.
2. **Sales channels → Headless → your storefront → Customer Account API settings:**
   - Client type: **Public**
   - Callback URI: `https://YOUR-DOMAIN/`
   - JavaScript origin: `https://YOUR-DOMAIN`
   - Logout URI: `https://YOUR-DOMAIN/`
3. Copy the **Client ID** into `config.js` → `customerAccount.clientId`. The Storefront `storeDomain` must already be set.

**Not connected.** The profile is saved in the shopper's browser. Orders placed on this device appear in it, and the thank-you animation still plays after checkout. Shopify still emails receipts and tracking.

Either way, every order carries a "Preorder reference" attribute in Shopify.

## 6. Survey answers → orders and customer tags

Answers from the 4-question survey are saved on the cart as **order attributes**. In Shopify admin, open an order and they appear under **Additional details** (Sport, Training days, Flavor to try, Heard about ORGO, and Survey = completed/partial/skipped). They're exportable with orders.

To turn them into **customer segments**, use **Shopify Flow** (free):
- Trigger: *Order created*
- Action: *Add customer tags*, e.g. `sport:{{order.customAttributes | where: "key", "Sport" | map: "value" | first}}`

You can then build segments like "Tennis players who heard about us on TikTok" for post-launch emails.

To change the questions, edit `survey.questions` in `config.js`. Set `survey.enabled: false` to turn the survey off.

## 7. Deploy on Netlify with your domain

1. Drag the whole `orgo-presale` folder into **Netlify → Add new site → Deploy manually**, or connect it to a Git repo. Netlify reads `netlify.toml` (publish folder `public`, functions folder `netlify/functions`). Note that drag-and-drop doesn't run functions from all plans/setups; a Git deploy or the Netlify CLI (`netlify deploy --prod`) always does.
2. **Domain management → Add domain** (e.g. `orgofuel.com`), then follow Netlify's DNS steps. HTTPS is automatic.
3. Optional: in Shopify, add `checkout.orgofuel.com` (or `shop.`) as a domain so checkout shows your brand domain. Don't point your root domain at Shopify; the root stays on Netlify.

## 8. Go-live checklist

- [ ] `config.js` has the store domain and Storefront token; the site no longer shows the demo message.
- [ ] All 5 handles resolve, and prices on the site match Shopify.
- [ ] Place a test order with **Bogus Gateway** (Settings → Payments → test mode). Check that the order shows "Preorder: Ships December 20" and the survey answers.
- [ ] After the test checkout, return to the site: the cart is cleared and "Preorder confirmed!" shows.
- [ ] The footer form creates a tagged customer in Shopify.
- [ ] The account icon opens Shopify login.
- [ ] Turn off test mode.

## Launch timing

The countdown targets `presale.launchAt: '2026-12-20T00:00:00-05:00'` (midnight Eastern). Change it in `config.js` if you drop at a different time or zone. When it hits zero, the site switches to "live" wording automatically.

## Testing without a store

In the browser console you can point the site at Shopify's public demo store to watch the API calls work:
```js
localStorage.setItem('orgo-config-override', JSON.stringify({ shopify: { endpointOverride: 'https://mock.shop/api' } }))
```
The demo store doesn't have ORGO products, so the catalog won't match. To return to normal, run `localStorage.removeItem('orgo-config-override')`.
