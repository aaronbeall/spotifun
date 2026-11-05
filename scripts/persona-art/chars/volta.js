import { page, part, limb, line, hl, dot, eye, blush, star, ell, smooth, darken, lighten } from '../kit.js';

function jack(pts, color) {
  const [a, b] = [pts[pts.length - 2], pts[pts.length - 1]];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  return `<g transform="translate(${b[0]} ${b[1]}) rotate(${ang})">
    <circle cx="44" cy="0" r="16" fill="${color}" opacity="0.8" filter="url(#glow)"/>
    <rect x="-4" y="-15" width="40" height="30" rx="7" fill="#2a2433" stroke="#120e18" stroke-width="5"/>
    <rect x="4" y="-15" width="6" height="30" fill="${color}"/>
    <path d="M36,-5 L58,-5 L64,0 L58,5 L36,5 Z" fill="#f5d27a" stroke="#8a6a1c" stroke-width="3" stroke-linejoin="round"/>
    <line x1="48" y1="-5" x2="48" y2="5" stroke="#8a6a1c" stroke-width="3"/></g>`;
}

export default function () {
  const pink = '#f2589c';
  const s = [];
  const cables = [
    { c: '#22d3ee', p: [[360, 390], [300, 360], [250, 290], [262, 210], [238, 150]] },
    { c: '#a855f7', p: [[668, 390], [730, 380], [790, 320], [776, 240], [800, 170]] },
    { c: '#ff4fa3', p: [[392, 420], [372, 520], [420, 610], [382, 720], [404, 810]] },
    { c: '#22d3ee', p: [[470, 430], [480, 540], [446, 640], [482, 740], [468, 830]] },
    { c: '#f5f3ff', p: [[548, 430], [560, 540], [600, 630], [570, 730], [590, 820]] },
    { c: '#ff4fa3', p: [[628, 420], [660, 520], [628, 610], [690, 700], [700, 790]] },
  ];
  for (const { c, p } of cables) {
    s.push(limb(smooth(p), 26, c, { ink: darken(c, 0.38) }));
    s.push(jack(p, c));
  }
  // bell with scalloped skirt
  let d = 'M296,420 C296,250 396,166 512,166 C628,166 728,250 728,420';
  const n = 9, w = (728 - 296) / n;
  for (let i = 0; i < n; i++) d += ` A${w / 2},${w / 2.2} 0 0,1 ${728 - w * (i + 1)},420`;
  d += ' Z';
  s.push(`<ellipse cx="512" cy="300" rx="230" ry="170" fill="${pink}" opacity="0.45" filter="url(#glow)"/>`);
  s.push(part(d, pink, {
    inner: `<ellipse cx="512" cy="330" rx="120" ry="80" fill="#ff9cc8" opacity="0.55"/>
      <circle cx="400" cy="250" r="14" fill="#ffd1e4"/><circle cx="640" cy="236" r="10" fill="#ffd1e4"/><circle cx="604" cy="200" r="7" fill="#ffd1e4"/><circle cx="358" cy="320" r="8" fill="#ffd1e4"/>`,
  }));
  s.push(hl('M346,300 C350,240 400,196 456,186', 12, 0.65));
  s.push(hl('M470,180 L492,178', 12, 0.65));
  // earbuds
  for (const [x, sx] of [[296, -1], [728, 1]]) {
    s.push(part(ell(x + sx * 6, 330, 22, 26), '#ffffff', { ink: '#8f8aa3', off: [-6, -6], lw: 5 }));
    s.push(limb(`M${x + sx * 10},352 L${x + sx * 16},392`, 14, '#ffffff', { ink: '#8f8aa3' }));
  }
  // face: blissed-out shut eyes, worried brows, singing mouth, tear
  const ink = '#4a0f2a';
  s.push(line('M418,318 C430,300 458,300 470,318', ink, 9), line('M554,318 C566,300 594,300 606,318', ink, 9));
  s.push(line('M420,270 L466,284', ink, 8), line('M604,270 L558,284', ink, 8));
  s.push(`<ellipse cx="512" cy="360" rx="20" ry="25" fill="${ink}"/><ellipse cx="512" cy="370" rx="10" ry="8" fill="#ff7a9a"/>`);
  s.push(blush(420, 350, 28, '#ff2f74', 0.4), blush(604, 350, 28, '#ff2f74', 0.4));
  s.push(`<path d="M606,334 C596,352 594,366 606,372 C618,366 616,352 606,334 Z" fill="#9be7ff" stroke="#2b82b8" stroke-width="4" stroke-linejoin="round"/>`);
  const front = [
    star(630, 360, 13, '#bae6fd', 0),
    star(210, 300, 20, '#f472b6', 0), star(830, 330, 22, '#22d3ee', 12), star(180, 520, 16, '#fde68a', 0),
    star(860, 560, 18, '#f472b6', 0), star(520, 90, 18, '#fde68a', 0),
    `<circle cx="240" cy="380" r="9" fill="#ffd1e4"/><circle cx="800" cy="420" r="7" fill="#ffd1e4"/><circle cx="262" cy="420" r="5" fill="#ffd1e4"/>`,
  ].join('');
  return page({ accent: '#d6336c', figure: s.join('\n'), front, seed: 8 });
}
