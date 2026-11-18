# Launch content (removed for the presale)

These pieces were taken out of the site for the presale. Each file is a verbatim copy of the original code, so it can go back exactly as it was. The full pre-presale site is in `../original/ORGO_Performance_Shot_before-presale.html`.

| File | What it is | Where it goes back |
|---|---|---|
| `home-reviews-section.html` | Home: athlete quote, average rating, review cards | `public/index.html`, right after the "Stock up with ORGO" banner, before the "Never run out mid-season" band |
| `js-reviews.js` | JS for the athlete-photo pouches and `buildReviews()` | `public/assets/js/app.js`, after `window.ORGO = {...}`, before the MOBILE MENU block |
| `science-experts-section.html` | Science: "What the experts say" | `index.html`, Science page, after the "One pouch. Or two." dose section, before Supplement Facts + FAQ |
| `js-science-experts.js` | Lines inside `buildScience()` that render the expert cards | `app.js`, inside `buildScience()`, after the `#stats` render, before the "chips" orbit code |
| `community-page.html` | The whole `<section data-page="community">` | `index.html`, after the About page section |
| `js-community-teams.js` | TEAMS block (`TICON`, `tic()`, `buildTeams()`) | `app.js`, after `buildScience()`, before the CART block |
| `hero-subscribe-button.html` | Home hero "Subscribe & save up to 10%" button | `index.html`, inside `<div class="hero-ctas">`, right after "Preorder now" |
| `community-nav-links.txt` | The 4 nav links (desktop nav, mobile top icon, footer, mobile menu) | Their original spots in `index.html` |

## Restoring Community: router changes in `app.js`

1. Add `'community'` back to the page list in the ROUTER:
   `if (!['home','shop','product','subscribe','science','community','about'].includes(page)) page = 'home';`
2. Add `if (page === 'community') buildTeams();` next to the other build calls.

## Restoring reviews

`buildReviews` runs on its own as soon as the code loads, so pasting the HTML and JS back is enough.

Some images used by these sections are still inline (base64) in the archived HTML, so they work as-is when pasted back.
