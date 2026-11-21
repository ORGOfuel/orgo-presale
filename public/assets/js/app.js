/* ORGO site app (original interactions + animations), presale build. Shopify glue: see 'PRESALE + SHOPIFY'. */
(() => {
const F = [
  { id: 'wild-berries', tx: 24.2, tl: 38.1, name: 'Wild Berries', a: '#b8121e', c: '#8b1142', b: '#55096e', k: '#a3101c', k2: '#6b0d5e', st: '#a8239a', sh: '#9b2fb5', pt: '#ffffff', t1: '#f7d0d6', t2: '#e6cdf0', cal: 20, bar: '8 84400 43132 5',
    ing: 'Water, sodium citrate, potassium citrate, magnesium glycinate, erythritol, citric acid, DL-malic acid, potassium sorbate (preservative), mixed berry flavor, sucralose, red grape juice concentrate, blueberry juice concentrate, cranberry juice concentrate, taurine.', note: 'Blackberry and raspberry with a tart finish.' },
  { id: 'blood-orange', tx: 22.1, tl: 42.5, name: 'Blood Orange', a: '#ffc61f', c: '#f0541a', b: '#d6061c', k: '#d60a1c', k2: '#c4061a', st: '#ff9f1c', sh: '#ffc61f', pt: '#ffffff', t1: '#ffe6c2', t2: '#ffd2d2', cal: 20, bar: '8 84400 35417 4',
    ing: 'Water, sodium citrate, potassium citrate, magnesium glycinate, erythritol, citric acid, DL-malic acid, potassium sorbate (preservative), orange flavor, sucralose, blood orange juice concentrate, orange juice concentrate, taurine.', note: 'Bright citrus up front, bitter orange at the end.' },
  { id: 'blue-pomegranate', tx: 21.5, tl: 46.5, name: 'Blue Pomegranate', a: '#f7cfe4', c: '#8d86d9', b: '#2b1fd0', k: '#2a1fb8', k2: '#2a1fb8', st: '#6d63e0', sh: '#8a5cf0', pt: '#ffffff', t1: '#fadcec', t2: '#d8d5ff', cal: 20, bar: '8 84400 91556 6',
    ing: 'Water, sodium citrate, potassium citrate, magnesium glycinate, erythritol, citric acid, DL-malic acid, potassium sorbate (preservative), pomegranate flavor, sucralose, blueberry juice concentrate, blueberry flavor, raspberry flavor, lemon juice concentrate, red grape juice concentrate, cranberry juice concentrate, pomegranate juice concentrate, taurine.', note: 'Deep pomegranate with a cool blueberry edge.' },
  { id: 'lemonade', tx: 22.6, tl: 32.4, bt: '#1d1f14', name: 'Lemonade', a: '#f7f15c', c: '#a6ee8c', b: '#45e6d0', k: '#c9a200', k2: '#e3d84a', st: '#e4ea7a', sh: '#e8d83a', pt: '#ffffff', t1: '#fbf6b8', t2: '#c6f6ee', cal: 15, bar: '8 84400 04393 1',
    ing: 'Water, sodium citrate, potassium citrate, magnesium glycinate, erythritol, citric acid, DL-malic acid, potassium sorbate (preservative), lemon flavor, sucralose, lemon juice concentrate, taurine, powdered lemon flavor.', note: 'Fresh-squeezed lemon, bright and zesty.' }
];
const VARIETY = { id: 'variety', tx: 28, tl: 22, name: 'Variety', a: '#ffc61f', c: '#d6061c', b: '#2b1fd0', k: '#d60a1c', k2: '#6b0d5e', st: '#ff9f1c', sh: '#ffc61f', pt: '#ffffff', t1: '#ffe6c2', t2: '#d8d5ff', cal: 20, bar: '8 84400 00000 0', ing: '', note: 'All four flavors in one box. Find your favorite.' };
const ALL = [...F, VARIETY];
const byId = id => ALL.find(f => f.id === id);
// REG = regular price (shown crossed out) · PRICE = presale one-time price · SUBP = presale subscription price
// With Shopify connected: REG = variant "compare-at price", PRICE = variant price, SUBP = selling plan price.
const REG = { 12: 41.49, 24: 55.99 };
const PRICE = { 12: 36.99, 24: 49.99 };
const SUBP = { 12: 34.99, 24: 46.99 };
// the percentages we advertise (each real saving is this or a little more)
const PRESALE_PCT = 10, SUB_PCT = 15;
const subPct = () => SUB_PCT;
const pctMax = () => SUB_PCT;
const PRESALE_TAG = 'Presale price · ends 12.29';
// Every price or "save X%" shown in plain text follows the real prices (which the admin can change)
function fillPrices() {
  const put = (sel, v) => $$(sel).forEach(e => { e.textContent = v; });
  put('.js-pct', pctMax()); put('.js-ppct', PRESALE_PCT); put('.js-r12', money(REG[12])); put('.js-r24', money(REG[24])); put('.js-p12', money(PRICE[12])); put('.js-p24', money(PRICE[24])); put('.js-s12', money(SUBP[12])); put('.js-s24', money(SUBP[24]));
}
const CAD = [4, 6];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const money = n => '$' + n.toFixed(2);
const fvars = f => `--a:${f.a};--b:${f.b};--c:${f.c || f.a};--k:${f.k || f.b};--k2:${f.k2 || f.b};--st:${f.st || f.a};--sh:${f.sh || f.a};--bt:${f.bt || '#fff'};--pt:${f.pt};--fa:${f.a};--fb:${f.b};--ft1:${f.t1}`;
// the real ORGO logo, shared by every pouch
try { const lg = document.querySelector('.logo-img'); if (lg) document.documentElement.style.setProperty('--pklogo', `url("${lg.src}")`); } catch (e) {}

/* ---------- real 3D pouch (model-viewer + GLB) ---------- */
const MV_ATTR = 'interaction-prompt="none" touch-action="pan-y" tone-mapping="neutral" environment-image="neutral" exposure="1" shadow-intensity="0" camera-orbit="0deg 82deg auto" min-camera-orbit="auto 45deg auto" max-camera-orbit="auto 120deg auto"';
customElements.whenDefined('model-viewer').then(() => { const M = customElements.get('model-viewer'); M.minimumRenderScale = 1; M.dracoDecoderLocation = 'https://cdn.jsdelivr.net/npm/three@0.172.0/examples/jsm/libs/draco/gltf/'; });
// models/<flavor>.glb on the live site; the preview page carries them inline (window.GLB_INLINE) as blob URLs
const MV_URL = {};
function mvSrc(id) {
  if (MV_URL[id]) return MV_URL[id];
  const b64 = window.GLB_INLINE && window.GLB_INLINE[id];
  if (b64) { const bin = atob(b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); MV_URL[id] = URL.createObjectURL(new Blob([u8], { type: 'model/gltf-binary' })); window.GLB_INLINE[id] = null; return MV_URL[id]; }
  return MV_URL[id] = `models/${id}.glb`;
}
function mvHTML(f, cls = '', extra = '') {
  return `<model-viewer class="mv ${cls}" src="${mvSrc(f.id)}" poster="posters/${f.id}.webp" alt="ORGO Sport Nutrition Shot – ${f.name}" ${MV_ATTR} ${extra}></model-viewer>`;
}
const posterIMG = (f, cls = '') => `<img class="mv-poster ${cls}" src="posters/${f.id}.webp" alt="ORGO ${f.name} pouch" loading="lazy" draggable="false">`;
let pkN = 0;
function pouchHTML(f, cls = '') {
  return `<div class="pouch ${cls}${f.id === 'variety' ? ' pv' : ''}" style="${fvars(f)}"><span class="edge e1"></span><span class="edge e2"></span><span class="edge e3"></span>
    <div class="pf front"><span class="pk-logo" role="img" aria-label="ORGO"></span>
      <svg class="pk-lbl" viewBox="0 0 100 218.8" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="pkg${++pkN}"><stop offset="0" class="tgs1"/><stop offset="1" class="tgs2"/></linearGradient></defs>
        <text class="cn" x="15.5" y="94.85" font-size="7.8" textLength="69.9" lengthAdjust="spacingAndGlyphs">SPORT NUTRITION SHOT</text>
        <text class="bd" x="15.5" y="100.05" font-size="4.05" textLength="33.4" lengthAdjust="spacingAndGlyphs">Dietary Supplement</text>
        <polygon points="17,102.3 77,102.3 70,113.8 17,113.8" fill="url(#pkg${pkN})"/>
        <polygon class="stp" points="78,102.3 82,102.3 75,113.8 71,113.8"/>
        <text class="tg pk-flv" x="${f.tx || 22.2}" y="110.8" font-size="8.2" textLength="${f.tl || 40}" lengthAdjust="spacingAndGlyphs">${f.name}</text>
        <text class="cn" x="15.3" y="122.4" font-size="7.3" font-weight="500" textLength="70.1" lengthAdjust="spacingAndGlyphs">Protein  |  Creatine  |  Electrolyte</text>
        <rect x="15.3" y="125.7" width="70.3" height=".45" fill="#fff"/>
        <text class="it shd" x="15.6" y="136.6" font-size="9.2" textLength="70.4" lengthAdjust="spacingAndGlyphs">FORMULATED FOR</text>
        <text class="it" x="15" y="136.1" font-size="9.2" textLength="70.8" lengthAdjust="spacingAndGlyphs">FORMULATED FOR</text>
        <text class="it shd" x="16" y="151.4" font-size="16.4" textLength="70.4" lengthAdjust="spacingAndGlyphs">ATHLETES</text>
        <text class="it" x="15" y="150.6" font-size="16.4" textLength="70.8" lengthAdjust="spacingAndGlyphs">ATHLETES</text>
        <text class="bd" x="15.3" y="157.6" font-size="4.6" textLength="70.6" lengthAdjust="spacingAndGlyphs">All-in-one for pre- &amp; post-training,</text>
        <text class="bd" x="15.4" y="162.7" font-size="4.6" textLength="44.5" lengthAdjust="spacingAndGlyphs">games and workouts.</text>
        <text class="cn" x="12.5" y="176.4" font-size="3.6" font-weight="500" textLength="74.3" lengthAdjust="spacingAndGlyphs">ORGANIC PROTEIN  •  CREATINE MONOHYDRATE</text>
        <text class="cn" x="18.7" y="182.16" font-size="3.6" font-weight="500" textLength="62.5" lengthAdjust="spacingAndGlyphs">SODIUM  •  MAGNESIUM  •  POTASSIUM</text>
        <rect x="12.5" y="186.45" width="74.9" height="11.65" rx="1.7" fill="#fff"/>
        <text class="pl" x="17.3" y="195.4" font-size="8.6" textLength="65.6" lengthAdjust="spacingAndGlyphs">Sugar FREE  |  0 CAFFEINE</text>
        <rect x="18.7" y="204.46" width="10.2" height=".25" fill="#fff"/><rect x="70.8" y="204.46" width="10.2" height=".25" fill="#fff"/>
        <text class="bd" x="34.2" y="205.6" font-size="3.6" font-weight="400" textLength="31.3" lengthAdjust="spacingAndGlyphs">Net 0.68 fl oz (20mL)</text>
      </svg>
      <span class="sheen"></span></div>
    <div class="pf back">
      <div class="pk-facts"><b>Supplement Facts</b><div class="sv">Serving Size 1 Pouch (20 mL)<br>Servings Per Container 1</div>
        <span class="hd"><em></em><em>Amount Per Serving</em><em>% Daily Value*</em></span>
        <span><em>Calories</em><em class="pk-cal">${f.cal || 20}</em><em></em></span><span><em>Total Carbohydrate</em><em>2 g</em><em>1%</em></span><span><em>Protein</em><em>4 g</em><em></em></span>
        <span><em>Vitamin C</em><em>20 mg</em><em>22%</em></span><span><em>Magnesium</em><em>17 mg</em><em>4%</em></span><span><em>Sodium</em><em>170 mg</em><em>7%</em></span><span class="tk"><em>Potassium</em><em>49 mg</em><em>1%</em></span>
        <span><em>Fish Collagen Peptides</em><em>4 g</em><em>†</em></span><span><em>Creatine</em><em>300 mg</em><em>†</em></span>
        <small>*Percent Daily Values are based on a 2,000 calorie diet.<br>†Daily Value (DV) not established.</small></div>
      <p class="pk-txt"><b>Other ingredients:</b> <span class="pk-ingr">${f.ing || ''}</span><br><b>Contains: fish (tilapia)</b><br><b>Suggested use:</b> Shake well before use. Consume pouch (20 mL) approximately 30–60 minutes before exercise or within 60 minutes after exercise. For daily routine use, a recommended intake of 2 pouches per day. Drink with adequate water.<br><b>Warning: consult a healthcare professional before use if pregnant, nursing, taking medication, or managing a medical condition. Keep out of reach of children.</b></p>
      <p class="pk-fda">*This statement has not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.</p>
      <span class="sheen"></span></div>
  </div>`;
}

/* ---------- state ---------- */
let cart = [];
try { cart = JSON.parse(localStorage.getItem('orgo-cart') || '[]'); } catch (e) { cart = []; }
cart.forEach(l => { if (l.sub && ![4, 6].includes(l.cad)) l.cad = 4; });   // 2-week plan retired
const save = () => { try { localStorage.setItem('orgo-cart', JSON.stringify(cart)); } catch (e) {} };
let shopSize = 12;

/* ---------- HERO float ---------- */
const fan = $('#fan');
const flPos = [ // far → back → mid → front: nearer pouches are larger and sit lower
  { l: '14%', t: '34%', r: '-14deg', ry: '28deg',  zi: 1, bl: '0.6px', pw: 'clamp(120px, 11vw, 160px)',   dy: '-200px', d: '0s' },
  { l: '37%', t: '45%', r: '9deg',   ry: '-12deg', zi: 3, bl: '0px',   pw: 'clamp(160px, 15vw, 215px)',   dy: '-110px', d: '-1.6s' },
  { l: '61%', t: '54%', r: '-6deg',  ry: '16deg',  zi: 4, bl: '0px',   pw: 'clamp(190px, 18.5vw, 265px)', dy: '-60px',  d: '-3.2s' },
  { l: '85%', t: '39%', r: '17deg',  ry: '-26deg', zi: 2, bl: '0.3px', pw: 'clamp(135px, 12.5vw, 180px)', dy: '-160px', d: '-4.4s' }
];
fan.insertAdjacentHTML('beforeend', F.map((f, i) => { const p = flPos[i];
  return `<a href="#flavor-${f.id}" class="fl" style="--l:${p.l};--t:${p.t};--r:${p.r};--ry:${p.ry};--zi:${p.zi};--bl:${p.bl};--pw:${p.pw};--dy:${p.dy};--d:${p.d}" aria-label="${f.name}"><div class="floaty">${pouchHTML(f, 'idle')}</div></a>`; }).join(''));
if (!reduce && matchMedia('(pointer:fine)').matches) {
  $('#hero').addEventListener('pointermove', e => {
    const r = fan.getBoundingClientRect();
    fan.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3));
    fan.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3));
  });
  $('#hero').addEventListener('pointerleave', () => { fan.style.setProperty('--mx', 0); fan.style.setProperty('--my', 0); });
}
function sizeFan() {}

