# ORGO Performance Shot — Presale site

The presale ("coming soon, drops 12.29") version of the ORGO site. It is a static front end deployed on Netlify, with Shopify as the back end for products, prices, checkout, payment, orders and customers.

## Folder map

```
orgo-presale/
├─ public/                    ← what Netlify publishes
│  ├─ index.html              page markup (all pages, hash-routed)
│  ├─ assets/css/site.css     original site styles (unchanged)
│  ├─ assets/css/presale.css  presale additions: hero, countdown, sticker, marquee, survey
│  ├─ assets/js/config.js     ★ the only file you normally edit: Shopify keys, dates, survey
│  ├─ assets/js/shopify.js    Storefront API: live prices, cart → Shopify checkout
│  ├─ assets/js/survey.js     4-tap pre-checkout survey
│  ├─ assets/js/presale.js    countdown, drop labels, hero photo, auto "live" switch
│  ├─ assets/js/app.js        original site app (animations, flips, cart), plus checkout glue
│  ├─ assets/img/             logo, favicon, about photos, tennis "Stock up" photo
│  ├─ models/*.glb            the 4 spinning pouch models
│  └─ posters/*.webp          model loading posters
├─ netlify/functions/waitlist.mjs   footer email form → Shopify customer (server side)
├─ netlify.toml               publish/functions folders, security + cache headers
├─ SHOPIFY_SETUP.md           ★ step-by-step store connection + go-live checklist
└─ archive/
   ├─ launch-content/         reviews, experts and Community, saved verbatim for launch (see its README)
   └─ original/               the full site as it was before the presale changes
```

## Common edits (all in `public/assets/js/config.js`)

| Want to… | Change |
|---|---|
| Connect Shopify | `shopify.storeDomain`, `shopify.storefrontToken` (see SHOPIFY_SETUP.md) |
| Add the hero photo | Put the image in `public/assets/img/` and set `presale.heroImage: 'assets/img/hero.jpg'` |
| Move the drop date/time | `presale.launchAt`, `presale.dropLabel`, `presale.shipNote` |
| Edit survey questions | `survey.questions` (or `survey.enabled: false`) |
| Link customer accounts | `customerAccountUrl` |

Swapping other images: replace the file in `public/assets/img/` with one of the same name.

## Run locally

Any static server works: `npx serve public` or `python3 -m http.server -d public`. The waitlist function needs `netlify dev` (Netlify CLI). Without Shopify keys, the site runs in demo mode: everything works except the final redirect to checkout.


## Deploy (GitHub + Netlify)
1. Put this whole folder in a GitHub repository (e.g. `orgo-presale`). GitHub Desktop: File → Add local repository → Publish repository (private is fine).
2. Netlify → Add new site → Import an existing project → GitHub → pick the repo.
   Build settings come from `netlify.toml` (publish `public`, functions `netlify/functions`, no build command) — leave the fields as they are and click Deploy.
3. Netlify → Site configuration → Environment variables (for the waitlist function):
   - `SHOPIFY_STORE_DOMAIN` = `b00p1g-jc.myshopify.com`
   - `SHOPIFY_ADMIN_ACCESS_TOKEN` = Admin API token (never put this in config.js)
4. Every change pushed to GitHub publishes automatically.
