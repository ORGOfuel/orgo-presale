  const XP = [
    ['feat', 'SPORTS DIETITIAN', 'Expert name', 'Registered dietitian, CSSD', 'Add a real quote about why a 20 mL shot works for in-session fueling.'],
    ['', 'STRENGTH COACH', 'Expert name', 'Head strength & conditioning coach', 'Add a real quote about creatine and power in training.'],
    ['', 'SPORTS SCIENTIST', 'Expert name', 'PhD, exercise physiology', 'Add a real quote about hydration and recovery between sessions.']
  ];
  const person = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.4 4.2-7 8-7s7 2.6 8 7"/></svg>';
  $('#xpGrid').innerHTML = XP.map(x => `<figure class="xq ${x[0]}" style="margin:0">
      <div class="xq-top"><span class="mark">&ldquo;</span><span class="xq-tag">${x[1]}</span></div>
      <blockquote><span>[${x[4]}]</span></blockquote>
      <figcaption class="xq-who"><span class="xq-av">${person}</span><span><b>[${x[2]}]</b><small>${x[3]}</small></span></figcaption>
    </figure>`).join('');
