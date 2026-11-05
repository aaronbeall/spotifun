import { page } from './kit.js';
import * as P from './parts.js';
const { g, oval, circ, blob, face, nose, ears, head, paw, limb, line, hl, smooth, part, ell, dot, darken, lighten, star, sparkles, notes, shadow } = P;

const speakerFlower = (x, y, h, petal) => limb(`M${x},${y} C${x - 10},${y - h * 0.5} ${x + 10},${y - h * 0.7} ${x},${y - h}`, 16, '#22c55e')
  + P.oval(x - 30, y - h * 0.45, 28, 12, '#4ade80', { lw: 4 }, -30)
  + [0, 1, 2, 3, 4, 5].map(i => { const a = i / 6 * Math.PI * 2; return circ(x + Math.cos(a) * 44, y - h + Math.sin(a) * 44, 30, petal, { lw: 5, off: [-4, -4] }); }).join('')
  + `<circle cx="${x}" cy="${y - h}" r="40" fill="#2a2433" stroke="#111" stroke-width="5"/><circle cx="${x}" cy="${y - h}" r="16" fill="#555"/><circle cx="${x}" cy="${y - h}" r="6" fill="#999"/>`;

function zip() {
  const t = '#2dd4bf';
  const s = [];
  s.push(speakerFlower(260, 860, 360, '#f472b6'), speakerFlower(780, 860, 280, '#facc15'));
  s.push(`<g stroke="#fff" stroke-opacity="0.5" stroke-width="5" fill="none" stroke-linecap="round"><path d="M320,480 c20,-20 20,-50 0,-70"/><path d="M712,560 c-20,-20 -20,-50 0,-70"/></g>`);
  // hummingbird
  s.push(part('M600,420 C680,330 760,290 850,300 C780,350 720,400 640,470 Z', lighten(t, 0.35), { inner: '<path d="M660,400 L800,320 M650,430 L790,350" stroke="#0f766e" stroke-width="4" opacity="0.5"/>' }));
  s.push(part('M480,560 C420,620 380,660 330,680 C380,610 420,560 460,520 Z', darken(t, 0.8)));
  s.push(oval(530, 480, 110, 76, t, { inner: '<ellipse cx="520" cy="510" rx="70" ry="40" fill="#f0fdfa"/>' }, -25));
  s.push(part('M560,420 C600,330 690,300 760,320 C700,360 640,420 600,470 Z', lighten(t, 0.2), { inner: '<path d="M600,420 L720,340" stroke="#0f766e" stroke-width="4" opacity="0.5"/>' }));
  s.push(head(430, 410, 76, 70, t));
  s.push(part('M370,400 L220,370 L372,420 Z', '#1f2937', { lw: 5, off: [-3, -3] }));
  s.push(oval(452, 448, 30, 20, '#f43f5e', { lw: 4 }));
  s.push(P.eye(430, 395, 16), P.blush(468, 420, 16));
  s.push(P.earbud(470, 380, 1));
  const front = P.motion([[700, 520, 60, 0.4], [690, 560, 50, 0.4], [720, 470, 40, 0.4]], '#99f6e4')
    + sparkles([[180, 200, 18, '#2dd4bf'], [880, 200, 20, '#f472b6'], [520, 160, 14, '#facc15']]) + notes([[540, 700, 0.7, '#99f6e4', 10]]);
  return page({ accent: '#2dd4bf', figure: s.join('\n'), front, seed: 61 });
}

