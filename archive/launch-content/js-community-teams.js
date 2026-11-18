/* ---------- TEAMS ---------- */
const TICON = {
  run: '<circle cx="14" cy="4.5" r="2"/><path d="m7 21 3-6 3 2v4M6 12l3-4 4 1 3 4 3 1"/>',
  ball: '<circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3c-3 3-3 15 0 18M12 3c3 3 3 15 0 18"/>',
  gym: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
  bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-7h5l3 7M10 9l-1-3H7M15 9l-3 7"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>',
  tag: '<path d="M3 12V4h8l10 10-8 7Z"/><circle cx="7.5" cy="8.5" r="1.4"/>',
  gift: '<path d="M4 11h16v10H4ZM3 7h18v4H3ZM12 7v14M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0"/>',
  box: '<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9Z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6.5v11"/>',
  cam: '<path d="M3 8h4l2-3h6l2 3h4v11H3Z"/><circle cx="12" cy="13" r="3.5"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  code: '<path d="M4 7h16v10H4Z"/><path d="M8 12h8"/>'
};
const tic = (k, c = '#ffffff') => `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${TICON[k]}</svg>`;
function buildTeams() {
  if ($('#exGrid').children.length) return;
  $('#tmHeroVis').innerHTML =
    `<div class="stackbox" style="--l:56%;--t:66%;--bw:62%;--r:-3deg">${cartonHTML(24)}</div>
     <div class="stackbox" style="--l:46%;--t:40%;--bw:50%;--r:4deg;z-index:2">${cartonHTML(24)}</div>` +
    [['20%', '30%', '-16deg', 'clamp(80px, 9vw, 120px)', 0, '0s'], ['84%', '26%', '14deg', 'clamp(70px, 8vw, 110px)', 3, '-2s'], ['86%', '76%', '-8deg', 'clamp(64px, 7vw, 96px)', 1, '-4s']]
      .map(p => `<div class="hp" style="--l:${p[0]};--t:${p[1]};--r:${p[2]};--pw:${p[3]};--d:${p[5]}"><div class="floaty">${pouchHTML(F[p[4]], 'idle')}</div></div>`).join('');
  const EX = [
    ['run', 'RUN CLUBS', 'Group long runs', 'One pouch per runner at the halfway water stop. Fits in any shorts pocket.', 'linear-gradient(150deg, #A2A1D7, #FFF7EC)', 0],
    ['ball', 'TEAM SPORTS', 'Halftime fuel', 'Soccer, basketball, lacrosse. Hand out at the bench, no shaker bottles.', 'linear-gradient(150deg, #7fa6ff, #2f4fe0)', 2],
    ['gym', 'GYMS & STUDIOS', 'Front-desk retail', 'A countertop box at check-in. Members grab one on the way to class.', 'linear-gradient(150deg, #ffe04a, #22c09b)', 3],
    ['bike', 'CYCLING TEAMS', 'Jersey-pocket fuel', 'Flat pouches stack in the back pocket for long rides and races.', 'linear-gradient(150deg, #ffa15c, #e8386d)', 1],
    ['flag', 'RACES & EVENTS', 'Aid-station supply', 'Bulk boxes for marathons, triathlons and tournaments, delivered before race week.', 'linear-gradient(150deg, #a678ff, #5a34d6)', 0],
    ['star', 'ATHLETES', 'Ambassadors', 'Athletes who train with ORGO and share it with their community.', 'linear-gradient(150deg, #22c09b, #2f4fe0)', 2]
  ];
  $('#exGrid').innerHTML = EX.map((e, i) => `<article class="ex"><div class="ex-img" style="--tbg:${e[4]}"><span class="img-tag">IMAGE PLACEHOLDER</span>
      <div class="tp" style="--l:${50 + (i % 2 ? 12 : -10)}%;--r:${i % 2 ? 10 : -12}deg"><div class="floaty" style="--d:${-i}s">${pouchHTML(F[e[5]], 'idle')}</div></div></div>
      <div class="ex-body"><span class="eyebrow">${tic(e[0], '#5d6380').replace('<svg', '<svg width="15" height="15"')}${e[1]}</span><h3>${e[2]}</h3><p>${e[3]}</p></div></article>`).join('');
  const B = [
    ['tag', 'Up to 35%', 'Off retail pricing', 'Volume pricing on every order, with tiers that grow with your roster.', '#2f4fe0', '#7fa6ff', '#2238a8'],
    ['gift', 'Free', 'Roster samples', 'We send a sample box so your athletes can try every flavor before you order.', '#22c09b', '#ffe04a', '#12896b', '215deg', '58%'],
    ['box', 'Custom', 'Team packs', 'Pick the flavor split and box count per delivery, timed to your season.', '#5a34d6', '#a678ff', '#43249f'],
    ['coin', 'Earn', 'Fundraise with ORGO', 'Clubs can resell at retail and keep the margin for travel, gear or entry fees.', '#e8386d', '#ffa15c', '#b0244f']
  ];
  $('#bftGrid').innerHTML = B.map(b => `<div class="bft" style="--c1:${b[4]};--c2:${b[5]};--c3:${b[6]};${b[7] ? `--ang:${b[7]};--end:${b[8]};` : ''}"><span class="ico">${tic(b[0])}</span><div class="big">${b[1]}</div><h3>${b[2]}</h3><p>${b[3]}</p></div>`).join('');
  const per24 = PRICE[24];
  const T = [
    ['Starter', '5–19 boxes', 20, ['Free roster sample box', 'Ships in 5 business days']],
    ['Club', '20–49 boxes', 28, ['Everything in Starter', 'Custom flavor split', 'Season delivery schedule'], true],
    ['Event & Pro', '50+ boxes', 35, ['Everything in Club', 'Dedicated account manager', 'Event signage and banners']]
  ];
  $('#tiers').innerHTML = T.map(t => { const box = per24 * (1 - t[2] / 100);
    return `<div class="tier${t[4] ? ' pick' : ''}">${t[4] ? '<span class="ribbon">MOST CLUBS PICK</span>' : ''}
      <div class="tier-head"><h3>${t[0]}</h3><span class="min">${t[1]}</span></div>
      <div class="off">${t[2]}%<small> off</small></div>
      <div class="tier-tiles"><div><small>Per 24-pouch box</small><b>${money(box)}</b></div><div><small>Per shot</small><b>${money(box / 24)}</b></div></div>
      <ul>${t[3].map(x => `<li>${x}</li>`).join('')}</ul>
      <a href="#community" class="btn ${t[4] ? 'btn-w' : 'btn-k'}" data-tjump="tmContact">Request ${t[0]} pricing</a></div>`; }).join('');
  const ST = [['Tell us about your team', 'Sport, roster size and season dates. Takes two minutes.'], ['Try the samples', 'We ship a free sample box so everyone can find a flavor.'], ['Set up your account', 'Pick a tier and delivery schedule. Reorder any time.']];
  $('#tmSteps').innerHTML = ST.map((s, i) => `<div style="--fa:${F[i].a};--fb:${F[i].b}"><span class="n">${i + 1}</span><div><b>${s[0]}</b><p>${s[1]}</p></div></div>`).join('');
  const CP = [['bolt', 'First access to new flavors'], ['code', 'Your own discount code to share'], ['cam', 'Featured on ORGO social']];
  $('#commPerks').innerHTML = CP.map(c => `<li><i>${tic(c[0])}</i>${c[1]}</li>`).join('');
  const W = ['linear-gradient(150deg,#5a34d6,#e8386d)', 'linear-gradient(150deg,#22c09b,#ffe04a)', 'linear-gradient(150deg,#2f4fe0,#7fa6ff)', 'linear-gradient(150deg,#ff4d2e,#ffae3d)', 'linear-gradient(150deg,#A2A1D7,#FFF7EC)', 'linear-gradient(150deg,#e8386d,#ffa15c)'];
  $('#commWall').innerHTML = W.map((g, i) => `<div style="--tbg:${g}">${pouchHTML(F[i % 4]).replace('class="pouch ', `style="--r:${(i % 2 ? 10 : -12)}deg" class="pouch `)}<span>#ORGOCOMMUNITY</span></div>`).join('');
  // interactions
  $$('[data-tjump]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    if (a.dataset.amb) $('#tfType').value = 'Becoming an ambassador';
    $('#' + a.dataset.tjump).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  $('#copyMail').addEventListener('click', () => {
    const t = $('#tmEmail').textContent;
    const done = () => { $('#copyMail').textContent = 'Copied'; setTimeout(() => $('#copyMail').textContent = 'Copy', 1600); };
    try { navigator.clipboard.writeText(t).then(done, () => { getSelection().selectAllChildren($('#tmEmail')); }); } catch (e) { getSelection().selectAllChildren($('#tmEmail')); }
  });
  $('#tmForm').addEventListener('submit', e => {
    e.preventDefault();
    const n = $('#tfNote'); n.classList.add('ok');
    n.textContent = `Thanks, ${$('#tfName').value.split(' ')[0]}. This form isn't connected to an inbox yet, so please also email the partnerships address.`;
  });
}