/* ---------- stat slabs ---------- */
const ICON = {
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/><path d="M9 14.5a3 3 0 0 0 3 3"/>',
  cube: '<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9Z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/><path d="M3 3l18 18"/>',
  thin: '<path d="M4 9.5h16M4 14.5h16"/><path d="M12 2.5v4.5m0 0-2-2m2 2 2-2M12 21.5V17m0 0-2 2m2-2 2 2"/>'
};
const svg = (k, cls = '', sw = 1.8) => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;
// little scenes for the three steps
function stepVis(i, f) {
  const p = pouchHTML(f, 'idle');
  if (i === 0) return `<div class="sv-tear"><div class="tp-body">${p}</div><div class="tp-top">${p}</div><i class="tp-spark"></i></div>`;
  if (i === 1) return `<div class="sv-sq" style="--dc1:${f.a};--dc2:${f.b}"><i class="sq-ar l"></i><div class="sq-p"><div class="tp-body">${p}</div><span class="sq-drops"><i></i><i></i><i></i><i></i></span></div><i class="sq-ar r"></i></div>`;
  return `<div class="sv-go"><span class="go-lines"><i></i><i></i><i></i><i></i></span><div class="go-p">${p}</div></div>`;
}
const slabData = [
  ['Tear', '4', 'mm', 'thin', 'Rip at the notch. Flat enough for a glove, a waistband or a jersey pocket.', '#5a34d6', '#a678ff', '#43249f', '-12deg', 'thin'],
  ['Squeeze', '20', 'mL', 'per pouch', 'One squeeze, one serving. Goes down in a single pass. No measuring, no mixing.', '#22c09b', '#ffe04a', '#12896b', '-6deg', 'drop'],
  ['Go', '0', 'g', 'added sugar', 'Sits easy mid-effort. The empty pouch goes back in your pocket. Keep moving.', '#e8386d', '#ffa15c', '#b0244f', '0deg', 'cube']
];
$('#slabs').innerHTML = slabData.map((d, i) => `<div class="slab" style="--c1:${d[5]};--c2:${d[6]};--c3:${d[7]};--sry:${d[8]};${d[5] === '#22c09b' ? '--ang:215deg;--end:58%;' : ''}--tx:#ffffff;--tx2:rgba(255,255,255,.9)">
  <!-- Placeholder: replace .slab-photo contents with <img src="athlete-step-${i + 1}.jpg" alt="Athlete: ${d[0]}"> -->
  <div class="slab-photo"><span class="img-tag">ATHLETE PHOTO</span><div class="sp-pouch">${stepVis(i, F[[0, 3, 1][i]])}</div></div>
  <div class="slab-top"><span class="eyebrow">Step ${i + 1}</span><span class="ico">${svg(d[9])}</span></div>
  <div class="slab-main"><h3 class="slab-step">${d[0]}</h3><p>${d[4]}</p></div></div>`).join('');
// cards rise in one after another when they scroll into view
(() => { const cards = $$('#slabs .slab'); if (reduce || !('IntersectionObserver' in window)) { cards.forEach(c => c.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .25 });
  cards.forEach(c => io.observe(c)); })();


/* ---------- ABOUT ---------- */
const AB_PHOTOS = ['assets/img/about-1.jpg', 'assets/img/about-2.jpg', 'assets/img/flavor-call.jpg', 'assets/img/about-4.jpg'];
const AB_CH = [
  ["Too much to think about.", "Three supplements, three shopping lists, a different scoop for everything. We were spending more time figuring out what to take than actually taking it. And somehow, the shaker was always missing."],
  ["Terrible first batch.", "What if we put everything into one tiny shot? Our first attempts gave us several reasons why nobody had done it quite like this. Bad flavors, weird textures, and a lot of wasted ingredients. A few questionable experiments later, we finally had something we'd actually want to drink."],
  ["Small pouch, big convenience.", "Meet ORGO. 20 mL packed with 4 g protein, 236 mg electrolytes, and 300 mg creatine. No sugar. No caffeine. Our teammates tried it, liked it, and started asking for boxes."],
  ["Never just about the shot.", "We started with a problem of our own, but realized we weren't the only ones facing it. ORGO was never about fitting more into less. It was about making the everyday routine a little easier, so athletes could give more to what matters. Plan A's formula didn't make it. Neither did Plans B, C, or a few we'd rather forget. But after all that trial and error, we finally made something we believed in. And this time, we're sharing it with you."]
];
let abBuilt = false, abIO = null;
function buildAbout() {
  if (!abBuilt) {
    abBuilt = true;
    $('#abProd').innerHTML = pouchHTML(F.find(f => f.id === 'wild-berries'));
    // gentle parallax: the shot drifts up a little as you scroll
    const st = $('#abStage'), onScroll = () => { if ($('[data-page="about"]').hidden) return; st.style.setProperty('--abp', Math.min(1, scrollY / innerHeight).toFixed(3)); };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    $('#abChapters').innerHTML = AB_CH.map((c, i) => `<article class="ab-ch ab-reveal${i % 2 ? ' flip' : ''}" style="--fa:${F[i].a};--fb:${F[i].b}">
      <div class="ab-photo${AB_PHOTOS[i] ? ' has-photo' : ''}" style="--tilt:${i % 2 ? '3deg' : '-3deg'}">${AB_PHOTOS[i] ? `<img class="ab-img" src="${AB_PHOTOS[i]}" alt="" loading="lazy">` : ''}<div class="ab-ph-pouch">${pouchHTML(F[i], 'idle')}</div></div>
      <div class="ab-txt"><span class="ab-num">0${i + 1}</span><h3 class="ab-ch-t">${c[0]}</h3><p class="ab-ch-p">${c[1]}</p></div></article>`).join('');
    $('#abNotePouches').innerHTML = F.map(f => `<i>${pouchHTML(f, 'idle')}</i>`).join('');
    // the headline drops in word by word
    const t = $('#abTitle'); if (!t.dataset.split) splitTitle(t);
    $('[data-abdown]').addEventListener('click', e => { e.preventDefault(); $('#ab-story').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); });
    if (window.applyAboutContent) window.applyAboutContent();
  }
  const els = $$('[data-page="about"] .ab-reveal, #abStats');
  if (reduce || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); countUp(true); return; }
  abIO = abIO || new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; e.target.classList.add('in'); if (e.target.id === 'abStats') countUp(); abIO.unobserve(e.target); }), { threshold: .2 });
  els.forEach(e => { if (!e.classList.contains('in')) abIO.observe(e); });
  $('.ab-hero').classList.remove('go'); requestAnimationFrame(() => requestAnimationFrame(() => $('.ab-hero').classList.add('go')));
}
function splitTitle(t) {
  let i = 0; const wrapWords = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) { const frag = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) frag.append(w); else { const sp = document.createElement('span'); sp.className = 'ab-w'; sp.style.setProperty('--i', i++); sp.textContent = w; frag.append(sp); } }); n.replaceWith(frag); }
    else if (n.nodeType === 1) wrapWords(n); });
  wrapWords(t); t.dataset.split = '1';
}
window.abSplit = splitTitle;
function countUp(now) {
  $$('#abStats [data-count]').forEach(b => { const to = +b.dataset.count;
    if (now) { b.textContent = to; return; }
    const t0 = performance.now(), dur = 1100; const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); b.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
}

/* ---------- STORY ---------- */
const story = $('#story');
// order of flavours in the scrolling section
const SF = ['lemonade', 'blood-orange', 'wild-berries', 'blue-pomegranate'].map(id => F.find(f => f.id === id));
// no flat poster here: it showed up blurry for a second before the 3D pouch took over. The section fades in once the 3D pouch is ready.
$('#storyPouch').outerHTML = `<div id="storyPouch" class="mv-story">${SF.map((f, i) => mvHTML(f, i ? '' : 'on', 'disable-zoom disable-pan interaction-prompt="none" loading="eager"').replace(/ poster="[^"]*"/, '')).join('')}</div>`;
const sp = $('#storyPouch');
const spMV = $$('model-viewer', sp);
const spWrap = $('#spWrap');
{ const showStory = () => spWrap.classList.add('mv-ready');
  if (spMV[0].loaded) showStory(); else spMV[0].addEventListener('load', showStory, { once: true });
  setTimeout(showStory, 6000); }
const GN = innerWidth <= 820 ? 4 : 5;
spWrap.insertAdjacentHTML('afterbegin', Array.from({ length: GN }, (_, k) => `<span class="ghost" data-k="${k + 1}" style="opacity:${(.34 - k * .06).toFixed(2)};filter:blur(${(k * 1.3 + 1.2).toFixed(1)}px) saturate(.75)"></span>`).join(''));
const ghosts = $$('.ghost', spWrap);
$('#storyList').insertAdjacentHTML('beforeend', SF.map((f, i) =>
  `<div class="sl-item${i === 0 ? ' on' : ''}" data-i="${i}" style="--fa:${f.a};--fb:${f.b}"><h3><i></i>${f.name}</h3><p>${f.note}</p></div>`).join(''));
$('#smDots').innerHTML = SF.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('');
let shown = -1;
let mvOn = 0; // flavour currently shown by the 3D pouch; it changes while the pouch is edge-on during each flip
function setStoryFlavor(i) {
  if (i === shown) return; shown = i; const f = SF[i];
  ghosts.forEach(g => { g.style.setProperty('--a', f.a); g.style.setProperty('--b', f.b); g.style.setProperty('--c', f.c); });
  story.style.setProperty('--t1', f.t1); story.style.setProperty('--t2', f.t2);
  $$('.sl-item').forEach((el, k) => el.classList.toggle('on', k === i));
  $$('#smDots i').forEach((el, k) => el.classList.toggle('on', k === i));
  $('#smName').textContent = f.name; $('#smNote').textContent = f.note;
}
setStoryFlavor(0);
// phones: the browser bar hiding/showing changes innerHeight mid-scroll; use a height that only updates when the width changes
let VH = innerHeight, VW = innerWidth;
$$('.sl-item').forEach(el => el.addEventListener('click', () => {
  const i = +el.dataset.i; const total = story.offsetHeight - VH;
  window.scrollTo({ top: story.offsetTop + total * ((i + .3) / 4), behavior: 'smooth' });
}));
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
let cur = { ry: 0, rx: 0, y: 0, s: 1, p: 0 }, target = { ry: 0, rx: 0, y: 0, s: 1, p: 0 };
function storyCalc() {
  if ($('[data-page="home"]').hidden) return;
  const total = story.offsetHeight - VH;
  const p = Math.min(1, Math.max(0, -story.getBoundingClientRect().top / total));
  const seg = Math.min(3, Math.floor(p * 4)); const t = p * 4 - seg;
  let idx = seg, flip = 0;
  if (seg < 3) { flip = smooth(.55, 1, t); if (t > .775) idx = seg + 1; }
  setStoryFlavor(idx);
  if (reduce) { target = { ry: 0, rx: 0, y: 0, s: 1, p: 0 }; return; }
  target.ry = seg * 360 + flip * 360 + Math.sin(t * Math.PI) * (seg < 3 ? -18 : 14) - 12;
  target.rx = Math.sin(p * Math.PI * 4) * 6;
  target.y = Math.sin(t * Math.PI) * -18;
  target.s = 1 - Math.sin(flip * Math.PI) * .08;
  // hero fan collapse
  const hp = Math.min(1, Math.max(0, scrollY / (VH * .9)));
  fan.style.setProperty('--hp', hp.toFixed(3));
  target.p = p;
}
function tick() {
  for (const k in cur) cur[k] += (target[k] - cur[k]) * .14;
  sp.style.transform = `translateY(${cur.y}px) scale(${cur.s})`;
  const orbit = `${(-cur.ry).toFixed(2)}deg ${(82 - cur.rx).toFixed(2)}deg auto`;
  spMV.forEach(m => { if (m.cameraOrbit !== orbit) { m.cameraOrbit = orbit; m.jumpCameraToGoal && m.jumpCameraToGoal(); } });
  // flip into the next flavour: each scroll step turns the pouch a full 360deg; the swap happens when it is edge-on (270deg), so the new front turns into view
  const fi = reduce ? shown : Math.min(3, Math.max(0, Math.floor((cur.ry + 90) / 360)));
  if (fi !== mvOn && fi >= 0) { mvOn = fi; spMV.forEach((m, k) => m.classList.toggle('on', k === fi)); }
  const sw = innerWidth <= 820 ? .6 : 1;
  ghosts.forEach((g, k) => { const n = k + 1; const a = cur.p * Math.PI * 2 + n * .5;
    g.style.transform = `translate(-50%,-50%) translateX(${(-n * 46 + Math.sin(a) * 14) * sw}px) translateY(${(n * 30 + cur.y * .5) * sw}px) translateZ(${-n * 90}px) rotateY(${cur.ry * .35 - n * 10 - 20}deg) rotateZ(${n * 3 - 6}deg)`; });
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ---------- steps + packs ---------- */
function renderPacks() {
$('#packs').innerHTML = [12, 24].map(n => {
  const row = (k) => Array.from({ length: 12 }, (_, i) => { const f = F[(i + k) % 4]; return `<span style="--fa:${f.a};--fb:${f.b};--h:${88 + ((i * 37 + k * 11) % 13)}%"></span>`; }).join('');
  const best = n === 24, full = PRICE[12] * 2, save = full - PRICE[24];
  return `<div class="pk${best ? ' best' : ''}">
    ${best ? `<span class="pk-flag">BEST VALUE · LOWEST PER SHOT</span>` : ''}
    <span class="pk-thumb pk-photo"><img src="assets/img/products/plan-variety_${n}.jpg?v=3" alt="ORGO Variety ${n}-pack box with pouches" loading="lazy"></span>
    <span class="pk-info"><b>${n}-pack</b><span class="pk-pw"><span class="pr">${money(SUBP[n])}<s>${money(REG[n])}</s></span><small class="save"><span class="sv-l">Subscription</span><span class="sv-dot"> · </span><span class="sv-r">${money(SUBP[n] / n)}/shot</span></small></span>
      <button type="button" class="pk-start" data-pkstart="${n}">Claim yours →</button></span>
  </div>`; }).join('');
$$('[data-pkstart]').forEach(b => b.addEventListener('click', () => { addLine({ flavor: 'variety', size: +b.dataset.pkstart, sub: true, cad: 4 }); openCart(); }));
}
renderPacks();
/* banner photo: real image now (floating pouches removed) */
$$('[data-setsize]').forEach(b => b.addEventListener('click', () => { shopSize = +b.dataset.setsize; renderShop(); }));

/* ---------- tilt helper ---------- */
function tilt(area, el, amt = 22) {
  if (reduce || !el || el.tagName === 'MODEL-VIEWER') return;
  area.addEventListener('pointermove', e => {
    const r = area.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `rotateY(${x * amt * 1.4}deg) rotateX(${-y * amt}deg) translateZ(20px)`;
    el.style.setProperty('--sp', (60 - x * 120) + '%');
  });
  area.addEventListener('pointerleave', () => { el.style.transform = ''; });
}

/* ---------- SHOP ---------- */
function renderShop() {
  $$('#shopSize button').forEach(b => b.classList.toggle('on', +b.dataset.size === shopSize));
  $('#shopGrid').innerHTML = ALL.map(f => {
    const vis = f.id === 'variety'
      ? varietyFan()
      : mvHTML(f, 'mv-card', 'disable-zoom');
    return `<article class="card" style="${fvars(f)}">
      <a class="card-vis" href="#flavor-${f.id}" aria-label="${f.name}">${vis}</a>
      <div class="card-body">
        <div class="row card-head"><div class="card-ttl"><h3>${f.name}</h3><span class="per">${shopSize} POUCHES</span></div><span class="price num">${money(PRICE[shopSize])}<s>${money(REG[shopSize])}</s></span></div>
        <p>${f.note}</p>
        <div class="actions"><button class="btn btn-ink" data-quick="${f.id}" data-qsub="1">Preorder</button><a class="btn btn-ghost" href="#flavor-${f.id}">Details</a></div>
      </div></article>`; }).join('');
  $$('#shopGrid .card').forEach(c => { const v = $('.card-vis', c); tilt(v, v.firstElementChild, 18); });
  $$('[data-quick]').forEach(b => b.addEventListener('click', () => addLine({ flavor: b.dataset.quick, size: shopSize, sub: !!b.dataset.qsub, cad: 4 })));
}
$$('#shopSize button').forEach(b => b.addEventListener('click', () => { shopSize = +b.dataset.size; renderShop(); }));

/* ---------- HOME: FIND YOUR FLAVOR ---------- */
const BEST_SELLER = 'lemonade';
function renderHomeFlavors() {
$('#homeFlavors').innerHTML = F.map(f => `<article class="card${f.id === BEST_SELLER ? ' is-best' : ''}" style="${fvars(f)}">
    ${f.id === BEST_SELLER ? '<span class="best-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" fill="currentColor"/></svg>BEST SELLER</span>' : ''}
    <a class="card-vis" href="#flavor-${f.id}" aria-label="${f.name}">${mvHTML(f, 'mv-card', 'disable-zoom')}</a>
    <div class="card-body">
      <div class="row"><h3>${f.name}</h3><span class="price num">${money(PRICE[12])}<s>${money(REG[12])}</s></span></div>
      <div class="actions"><button class="btn btn-ink" data-hquick="${f.id}">Preorder</button></div>
      <a class="learn" href="#flavor-${f.id}">Learn more</a>
    </div></article>`).join('');
$$('#homeFlavors .card').forEach(c => { const v = $('.card-vis', c); tilt(v, v.firstElementChild, 18); });
$$('[data-hquick]').forEach(b => b.addEventListener('click', () => addLine({ flavor: b.dataset.hquick, size: 12, sub: true, cad: 4 })));
}
renderHomeFlavors();

/* ---------- PRODUCT ---------- */
let pd = { size: 12, sub: true, cad: 4, qty: 1 };
// Variety: the four real 3D pouches layered in a fan (same models + lighting as the single-flavor cards)
const FAN_ORDER = ['wild-berries', 'blood-orange', 'blue-pomegranate', 'lemonade'];
function varietyFan(cls = '') {
  return `<div class="var-fan3d ${cls}" aria-label="All four ORGO flavors" role="img">${FAN_ORDER.map((id, i) =>
    `<div class="vf" style="--i:${i - 1.5};--fy:${Math.abs(i - 1.5)}">${mvHTML(byId(id), 'mv-fan', 'disable-zoom disable-pan')}</div>`).join('')}</div>`;
}
// Variety product page: big 3D pouches trickling down one after another, 1–3 in view, endless loop
function pouchRain() {
  const slots = [[30, -14, 22], [70, 12, -26], [44, -24, 14], [62, 20, -18]];   // x%, start / end tilt
  const dur = 9;
  return `<div class="pouch-rain" aria-hidden="true">${FAN_ORDER.map((id, i) =>
    `<div class="rain-p" style="--x:${slots[i][0]}%;--r0:${slots[i][1]}deg;--r1:${slots[i][2]}deg;--dur:${dur}s;--d:${-(i * dur / 4).toFixed(2)}s">${mvHTML(byId(id), 'mv-rain', 'disable-zoom disable-pan')}</div>`).join('')}</div>`;
}
function renderPDP(id) {
  if (renderPDP.last !== id) { pdThumb = -1; renderPDP.last = id; }
  const f = byId(id) || F[0];
  const base = REG[pd.size] * pd.qty, now = PRICE[pd.size] * pd.qty;   // box 1 is always the presale price; subscriptions drop to SUBP from box 2
  $('#pdp').innerHTML = `
    <div class="pdp-media">
      <div class="pdp-main">
        <div class="pdp-vis" id="pdpVis" style="--t1:${f.t1};--t2:${f.t2}">${f.id === 'variety' ? `${pouchRain()}<span class="hint">All four flavors in one box</span>` : `${mvHTML(f, 'mv-pdp', 'camera-controls auto-rotate auto-rotate-delay="0" rotation-per-second="30deg"')}<span class="hint">Drag to turn the pouch</span>`}</div>
        <div class="pdp-photo" id="pdpPhoto" hidden></div>
      </div>
      <div class="pdp-thumbs" role="tablist" aria-label="Product photos">
        <button type="button" class="pdp-th on" data-th="-1" style="--t1:${f.t1}" aria-label="${f.id === 'variety' ? 'All four flavors' : '3D pouch'}">${f.id === 'variety' ? varietyFan('th') : posterIMG(f)}</button>
        ${pdpPhotos(f).map((src, i) => `<button type="button" class="pdp-th${src ? '' : ' ph'}" data-th="${i}" aria-label="Photo ${i + 2}">${src ? `<img src="${src}" alt="" loading="lazy">` : `<span>PHOTO ${i + 2}</span>`}</button>`).join('')}
      </div>
    </div>
    <div class="pdp-info">
      <span class="crumb"><a href="#shop">Shop</a> / ${f.name}</span>
      <h1>${f.name}</h1>
      <p class="lede" style="max-width:44ch">${f.note} ${f.id === 'variety' ? 'Box splits evenly across all four flavors.' : 'Each pouch is a 20 mL sport nutrition shot.'}</p>
      <div class="pdp-price num">${money(now)}<s>${money(base)}</s><small>${money(now / (pd.size * pd.qty))} PER SHOT</small></div>${pd.sub ? `<p class="pdp-then">Then <b>${money(SUBP[pd.size])}</b> per box from your 2nd box, ${SUB_PCT}% off for as long as you stay.</p>` : ''}
      <div class="opt"><span class="eyebrow"><span>Flavor</span><span>${f.name}</span></span>
        <div class="swatches">${F.concat([VARIETY]).map(x => `<a href="#flavor-${x.id}" class="swatch${x.id === 'variety' ? ' sw-var' : ''}${x.id === f.id ? ' on' : ''}" style="--fa:${x.a};--fb:${x.b}" aria-label="${x.id === 'variety' ? 'Variety' : x.name}" title="${x.id === 'variety' ? 'Variety' : x.name}"></a>`).join('')}</div></div>
      <div class="opt"><span class="eyebrow">Pack size</span>
        <div class="choices">${[12, 24].map(n => `<button class="choice${pd.size === n ? ' on' : ''}" data-ps="${n}"><b>${n} pouches</b><span>${pd.sub ? `${money(PRICE[n])}, then ${money(SUBP[n])}` : `${money(PRICE[n])} · ${money(PRICE[n] / n)}/shot`}</span></button>`).join('')}</div></div>
      <div class="opt"><span class="eyebrow">Purchase</span>
        <div class="choices">
          <button class="choice${!pd.sub ? ' on' : ''}" data-sub="0"><b>Preorder once</b><span>${money(PRICE[pd.size])}</span><span class="tag">${PRESALE_PCT}% OFF</span></button>
          <button class="choice${pd.sub ? ' on' : ''}" data-sub="1"><b>Subscribe</b><span class="ch-tight">${money(SUBP[pd.size])}/box from box 2</span><span class="tag">${SUB_PCT}% OFF FROM BOX 2</span></button>
        </div>
        ${pd.sub ? `<div class="cadence">${CAD.map(c => `<button class="${pd.cad === c ? 'on' : ''}" data-cad="${c}">Every ${c} weeks</button>`).join('')}</div>` : ''}
      </div>
      <div class="buyrow">
        <div class="qty"><button data-q="-1" aria-label="Fewer">−</button><output class="num">${pd.qty}</output><button data-q="1" aria-label="More">+</button></div>
        <button class="btn btn-ink" id="pdpAdd">Preorder · ${money(now)}</button>
      </div>${pd.sub ? `<p class="ar-note">Auto-renews: you pay ${money(PRICE[pd.size] * pd.qty)} today for box 1, then ${money(SUBP[pd.size] * pd.qty)} every ${pd.cad} weeks, counted from when your first box ships, until you cancel. Change or cancel any time from your account before your next renewal.</p>` : ''}
      <dl class="specs" style="margin:0">
        <div><span>Volume</span><span>20 mL / pouch</span></div>
        <div><span>Pouch</span><span>4 mm flat · tear notch</span></div>
        <div><span>Calories</span><span>${f.cal || 20}</span></div>
        <div><span>Added sugar</span><span>0 g</span></div>
        <div><span>Electrolytes</span><span>Na · K · Mg</span></div>
      </dl>
      <details class="pdp-acc sc-det"><summary>Science &amp; testing</summary><div class="sc-body"><h5>Third-party tested</h5><p>Every batch goes to an independent lab before it ships. They screen for heavy metals, pesticides and microbes, and check that every pouch matches its label.</p> <h5>High standards</h5><p>ORGO is made in a cGMP facility that&rsquo;s NSF-listed for dietary supplement manufacturing (NSF/ANSI 455-2), liquids like ours included, and registered with the U.S. FDA.</p> <h5>Certifications</h5><p>Beyond the NSF-listed site that makes ORGO, our manufacturer&rsquo;s other facilities hold HACCP and ISO 22000 food-safety certifications.</p> <h5>The research</h5><p>The ingredients in ORGO have been studied on their own; ORGO's finished formula has not been through its own clinical trial. See the studies on our <a href="#science">Science page</a>.</p></div></details>
    </div>`;
  $$('[data-ps]').forEach(b => b.onclick = () => { pd.size = +b.dataset.ps; renderPDP(id); });
  $$('[data-sub]').forEach(b => b.onclick = () => { pd.sub = b.dataset.sub === '1'; renderPDP(id); });
  $$('[data-cad]').forEach(b => b.onclick = () => { pd.cad = +b.dataset.cad; renderPDP(id); });
  $$('[data-q]').forEach(b => b.onclick = () => { pd.qty = Math.max(1, Math.min(9, pd.qty + +b.dataset.q)); renderPDP(id); });
  $('#pdpAdd').onclick = () => addLine({ flavor: f.id, size: pd.size, sub: pd.sub, cad: pd.cad, qty: pd.qty });
  const ph = pdpPhotos(f);
  $$('.pdp-th').forEach(b => b.onclick = () => {
    $$('.pdp-th').forEach(x => x.classList.toggle('on', x === b));
    const i = +b.dataset.th, box = $('#pdpPhoto');
    $('#pdpVis').hidden = i >= 0; box.hidden = i < 0;
    pdThumb = i;
    if (i >= 0) box.innerHTML = ph[i] ? `<img src="${ph[i]}" alt="${f.name} ${i === 0 ? pd.size + '-pack box with pouch' : ''}">` : `<span class="img-tag">IMAGE PLACEHOLDER · PHOTO ${i + 2}</span>`;
  });
  // keep the same photo open when the pack size changes (photo 2 swaps to the matching box)
  if (pdThumb >= 0) { const t = $(`.pdp-th[data-th="${pdThumb}"]`); if (t) t.click(); }
}
/* Product photos per flavor (up to 3 extra). Empty slots show a placeholder until photos are uploaded.
   Photo 2 is the box + pouch shot and follows the selected pack size: assets/img/products/{flavor}_{12|24}.jpg */
const PDP_PHOTOS = { 'wild-berries': ['assets/img/lifestyle/wild-berries.jpg'], 'blue-pomegranate': ['assets/img/lifestyle/blue-pomegranate.jpg'], 'blood-orange': ['assets/img/lifestyle/blood-orange.jpg'], 'lemonade': ['assets/img/lifestyle/lemonade.jpg'], variety: ['assets/img/lifestyle/variety.jpg'] };
const BOX_SHOT = (f, n) => `assets/img/products/${f.id}_${n}.jpg?v=3`;
let pdThumb = -1;
function pdpPhotos(f) { const a = [BOX_SHOT(f, pd.size)].concat((PDP_PHOTOS[f.id] || []).slice(0, 1)); while (a.length < 2) a.push(''); return a; }
function spinner(area, el) {
  let rot = -16, vel = 0, drag = false, lx = 0, raf;
  const loop = () => {
    if (!drag) { vel *= .94; rot += vel + (reduce ? 0 : .12); }
    el.style.transform = `rotateY(${rot}deg) rotateX(4deg)`;
    el.style.setProperty('--sp', (130 - ((rot % 360 + 360) % 360) / 360 * 160) + '%');
    if (document.body.contains(el)) raf = requestAnimationFrame(loop);
  };
  area.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; area.setPointerCapture(e.pointerId); });
  area.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - lx; lx = e.clientX; rot += dx * .6; vel = dx * .6; });
  const end = () => { drag = false; };
  area.addEventListener('pointerup', end); area.addEventListener('pointercancel', end);
  loop();
}