function cumulo() {
  const b = '#38bdf8', belly = '#e0f2fe';
  const s = [];
  s.push(P.cloud(260, 760, 1.3, '#e0f2fe', { ink: '#6b8fb8' }), P.cloud(800, 720, 1.1, '#e0f2fe', { ink: '#6b8fb8' }));
  // whale
  s.push(part('M260,520 C260,400 380,330 520,330 C660,330 760,400 760,500 C760,560 720,600 640,610 L330,610 C290,600 260,570 260,520 Z', b, {
    inner: `<path d="M300,560 C380,600 560,610 720,560 L720,620 L300,620 Z" fill="${belly}"/>` + [360, 400, 440, 480, 520, 560, 600].map(x => `<line x1="${x}" y1="570" x2="${x}" y2="610" stroke="#7dd3fc" stroke-width="5"/>`).join(''),
  }));
  s.push(part('M740,480 C800,430 840,380 880,330 C900,400 880,460 840,480 C880,500 900,560 880,620 C840,560 800,520 740,500 Z', b));
  s.push(part('M450,600 C460,660 500,690 540,680 C520,650 510,620 500,600 Z', darken(b, 0.85)));
  s.push(hl('M310,450 C330,400 380,370 440,360', 12, 0.5));
  s.push(face(400, 470, { eyes: 'shut', mouth: 'smile', gap: 90, r: 18, mouthY: 50, mw: 26 }));
  s.push(P.earbud(300, 460, -1));
  // spout of little notes
  s.push(line('M520,330 C510,280 490,250 470,230 M520,330 C530,280 550,250 570,230', '#bae6fd', 8));
  const front = notes([[460, 200, 0.8, '#bae6fd', -10], [590, 180, 0.7, '#bae6fd', 10]]) + sparkles([[180, 260, 14, '#bae6fd'], [860, 220, 16, '#fde68a'], [880, 520, 12, '#bae6fd']]);
  return page({ accent: '#38bdf8', figure: s.join('\n'), front, seed: 62 });
}

function staticBot() {
  const red = '#ff1744';
  const s = [];
  s.push(shadow(512, 220));
  // legs: cables
  s.push(limb(smooth([[460, 680], [430, 760], [440, 820]]), 22, '#2a2433', { ink: '#000' }), limb(smooth([[564, 680], [600, 760], [590, 820]]), 22, '#2a2433', { ink: '#000' }));
  s.push(oval(440, 826, 40, 18, '#555'), oval(590, 826, 40, 18, '#555'));
  // pedal body
  s.push(part('M400,520 L624,520 C640,520 650,530 650,546 L650,690 C650,706 640,716 624,716 L400,716 C384,716 374,706 374,690 L374,546 C374,530 384,520 400,520 Z', red, {
    inner: '<circle cx="440" cy="560" r="16" fill="#111"/><circle cx="512" cy="560" r="16" fill="#111"/><circle cx="584" cy="560" r="16" fill="#111"/><line x1="440" y1="560" x2="448" y2="548" stroke="#fff" stroke-width="4"/><line x1="512" y1="560" x2="520" y2="548" stroke="#fff" stroke-width="4"/><line x1="584" y1="560" x2="592" y2="548" stroke="#fff" stroke-width="4"/><rect x="452" y="620" width="120" height="60" rx="8" fill="#e5e7eb" stroke="#111" stroke-width="4"/><text x="512" y="662" font-family="Arial Black, sans-serif" font-size="26" text-anchor="middle" fill="#ff1744">FUZZ</text>',
  }));
  // arms
  s.push(limb(smooth([[380, 580], [300, 520], [260, 440]]), 20, '#2a2433', { ink: '#000' }), limb(smooth([[644, 580], [720, 520], [760, 440]]), 20, '#2a2433', { ink: '#000' }));
  s.push(g(250, 420, 1, -20, `<path d="M0,-30 L10,0 L-4,4 L6,30" stroke="#facc15" stroke-width="7" fill="none"/>`), g(770, 420, 1, 20, `<path d="M0,-30 L10,0 L-4,4 L6,30" stroke="#facc15" stroke-width="7" fill="none"/>`));
  // head: smaller pedal tilted (headbanging)
  s.push(g(512, 400, 1, -14, part('M-120,-80 L120,-80 C134,-80 144,-70 144,-56 L144,70 C144,84 134,94 120,94 L-120,94 C-134,94 -144,84 -144,70 L-144,-56 C-144,-70 -134,-80 -120,-80 Z', '#3b82f6', { ink: '#1e3a8a',
    inner: '<circle cx="-50" cy="0" r="34" fill="#fff"/><circle cx="50" cy="0" r="34" fill="#fff"/><circle cx="-44" cy="6" r="16" fill="#111"/><circle cx="56" cy="6" r="16" fill="#111"/><path d="M-90,-46 L-10,-24 M90,-46 L10,-24" stroke="#111" stroke-width="10" stroke-linecap="round"/><path d="M-40,56 L40,56 L30,74 L-30,74 Z" fill="#4a1a2c" stroke="#111" stroke-width="5"/><circle cx="100" cy="-56" r="9" fill="#ff1744"/>' })
    + line('M-80,-80 L-110,-150 M80,-80 L110,-150', '#2a2433', 10) + dot(-110, -154, 14, '#facc15', 'stroke="#111" stroke-width="4"') + dot(110, -154, 14, '#facc15', 'stroke="#111" stroke-width="4"')));
  const front = sparkles([[200, 260, 20, '#ff1744'], [840, 240, 22, '#facc15'], [860, 560, 16, '#ff1744'], [180, 560, 14, '#3b82f6']])
    + P.motion([[390, 260, 40, -2.4], [640, 250, 40, -0.7]], '#fca5a5');
  return page({ accent: '#ff1744', figure: s.join('\n'), front, seed: 63 });
}

