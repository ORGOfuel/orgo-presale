/* =====================================================================
   ORGO presale: countdown to the drop, hero photo, drop sticker, marquee.
   Runs on its own; reads dates/labels from config.js.
   After launchAt passes, the hero switches from "coming soon" to "out now".
   ===================================================================== */
(function () {
  'use strict';
  const P = (window.ORGO_CONFIG && window.ORGO_CONFIG.presale) || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const launch = new Date(P.launchAt || '2026-12-29T00:00:00-05:00').getTime();

  // labels from config
  $$('[data-drop-label]').forEach(e => { e.textContent = P.dropLabel || '12.29'; });
  $$('[data-ship-note]').forEach(e => { e.textContent = P.shipNote || 'Ships December 29'; });

  // hero photo (placeholder until config.presale.heroImage is set)
  const ph = $('#heroPhoto');
  if (ph && P.heroImage) {
    const img = new Image();
    img.alt = ''; img.decoding = 'async'; img.src = P.heroImage;
    img.onload = () => { ph.classList.add('has-img'); ph.prepend(img); };
  }

  // sticker: text around a circle
  const st = $('#psSticker textPath');
  if (st) st.textContent = st.textContent.replace(/\{drop\}/g, P.dropLabel || '12.29');

  // marquee: duplicate the run so the loop is seamless
  const mq = $('.ps-mq-track');
  if (mq) mq.innerHTML = mq.innerHTML + mq.innerHTML;

  // countdown
  const box = $('#psCount'), units = { d: 864e5, h: 36e5, m: 6e4, s: 1e3 };
  const set = (u, v) => {
    const el = box && box.querySelector(`[data-u="${u}"]`); if (!el) return;
    const t = String(v).padStart(2, '0');
    if (el.textContent !== t) { el.textContent = t; if (!reduce) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); } }
  };
  function live() {
    document.documentElement.classList.add('is-live');
    $$('[data-presale-live]').forEach(e => { e.textContent = e.dataset.presaleLive; });
  }
  function tick() {
    let left = launch - Date.now();
    if (!(left > 0)) { live(); return false; }
    const d = Math.floor(left / units.d); left -= d * units.d;
    const h = Math.floor(left / units.h); left -= h * units.h;
    const m = Math.floor(left / units.m); left -= m * units.m;
    const s = Math.floor(left / units.s);
    set('d', d); set('h', h); set('m', m); set('s', s);
    if (box) box.setAttribute('aria-label', `${d} days, ${h} hours and ${m} minutes until the drop`);
    return true;
  }
  if (tick()) { const t = setInterval(() => { if (!tick()) clearInterval(t); }, 1000); }
})();