/* ---------- SUBSCRIBE (sales page) ---------- */
let sbCad = 4, sbFlav = 'variety';
const sbSel = { 12: { f: 'variety', c: 4 }, 24: { f: 'variety', c: 4 } };
const cartonHTML = (n, fid) => {
  const one = fid && fid !== 'variety' ? byId(fid) : null;
  const row = k => Array.from({ length: 12 }, (_, i) => { const f = one || F[(i + k) % 4]; return `<span style="--fa:${f.a};--fb:${f.b};--h:${88 + ((i * 37 + k * 11) % 13)}%"></span>`; }).join('');
  return `<div class="carton"><div class="c-back"></div>${n === 24 ? `<div class="c-row r1">${row(1)}</div><div class="c-row r2">${row(2)}</div>` : `<div class="c-row r2" style="top:4%">${row(0)}</div>`}<div class="c-front"><b>ORGO</b><i></i><small>${n} SPORT NUTRITION SHOTS</small></div></div>`;
};
function buildSubStatic() {
  if ($('#sbHeroVis .hp')) return;
  const hp = [
    { l: '28%', t: '60%', r: '-14deg', ry: '22deg', pw: 'clamp(100px, 11vw, 160px)', d: '0s', f: 0 },
    { l: '52%', t: '44%', r: '6deg', ry: '-10deg', pw: 'clamp(130px, 14vw, 200px)', d: '-1.5s', f: 2 },
    { l: '76%', t: '64%', r: '16deg', ry: '-24deg', pw: 'clamp(110px, 12vw, 170px)', d: '-3s', f: 1 }
  ];
  // floating pouches removed for the presale (the runner photo carries this hero)
  void hp;
  const tiles = [
    ['big photo dark', 'Race day, sorted.', 'One squeeze before the gun, one after the line.<br class="cap-br"> Nothing else to think about.', 'linear-gradient(160deg, #5a34d6, #e8386d)', [], 'assets/img/race-day.jpg', 'Sprinters driving off the start line'],
    ['deliv photo dark', 'Delivered before you run out.', 'A fresh box every 4 or 6 weeks.', 'linear-gradient(150deg, #22c09b, #ffe04a)', [], 'assets/img/delivered-2.jpg', 'Athlete holding a Lemonade ORGO pouch on the track'],
    ['photo', 'Your flavor, your call.', 'Go Variety or stick with a favorite. Switch any time.', 'linear-gradient(150deg, #ff4d2e, #ffae3d)', [], 'assets/img/flavor-call-ice.jpg', 'Blue Pomegranate ORGO pouch on ice']
  ];
  $('#gallery').innerHTML = tiles.map(t => `<div class="tile ${t[0]}" style="--tbg:${t[3]}">
      ${t[5] ? `<img class="tile-img" src="${t[5]}" alt="${t[6] || ''}" loading="lazy">` : t[0] === 'deliv' ? '' : '<span class="img-tag">IMAGE PLACEHOLDER</span>'}
      ${t[4].map((p, k) => `<div class="tp" style="--l:${p[0]};--t:${p[1]};--r:${p[2]};--pw:${p[3]}"><div class="floaty" style="--d:${-k * 1.7}s">${pouchHTML(F[p[4]], 'idle')}</div></div>`).join('')}
      <div class="tile-cap"><h3>${t[1]}</h3><p>${t[2]}</p></div></div>`).join('');
  const flow = [['Pick a box', '12 or 24 pouches. Variety or one favorite flavor.'], ['Pick your timing', 'Every 4 or 6 weeks, counted from when your first box ships.'], ['It ships free', 'We\'ll update you before each box ships.'], ['Adjust any time', 'Change flavor, size or timing, or cancel online.']];
  $('#flow').innerHTML = flow.map((f, i) => `<div style="--fa:${F[i].a};--fb:${F[i].b}"><span class="n">${i + 1}</span><h3>${f[0]}</h3><p>${f[1]}</p></div>`).join('');
  $$('[data-jump]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); $('#plans').scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
}
// plan card photo: the box + pouch shot for the chosen flavor and size
const planShot = (fid, n) => { const w = n === 12 ? 'w' : ''; return fid === 'variety' ? `assets/img/products/plan-variety_${n}${w}.jpg?v=4` : `assets/img/products/${fid}_${n}${w}.jpg?v=4`; };
function renderSub() {
  buildSubStatic();
  const fdot = id => id === 'variety' ? 'linear-gradient(var(--vang),var(--va2),var(--vb2))' : `linear-gradient(140deg,${byId(id).a},${byId(id).b})`;
  $('#plansGrid').innerHTML = [24, 12].map(n => {
    const best = n === 24, sel = sbSel[n], sf = byId(sel.f), yearly = (REG[n] - SUBP[n]) * 52 / sel.c;
    return `<div class="plan pl-min${best ? ' best' : ''}">${best ? '<span class="ribbon">MOST POPULAR</span>' : ''}
      <div class="plan-vis" style="--pv1:${sf.t1};--pv2:${sf.t2}"><img class="plan-img s${n}" src="${planShot(sel.f, n)}" alt="${sel.f === 'variety' ? 'Variety' : sf.name} ${n}-pack box with pouches" loading="lazy"></div>
      <div class="pm-top">
        <h3>${n} pouches</h3>
        <div class="plan-price"><b>${money(SUBP[n])}</b><s>${money(REG[n])}</s></div>
      </div>
      <p class="pm-facts">From box 2 · ${money(SUBP[n] / n)} a shot · first box ${money(PRICE[n])} · ships&nbsp;free</p>
      <div class="pm-sel">
        <div class="po-sw" role="group" aria-label="Flavor">${[VARIETY, ...F].map(f => `<button type="button" class="${f.id === sel.f ? 'on' : ''}" data-pf="${n}:${f.id}" style="--dot:${fdot(f.id)}" aria-label="${f.name}" title="${f.name}"></button>`).join('')}<span class="pm-fl">${sel.f === 'variety' ? 'Variety' : sf.name}</span></div>
        <div class="po-seg" role="group" aria-label="Delivery interval">${CAD.map(c => `<button type="button" class="${c === sel.c ? 'on' : ''}" data-pc="${n}:${c}">Every ${c} wk</button>`).join('')}</div>
      </div>
      <button class="btn ${best ? 'btn-w' : 'btn-dark'}" data-plan="${n}">Claim my box</button>
      <p class="pm-fine">First box ships Dec 29 · then auto-renews at ${money(SUBP[n])} every ${sel.c} weeks until you cancel · cancel any time · <a href="#flavor-${sel.f}">or ${money(PRICE[n])} one-time</a></p>
    </div>`; }).join('');
  sbCad = sbSel[24].c;
  const y = n => money((REG[n] - SUBP[n]) * 52 / sbCad);
  $('#compare').innerHTML = `<thead><tr><th></th><th>One-time</th><th class="sub">Subscription <small class="cmp-from">from box 2</small></th></tr></thead><tbody>
    <tr><td>12-pouch box</td><td>${money(REG[12])}</td><td class="sub">${money(SUBP[12])}</td></tr>
    <tr><td>24-pouch box</td><td>${money(REG[24])}</td><td class="sub">${money(SUBP[24])}</td></tr>
    <tr><td>Price per shot</td><td>${money(REG[24] / 24)} – ${money(REG[12] / 12)}</td><td class="sub">${money(SUBP[24] / 24)} – ${money(SUBP[12] / 12)}</td></tr>
    <tr><td>Shipping</td><td>Free on preorders</td><td class="sub">Always free</td></tr>
    <tr><td>Yearly savings (24-pouch, every ${sbCad} wk)</td><td class="no">—</td><td class="sub">${y(24)}</td></tr>
    <tr><td>Change or cancel online</td><td class="no">—</td><td class="sub yes">Yes</td></tr>
    <tr><td>Early access to new flavors</td><td class="no">—</td><td class="sub yes">Yes</td></tr></tbody>`;
  $('#finalPct').textContent = pctMax() + '%';
  const keepX = () => { const g = $('#plansGrid'); const x = g.scrollLeft; return () => { g.scrollLeft = x; }; };
  $$('[data-pf]').forEach(b => b.onclick = () => { const [n, f] = b.dataset.pf.split(':'); sbSel[n].f = f; const r = keepX(); renderSub(); r(); });
  $$('[data-pc]').forEach(b => b.onclick = () => { const [n, c] = b.dataset.pc.split(':'); sbSel[n].c = +c; const r = keepX(); renderSub(); r(); });
  $$('[data-plan]').forEach(b => b.onclick = () => { const sel = sbSel[b.dataset.plan]; addLine({ flavor: sel.f, size: +b.dataset.plan, sub: true, cad: sel.c }); });
}

/* ---------- SCIENCE ---------- */
const SICON = {
  muscle: '<path d="M6 15c0-4 2-8 5-9 1.5-.5 3 .3 3 2s-2 2-2 4c2-1 5-1 6 1.5 1 2.6-1 5.5-5 5.5H9c-1.8 0-3-1.6-3-4Z"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/><path d="M9 14.5a3 3 0 0 0 3 3"/>',
  joint: '<circle cx="7" cy="7" r="3"/><circle cx="17" cy="17" r="3"/><path d="M9.2 9.2l5.6 5.6"/><path d="M4 12h3M17 4v3"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>'
};
const sic = (k, c = '#ffffff') => `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SICON[k]}</svg>`;
// two-bar comparison drawn to the stated ratio (base = 1, compare = 1 + pct)
function barsViz(pct, a, b) {
  const W = 300, x0 = 112, max = W - x0 - 54, w1 = max / (1 + pct), w2 = max;
  return `<svg viewBox="0 0 ${W} 96" role="img" aria-label="${b} ${Math.round(pct * 100)}% above ${a}">
    <text x="0" y="30" fill="#ffffff" fill-opacity=".85" font-family="Manrope, sans-serif" font-size="18">${a}</text>
    <rect x="${x0}" y="16" width="${w1.toFixed(1)}" height="20" rx="10" fill="#ffffff" fill-opacity=".35"/>
    <text x="0" y="74" fill="#ffffff" font-family="Manrope, sans-serif" font-size="18" font-weight="700">${b}</text>
    <rect x="${x0}" y="60" width="${w2.toFixed(1)}" height="20" rx="10" fill="#ffffff"/>
    <text x="${(x0 + w2 + 8).toFixed(1)}" y="75" fill="#ffffff" font-family="JetBrains Mono, monospace" font-size="16" font-weight="500">+${Math.round(pct * 100)}%</text>
  </svg>`;
}
function powerViz() {
  // schematic Wingate power curve; ORGO peak is drawn 48 units above placebo on a 0–200 scale
  const pts = (peak) => { const out = []; for (let i = 0; i <= 30; i++) { const t = i / 30; const v = peak * Math.min(1, t * 6) * Math.exp(-1.4 * Math.max(0, t - .17)); out.push([10 + t * 280, 100 - v / 200 * 90]); } return out; };
  const path = p => p.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
  const a = pts(130), b = pts(178);
  const pa = a.reduce((m, q) => q[1] < m[1] ? q : m), pb = b.reduce((m, q) => q[1] < m[1] ? q : m);
  return `<svg viewBox="0 0 300 110" role="img" aria-label="Peak power about 48 watts higher than placebo">
    <line x1="10" y1="100" x2="290" y2="100" stroke="#ffffff" stroke-opacity=".35"/>
    <path d="${path(a)}" fill="none" stroke="#ffffff" stroke-opacity=".45" stroke-width="2" stroke-dasharray="4 4"/>
    <path d="${path(b)}" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    <line x1="${pb[0].toFixed(1)}" y1="${pb[1].toFixed(1)}" x2="${pb[0].toFixed(1)}" y2="${pa[1].toFixed(1)}" stroke="#ffffff" stroke-width="1.5"/>
    <circle cx="${pb[0].toFixed(1)}" cy="${pb[1].toFixed(1)}" r="4.5" fill="#ffffff"/>
    <path d="M${(pb[0] + 7).toFixed(1)} ${pb[1].toFixed(1)} L104 ${(pb[1] - 2).toFixed(1)}" stroke="#ffffff" stroke-width="1" stroke-dasharray="2 3"/>
    <text x="110" y="${(pb[1] + 3).toFixed(1)}" fill="#ffffff" font-family="JetBrains Mono, monospace" font-size="20" font-weight="500">+48 W</text>
    <text x="210" y="44" fill="#ffffff" font-family="Manrope, sans-serif" font-size="16" font-weight="700">Creatine</text>
  </svg>`;
}
function mgViz() {
  // electrolytes in one pouch, bars drawn to scale (170 / 49 / 17 mg)
  const R = [['Sodium', 170], ['Potassium', 49], ['Magnesium', 17]], x0 = 112, max = 130;
  return `<svg viewBox="0 0 300 108" role="img" aria-label="Per pouch: sodium 170 mg, potassium 49 mg, magnesium 17 mg">${R.map((r, i) => {
    const y = 8 + i * 34, w = Math.max(6, r[1] / 170 * max);
    return `<text x="0" y="${y + 15}" fill="#ffffff" fill-opacity=".9" font-family="Manrope, sans-serif" font-size="16" font-weight="${i ? 500 : 700}">${r[0]}</text>
      <rect x="${x0}" y="${y + 2}" width="${w.toFixed(1)}" height="18" rx="9" fill="#ffffff" fill-opacity="${i ? .55 : 1}"/>
      <text x="${(x0 + w + 8).toFixed(1)}" y="${y + 16}" fill="#ffffff" font-family="JetBrains Mono, monospace" font-size="14">${r[1]} mg</text>`; }).join('')}</svg>`;
}
function collagenViz() {
  // illustrative collagen fibre: three intertwined strands
  const strand = (ph, op, w) => { let d = ''; for (let i = 0; i <= 60; i++) { const x = 6 + i * 4.8, y = 50 + Math.sin(i / 4 + ph) * 22; d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); } return `<path d="${d}" fill="none" stroke="#ffffff" stroke-opacity="${op}" stroke-width="${w}" stroke-linecap="round"/>`; };
  return `<svg viewBox="0 0 300 100" role="img" aria-label="Illustration of a collagen triple helix">${strand(0, 1, 3)}${strand(2.1, .6, 3)}${strand(4.2, .35, 3)}</svg>`;
}
function buildScience() {
  if ($('#stats').children.length) return;
  const S = [
    { k: 'ELECTROLYTES', sup: '1,2', ico: 'drop', num: '236', unit: 'mg', head: 'Sodium, potassium & magnesium', body: 'Sodium helps your body hold on to the water you drink after exercise. ORGO is a 20 mL shot, so take it with water.', src: 'Research: sodium-containing drinks improve fluid retention after exercise.', viz: mgViz(), c1: '#22c09b', c2: '#ffe04a', c3: '#12896b', ang: '215deg', end: '58%' },
    { k: 'ORGANIC PROTEIN', sup: '3,4', ico: 'joint', words: 'Tendon adaptation', head: 'Collagen peptides + training', body: 'In a 14-week trial of 50 active men doing heavy resistance training, 5 g a day of collagen peptides increased patellar tendon size more than placebo. Strength gains were similar in both groups.', src: 'Studied: 5 g a day · ORGO: 4 g per pouch, 8 g in two', viz: collagenViz(), c1: '#e8386d', c2: '#ffa15c', c3: '#b0244f' },
    { k: 'CREATINE', sup: '5,6', ico: 'bolt', num: '+5', unit: '%', head: 'Mean sprint power', body: 'In a 6-week double-blind trial, recreational cyclists taking a creatine-electrolyte supplement raised mean sprint power by 5% and peak power by 4%. The placebo group showed no matching change.', src: 'Most creatine research uses 3–5 g a day · ORGO: 300 mg per pouch', viz: barsViz(.05, 'Before', '6 weeks'), c1: '#2f4fe0', c2: '#7fa6ff', c3: '#2238a8' }
  ];
  $('#stats').innerHTML = S.map((s, i) => `<article class="stat" style="--c1:${s.c1};--c2:${s.c2};--c3:${s.c3};${s.ang ? `--ang:${s.ang};--end:${s.end};` : ''}">
      <div class="stat-top"><span class="eyebrow">${s.k} <sup>${s.sup}</sup></span><span class="ico">${sic(s.ico)}</span></div>
      ${s.words ? `<div class="stat-num words">${s.words}</div>` : `<div class="stat-num" data-countup="${s.num}">${s.pre ? `<em class="pre">${s.pre}</em>` : ''}<span>${s.num}</span><small>${s.unit}</small></div>`}
      <div class="stat-head">${s.head}</div>
      <p>${s.body}</p>
      <p class="stat-src">${s.src}</p>
      <div class="stat-viz">${s.viz}</div>
    </article>`).join('');
  const chips = [['Organic protein', 'joint', 'L', '61%', 2, 'Joints', '16px', '#b0244f'], ['Electrolytes', 'drop', 'R', '37%', 3, 'Hydration', '30px', '#12896b'], ['Creatine', 'bolt', 'R', '62%', 1, 'Power', '44px', '#2238a8']];
  $('#sciOrbit').insertAdjacentHTML('beforeend', `<div class="op"><div class="floaty">${pouchHTML(F[2], 'idle')}</div></div>` +
    chips.map((c, i) => `<span class="chip ${c[2]}" style="--t:${c[3]};--dx:${c[6]};--d0:${(.2 + i * .15).toFixed(2)}s;--fa:${c[7]}"><i>${sic(c[1], c[7])}</i><span><b>${c[0]}</b><small>${c[5]}</small></span></span>`).join(''));
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      const el = $('span', e.target), raw = e.target.dataset.countup, sign = raw.startsWith('+') ? '+' : '', end = parseInt(raw.replace('+', ''), 10), t0 = performance.now();
      const step = now => { const t = Math.min(1, (now - t0) / 1100), v = Math.round(end * (1 - Math.pow(1 - t, 3))); el.textContent = sign + v; if (t < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }), { threshold: .5 });
    $$('[data-countup]').forEach(n => io.observe(n));
  }
}