function wisp() {
  const s = [];
  // floating seed spirit, drifting up and away
  s.push(`<ellipse cx="560" cy="330" rx="200" ry="200" fill="#e5e7eb" opacity="0.25" filter="url(#glow)"/>`);
  for (let i = 0; i < 18; i++) {
    const a = Math.PI * (1.02 + i / 17 * 0.96), x2 = 560 + Math.cos(a) * 190, y2 = 340 + Math.sin(a) * 170;
    s.push(line(`M560,420 L${x2},${y2}`, '#cbd5e1', 4), circ(x2, y2, 12, '#f8fafc', { lw: 3, off: [-2, -2] }));
  }
  s.push(line('M560,430 C560,520 540,600 520,660', '#9ca3af', 8));
  s.push(oval(560, 430, 60, 56, '#f1f5f9', { ink: '#64748b' }));
  s.push(face(560, 430, { eyes: 'shut', mouth: 'flat', gap: 46, r: 11, mouthY: 28, mw: 12, brows: 'worried' }));
  s.push(oval(512, 680, 22, 14, '#d1d5db', { lw: 4 }, 30));
  // other seeds drifting
  for (const [x, y, sc] of [[250, 300, 0.5], [820, 200, 0.4], [860, 470, 0.35]]) s.push(g(x, y, sc, 20, Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (1.1 + i / 8 * 0.8); return line(`M0,0 L${Math.cos(a) * 90},${Math.sin(a) * 80}`, '#cbd5e1', 6); }).join('') + line('M0,0 L0,90', '#9ca3af', 8)));
  const front = notes([[350, 640, 0.7, '#e5e7eb', -20]]) + sparkles([[180, 520, 10, '#e5e7eb'], [760, 640, 10, '#e5e7eb']]);
  return page({ accent: '#d1d5db', glow: '#8e97a8', figure: s.join('\n'), front, seed: 64 });
}

function mixtape() {
  const amber = '#f59e0b';
  const s = [];
  // nest of cassettes and 45s
  s.push(shadow(512, 260));
  s.push(P.cassette(380, 760, 0.8, -12, '#f472b6'), P.cassette(650, 770, 0.8, 10, '#22d3ee'), g(512, 790, 1, 0, P.disc(0, 0, 70, '#facc15', 26)));
  s.push(part('M260,760 C300,700 720,700 764,760 C740,820 290,820 260,760 Z', '#8a5a2a', { inner: [0, 1, 2, 3, 4, 5].map(i => `<path d="M${280 + i * 80},740 C${320 + i * 80},780 ${360 + i * 80},740 ${400 + i * 80},770" stroke="#c48a4a" stroke-width="6" fill="none"/>`).join('') }));
  s.push(P.cassette(300, 720, 0.6, -30, '#a78bfa'), P.cassette(720, 720, 0.6, 26, '#fb923c'));
  // magpie (amber + ink colors)
  s.push(part('M600,520 L760,420 L740,460 L790,440 L640,560 Z', '#1f2937', { ink: '#000' }));
  s.push(oval(512, 560, 120, 130, '#1f2937', { ink: '#000', inner: `<ellipse cx="530" cy="600" rx="74" ry="90" fill="#fff7ed"/>` }));
  s.push(part('M410,520 C350,470 300,400 290,340 C360,380 420,440 450,500 Z', amber, { inner: '<path d="M300,350 L440,500" stroke="#fde68a" stroke-width="6"/>' }));
  s.push(part('M614,520 C674,470 724,400 734,340 C664,380 604,440 574,500 Z', amber, { inner: '<path d="M724,350 L584,500" stroke="#fde68a" stroke-width="6"/>' }));
  s.push(line('M470,680 L460,720 M550,680 L560,720', '#374151', 10));
  s.push(head(512, 400, 96, 88, '#1f2937', { ink: '#000' }));
  s.push(part('M590,400 L660,414 L590,428 Z', '#facc15', { lw: 4, off: [-3, -3] }));
  s.push(face(512, 395, { eyes: 'happy', mouth: 'none', gap: 64, r: 14, ink: '#fde68a', blushColor: '#f59e0b' }));
  s.push(line('M500,320 C490,300 500,286 516,290', '#000', 6));
  const front = sparkles([[200, 240, 20, '#f59e0b'], [850, 260, 22, '#f472b6'], [880, 520, 14, '#22d3ee'], [160, 520, 14, '#facc15']])
    + notes([[760, 200, 0.8, '#fcd34d', 10], [260, 180, 0.7, '#fcd34d', -10]]) + P.motion([[350, 300, 40, -2.5], [680, 300, 40, -0.6]], '#fde68a');
  return page({ accent: '#f59e0b', figure: s.join('\n'), front, seed: 65 });
}

