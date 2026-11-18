$('#fqPhoto').insertAdjacentHTML('beforeend', [['62%', '46%', '-10deg', 'clamp(110px, 12vw, 170px)', 0, '0s'], ['32%', '68%', '14deg', 'clamp(70px, 8vw, 110px)', 3, '-2.5s']].map(p => `<div class="fp" style="--l:${p[0]};--t:${p[1]};--r:${p[2]};--w2:${p[3]}"><div class="floaty" style="--d:${p[5]}">${pouchHTML(F[p[4]], 'idle')}</div></div>`).join(''));
/* ---------- REVIEWS ---------- */
const starSvg = c => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" fill="${c}"/></svg>`;
(function buildReviews() {
  const sum = $('.rv-sum .stars'); if (sum) sum.innerHTML = starSvg('#ff4f86').repeat(5);
  $('#rvBars').innerHTML = [5, 4, 3, 2, 1].map((n, i) => `<div><span>${n}★</span><i><b style="--w:${[78, 14, 5, 2, 1][i]}%"></b></i></div>`).join('');
  const R = [
    [F[0], 'Review title', 'Real review text from a verified buyer. Two or three sentences about taste, timing or how it fits their training.', 'Runner'],
    [F[3], 'Review title', 'Real review text from a verified buyer about using a pouch mid-session.', 'Cyclist'],
    [F[1], 'Review title', 'Real review text from a verified buyer about the subscription delivery.', 'CrossFit'],
    [F[2], 'Review title', 'Real review text from a verified buyer about flavor or packaging.', 'Soccer']
  ];
  $('#rvTrack').innerHTML = R.map(r => `<article class="rcard">
      <div class="rcard-top"><div class="stars">${starSvg('#ff6a3d').repeat(5)}</div><span class="rflv" style="--fa:${r[0].a};--fb:${r[0].b}"><i></i>${r[0].name}</span></div>
      <h3>[${r[1]}]</h3><p>[${r[2]}]</p>
      <div class="rcard-who"><b>[First name L.] · ${r[3]}</b><small>✓ Verified buyer</small></div>
    </article>`).join('');
})();