/* ---------- CART ---------- */
function lineKey(l) { return [l.flavor, l.size, l.sub ? 's' + l.cad : 'o', l.mix ? l.mix.join('-') : ''].join('|'); }
/* Box 1 of a subscription is charged at the presale price; the subscriber price (SUBP) starts with box 2. */
function linePrice(l) { return PRICE[l.size] * l.qty; }
const renewPrice = l => (l.sub ? SUBP[l.size] : PRICE[l.size]) * l.qty;
function addLine(l) {
  // store connected but no subscription plans set up in Shopify yet → preorder as one-time
  if (l.sub && window.OrgoShopify && OrgoShopify.enabled && OrgoShopify.catalog && !Object.values(OrgoShopify.catalog).some(p => p.plans.length)) l.sub = false;
  l.qty = l.qty || 1; const k = lineKey(l); const ex = cart.find(x => lineKey(x) === k);
  if (ex) ex.qty += l.qty; else cart.push(l);
  save(); renderCart();
  const name = l.custom ? 'Custom box' : byId(l.flavor).name;
  toast(`${name} · ${l.size}-pack reserved`);
}
function renderCart() {
  const n = cart.reduce((a, l) => a + l.qty, 0);
  $$('[data-count]').forEach(el => { el.textContent = n; });
  $$('.mob-badge').forEach(el => { el.hidden = n === 0; });
  const sub = cart.reduce((a, l) => a + linePrice(l), 0);
  if (!cart.length) {
    $('#cartBody').innerHTML = `<div class="empty"><div class="empty-pouch" style="transform:rotate(-8deg)">${pouchHTML(F[3], 'idle')}</div><p>Your preorder is empty.</p><a href="#shop" class="btn btn-ink" data-close>Preorder flavors</a></div>`;
    $('#cartFoot').innerHTML = '';
  } else {
    $('#cartBody').innerHTML = cart.map((l, i) => { const f = byId(l.flavor);
      const desc = l.custom ? F.map((x, j) => l.mix[j] ? `${l.mix[j]} ${x.name}` : '').filter(Boolean).join(', ') : `${l.size} pouches`;
      return `<div class="line" style="--fa:${f.a};--fb:${f.b}"><span class="line-pouch">${pouchHTML(f)}</span>
        <div style="min-width:0"><b>${l.custom ? 'Custom box' : f.name} · ${l.size}</b><small>${desc}</small><small>${l.sub ? `Subscription · every ${l.cad} weeks · −${PRESALE_PCT}% now, then ${money(renewPrice(l))} (−${SUB_PCT}%) from box 2` : `Preorder · −${PRESALE_PCT}%`}</small></div>
        <div class="r"><span>${money(linePrice(l))} <s class="ps-was">${money(REG[l.size] * l.qty)}</s></span><div class="qty"><button data-cq="${i}" data-d="-1" aria-label="Fewer">−</button><output>${l.qty}</output><button data-cq="${i}" data-d="1" aria-label="More">+</button></div></div></div>`; }).join('');
    const hasSub = cart.some(l => l.sub);
    const ship = 0;   // presale: free shipping on every preorder
    $('#cartFoot').innerHTML = `<div style="display:flex;justify-content:space-between;color:var(--muted)" class="num"><span>Shipping</span><span>${ship ? money(ship) : 'Free'}</span></div>
      <div class="tot"><span>Total</span><span>${money(sub + ship)}</span></div>
      <button class="btn btn-ink" id="checkout">Claim my preorder</button>
      <p class="note" id="coNote">${ship ? `Add ${money(60 - sub)} more for free shipping.` : `Free shipping on every preorder · you save ${money(cart.reduce((a, l) => a + REG[l.size] * l.qty, 0) - sub)}`}</p>
      ${cart.some(l => l.sub) ? `<p class="ar-note ar-cart">By checking out with a subscription, you agree it auto-renews: you'll be charged the price shown above on the schedule you picked, counted from when your first box ships, until you cancel. Cancel any time from your account before your next renewal.</p>` : ''}
      <p class="ps-cart-note"><b>Preorder · ${SHIP_NOTE}.</b> Secure checkout by Shopify. Final shipping &amp; tax at checkout.</p>`;
    $('#checkout').onclick = e => startCheckout(e.currentTarget);
  }
  $$('[data-cq]').forEach(b => b.onclick = () => { const i = +b.dataset.cq; cart[i].qty += +b.dataset.d; if (cart[i].qty <= 0) cart.splice(i, 1); save(); renderCart(); });
  $$('[data-close]').forEach(b => b.onclick = closeCart);
}
const openCart = () => { $('#drawer').classList.add('open'); $('#scrim').classList.add('open'); };
const closeCart = () => { $('#drawer').classList.remove('open'); $('#scrim').classList.remove('open'); };
$$('[data-open-cart]').forEach(b => b.addEventListener('click', openCart));
$('#closeCart').addEventListener('click', closeCart);
$('#scrim').addEventListener('click', closeCart);
addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
let tt; function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2200); }

/* Policy links: add each page URL here when ready. Empty ones show a short note instead of navigating. */
/* Policy pages: text lives in assets/js/policies.js, shown at #policy-<name>. */
const POL_ORDER = [['refund', 'Refunds'], ['shipping', 'Shipping'], ['subscription', 'Subscriptions'], ['privacy', 'Privacy'], ['terms', 'Terms'], ['contact', 'Contact']];
function renderPolicy(id) {
  const P = window.ORGO_POLICIES || {}, p = P[id] || P.refund;
  if (!p) return;
  $('#polBody').innerHTML = `<span class="eyebrow">ORGO · Policies</span><h1>${p.title}</h1>
    <nav class="pol-nav" aria-label="Policies">${POL_ORDER.filter(([k]) => P[k]).map(([k, n]) => `<a href="#policy-${k}"${P[k] === p ? ' class="on" aria-current="page"' : ''}>${n}</a>`).join('')}</nav>
    <div class="pol-text">${p.html}</div>`;
  document.title = `${p.title} · ORGO`;
}
$('#newsSms').addEventListener('change', e => { $('#smsBox').hidden = !e.target.checked; });
$('#news').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.currentTarget, btn = $('button', f), email = $('#newsEmail').value.trim(), sms = $('#newsSms').checked, phone = $('#newsPhone').value.trim();
  if (sms && phone.replace(/\D/g, '').length < 10) { toast('Add your mobile number for drop texts'); $('#newsPhone').focus(); return; }
  const ep = (window.ORGO_CONFIG || {}).waitlistEndpoint;
  if (!ep) { toast('You’re on the list'); $('#newsEmail').value = ''; return; }
  btn.disabled = true;
  try {
    const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, sms, phone: sms ? phone : '', source: 'footer', company: ($('[name="company"]', f) || {}).value || '' }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok && d.ok) { toast('You’re on the list for the 12.29 drop'); f.reset(); $('#smsBox').hidden = true; }
    else toast(d.error === 'email' ? 'Check your email address' : 'Couldn’t sign you up just now. Try again soon.');
  } catch (err) { toast('Couldn’t sign you up just now. Try again soon.'); }
  btn.disabled = false;
});

/* ---------- PROFILE ---------- */
let prof = null;
try { prof = JSON.parse(localStorage.getItem('orgo-profile') || 'null'); } catch (e) { prof = null; }
// With Shopify accounts on, the profile only ever comes from Shopify: drop any old on-site profile left in this browser
if (window.OrgoAccount && OrgoAccount.enabled) { prof = null; try { localStorage.removeItem('orgo-profile'); } catch (e) {} }
const saveProf = () => { if (prof && prof.shopify) return; try { prof ? localStorage.setItem('orgo-profile', JSON.stringify(prof)) : localStorage.removeItem('orgo-profile'); } catch (e) {} };
const PICON = {
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  loop: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>',
  team: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2c2.4-.3 4.4 1.3 5 4.3"/>',
  crown: '<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5Z"/>',
  cart: '<path d="M5 7h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7Z"/><path d="M9 7V5.5a3 3 0 0 1 6 0V7"/>',
  box: '<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9Z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>',
  truck: '<path d="M3 6h11v10H3ZM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  home: '<path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"/>'
};
const pic = (k, c = '#ffffff') => `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PICON[k]}</svg>`;
const LEVELS = [['Rookie', 0], ['Pacer', 10], ['Racer', 50], ['Legend', 150]];
const PERSONA = {
  'wild-berries': ['The Night Owl', 'Late sessions and deep focus. Berries keep you going after dark.'],
  'blood-orange': ['The Sunrise Sprinter', 'First out the door and first to the line. You run on citrus.'],
  'blue-pomegranate': ['The Deep Diver', 'Long, steady efforts and a cool head when it counts.'],
  'lemonade': ['The Bright Spark', 'Upbeat and quick, and you always bring the team along.']
};
// the same steps Shopify shows customers on its order status page
const STEPS = [['Confirmed', 'cart'], ['On its way', 'truck'], ['Out for delivery', 'pin'], ['Delivered', 'home']];
const DONE = STEPS.length - 1;
const fmtD = (iso, o = { month: 'short', day: 'numeric', year: 'numeric' }) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', o);
const localISO = t => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;   // local calendar date, not UTC
const isoPlus = d => { const t = new Date(); t.setDate(t.getDate() + d); return localISO(t); };
const totalLogs = () => prof ? Object.values(prof.logs).reduce((a, b) => a + b, 0) : 0;
const orderTotal = o => o.total != null ? o.total : o.items.reduce((a, l) => a + linePrice(l), 0);
function demoProfile() {
  return {
    name: 'Jordan Lee', email: 'jordan@example.com', since: '2026-06-14', no: '0042 0815 2026', demo: true,
    logs: { 'wild-berries': 9, 'blood-orange': 7, 'blue-pomegranate': 12, 'lemonade': 14 },
    addr: { street: '1180 Riverside Ave', city: 'Indianapolis', state: 'IN', zip: '46202', phone: '' },
    orders: [
      { id: 'ORG-10531', date: '2026-10-01', eta: '2026-10-07', step: 1, items: [{ flavor: 'variety', size: 24, sub: true, cad: 4, qty: 1 }] },
      { id: 'ORG-10388', date: '2026-09-03', step: 3, items: [{ flavor: 'variety', size: 24, sub: true, cad: 4, qty: 1 }] },
      { id: 'ORG-10214', date: '2026-08-06', step: 3, items: [{ flavor: 'lemonade', size: 12, sub: false, qty: 1 }, { flavor: 'blood-orange', size: 12, sub: false, qty: 1 }] },
      { id: 'ORG-10102', date: '2026-07-15', step: 3, items: [{ flavor: 'wild-berries', size: 12, sub: false, qty: 1 }] }
    ]
  };
}
function newProfile(name, email) {
  const n = String(Math.floor(1000 + Math.random() * 9000));
  return { name, email, since: isoPlus(0), no: `${n} ${String(Math.floor(1000 + Math.random() * 9000))} 2026`, logs: { 'wild-berries': 0, 'blood-orange': 0, 'blue-pomegranate': 0, 'lemonade': 0 }, addr: {}, orders: [] };
}
// favorite = the flavor ordered most (variety boxes don't count)
const faveFlavor = () => { if (!prof) return null; const c = {}; prof.orders.forEach(o => o.items.forEach(l => { if (l.flavor !== 'variety' && !l.custom) c[l.flavor] = (c[l.flavor] || 0) + l.qty; })); const e = Object.entries(c).sort((a, b) => b[1] - a[1]); return e.length ? e[0][0] : null; };
const topFlavor = () => { const e = Object.entries(prof.logs).sort((a, b) => b[1] - a[1]); return e[0][1] ? e[0][0] : null; };
const level = () => { const t = totalLogs(); let i = 0; LEVELS.forEach((l, k) => { if (t >= l[1]) i = k; }); return i; };
function badgeList() {
  const t = totalLogs();
  return [
    ['first', 'First squeeze', 'Log 1 pouch', 'drop', t >= 1, F[3]],
    ['explorer', 'Flavor explorer', 'Try all 4', 'star', Object.values(prof.logs).every(v => v > 0), F[0]],
    ['sub', 'Subscriber', 'Start a subscription', 'loop', prof.orders.some(o => o.items.some(l => l.sub)), F[2]],
    ['half', 'Half century', 'Log 50', 'bolt', t >= 50, F[1]],
    ['team', 'Team player', 'Join a team', 'team', false, F[2]],
    ['legend', 'Legend', 'Log 150', 'crown', t >= 150, F[0]]
  ];
}
let sqFlav = 'lemonade', prevBadges = null;
function memberCard(name, tier) {
  const logo = $('.logo-img') ? $('.logo-img').src : '';
  const num = prof ? prof.no.split(' ')[0] : '0000';
  const fave = prof && faveFlavor() ? byId(faveFlavor()).name : '—';
  const since = prof ? fmtD(prof.since, { month: 'short', year: 'numeric' }) : 'Today';
  return `<span class="pin a"></span><span class="pin b"></span><span class="pin c"></span><span class="pin d"></span>
    <div class="bib-band"><img src="${logo}" alt="ORGO"><span>ATHLETE ID</span></div>
    <div class="bib-main"><div class="bib-num">${num}</div><div class="bib-name">${name}</div></div>
    <div class="bib-foot"><div><small>STATUS</small><b>${tier}</b></div><div><small>SINCE</small><b>${since}</b></div><div><small>FAVE</small><b>${fave}</b></div></div>`;
}
function cardTilt(wrap, card) {
  if (reduce || wrap.dataset.tilt) return; wrap.dataset.tilt = 1;
  wrap.addEventListener('pointermove', e => { const r = wrap.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `rotateY(${x * 22}deg) rotateX(${-y * 16}deg)`; card.style.setProperty('--sx', (x * 80) + '%'); });
  wrap.addEventListener('pointerleave', () => { card.style.transform = ''; card.style.setProperty('--sx', '-30%'); });
}
function renderProfile() {
  const signed = !!prof;
  $('#pfGate').hidden = signed; $('#pfDash').hidden = !signed;
  const ca = window.OrgoAccount && OrgoAccount.enabled;
  $('#signupForm').classList.toggle('ca', !!ca); $('#caLogin').hidden = !ca;
  if (signed) { $('#acEmail').readOnly = !!prof.shopify; }
  if (!signed) {
    if (!$('#pfGateVis').children.length) {
      $('#pfGateVis').innerHTML = `<div class="mcard-wrap" style="width:min(80%,420px)"><div class="mcard" id="gateCard" style="--ca:${F[2].a};--cb:${F[0].b};rotate:-5deg">${memberCard('YOUR NAME', 'Member')}</div></div>` +
        [['16%', '22%', '-14deg', 3], ['86%', '76%', '12deg', 1]].map((p, i) => `<div style="position:absolute;left:${p[0]};top:${p[1]};translate:-50% -50%;rotate:${p[2]}"><div class="floaty gate-pouch" style="animation:float 6s ease-in-out infinite;animation-delay:${-i * 2}s">${pouchHTML(F[p[3]], 'idle')}</div></div>`).join('');
      cardTilt($('#pfGateVis .mcard-wrap'), $('#gateCard'));
    }
    return;
  }
  const lv = level(), t = totalLogs(), tf = faveFlavor(), fT = tf ? byId(tf) : F[2];
  const card = $('#mcard'); card.style.setProperty('--ca', fT.id === 'lemonade' ? '#22c09b' : fT.a); card.style.setProperty('--cb', fT.b);
  const isSub = (() => { const sb = subState(); return !!sb && sb.status !== 'cancelled'; })();
  card.classList.toggle('gold', isSub);
  const tier = isSub ? 'Subscriber' : prof.orders.length ? 'Presale' : 'Member';
  card.innerHTML = memberCard(prof.name, tier).replace('<span>ATHLETE ID</span>', isSub ? '<span>SUBSCRIBER</span>' : '<span>ATHLETE ID</span>');
  cardTilt($('#mcardWrap'), card);
  $('#pfSince').textContent = `Member since ${fmtD(prof.since, { month: 'long', year: 'numeric' })}${prof.demo ? ' · Demo profile' : ''}`;
  $('#pfHi').textContent = `Hey, ${prof.name.split(' ')[0]}.`;
  const nxt = LEVELS[lv + 1];
  $('#lvlName').textContent = LEVELS[lv][0];
  $('#lvlCount').textContent = `${t} pouch${t === 1 ? '' : 'es'} squeezed`;
  $('#lvlFill').style.width = nxt ? `${((t - LEVELS[lv][1]) / (nxt[1] - LEVELS[lv][1]) * 100).toFixed(1)}%` : '100%';
  $('#lvlNext').textContent = nxt ? `${nxt[1] - t} more to reach ${nxt[0]}` : 'Top level reached. Respect.';
  const nb = badgeList().filter(b => b[4]).length;
  $('#pfQuick').innerHTML = `<span><em>Orders</em>${prof.orders.length}</span><span><em>Status</em>${isSub ? 'Subscriber' : prof.orders.length ? 'Presale' : 'Member'}</span><span><em>First drop</em>Ships ${DROP}</span>`;
  // squeeze flavors
  $('#sqFlav').innerHTML = F.map(f => `<button type="button" class="${f.id === sqFlav ? 'on' : ''}" data-sq="${f.id}" style="--fa:${f.a};--fb:${f.b}" aria-label="${f.name}"></button>`).join('');
  $('#sqPouch').innerHTML = pouchHTML(byId(sqFlav), 'idle');
  $$('[data-sq]').forEach(b => b.onclick = () => { sqFlav = b.dataset.sq; renderProfile(); });
  // persona
  const P = tf ? PERSONA[tf] : ['Still warming up', 'Log your first pouch to discover your flavor personality.'];
  const max = Math.max(1, ...Object.values(prof.logs));
  $('#persona').style.setProperty('--pa', fT.b); $('#persona').style.setProperty('--pb', fT.a);
  $('#persona').innerHTML = `<div class="pp">${pouchHTML(fT, 'idle')}</div><span class="eyebrow">Flavor personality</span><h3>${P[0]}</h3><p style="max-width:24ch">${P[1]}</p>
    <div class="pmix">${F.map(f => `<div><span>${f.name}</span><span class="num">${prof.logs[f.id]}</span><i><b style="width:${(prof.logs[f.id] / max * 100).toFixed(0)}%"></b></i></div>`).join('')}</div>`;
  if (fT.id === 'lemonade') { $('#persona').style.setProperty('--pa', '#12896b'); $('#persona').style.setProperty('--pb', '#22c09b'); }
  // badges
  const bl = badgeList(), got = bl.filter(b => b[4]).map(b => b[0]);
  $('#badgeCount').textContent = `${got.length} of ${bl.length}`;
  $('#badgeGrid').innerHTML = bl.map(b => `<div class="bdg${b[4] ? '' : ' locked'}${prevBadges && b[4] && !prevBadges.includes(b[0]) ? ' pop' : ''}" style="--fa:${b[5].a};--fb:${b[5].b}"><i>${pic(b[3], b[4] ? '#ffffff' : '#9aa0b8')}</i><b>${b[1]}</b><small>${b[2]}</small></div>`).join('');
  prevBadges = got;
  // orders
  const cur = prof.orders.find(o => o.step < DONE);
  const itemsHTML = o => o.items.map(l => { const f = byId(l.flavor); return `<div class="oitem" style="--fa:${f.a};--fb:${f.b}"><span class="oi-pouch">${pouchHTML(f)}</span><span>${f.name} · ${l.size}${l.qty > 1 ? ` × ${l.qty}` : ''}${l.sub ? ` · every ${l.cad} wk` : ''}</span><span>${money(linePrice(l))}</span></div>`; }).join('');
  const A = prof.addr || {};
  const addrHTML = A.street ? `${prof.name}<br>${A.street}<br>${A.city}, ${A.state} ${A.zip}` : (cur && cur.shopify ? 'The address you entered at checkout' : '<span style="color:#c2185b">No address yet. Add one below.</span>');
  if (cur) {
    const tw = (cur.step / DONE * 75).toFixed(1) + '%';
    const shipped = cur.step > 0, etaD = shipped && cur.eta ? cur.eta : (cur.ship || SHIP_DATE);
    const hasSub = cur.items.some(l => l.sub);
    $('#curOrder').innerHTML = `<div class="order">
      <div class="order-head"><div><h3>Order ${cur.id}</h3><p class="note">Placed ${fmtD(cur.date)} · ${money(orderTotal(cur))}</p></div>
        <div class="eta"><span class="eyebrow">${shipped ? 'Arriving' : 'Ships'}</span><b>${fmtD(etaD, { weekday: 'short', month: 'short', day: 'numeric' })}</b>${cur.tracking ? `<small class="note">${cur.tracking}</small>` : ''}</div></div>
      <div class="track" style="--tw:${tw}"><i class="fill"></i>
        ${STEPS.map((s, i) => `<div class="${i < cur.step ? 'done' : i === cur.step ? 'now' : ''}"><span>${pic(s[1], i <= cur.step ? '#ffffff' : '#9aa0b8')}</span><b>${s[0]}</b><small>${i <= cur.step ? (i === cur.step ? 'Now' : 'Done') : ''}</small></div>`).join('')}
      </div>
      <div class="order-cols">
        <div><span class="eyebrow">Items</span>${itemsHTML(cur)}</div>
        <div><span class="eyebrow">Shipping to</span><p>${addrHTML}</p></div>
        <div><span class="eyebrow">Delivery</span><p>Free standard shipping<br>${hasSub ? `Subscription · every ${(cur.items.find(l => l.sub) || {}).cad || 4} weeks after your first box` : cur.ship ? 'One-time preorder' : 'One-time order'}</p></div>
      </div>
      <div class="order-acts">${hasSub ? '<button class="btn btn-ghost" type="button" data-oact="manage">Manage subscription</button>' : ''}<button class="btn btn-ghost" type="button" data-oact="track">Track package</button></div>
    </div>`;
  } else {
    $('#curOrder').innerHTML = `<div class="empty-card"><div class="empty-pouch" style="rotate:-8deg">${pouchHTML(F[1], 'idle')}</div><p>No order on the way. Your next box is one click away.</p><div class="order-acts"><a class="btn btn-ink" href="#shop">Preorder flavors</a><a class="btn btn-ghost" href="#subscribe">Subscribe &amp; save</a></div></div>`;
  }
  const past = prof.orders.filter(o => o !== cur);
  $('#pastOrders').innerHTML = past.length ? `<div class="hist"><div class="hrow hh"><span>Order</span><span>Items</span><span>Date</span><span>Total</span><span></span></div>
    ${past.map(o => `<div class="hrow"><div><span class="id">${o.id}</span><br><span class="pill"${o.step < DONE ? ' style="background:#eef0ff;color:#5a34d6"' : ''}>${STEPS[Math.min(o.step, DONE)][0]}</span></div>
      <div class="dots-flav">${o.items.map(l => { const f = byId(l.flavor); return `<i style="--fa:${f.a};--fb:${f.b}" title="${f.name}"></i>`; }).join('')}<span>${o.items.map(l => `${byId(l.flavor).name} ${l.size}`).join(', ')}</span></div>
      <span>${fmtD(o.date)}</span><span class="tot">${money(orderTotal(o))}</span><button class="btn btn-ghost" type="button" data-reorder="${o.id}">Reorder</button></div>`).join('')}</div>`
    : `<div class="empty-card"><p>Your past orders will show up here.</p></div>`;
  renderMySub();
  // real tracking + subscription management live in the Shopify customer account (config.js → customerAccountUrl)
  $$('[data-oact]').forEach(b => b.onclick = () => { if (b.dataset.oact === 'track' && cur && cur.trackingUrl) { window.open(cur.trackingUrl, '_blank', 'noopener'); return; }
    if (b.dataset.oact === 'manage' && SUB_PORTAL()) { location.href = SUB_PORTAL(); return; }
    if (CFG.customerAccountUrl) { location.href = CFG.customerAccountUrl; return; }
    toast(b.dataset.oact === 'manage' ? 'Subscription settings open once the store is live' : `Tracking appears here once your box ships on ${fmtD(cur && cur.ship || isoPlus(0), { month: 'short', day: 'numeric' })}`); });
  $$('[data-reorder]').forEach(b => b.onclick = () => { const o = prof.orders.find(x => x.id === b.dataset.reorder); o.items.forEach(l => addLine({ flavor: l.flavor, size: l.size, sub: false, qty: l.qty })); openCart(); });
  // account form
  $('#acName').value = prof.name; $('#acEmail').value = prof.email;
  $('#acStreet').value = A.street || ''; $('#acCity').value = A.city || ''; $('#acState').value = A.state || ''; $('#acZip').value = A.zip || ''; $('#acPhone').value = A.phone || '';
}
function confetti(x, y) {
  if (reduce) return;
  for (let i = 0; i < 28; i++) {
    const f = F[i % 4], el = document.createElement('i'); el.className = 'confetti';
    el.style.cssText = `left:${x}px;top:${y}px;background:linear-gradient(170deg,${f.a},${f.b})`;
    document.body.appendChild(el);
    const ang = Math.random() * Math.PI * 2, d = 80 + Math.random() * 140;
    el.animate([{ transform: 'translate(-50%,-50%) rotate(0)', opacity: 1 }, { transform: `translate(${Math.cos(ang) * d}px, ${Math.sin(ang) * d - 60}px) rotate(${Math.random() * 720 - 360}deg)`, opacity: 0 }],
      { duration: 900 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => el.remove();
  }
}
function setupSqueeze() {
  const arc = $('#sqArc'), C = 339.3; let t0 = 0, raf = 0, holding = false;
  const reset = () => { holding = false; cancelAnimationFrame(raf); arc.style.transition = 'stroke-dashoffset .35s'; arc.style.strokeDashoffset = C; $('#sqPouch').style.transform = ''; $('#sqBtn').textContent = 'Hold to squeeze'; };
  const loop = now => {
    const p = Math.min(1, (now - t0) / 850);
    arc.style.strokeDashoffset = C * (1 - p);
    $('#sqPouch').style.transform = `scaleX(${1 - p * .32}) scaleY(${1 + p * .06}) rotate(${Math.sin(now / 40) * p * 2}deg)`;
    if (p >= 1) {
      holding = false; prof.logs[sqFlav]++; saveProf();
      const r = $('#sqStage').getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2);
      toast(`+1 ${byId(sqFlav).name}. Nice squeeze.`);
      setTimeout(() => { reset(); renderProfile(); }, 120); return;
    }
    if (holding) raf = requestAnimationFrame(loop);
  };
  const start = e => { e.preventDefault(); if (holding) return; holding = true; arc.style.transition = 'none'; t0 = performance.now(); $('#sqBtn').textContent = 'Keep holding…'; raf = requestAnimationFrame(loop); };
  [$('#sqStage'), $('#sqBtn')].forEach(el => {
    el.addEventListener('pointerdown', start);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => el.addEventListener(ev, () => { if (holding) reset(); }));
    el.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !holding) start(e); });
    el.addEventListener('keyup', e => { if ((e.key === ' ' || e.key === 'Enter') && holding) reset(); });
  });
}
setupSqueeze();
/* ---------- Your subscription (Profile) ----------
   Shows the shopper's subscription and lets them change flavor/size, change timing or cancel.
   Live store: every action opens the subscription app's customer portal in Shopify (config.js → subscriptionPortalUrl,
   falling back to customerAccountUrl), so the change happens on the real subscription contract.
   Preview (no URLs set): changes are saved with the browser profile so the flow can be tried end to end. */
const SUB_PORTAL = () => CFG.subscriptionPortalUrl || CFG.customerAccountUrl || '';
function subState() {
  if (!prof) return null;
  if (prof.shopify && 'sub' in prof) return prof.sub ? { start: SHIP_DATE, ...prof.sub } : null;   // live from Shopify
  if (prof.sub) return prof.sub;
  const o = [...(prof.orders || [])].reverse().find(x => x.items.some(l => l.sub)); if (!o) return null;
  const l = o.items.find(x => x.sub);
  return { flavor: l.flavor, size: l.size, cad: l.cad || 4, start: o.ship || SHIP_DATE, ordered: o.date, status: 'active' };
}
/* Box 1 ships on the presale date; renewals run every N weeks counted from that ship date
   (presale subscriptions are rescheduled in Seal to match). */
function nextBox(sb) {
  const today = isoPlus(0);
  if (sb.next) return sb.next < sb.start ? sb.start : sb.next;   // real next charge date from Shopify
  let n = sb.start;
  while (n < today) n = plusDays(n, sb.cad * 7);
  return n;
}
let subEditing = false;
function renderMySub() {
  const sec = $('#pfSubSec'), box = $('#pfSub'), sb = subState();
  sec.hidden = !sb; if (!sb) return;
  const f = byId(sb.flavor) || VARIETY, name = f.id === 'variety' ? 'Variety' : f.name;
  if (sb.status === 'cancelled') {
    box.innerHTML = `<div class="subc off"><div class="subc-vis">${pouchHTML(f, 'idle')}</div><div class="subc-main"><span class="subc-pill off">Cancelled</span><h3>${name} · ${sb.size} pouches</h3><p>Your subscription is cancelled, so the ${SUB_PCT}% subscriber price no longer applies.</p></div><div class="subc-acts"><a class="btn btn-ink" href="#subscribe">Restart subscription</a></div></div>`;
    return;
  }
  const nb = nextBox(sb);
  box.innerHTML = `<div class="subc" style="--fa:${f.a};--fb:${f.b}">
      <div class="subc-vis">${pouchHTML(f, 'idle')}</div>
      <div class="subc-main"><span class="subc-pill">${sb.status === 'paused' ? 'Paused' : 'Active'} · ${SUB_PCT}% off from box 2</span><h3>${name} · ${sb.size} pouches</h3>
        <p>Every ${sb.cad} weeks · next box <b>${fmtD(nb, { month: 'long', day: 'numeric' })}</b> · <b>${money(nb === sb.start && !sb.shippedFirst ? PRICE[sb.size] : SUBP[sb.size])}</b> <s>${money(REG[sb.size])}</s>${nb === sb.start && !sb.shippedFirst ? ` <span class="subc-then">then ${money(SUBP[sb.size])} from box 2</span>` : ''}</p></div>
      <div class="subc-acts"><button type="button" class="btn btn-ghost" data-subact="edit">Change flavor or size</button><button type="button" class="btn btn-ghost" data-subact="timing">Change timing</button><button type="button" class="subc-cancel" data-subact="cancel">Cancel subscription</button></div>
    </div>
    <div class="subc-edit" id="subEdit"${subEditing ? '' : ' hidden'}>
      <div class="se-row"><span class="eyebrow">Flavor</span><div class="se-opts">${F.concat([VARIETY]).map(x => `<button type="button" class="se-fl${x.id === sb.flavor ? ' on' : ''}" data-sef="${x.id}" style="--fa:${x.a};--fb:${x.b}" aria-label="${x.id === 'variety' ? 'Variety' : x.name}" title="${x.id === 'variety' ? 'Variety' : x.name}"></button>`).join('')}</div></div>
      <div class="se-row"><span class="eyebrow">Pack size</span><div class="se-opts">${[12, 24].map(n => `<button type="button" class="se-chip${n === sb.size ? ' on' : ''}" data-ses="${n}">${n} pouches · ${money(SUBP[n])}</button>`).join('')}</div></div>
      <div class="se-row" id="seTiming"><span class="eyebrow">Delivery</span><div class="se-opts">${CAD.map(n => `<button type="button" class="se-chip${n === sb.cad ? ' on' : ''}" data-sec="${n}">Every ${n} weeks</button>`).join('')}</div></div>
      <div class="se-foot"><button type="button" class="btn btn-ghost" data-subact="close">Done</button></div>
    </div>`;
  const portal = SUB_PORTAL();
  const save = patch => { prof.sub = Object.assign({}, sb, patch); saveProf(); renderMySub(); toast('Subscription updated'); };
  $$('[data-subact]', box).forEach(b => b.onclick = async () => {
    const act = b.dataset.subact;
    if (act === 'close') { subEditing = false; renderMySub(); return; }
    if (act === 'cancel') {
      const sure = await confirmBox({ title: 'Cancel your subscription?', body: `Your ${SUB_PCT}% subscriber price ends with it, and it may not be available if you come back later. Need fewer boxes? You can change your timing instead.`, yes: 'Yes, cancel', no: 'Keep my subscription' });
      if (!sure) return;
      if (portal) { location.href = portal; return; }
      prof.sub = Object.assign({}, sb, { status: 'cancelled' }); saveProf(); subEditing = false; renderMySub(); renderProfile(); return;
    }
    if (portal) { location.href = portal; return; }
    subEditing = true; renderMySub();
    const t = act === 'timing' ? $('#seTiming') : $('#subEdit'); if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  });
  $$('[data-sef]', box).forEach(b => b.onclick = () => save({ flavor: b.dataset.sef }));
  $$('[data-ses]', box).forEach(b => b.onclick = () => save({ size: +b.dataset.ses }));
  $$('[data-sec]', box).forEach(b => b.onclick = () => save({ cad: +b.dataset.sec }));
}
/* ---------- sign up / sign back in (browser-saved profile; Shopify login takes over once connected) ---------- */
const SAVED_KEY = 'orgo-profile-saved';
const pwHash = async (email, pass) => {
  try { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`orgo|${email.toLowerCase()}|${pass}`)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join(''); }
  catch (e) { return ''; }
};
let suMode = 'up';
function setSuMode(m) {
  suMode = m; const inMode = m === 'in';
  $('#suEyebrow').textContent = inMode ? 'Welcome back' : 'Join ORGO';
  $('#suTitle').textContent = inMode ? 'Sign in.' : 'Create your profile.';
  $('#suLede').textContent = inMode ? 'Pick up where you left off: your preorder, shipping and order history.' : 'Track your preorder, shipping and order history in one place.';
  $('#suNameRow').hidden = inMode; $('#suName').required = !inMode;
  $('#suPass').autocomplete = inMode ? 'current-password' : 'new-password';
  $('#suPass').placeholder = inMode ? 'Your password' : 'At least 6 characters';
  $('#suSubmit').textContent = inMode ? 'Sign in' : 'Create profile';
  $('#suSwitchQ').textContent = inMode ? 'New to ORGO?' : 'Already have a profile?';
  $('#suSwitchBtn').textContent = inMode ? 'Create a profile' : 'Sign in';
  $('#suErr').hidden = true; $$('#signupForm .is-bad').forEach(el => el.classList.remove('is-bad'));
}
$('#suSwitchBtn').addEventListener('click', () => { setSuMode(suMode === 'in' ? 'up' : 'in'); (suMode === 'in' ? $('#suEmail') : $('#suName')).focus(); });
$('#signupForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('#suEmail').value.trim(), pass = $('#suPass').value;
  if (suMode === 'in') {
    let saved = null; try { saved = JSON.parse(localStorage.getItem(SAVED_KEY) || 'null'); } catch (x) {}
    const ok = saved && saved.email && saved.email.toLowerCase() === email.toLowerCase() && (!saved.pw || saved.pw === await pwHash(email, pass));
    if (!ok) {
      $('#suErr').hidden = false;
      [$('#suEmail'), $('#suPass')].forEach(el => { el.classList.remove('is-bad'); void el.offsetWidth; el.classList.add('is-bad'); });
      return;
    }
    prof = saved; try { localStorage.removeItem(SAVED_KEY); } catch (x) {}
    const g = guestOrders(); if (g.length) { prof.orders = [...g, ...(prof.orders || [])]; clearGuestOrders(); }
    $('#suPass').value = ''; prevBadges = null; saveProf(); setSuMode('up'); welcomeIntro(true); return;
  }
  prof = newProfile($('#suName').value.trim(), email); prof.pw = await pwHash(email, pass);
  prof.orders = guestOrders(); clearGuestOrders(); $('#suPass').value = ''; prevBadges = null; saveProf();
  try { localStorage.removeItem(SAVED_KEY); } catch (x) {}
  welcomeIntro();
});
document.addEventListener('input', e => { if (e.target.closest && e.target.closest('#signupForm')) $('#suErr').hidden = true; });
try { if (!prof && localStorage.getItem(SAVED_KEY)) setSuMode('in'); } catch (e) {}
/* ---------- sign out: confirm first ---------- */
function confirmBox({ title, body, yes, no }) {
  return new Promise(res => {
    const prev = document.activeElement;
    const ov = document.createElement('div'); ov.className = 'cfm';
    ov.innerHTML = `<div class="cfm-card" role="alertdialog" aria-modal="true" aria-labelledby="cfmT" aria-describedby="cfmB">
      <h3 id="cfmT">${title}</h3><p id="cfmB">${body}</p>
      <div class="cfm-actions"><button type="button" class="btn btn-ink cfm-no">${no}</button><button type="button" class="btn btn-ghost cfm-yes">${yes}</button></div></div>`;
    document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add('on'));
    const close = v => { ov.classList.remove('on'); document.removeEventListener('keydown', key); setTimeout(() => ov.remove(), 250); if (prev && prev.focus) prev.focus({ preventScroll: true }); res(v); };
    const key = e => { if (e.key === 'Escape') close(false); if (e.key === 'Tab') { const b = [$('.cfm-no', ov), $('.cfm-yes', ov)]; const i = b.indexOf(document.activeElement); e.preventDefault(); b[(i + 1) % 2].focus(); } };
    document.addEventListener('keydown', key);
    ov.addEventListener('click', e => { if (e.target === ov) close(false); });
    $('.cfm-no', ov).addEventListener('click', () => close(false)); $('.cfm-yes', ov).addEventListener('click', () => close(true));
    $('.cfm-no', ov).focus();
  });
}
/* ---------- form checks: no browser pop-up bubbles; a bad field gets a red outline and a little shake ---------- */
$$('form').forEach(f => { f.noValidate = true; });
document.addEventListener('submit', e => {
  const f = e.target; if (!(f instanceof HTMLFormElement)) return;
  const short = el => el.minLength > 0 && el.value.length > 0 && el.value.length < el.minLength;
  const bad = [...f.elements].filter(el => el.willValidate && (!el.checkValidity() || short(el)));
  if (!bad.length) return;
  e.preventDefault(); e.stopImmediatePropagation();
  bad.forEach(el => { el.classList.remove('is-bad'); void el.offsetWidth; el.classList.add('is-bad'); el.setAttribute('aria-invalid', 'true'); });
  bad[0].focus({ preventScroll: false });
}, true);
document.addEventListener('input', e => { const el = e.target; if (el.classList && el.classList.contains('is-bad') && el.checkValidity() && !(el.minLength > 0 && el.value.length < el.minLength)) { el.classList.remove('is-bad'); el.removeAttribute('aria-invalid'); } });
/* ---------- after sign-up: a short "getting your locker ready" beat, then a welcome reveal ---------- */
function welcomeIntro(back) {
  const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const first = (prof.name || 'Athlete').split(' ')[0];
  const num = prof.no.split(' ')[0];
  const ov = document.createElement('div'); ov.className = 'pf-intro'; ov.setAttribute('role', 'status'); ov.setAttribute('aria-live', 'polite');
  const steps = back ? ['Checking your details', 'Loading your orders', 'Getting your locker ready'] : ['Creating your athlete ID', 'Saving your details', 'Getting your locker ready'];
  ov.innerHTML = `<div class="pi-load">
      <div class="pi-ring"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28"/><circle class="pi-arc" cx="32" cy="32" r="28"/></svg></div>
      <h3>${back ? 'Signing you in' : 'Setting things up'}</h3>
      <ul class="pi-steps">${steps.map(t => `<li><i></i><span>${t}</span></li>`).join('')}</ul>
      <div class="pi-bar"><b></b></div>
    </div>
    <div class="pi-hello" hidden>
      <div class="mcard-wrap pi-card"><div class="mcard" style="--ca:${F[2].a};--cb:${F[0].b}">${memberCard(esc(prof.name).toUpperCase(), 'Member')}</div></div>
      <span class="eyebrow">${back ? 'Signed in' : "You're in"}</span>
      <h2>${back ? 'Welcome back' : 'Welcome'}, ${esc(first)}.</h2>
      <p>${back ? 'Everything is right where you left it.' : 'Your athlete ID is ready. Preorders, shipping and order history all live here.'}</p>
      <button type="button" class="btn btn-ink pi-go">Enter my profile</button>
    </div>`;
  document.body.appendChild(ov); document.body.classList.add('pi-lock');
  requestAnimationFrame(() => ov.classList.add('on'));
  const lis = $$('.pi-steps li', ov), bar = $('.pi-bar b', ov);
  const stepMs = reduce ? 150 : 650;
  lis.forEach((li, i) => setTimeout(() => { li.classList.add('done'); bar.style.width = `${((i + 1) / lis.length) * 100}%`; }, stepMs * (i + 1)));
  let gone = false;
  const finish = () => { if (gone) return; gone = true; ov.classList.add('out'); document.body.classList.remove('pi-lock'); setTimeout(() => ov.remove(), 600); };
  setTimeout(() => {
    renderProfile(); window.scrollTo(0, 0);
    ov.classList.add('hello'); $('.pi-load', ov).hidden = true; $('.pi-hello', ov).hidden = false;
    const n = $('.pi-card .bib-num', ov);
    if (!reduce && n) { let k = 0; const t = setInterval(() => { n.textContent = k++ < 14 ? String(Math.floor(1000 + Math.random() * 9000)) : num; if (k > 14) clearInterval(t); }, 55); }
    setTimeout(() => { const r = $('.pi-card', ov).getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2); }, reduce ? 0 : 650);
    $('.pi-go', ov).addEventListener('click', finish); $('.pi-go', ov).focus({ preventScroll: true });
    setTimeout(finish, reduce ? 2500 : 4200);
  }, stepMs * (lis.length + 1) + 150);
}
$('#demoBtn').addEventListener('click', () => { prof = demoProfile(); prevBadges = null; saveProf(); renderProfile(); window.scrollTo(0, 0); });
$('#signOut').addEventListener('click', async () => {
  const sure = await confirmBox({ title: 'Sign out of ORGO?', body: 'Your profile and orders stay saved. You can sign back in any time.', yes: 'Yes, sign out', no: 'Stay signed in' });
  if (!sure) return;
  if (prof && prof.shopify) { prof = null; OrgoAccount.logout(); return; }
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(prof)); } catch (e) {}
  prof = null; prevBadges = null; saveProf(); setSuMode('in'); renderProfile(); window.scrollTo(0, 0);
});
$('#acctForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (prof && prof.shopify) {
    const n = $('#acNote'), next = { name: $('#acName').value.trim(), addr: { ...prof.addr, street: $('#acStreet').value.trim(), city: $('#acCity').value.trim(), state: $('#acState').value.trim(), zip: $('#acZip').value.trim(), phone: $('#acPhone').value.trim() } };
    n.textContent = 'Saving to your account…';
    try { await OrgoAccount.save(next); prof = await OrgoAccount.load(); renderProfile(); n.textContent = 'Saved to your account.'; n.classList.add('ok'); }
    catch (err) { console.error('[ORGO] save details', err); n.textContent = err.message || 'Couldn’t save. Try again.'; }
    setTimeout(() => { n.textContent = 'Saved to your ORGO account.'; n.classList.remove('ok'); }, 2600);
    return;
  }
  prof.name = $('#acName').value.trim(); prof.email = $('#acEmail').value.trim();
  prof.addr = { street: $('#acStreet').value.trim(), city: $('#acCity').value.trim(), state: $('#acState').value.trim(), zip: $('#acZip').value.trim(), phone: $('#acPhone').value.trim() };
  saveProf(); renderProfile(); const n = $('#acNote'); n.textContent = 'Saved.'; n.classList.add('ok');
  setTimeout(() => { n.textContent = 'Payment is added at checkout once the store is live.'; n.classList.remove('ok'); }, 2200);
});
function placeOrder() {
  if (!prof) { closeCart(); location.hash = '#profile'; toast('Create a profile to check out'); return; }
  if (!prof.addr || !prof.addr.street) { closeCart(); location.hash = '#profile'; setTimeout(() => { $('#acStreet').scrollIntoView({ behavior: 'smooth', block: 'center' }); $('#acStreet').focus(); }, 300); toast('Add a shipping address first'); return; }
  const id = 'ORG-' + (10600 + Math.floor(Math.random() * 9000));
  prof.orders.unshift({ id, date: isoPlus(0), eta: isoPlus(5), step: 0, items: cart.map(l => ({ ...l })) });
  cart = []; save(); saveProf(); renderCart(); closeCart();
  lastOrderId = id; tyOrder = null; try { sessionStorage.setItem('orgo-last-order', id); } catch (e) {}
  if (location.hash === '#thanks') { renderThanks(); window.scrollTo(0, 0); } else location.hash = '#thanks';
}

/* ---------- THANK YOU / ORDER CONFIRMATION ----------
   Connect payments later by calling ORGO.showConfirmation(order) after a successful payment
   (e.g. on Stripe Checkout's success_url, after your server confirms the session).
   Expected order shape:
   { id, date:'YYYY-MM-DD', eta:'YYYY-MM-DD', email, items:[{ flavor, size:12|24, sub:bool, cad:2|4|6, qty }],
     shipping:{ name, street, city, state, zip }, payment:{ brand:'Visa', last4:'4242' } } */
let lastOrderId = null;
try { lastOrderId = sessionStorage.getItem('orgo-last-order'); } catch (e) {}
let tyOrder = null;
const TY_LINES = ['You just fueled your next PR.', 'You’re in the first drop.', 'Training partner: secured.', 'Tear. Squeeze. Go. Soon.', 'Ships December 29. Get ready.'];
let tyTimer = null;
function sampleOrder() {
  return { id: 'ORG-10642', date: isoPlus(0), eta: isoPlus(5), email: 'you@email.com', sample: true,
    items: [{ flavor: 'variety', size: 24, sub: true, cad: 4, qty: 1 }, { flavor: 'lemonade', size: 12, sub: false, qty: 1 }],
    shipping: { name: 'Jordan Lee', street: '1180 Riverside Ave', city: 'Indianapolis', state: 'IN', zip: '46202' }, payment: { brand: 'Visa', last4: '4242' } };
}
function renderThanks() {
  let o = tyOrder;
  if (!o && prof && lastOrderId) { const p = prof.orders.find(x => x.id === lastOrderId); if (p) o = { ...p, email: prof.email, shipping: { name: prof.name, ...(prof.addr || {}) } }; }
  if (!o) o = sampleOrder();
  const first = (o.shipping && o.shipping.name ? o.shipping.name : (prof ? prof.name : '')).split(' ')[0];
  const title = first ? `Thank you, <span class="grad">${first}.</span>` : 'Thank <span class="grad">you.</span>';
  // split title into animated characters (keep the gradient span intact)
  const tmp = document.createElement('div'); tmp.innerHTML = title; let i = 0;
  const wrap = node => { if (node.nodeType === 3) { const frag = document.createDocumentFragment(); node.textContent.split(/(\s+)/).forEach(part => { if (!part) return; if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; } const w = document.createElement('span'); w.className = 'w'; [...part].forEach(c => { const sp = document.createElement('span'); sp.className = 'ch'; sp.style.setProperty('--i', i++); sp.textContent = c; w.appendChild(sp); }); frag.appendChild(w); }); node.replaceWith(frag); } else [...node.childNodes].forEach(wrap); };
  [...tmp.childNodes].forEach(wrap);
  $('#tyTitle').innerHTML = tmp.innerHTML;
  $('#tyEyebrow').innerHTML = 'Preorder confirmed';
  $('.ty-num > span').textContent = o.shopify ? 'Preorder reference' : 'Order number';
  $('#tyId').textContent = o.id;
  $('#tyMail').textContent = `Your receipt${o.shopify ? ' and order number are' : ' is'} on the way to ${o.email || 'your inbox'}. We'll send tracking as soon as it ships.`;
  $('#tyDate').textContent = `Placed ${fmtD(o.date)}`;
  // items
  const lines = o.items.map(l => { const f = byId(l.flavor) || VARIETY;
    return `<div class="ty-line"><span class="th" style="--t1:${f.t1};--t2:${f.t2}">${pouchHTML(f)}</span>
      <div><b>${f.id === 'variety' ? 'Variety' : f.name} · ${l.size}-pouch box${l.qty > 1 ? ` × ${l.qty}` : ''}</b>
      <small>${l.sub ? `Subscription · every ${l.cad} weeks · then ${money(renewPrice(l))} from box 2` : 'One-time preorder'}</small><span class="ty-tag">SAVING ${PRESALE_PCT}%${l.sub ? ` · ${SUB_PCT}% FROM BOX 2` : ''}</span></div>
      <span class="pr">${money(linePrice(l))}<s>${money(REG[l.size] * l.qty)}</s></span></div>`; }).join('');
  $('#tyLines').innerHTML = lines;
  const full = o.items.reduce((a, l) => a + REG[l.size] * l.qty, 0), paid = o.items.reduce((a, l) => a + linePrice(l), 0);
  const ship = 0;   // presale: free shipping on every preorder
  $('#tySum').innerHTML = `<div><span>Subtotal</span><span>${money(full)}</span></div>
    ${full - paid > 0.004 ? `<div class="save"><span>Presale savings</span><span>−${money(full - paid)}</span></div>` : ''}
    <div><span>Shipping</span><span>${ship ? money(ship) : 'Free'}</span></div>
    <div class="tot"><span>Total before tax</span><span>${money(paid + ship)}</span></div>
    <div><span>Tax</span><span>Shown on your receipt</span></div>`;
  $('#tyEta').textContent = fmtD(o.ship || o.eta, { weekday: 'long', month: 'short', day: 'numeric' });
  $('#tyTrack').innerHTML = STEPS.map(s => s[0]).map((t, k) => `<div class="${k === 0 ? 'on' : ''}"><i></i>${t}</div>`).join('');
  const S = o.shipping || {};
  $('#tyAddr').innerHTML = S.street ? `${S.name || ''}<br>${S.street}<br>${S.city}, ${S.state} ${S.zip}` : 'The address you entered at checkout';
  $('#tyPay').innerHTML = o.payment ? `${o.payment.brand} ending in ${o.payment.last4}` : 'Paid securely on checkout';
  const subLine = o.items.find(l => l.sub);
  $('#tySub').hidden = !subLine;
  if (subLine) { const firstShip = o.ship || SHIP_DATE; const nd = plusDays(firstShip, subLine.cad * 7);
    $('#tySub').innerHTML = `<span class="eyebrow">You're subscribed</span><b>First box ships ${fmtD(firstShip, { month: 'long', day: 'numeric' })}, the next one ${fmtD(nd, { month: 'long', day: 'numeric' })}.</b><p>Smart call. Your first box ships at the presale price, and from box 2 you get our best price, ${SUB_PCT}% off every box, for as long as you stay. Change or cancel whenever you want.</p>`; }
  // drop animation pouches
  $('#tyDrop').innerHTML = F.concat(F).map((f, k) => `<div class="dp" style="--x:${22 + (k * 9) % 56}%;--r:${(k % 2 ? 1 : -1) * (10 + k * 4)}deg;--d:${.2 + k * .09}s;--w2:${46 + (k % 3) * 8}px">${pouchHTML(f)}</div>`).join('');
  $('#tyBox').innerHTML = '<img class="ty-box-img" src="assets/img/products/variety-24-cutout.webp?v=3" alt="ORGO Variety 24-pack box with all four flavors">';
  // replay animation
  const h = $('#tyHero'); h.classList.remove('go'); void h.offsetWidth; h.classList.add('go');
  if (!reduce) setTimeout(() => { if ($('[data-page="thanks"]').hidden) return; const r = $('.ty-check').getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2); }, 1850);
  // rotating thank-you lines
  clearInterval(tyTimer); let li = 0; $('#tyLine').textContent = TY_LINES[0];
  if (!reduce) tyTimer = setInterval(() => { if ($('[data-page="thanks"]').hidden) return clearInterval(tyTimer); const el = $('#tyLine'); el.classList.add('out'); setTimeout(() => { li = (li + 1) % TY_LINES.length; el.textContent = TY_LINES[li]; el.classList.remove('out'); }, 350); }, 2600);
}
$('#tyCopy').addEventListener('click', () => {
  const t = $('#tyId').textContent, done = () => { $('#tyCopy').textContent = 'Copied'; setTimeout(() => $('#tyCopy').textContent = 'Copy', 1500); };
  try { navigator.clipboard.writeText(t).then(done, () => getSelection().selectAllChildren($('#tyId'))); } catch (e) { getSelection().selectAllChildren($('#tyId')); }
});
window.ORGO = { showConfirmation(order) { tyOrder = order; if (location.hash === '#thanks') renderThanks(); else location.hash = '#thanks'; } };