function dinghy() {
  const paper = '#fdf6e3';
  const s = [];
  // record turned pond: water on record
  s.push(`<ellipse cx="512" cy="840" rx="300" ry="72" fill="#7dd3fc" opacity="0.55"/><path d="M300,840 C360,820 420,860 480,840 M560,850 C620,830 680,870 740,846" stroke="#e0f2fe" stroke-width="6" fill="none" stroke-linecap="round"/>`);
  s.push(`<ellipse cx="512" cy="830" rx="250" ry="50" fill="none" stroke="#e0f2fe" stroke-width="4" stroke-dasharray="20 18" opacity="0.6"/>`);
  // paper boat
  s.push(part('M260,640 L764,640 L650,800 L374,800 Z', paper, { ink: '#a8946a', inner: '<path d="M260,640 L512,720 L764,640" stroke="#e6dcc0" stroke-width="6" fill="none"/>' }));
  s.push(part('M512,640 L512,380 L700,640 Z', '#f1e7cc', { ink: '#a8946a' }), part('M512,640 L512,380 L340,640 Z', paper, { ink: '#a8946a' }));
  s.push(face(470, 560, { eyes: 'shut', mouth: 'smile', gap: 60, r: 14, mouthY: 40, mw: 14 }));
  s.push(line('M512,380 L512,330', '#a8946a', 6), part('M512,330 L580,350 L512,370 Z', '#f472b6', { lw: 4 }));
  const front = notes([[240, 420, 0.8, '#fdf6e3', -10], [800, 360, 0.7, '#fde68a', 8]]) + sparkles([[180, 250, 12, '#fdf6e3'], [860, 220, 14, '#fde68a'], [860, 560, 10, '#fdf6e3']])
    + P.moon(820, 160, 0.6, '#fde68a');
  return page({ accent: '#fdf6e3', glow: '#bfae84', figure: s.join('\n'), front, seed: 66 });
}

