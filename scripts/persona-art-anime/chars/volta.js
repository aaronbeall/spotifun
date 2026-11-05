import { page, theme, part, line, fill, glow, eye, blushHatch, sparkle, smooth, ell, darken, lighten, mix, rng, motes, bokeh, rays } from '../kit.js';

// Volta: a jellyfish drifting under a city harbour at night, eyes shut, dancing to something only it can hear.
export default function () {
  theme({ key: [0, -26], shadow: '#1b1f5c', rim: '#f0abfc', rimW: 5, ink: '#1a1440', deep: 0.55 });
  const R = rng(5);
  const bg = [];
  bg.push(`<defs>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c3a6e"/><stop offset="0.35" stop-color="#0e1d44"/><stop offset="1" stop-color="#03040d"/></linearGradient>
    <radialGradient id="bellG" cx="45%" cy="30%" r="75%"><stop offset="0" stop-color="#e0fbff" stop-opacity="0.95"/><stop offset="0.35" stop-color="#7dd3fc" stop-opacity="0.75"/><stop offset="0.8" stop-color="#c026d3" stop-opacity="0.55"/><stop offset="1" stop-color="#701a75" stop-opacity="0.7"/></radialGradient>
    <linearGradient id="armG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5d0fe" stop-opacity="0.85"/><stop offset="1" stop-color="#a21caf" stop-opacity="0.15"/></linearGradient>
  </defs>`);
  bg.push(`<rect width="1024" height="1024" fill="url(#sea)"/>`);
  // surface: the harbour's neon reflected from below, wobbling
  for (let i = 0; i < 9; i++) {
    const y = 20 + i * 14, c = ['#f472b6', '#22d3ee', '#fbbf24', '#a78bfa'][i % 4];
    let d = `M-20,${y}`;
    for (let x = 0; x <= 1060; x += 40) d += ` Q${x + 10},${y + (R() * 16 - 8)} ${x + 20},${y + (R() * 6 - 3)}`;
    bg.push(`<g filter="url(#soft4)">${line(d, c, 4 + R() * 5, 0.3 + R() * 0.3)}</g>`);
  }
  bg.push(`<rect width="1024" height="150" fill="#7dd3fc" opacity="0.08"/>`);
  bg.push(rays(380, -60, '#bae6fd', [62, 74, 86, 98, 112], 1300, 2.6, 0.2));
  bg.push(rays(700, -60, '#f5d0fe', [80, 96, 120], 1300, 2, 0.14));
  // distant silhouettes: harbour pilings fading into the deep
  for (const [x, w] of [[90, 26], [170, 18], [860, 30], [950, 20]]) bg.push(`<rect x="${x}" y="0" width="${w}" height="760" fill="#081430" opacity="0.6"/>`);
  bg.push(bokeh(9, 22, ['#67e8f9', '#f0abfc', '#c4b5fd'], [0, 120, 1024, 1024], [8, 30]));
  bg.push(motes(13, 110, '#cfe8ff', [0, 0, 1024, 1024], [1, 2.6]));

  const f = [];
  // tentacles: aux cables, each glowing, ending in a little jack plug
  const cables = [
    [[400, 560], [360, 680], [410, 800], [350, 930], [380, 1060]],
    [[460, 570], [480, 700], [430, 820], [470, 950], [440, 1060]],
    [[560, 570], [540, 690], [600, 810], [560, 930], [600, 1060]],
    [[620, 560], [680, 660], [640, 780], [700, 880], [720, 960]],
    [[350, 540], [280, 640], [300, 740], [240, 830], [230, 900]],
    [[680, 540], [760, 620], [770, 720], [830, 790], [860, 850]],
  ];
  const ccol = ['#22d3ee', '#f472b6', '#a78bfa', '#facc15', '#f472b6', '#22d3ee'];
  cables.forEach((pts, i) => {
    const d = smooth(pts), c = ccol[i];
    f.push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="22" opacity="0.5" filter="url(#blur10)"/>`);
    f.push(line(d, darken(c, 0.35), 13), line(d, c, 8), line(d, lighten(c, 0.7), 2.6, 0.9));
    const [x, y] = pts[pts.length - 1];
    if (y < 1000) {
      const [px, py] = pts[pts.length - 2], a = Math.atan2(y - py, x - px) * 180 / Math.PI - 90;
      f.push(`<g transform="translate(${x} ${y}) rotate(${a})">
        ${part('M-11,-6 L11,-6 L11,30 L-11,30 Z', '#2a2440', { rimW: 3, lw: 2.4 })}
        ${part('M-4,30 L4,30 L4,72 L0,78 L-4,72 Z', '#e5e7eb', { rimW: 2, lw: 2, inner: '<rect x="-5" y="44" width="10" height="3" fill="#6b7280"/><rect x="-5" y="58" width="10" height="3" fill="#6b7280"/>' })}
        ${glow(0, 74, 26, c, 0.8)}</g>`);
    }
  });
  // frilly oral arms
  for (const [dx, sw] of [[-50, -1], [0, 1], [50, 1]]) {
    let d = `M${512 + dx - 26},540`;
    for (let k = 0; k < 7; k++) d += ` Q${512 + dx + sw * 36 * (k % 2 ? 1 : -1)},${560 + k * 40} ${512 + dx - 20 + k * 2},${580 + k * 40}`;
    d += ` L${512 + dx + 20},${830}`;
    for (let k = 6; k >= 0; k--) d += ` Q${512 + dx + 40 + sw * 30 * (k % 2 ? -1 : 1)},${560 + k * 40} ${512 + dx + 26 - k * 2},${540 + k * 40}`;
    f.push(`<path d="${d} Z" fill="url(#armG)" stroke="#f0abfc" stroke-opacity="0.6" stroke-width="2.4"/>`);
  }
  // bell
  const bell = 'M282,520 C250,360 340,180 512,176 C684,180 774,360 742,520 C720,540 700,512 680,534 C658,552 640,520 618,540 C596,558 576,528 556,546 C536,560 520,532 500,548 C480,562 462,532 442,546 C420,560 404,528 384,542 C362,556 344,522 322,540 C304,552 290,536 282,520 Z';
  f.push(glow(512, 360, 300, '#a855f7', 0.45));
  f.push(`<path d="${bell}" fill="url(#bellG)"/>`);
  // inner canals and gonad ring
  for (let i = 0; i < 9; i++) { const x = 320 + i * 48; f.push(line(`M512,240 Q${(x + 512) / 2},${360} ${x},${520}`, '#ffffff', 2, 0.22)); }
  f.push(`<ellipse cx="512" cy="290" rx="110" ry="54" fill="none" stroke="#fdf4ff" stroke-width="5" opacity="0.4"/>`);
  f.push(`<path d="M300,470 C340,494 420,506 512,506 C604,506 684,494 724,470" fill="none" stroke="#3b0764" stroke-width="10" opacity="0.35"/>`);
  f.push(line(bell.replace(/ Z$/, ''), '#fdf4ff', 3, 0.85));
  f.push(`<path d="M330,330 C350,250 420,206 500,198" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.7"/>`);
  f.push(`<path d="M680,300 C690,330 694,360 692,390" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.45"/>`);
  // face: eyes shut, lost in it; a sparkly tear
  f.push(eye(438, 404, 92, 70, { side: -1, open: 0, lash: '#2e1065' }), eye(586, 404, 92, 70, { side: 1, open: 0, lash: '#2e1065' }));
  f.push(line('M400,354 Q430,342 464,350', '#2e1065', 4.5), line('M560,350 Q594,342 624,354', '#2e1065', 4.5));
  f.push(blushHatch(410, 448, '#f472b6', 0.8), blushHatch(614, 448, '#f472b6', 0.8));
  f.push(`<path d="M500,462 C506,472 518,472 524,462" fill="none" stroke="#2e1065" stroke-width="3.6" stroke-linecap="round"/>`);
  f.push(`<path d="M612,424 C624,446 626,466 612,474 C598,466 600,446 612,424 Z" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2.4"/>`);
  f.push(sparkle(626, 488, 14, '#fff'), sparkle(600, 500, 7, '#bae6fd'));

  const front = [];
  // bubbles rising
  const RB = rng(31);
  for (let i = 0; i < 26; i++) {
    let x = 120 + RB() * 780, y = 80 + RB() * 820; const r = 4 + RB() * 14; if (x > 280 && x < 750 && y > 170 && y < 560) x = x < 512 ? x - 220 : x + 220;
    front.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="#bae6fd" fill-opacity="0.08" stroke="#e0f2fe" stroke-opacity="0.6" stroke-width="1.6"/><circle cx="${(x - r * 0.35).toFixed(0)}" cy="${(y - r * 0.35).toFixed(0)}" r="${(r * 0.25).toFixed(1)}" fill="#fff" opacity="0.7"/>`);
  }
  return page({ bg: bg.join('\n'), figure: f.join('\n'), front: front.join(''), grade: { top: '#2563eb', bottom: '#1e0b3a', vignette: 0.8 }, bloom: 0.6 });
}