/* ---------- MOBILE MENU ---------- */
$('.mm-logo').innerHTML = `<img src="${$('.logo-img').src}" alt="ORGO">`;
const openMenu = () => { const m = $('#mmenu'); clearTimeout(m._t); m.classList.add('show'); void m.offsetWidth; m.classList.add('open'); $('#mscrim').classList.add('open'); $('#mmenu').setAttribute('aria-hidden', 'false'); $('#menuBtn').setAttribute('aria-expanded', 'true'); };
const closeMenu = () => { const m = $('#mmenu'); m.classList.remove('open'); clearTimeout(m._t); m._t = setTimeout(() => { if (!m.classList.contains('open')) m.classList.remove('show'); }, 520); $('#mscrim').classList.remove('open'); $('#mmenu').setAttribute('aria-hidden', 'true'); $('#menuBtn').setAttribute('aria-expanded', 'false'); };
$('#menuBtn').addEventListener('click', openMenu);
$('#menuClose').addEventListener('click', closeMenu);
$('.mm-logo').addEventListener('click', () => { closeMenu(); if (location.hash === '#home' || !location.hash) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
$('#mscrim').addEventListener('click', closeMenu);
$$('#mmenu a').forEach(a => a.addEventListener('click', closeMenu));
addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
$$('[data-open-cart]').forEach(b => b.addEventListener('click', closeMenu));

/* ---------- SOCIAL LINKS ----------
   Paste each profile URL below when the accounts are ready. Empty links stay on the page and show a note instead of navigating. */
const SOCIAL_LINKS = { instagram: 'https://www.instagram.com/orgofuel', tiktok: 'https://www.tiktok.com/@orgofuel', pinterest: 'https://pin.it/1z8lQfi3u', facebook: 'https://www.facebook.com/share/1Mxvr32J9x/' };
$$('[data-social]').forEach(a => {
  const url = SOCIAL_LINKS[a.dataset.social];
  if (url) a.href = url;
  else a.addEventListener('click', e => { e.preventDefault(); toast(`${a.title} link coming soon`); });
});

/* ---------- DETAILS SWIPER ---------- */
(function () {
  const track = $('#swTrack'); if (!track) return;
  const slides = $$('.sw-slide', track), tabs = $$('#swTabs button'), dots = $$('#swDots i');
  let cur = 0;
  const go = i => { cur = Math.max(0, Math.min(slides.length - 1, i)); track.scrollTo({ left: slides[cur].offsetLeft - slides[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' }); mark(cur); };
  const fit = i => { track.style.height = slides[i].offsetHeight + 'px'; };
  const mark = i => { fit(i); tabs.forEach((t, k) => { t.classList.toggle('on', k === i); t.setAttribute('aria-selected', k === i); }); dots.forEach((d, k) => d.classList.toggle('on', k === i));
    const t = tabs[i], bar = $('#swTabs'); if (t && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: t.offsetLeft - 16, behavior: 'smooth' }); };
  addEventListener('resize', () => fit(cur)); setTimeout(() => fit(0), 50);
  tabs.forEach((t, k) => t.addEventListener('click', () => go(k)));
  dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
  $$('[data-sw]').forEach(b => b.addEventListener('click', () => go(cur + +b.dataset.sw)));
  let to; track.addEventListener('scroll', () => { clearTimeout(to); to = setTimeout(() => { const i = Math.round(track.scrollLeft / track.clientWidth); if (i !== cur) { cur = i; mark(i); } }, 80); }, { passive: true });
})();

/* ---------- PRESALE + SHOPIFY ----------
   Checkout runs on Shopify: the cart below is sent to Shopify (assets/js/shopify.js) and the buyer pays on
   Shopify's hosted checkout. The old in-browser profile/order prototype (placeOrder, renderProfile, renderThanks)
   is kept in this file for the official launch but is not reachable in the presale build. */
const CFG = window.ORGO_CONFIG || {};
const SHIP_NOTE = (CFG.presale && CFG.presale.shipNote) || 'Ships December 29';
const DROP = (CFG.presale && CFG.presale.dropLabel) || '12.29';
let curPid = null;
// ---- presale orders: recorded on this device so the profile can show tracking + history ----
const SHIP_DATE = ((CFG.presale && CFG.presale.launchAt) || '2026-12-29').slice(0, 10);
const plusDays = (iso, d) => { const t = new Date(iso + 'T12:00:00'); t.setDate(t.getDate() + d); return localISO(t); };
const guestOrders = () => { try { return JSON.parse(localStorage.getItem('orgo-guest-orders') || '[]'); } catch (e) { return []; } };
const clearGuestOrders = () => { try { localStorage.removeItem('orgo-guest-orders'); } catch (e) {} };
const newOrderId = () => 'ORG-' + (10600 + Math.floor(Math.random() * 89000));
function recordOrder(o) {
  const order = { id: o.id || newOrderId(), date: o.date || isoPlus(0), ship: SHIP_DATE, eta: plusDays(SHIP_DATE, 5), step: 0, presale: true, shopify: !!o.shopify, demo: !!o.demo, items: o.items.map(l => ({ ...l })) };
  if (prof && prof.shopify) { OrgoAccount.load().then(p => { prof = p; }).catch(() => {}); }
  else if (prof) { prof.orders.unshift(order); saveProf(); }
  else { const g = guestOrders(); g.unshift(order); try { localStorage.setItem('orgo-guest-orders', JSON.stringify(g)); } catch (e) {} }
  lastOrderId = order.id; try { sessionStorage.setItem('orgo-last-order', order.id); } catch (e) {}
  tyOrder = { ...order, email: prof ? prof.email : '', shipping: prof ? { name: prof.name, ...(prof.addr || {}) } : null };
  return order;
}
function showThanks() { if (location.hash === '#thanks') { renderThanks(); window.scrollTo(0, 0); } else location.hash = '#thanks'; }
async function startCheckout(btn) {
  if (!cart.length) return;
  const label = btn ? btn.textContent : '';
  const survey = window.OrgoSurvey ? await OrgoSurvey.answersForCheckout() : { answers: {}, status: 'off' };
  const attributes = [{ key: 'Presale', value: 'Yes' }, { key: 'Ships', value: SHIP_NOTE }];
  if (survey.status !== 'off') attributes.push({ key: 'Survey', value: survey.status });
  Object.entries(survey.answers || {}).forEach(([key, value]) => attributes.push({ key, value }));
  if (!window.OrgoShopify || !OrgoShopify.enabled) {
    console.info('[ORGO] Demo mode — add your Shopify domain + Storefront token in assets/js/config.js. Order attributes that would be sent:', attributes);
    recordOrder({ items: cart, demo: true });
    cart = []; save(); renderCart(); closeCart(); showThanks();
    return;
  }
  if (btn) { btn.disabled = true; btn.textContent = 'Opening secure checkout…'; }
  try {
    const id = newOrderId();
    const r = await OrgoShopify.checkout(cart, { attributes: attributes.concat([{ key: 'Preorder reference', value: id }]) });
    try { localStorage.setItem('orgo-pending-order', JSON.stringify({ id, date: isoPlus(0), items: cart })); } catch (e) {}
    location.href = r.checkoutUrl;
  } catch (err) {
    console.error('[ORGO] checkout failed', err);
    toast(err.userMessage || 'Checkout is unavailable right now. Please try again.');
    if (btn) { btn.disabled = false; btn.textContent = label; }
  }
}
// live Shopify prices → every price on the site
function applyPrices(p) {
  if (!p) return;
  [12, 24].forEach(n => { if (p.price[n] > 0) PRICE[n] = p.price[n]; if (p.reg && p.reg[n] > 0) REG[n] = p.reg[n]; if (p.subp[n] > 0) SUBP[n] = p.subp[n]; });
  fillPrices(); renderPacks(); renderHomeFlavors(); renderCart();
  $$('#subTab .js-pmax').forEach(e => e.textContent = pctMax());
  const page = location.hash.slice(1) || 'home';
  if (page === 'shop') renderShop();
  else if (page.startsWith('flavor-')) renderPDP(curPid);
  else if (page === 'subscribe') renderSub();
}
if (window.OrgoShopify && OrgoShopify.enabled) {
  OrgoShopify.load().then(applyPrices);
  // back from Shopify checkout: if that cart is gone, the order was placed → clear the on-site cart
  OrgoShopify.checkReturn().then(s => { if (s !== 'completed') return;
    let p = null; try { p = JSON.parse(localStorage.getItem('orgo-pending-order') || 'null'); localStorage.removeItem('orgo-pending-order'); } catch (e) {}
    cart = []; save(); renderCart();
    if (p) { recordOrder({ ...p, shopify: true }); showThanks(); } else toast('Preorder confirmed! Your receipt is in your inbox.'); });
}
window.ORGO_APP = { applyPrices, get cart() { return cart; } };
// ---- Shopify customer accounts (assets/js/shopify-account.js) ----
if (window.OrgoAccount && OrgoAccount.enabled) {
  $('#caLogin').addEventListener('click', () => OrgoAccount.login());
  OrgoAccount.handleCallback().then(() => {
    if (!OrgoAccount.signedIn()) return;
    OrgoAccount.load().then(p => { prof = p; const pg = location.hash.slice(1); if (pg === 'profile') renderProfile(); })
      .catch(e => { console.error('[ORGO] Could not load Shopify account', e); });
  });
}

/* ---------- ROUTER ---------- */
const POL_BASE_TITLE = document.title;
function route() {
  let h = location.hash.slice(1) || 'home';
  let page = h, pid = null;
  if (h.startsWith('flavor-')) { page = 'product'; pid = h.slice(7); }
  let polId = null; if (h.startsWith('policy-')) { page = 'policy'; polId = h.slice(7); }
  if (!['home', 'shop', 'product', 'subscribe', 'science', 'about', 'profile', 'thanks', 'policy'].includes(page)) page = 'home';
  curPid = pid;
  $$('[data-page]').forEach(s => { s.hidden = s.dataset.page !== page; });
  $$('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === page || (page === 'product' && a.dataset.nav === 'shop')));
  if (page === 'shop') renderShop();
  if (page === 'product') { pd.qty = 1; renderPDP(pid); }
  if (page === 'subscribe') renderSub();
  if (page === 'science') buildScience();
  if (page === 'about') buildAbout();
  if (page === 'profile') renderProfile();
  if (page === 'thanks') renderThanks();
  if (page === 'policy') renderPolicy(polId);
  else if (/ · ORGO$/.test(document.title)) document.title = POL_BASE_TITLE;
  closeCart();
  window.scrollTo(0, 0);
  fillPrices();
  if (page === 'home') { sizeFan(); storyCalc(); }
}
addEventListener('hashchange', route);
/* ---------- left-edge subscribe tab ---------- */
(() => {
  const tab = $('#subTab'); if (!tab) return;
  $$('.js-pmax', tab).forEach(e => e.textContent = pctMax());
  let off = false; try { off = sessionStorage.getItem('orgoSubTab') === 'off'; } catch (e) {}
  const sync = () => tab.classList.toggle('hide', off || (location.hash.slice(1) || 'home') === 'subscribe');
  $('#subTabX').onclick = e => { e.preventDefault(); off = true; try { sessionStorage.setItem('orgoSubTab', 'off'); } catch (e) {} sync(); };
  addEventListener('hashchange', sync); sync();
})();

addEventListener('scroll', () => { $('#top').classList.toggle('scrolled', scrollY > 8); storyCalc(); }, { passive: true });
// phone: tuck the floating menu/cart buttons away while scrolling down so they don't sit on content; bring them back on scroll up
{ let lastY = scrollY; const ml = document.querySelector('.mob-left');
  addEventListener('scroll', () => { const y = scrollY, d = y - lastY; if (Math.abs(d) < 6) return;
    if (ml) ml.classList.toggle('mob-hide', d > 0 && y > 140); lastY = y; }, { passive: true }); }
addEventListener('resize', () => { if (innerWidth === VW && Math.abs(innerHeight - VH) < 160) return; VW = innerWidth; VH = innerHeight; sizeFan(); storyCalc(); });
renderCart();
fillPrices();
route();
})();
