/* =====================================================================
   ORGO pre-checkout survey
   One question per screen, one tap each, skippable. Shown once per browser,
   right after "Claim my preorder" and before Shopify checkout opens.
   Answers are returned to app.js, which attaches them to the Shopify cart as
   order attributes (visible on the order in Shopify admin).
   ===================================================================== */
(function () {
  'use strict';
  const KEY = 'orgo-survey';
  const cfg = () => (window.ORGO_CONFIG && window.ORGO_CONFIG.survey) || {};
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function stored() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }

  // Resolves to { answers: {key: value}, status: 'completed' | 'partial' | 'skipped' } — never rejects.
  function ask() {
    const c = cfg(), Q = (c.questions || []).filter(q => q && q.q && q.options && q.options.length);
    if (!c.enabled || !Q.length) return Promise.resolve({ answers: {}, status: 'off' });
    return new Promise(resolve => {
      const answers = {}; let i = 0, done = false;
      const lastFocus = document.activeElement;
      const root = document.createElement('div');
      root.className = 'sv-scrim';
      root.innerHTML = `<div class="sv-card" role="dialog" aria-modal="true" aria-labelledby="svTitle">
          <div class="sv-head">
            <div><span class="eyebrow" id="svTitle">${esc(c.title || 'Quick question')}</span><small class="sv-sub">${esc(c.subtitle || '')}</small></div>
            <button type="button" class="sv-skip" data-sv-skip>Skip</button>
          </div>
          <div class="sv-prog" aria-hidden="true">${Q.map(() => '<i></i>').join('')}</div>
          <div class="sv-stage">${Q.map((q, k) => `<section class="sv-q" data-k="${k}" aria-hidden="${k ? 'true' : 'false'}">
              <h3>${esc(q.q)}</h3>
              <div class="sv-opts" role="group" aria-label="${esc(q.q)}">${q.options.map(o => `<button type="button" class="sv-opt" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>
            </section>`).join('')}</div>
          <div class="sv-foot"><button type="button" class="sv-back" data-sv-back>← Back</button><span class="sv-count num"></span></div>
        </div>`;
      document.body.appendChild(root);
      const card = root.querySelector('.sv-card'), qs = [...root.querySelectorAll('.sv-q')], bars = [...root.querySelectorAll('.sv-prog i')];
      const show = k => {
        i = k;
        qs.forEach((q, n) => { q.classList.toggle('on', n === k); q.classList.toggle('past', n < k); q.setAttribute('aria-hidden', n === k ? 'false' : 'true'); q.querySelectorAll('button').forEach(b => b.tabIndex = n === k ? 0 : -1); });
        bars.forEach((b, n) => b.classList.toggle('on', n <= k));
        root.querySelector('.sv-count').textContent = `${k + 1} / ${Q.length}`;
        root.querySelector('[data-sv-back]').style.visibility = k ? 'visible' : 'hidden';
        const first = qs[k].querySelector('.sv-opt.sel') || qs[k].querySelector('.sv-opt');
        if (first) setTimeout(() => first.focus({ preventScroll: true }), reduce ? 0 : 260);
      };
      const finish = status => {
        if (done) return; done = true;
        store({ answers, status, at: new Date().toISOString() });
        root.classList.remove('open');
        setTimeout(() => { root.remove(); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }, reduce ? 0 : 280);
        document.removeEventListener('keydown', onKey, true);
        resolve({ answers, status });
      };
      const onKey = e => {
        if (e.key === 'Escape') { e.preventDefault(); finish(Object.keys(answers).length ? 'partial' : 'skipped'); }
        if (e.key === 'Tab') { // keep focus inside the dialog
          const f = [...card.querySelectorAll('button')].filter(b => b.tabIndex !== -1 && b.offsetParent !== null);
          if (!f.length) return; const a = f[0], z = f[f.length - 1];
          if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
        }
      };
      document.addEventListener('keydown', onKey, true);
      root.addEventListener('click', e => {
        const opt = e.target.closest('.sv-opt');
        if (opt) {
          const q = Q[i]; answers[q.key || q.q] = opt.dataset.v;
          opt.parentElement.querySelectorAll('.sv-opt').forEach(b => b.classList.toggle('sel', b === opt));
          setTimeout(() => { if (i < Q.length - 1) show(i + 1); else finish('completed'); }, reduce ? 0 : 240);
          return;
        }
        if (e.target.closest('[data-sv-skip]')) return finish(Object.keys(answers).length ? 'partial' : 'skipped');
        if (e.target.closest('[data-sv-back]')) return show(Math.max(0, i - 1));
        if (e.target === root) return finish(Object.keys(answers).length ? 'partial' : 'skipped');
      });
      show(0);
      requestAnimationFrame(() => root.classList.add('open'));
    });
  }

  // Ask only once per browser; later checkouts reuse the saved answers.
  async function answersForCheckout() {
    const s = stored();
    if (s && s.status && s.status !== 'off') return s;
    return ask();
  }

  window.OrgoSurvey = { ask, answersForCheckout, reset() { try { localStorage.removeItem(KEY); } catch (e) {} } };
})();
