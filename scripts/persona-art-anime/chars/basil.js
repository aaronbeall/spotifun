import { page, theme, part, cast, shine, line, fill, glow, eye, brow, blushHatch, sparkle, tuft, smooth, ell, g, darken, lighten, mix, rng, motes, bokeh, rain } from '../kit.js';

// Basil: a sloth by a rainy window late at night, lamp on, slowly reading the back of one record sleeve.
export default function () {
  theme({ key: [30, -12], shadow: '#232a52', rim: '#93c5fd', rimW: 7, ink: '#1c1830', deep: 0.5 });
  const fur = '#a8957e', furDk = '#7a6650', face = '#efe2cb', patch = '#3d2f28', knit = '#4b6b52';
  const bg = [];
  bg.push(`<defs>
    <linearGradient id="room" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0f1630"/><stop offset="0.6" stop-color="#1a1830"/><stop offset="1" stop-color="#3a2418"/></linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e3a6b"/><stop offset="1" stop-color="#0d1834"/></linearGradient>
    <clipPath id="win"><rect x="40" y="70" width="560" height="760"/></clipPath>
  </defs>`);
  bg.push(`<rect width="1024" height="1024" fill="url(#room)"/>`);
  // window: city at night through wet glass
  bg.push(`<rect x="40" y="70" width="560" height="760" fill="url(#glass)"/>`);
  bg.push(`<g clip-path="url(#win)">`);
  for (const [x, w, h] of [[40, 70, 380], [120, 90, 300], [220, 60, 420], [290, 110, 260], [410, 80, 360], [500, 100, 300]]) {
    bg.push(`<rect x="${x}" y="${830 - h}" width="${w}" height="${h}" fill="#0a1228" opacity="0.9"/>`);
  }
  bg.push(bokeh(17, 46, ['#fbbf24', '#60a5fa', '#f472b6', '#5eead4', '#fde68a'], [40, 300, 600, 830], [8, 26]));
  bg.push(rain(4, 90, '#c7d7ff', 0.4, 4));
  const RD = rng(23);
  for (let i = 0; i < 60; i++) {
    const x = 50 + RD() * 540, y = 80 + RD() * 740, r = 2 + RD() * 6;
    bg.push(`<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${r.toFixed(1)}" ry="${(r * 1.3).toFixed(1)}" fill="#dbeafe" opacity="0.18"/><circle cx="${(x - r * 0.3).toFixed(0)}" cy="${(y - r * 0.4).toFixed(0)}" r="${(r * 0.3).toFixed(1)}" fill="#fff" opacity="0.6"/>`);
  }
  bg.push(`</g>`);
  // frame + mullions
  bg.push(`<path d="M28,58 L612,58 L612,842 L28,842 Z M40,70 L40,830 L600,830 L600,70 Z" fill="#1a1426" fill-rule="evenodd"/>`);
  bg.push(`<rect x="312" y="70" width="14" height="760" fill="#1a1426"/><rect x="40" y="440" width="560" height="14" fill="#1a1426"/>`);
  bg.push(`<rect x="0" y="842" width="640" height="40" fill="#241a2e"/>`);
  // record shelf on the right, lamp-lit
  bg.push(glow(900, 300, 260, '#fb923c', 0.55));
  for (let i = 0; i < 16; i++) {
    const x = 690 + i * 22, c = ['#7c2d12', '#be185d', '#1d4ed8', '#ca8a04', '#065f46', '#7e22ce'][i % 6];
    bg.push(`<rect x="${x}" y="${600 + (i % 3) * 6}" width="18" height="${200 - (i % 3) * 6}" fill="${c}" opacity="0.55"/>`);
  }
  bg.push(`<rect x="670" y="800" width="400" height="14" fill="#2b1d16"/>`);
  // lamp
  bg.push(`<path d="M820,120 L960,120 L1010,230 L770,230 Z" fill="#f59e0b" opacity="0.9"/><path d="M770,230 L1010,230 L1060,1024 L720,1024 Z" fill="#fdba74" opacity="0.07"/>`);
  bg.push(glow(890, 240, 120, '#fde68a', 0.8));

  const f = [];
  // sweater
  const sweater = 'M120,1024 C130,900 180,790 280,740 C350,706 430,694 500,694 C590,694 670,712 740,752 C840,810 880,920 890,1024 Z';
  const cables = [300, 420, 580, 700].map(x => line(`M${x},720 ${Array.from({ length: 8 }, (_, k) => `Q${x + (k % 2 ? 16 : -16)},${734 + k * 40} ${x},${754 + k * 40}`).join(' ')}`, darken(knit, 0.55), 5, 0.6)).join('');
  f.push(part(sweater, knit, { inner: cables, sh: 'M0,690 L360,690 C330,820 360,920 420,1024 L0,1024 Z' }));
  // roll neck
  f.push(part('M380,690 C400,650 620,650 640,690 C650,730 620,760 510,762 C400,760 370,730 380,690 Z', lighten(knit, 0.08), { sh: 'M340,640 L470,640 L470,780 L340,780 Z', inner: [400, 440, 480, 520, 560, 600].map(x => line(`M${x},676 L${x + 4},752`, darken(knit, 0.55), 3, 0.5)).join('') }));

  // head, tilted toward the record
  const H = [];
  const headD = smooth([[500, 228], [598, 244], [664, 304], [690, 392], [672, 486], [612, 560], [500, 592], [388, 560], [328, 486], [310, 392], [336, 304], [402, 244]], true);
  // shaggy fringe of fur around the head
  const shag = [];
  for (let i = 0; i < 26; i++) {
    const a = Math.PI * (0.92 + i / 25 * 1.16), r1 = 168, r2 = 184 + (i % 3) * 7;
    const cx = 500, cy = 400;
    const ax = cx + Math.cos(a - 0.08) * r1, ay = cy + Math.sin(a - 0.08) * r1 * 1.0, bx = cx + Math.cos(a + 0.08) * r1, by = cy + Math.sin(a + 0.08) * r1;
    const q = v => Math.round(v); shag.push(tuft(q(ax), q(ay), q(bx), q(by), q(cx + Math.cos(a) * r2), q(cy + Math.sin(a) * r2), 0.1));
  }
  H.push(part(shag.join(' '), fur, { sh: 'M250,150 L470,150 C420,300 420,460 500,640 L250,640 Z' }));
  H.push(part(headD, fur, { sh: 'M280,200 L384,200 C344,320 352,470 432,600 L280,600 Z' }));
  // pale face mask
  const mask = smooth([[500, 300], [586, 318], [636, 380], [628, 470], [576, 530], [500, 548], [424, 530], [372, 470], [364, 380], [414, 318]], true);
  H.push(part(mask, face, { sh: 'M330,280 L384,280 C368,380 384,470 444,560 L330,560 Z', rim: false }));
  // the sloth eye stripes, drooping outward
  H.push(part('M452,384 C430,370 396,372 378,392 C360,414 362,448 380,470 C396,486 420,480 430,460 C440,440 462,420 470,404 C476,394 466,388 452,384 Z', patch, { rim: false }));
  H.push(part('M548,384 C570,370 604,372 622,392 C640,414 638,448 620,470 C604,486 580,480 570,460 C560,440 538,420 530,404 C524,394 534,388 548,384 Z', patch, { rim: false }));
  // eyes, heavy-lidded, reading
  const look = [10, 14];
  H.push(eye(426, 410, 70, 56, { side: -1, open: 0.5, iris: '#c08a3e', look, lash: '#120c10', lid: false, tilt: -2, lashW: 7 }));
  H.push(eye(574, 410, 70, 56, { side: 1, open: 0.5, iris: '#c08a3e', look, lash: '#120c10', lid: false, tilt: -2, lashW: 7 }));
  // nose + calm little smile
  H.push(part('M482,470 C482,458 518,458 518,470 C518,484 506,490 500,490 C494,490 482,484 482,470 Z', '#2a1e1c', { rimW: 2, lw: 2.4 }));
  H.push(fill(ell(494, 466, 6, 3), '#fff', 0.6));
  H.push(line('M500,490 L500,500 M478,504 C488,512 496,510 500,500 C504,510 512,512 522,504', '#3a2428', 3));
  H.push(blushHatch(392, 492, '#f9a8a8', 0.55), blushHatch(608, 492, '#f9a8a8', 0.55));
  // tiny forehead tuft + hair shine
  H.push(part(tuft(480, 236, 520, 236, 536, 186, -0.35), fur));
  H.push(shine([[440, 270, -14], [462, 262, -8], [540, 262, 8], [562, 270, 14]], '#fff6e0', 0.45, 8));
  f.push(cast('M396,680 C430,730 500,744 570,740 C630,730 650,700 650,680 Z', 0.7));
  f.push(g(500, 470, 1, 7, `<g transform="translate(-500 -400)">${H.join('\n')}</g>`));

  // arms and the record sleeve held up to read
  f.push(part('M250,1024 C240,920 280,820 360,790 C420,770 470,800 480,850 L400,1024 Z', knit, { sh: 'M200,780 L320,780 C300,880 320,960 360,1024 L200,1024 Z' }));
  f.push(part('M790,1024 C810,920 790,830 720,800 C670,782 620,800 610,850 L660,1024 Z', knit));
  // record sleeve
  f.push(g(560, 850, 1, -8, `
    ${part('M-150,-140 L150,-140 L150,150 L-150,150 Z', '#e7c6a7', { sh: 'M-160,40 L160,90 L160,160 L-160,160 Z', inner: `
      <rect x="-150" y="-140" width="300" height="290" fill="#f472b6" opacity="0.18"/>
      <circle cx="40" cy="-30" r="90" fill="#0f766e"/><circle cx="40" cy="-30" r="56" fill="#fb7185"/><circle cx="40" cy="-30" r="20" fill="#fde68a"/>
      <path d="M-130,100 L-20,100 M-130,118 L-60,118" stroke="#7c2d12" stroke-width="7" stroke-linecap="round"/>` })}
    ${part('M-150,-140 L-130,-150 L170,-150 L150,-140 Z', '#c9a483', { rimW: 2 })}`));
  // long claws curling over the sleeve edges
  for (const [x, y, r] of [[402, 770, -20], [426, 762, -10], [450, 760, 0]]) f.push(part(tuft(x - 9, y + 26, x + 9, y + 26, x + 4, y - 26, 0.3), '#e9dcc6', { rimW: 2, lw: 2.4 }));
  for (const [x, y] of [[712, 750], [734, 756], [756, 766]]) f.push(part(tuft(x - 9, y + 26, x + 9, y + 26, x - 6, y - 26, -0.3), '#e9dcc6', { rimW: 2, lw: 2.4 }));
  f.push(part('M370,790 C380,750 470,740 480,790 C470,830 380,830 370,790 Z', fur));
  f.push(part('M690,790 C700,750 790,740 800,790 C790,830 700,830 690,790 Z', fur));

  const front = [motes(8, 30, '#ffe7c2', [600, 100, 1024, 900], [1, 2.6])].join('');
  return page({ bg: bg.join('\n'), figure: f.join('\n'), front, grade: { top: '#1e3a8a', bottom: '#3b1d0e', vignette: 0.8 }, bloom: 0.45 });
}