function thorn() {
  const c = '#9f2a52', denim = '#3b5b8c';
  const s = [];
  s.push(shadow(512, 200));
  // pot
  s.push(part('M380,700 L644,700 L620,830 L404,830 Z', '#c2410c', { inner: '<path d="M380,730 L644,730" stroke="#7c2d12" stroke-width="8"/>' }));
  // cactus body with denim vest
  s.push(part('M410,700 L410,420 C410,330 460,290 512,290 C564,290 614,330 614,420 L614,700 Z', c, { inner: [440, 480, 512, 544, 584].map(x => `<path d="M${x},320 L${x},700" stroke="${darken(c, 0.7)}" stroke-width="5" opacity="0.6"/>`).join('') }));
  s.push(part('M408,520 L470,520 L480,700 L408,700 Z', denim, { inner: '<path d="M420,600 L460,620 M430,660 l20,-6" stroke="#cbd5e1" stroke-width="4"/>' }), part('M616,520 L554,520 L544,700 L616,700 Z', denim, { inner: '<path d="M570,580 l30,10" stroke="#cbd5e1" stroke-width="4"/>' }));
  s.push(P.sticker(440, 560, '#facc15', 'tri', 14), P.pin(586, 620, '#ef4444', 14));
  // arms
  s.push(limb('M410,520 C340,520 330,470 330,420', 50, c), limb('M614,560 C690,560 700,500 700,450', 50, c));
  s.push(P.walkman(700, 420, 0.6, 10, '#facc15'));
  s.push(line('M660,380 C620,330 560,320 540,330', '#2a2433', 5));
  // spines + mohawk
  for (const [x, y, a] of [[400, 460, 3.6], [400, 620, 3.0], [624, 460, -0.4], [624, 620, 0.1], [330, 400, -2.0], [700, 430, -1.2]]) s.push(line(`M${x},${y} l${Math.cos(a) * 24},${Math.sin(a) * 24}`, '#fde68a', 5));
  for (let i = 0; i < 7; i++) s.push(part(`M${470 + i * 14},${300 + Math.abs(i - 3) * 6} L${478 + i * 14},${200 + Math.abs(i - 3) * 22} L${486 + i * 14},${300 + Math.abs(i - 3) * 6} Z`, i % 2 ? '#22c55e' : '#a3e635', { lw: 4, off: [-2, -2] }));
  s.push(P.earbud(420, 420, -1));
  s.push(face(512, 410, { eyes: 'dot', mouth: 'yell', brows: 'angry', gap: 70, r: 14, mouthY: 52, mw: 20 }));
  const front = sparkles([[200, 280, 18, '#ef4444'], [820, 250, 20, '#a3e635'], [860, 600, 14, '#ef4444']]) + P.motion([[300, 300, 40, -2.4], [320, 260, 30, -2.4]], '#fda4af');
  return page({ accent: '#7f1d3d', glow: '#b23a66', figure: s.join('\n'), front, seed: 67 });
}

function fog() {
  const fur = '#a1a1aa';
  const s = [];
  s.push(shadow(470, 220));
  // old radio at the bottom with tall antenna
  s.push(P.radio(470, 760, 1.0, '#c08457'));
  s.push(line('M520,700 L620,200', '#9a9aa6', 14), dot(622, 192, 14, '#c0c0c8', 'stroke="#555" stroke-width="4"'));
  // koala clinging
  s.push(oval(600, 420, 92, 110, fur, { inner: '<ellipse cx="590" cy="450" rx="54" ry="70" fill="#e4e4e7"/>' }, 10));
  s.push(limb(smooth([[540, 380], [590, 330], [620, 340]]), 34, fur), limb(smooth([[660, 380], [640, 340], [625, 330]]), 34, fur));
  s.push(limb(smooth([[560, 500], [600, 520], [610, 500]]), 34, fur), limb(smooth([[660, 500], [630, 520], [612, 520]]), 34, fur));
  s.push(ears('round', 560, 270, 120, fur, '#f4f4f5').replace(/r="([0-9.]+)"/g, (m, r) => `r="${(+r * 1.25).toFixed(1)}"`));
  s.push(head(560, 270, 104, 92, fur));
  s.push(part('M540,270 C540,240 580,240 580,270 C580,310 570,330 560,330 C550,330 540,310 540,270 Z', '#3f3f46', { lw: 4, off: [-3, -3] }));
  s.push(face(560, 260, { eyes: 'lid', skin: fur, mouth: 'none', gap: 96, r: 13 }));
  s.push(P.line('M545,342 C552,348 568,348 575,342', '#24142e', 5));
  const front = notes([[300, 360, 0.7, '#d4d4d8', -10], [230, 480, 0.6, '#a1a1aa', 8]]) + sparkles([[820, 240, 12, '#e4e4e7'], [840, 560, 10, '#e4e4e7']])
    + `<text x="690" y="250" font-family="Comic Sans MS, cursive" font-size="40" fill="#e4e4e7" opacity="0.7">z</text><text x="720" y="210" font-family="Comic Sans MS, cursive" font-size="30" fill="#e4e4e7" opacity="0.5">z</text>`;
  return page({ accent: '#a1a1aa', glow: '#737384', figure: s.join('\n'), front, seed: 68 });
}

export default {
  'the-sonic-wanderer': zip, 'the-modern-daydreamer': cumulo, 'the-noise-nomad': staticBot, 'the-fadeaway-listener': wisp,
  'the-eclectic-retrohead': mixtape, 'the-vinyl-drifter': dinghy, 'the-obscure-punk': thorn, 'the-lost-listener': fog,
};
