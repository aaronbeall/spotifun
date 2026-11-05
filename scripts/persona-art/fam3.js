import { page } from './kit.js';
import * as P from './parts.js';
const { g, oval, circ, blob, face, nose, ears, head, paw, limb, line, hl, smooth, part, ell, dot, darken, lighten, star, sparkles, notes, shadow } = P;

const pick = (x, y, rot, c, s = 1) => g(x, y, s, rot, part('M0,-46 C26,-46 40,-30 36,-6 C30,20 14,40 0,46 C-14,40 -30,20 -36,-6 C-40,-30 -26,-46 0,-46 Z', c, { lw: 5, off: [-5, -5] }));

function patch() {
  const v = '#8b5cf6', cream = '#f3e8ff';
  const s = [];
  s.push(shadow(512, 150, 860));
  // pick spines around the top
  const cols = ['#a78bfa', '#7c3aed', '#c4b5fd', '#8b5cf6', '#6d28d9'];
  for (let i = 0; i < 13; i++) {
    const a = Math.PI * (0.98 + i * 1.04 / 12), r = 168;
    s.push(pick(512 + Math.cos(a) * r, 470 + Math.sin(a) * r, a * 180 / Math.PI + 90 + 180, cols[i % 5], 1.35));
  }
  // legs (mid-jump)
  s.push(limb('M450,600 L420,680', 40, v), limb('M574,600 L610,670', 40, v));
  s.push(oval(414, 692, 32, 20, darken(v, 0.7)), oval(616, 682, 32, 20, darken(v, 0.7)));
  s.push(oval(512, 470, 160, 150, v));
  s.push(oval(512, 500, 116, 108, cream, { off: [-8, -8] }));
  // tote bag with band pins on the arm
  s.push(limb(smooth([[400, 520], [330, 470], [300, 400]]), 34, v), paw(298, 390, 22, cream));
  s.push(line('M300,410 C280,470 300,520 320,540 M300,410 C340,450 380,500 380,540', '#d6c3a5', 8));
  s.push(part('M290,540 L410,540 L420,700 L280,700 Z', '#f5ecd7', { inner: '' }) + P.pin(320, 590, '#f472b6', 16) + P.pin(380, 620, '#22d3ee', 14) + P.pin(330, 660, '#facc15', 15) + P.pin(390, 570, '#a78bfa', 12) + P.pin(372, 672, '#ef4444', 13));
  s.push(limb(smooth([[624, 520], [690, 460], [720, 380]]), 34, v), paw(722, 370, 22, cream));
  s.push(nose(512, 500, 16));
  s.push(face(512, 460, { eyes: 'dot', mouth: 'grin', gap: 90, r: 16, mouthY: 64, mw: 18 }));
  s.push(P.earbud(370, 440, -1));
  const front = P.motion([[440, 760, 40, 1.57], [512, 770, 50, 1.57], [590, 760, 40, 1.57]], '#c4b5fd')
    + sparkles([[200, 300, 20, '#a78bfa'], [830, 260, 22, '#f472b6'], [850, 560, 16, '#22d3ee'], [512, 120, 16, '#facc15']]);
  return page({ accent: '#8b5cf6', figure: s.join('\n'), front, seed: 51 });
}

function echo() {
  const t = '#5eead4', belly = '#ccfbf1';
  const s = [];
  s.push(shadow(512, 230));
  // tail
  s.push(part('M600,700 C700,700 780,660 820,600 C800,680 720,750 600,760 Z', t));
  // body sitting
  s.push(oval(512, 640, 140, 140, t, { inner: `<ellipse cx="512" cy="670" rx="90" ry="100" fill="${belly}"/>` }));
  s.push(oval(430, 770, 50, 28, t), oval(594, 770, 50, 28, t));
  // jar of glowing waves
  s.push(`<ellipse cx="512" cy="640" rx="100" ry="110" fill="#5eead4" opacity="0.5" filter="url(#glow)"/>`);
  s.push(part('M440,560 L584,560 C600,560 606,572 606,586 L606,720 C606,740 594,750 576,750 L448,750 C430,750 418,740 418,720 L418,586 C418,572 424,560 440,560 Z', '#e0fffb', { ink: '#2a8f84', off: [-4, -4],
    inner: `<path d="M430,620 C460,590 490,650 520,620 C550,590 580,650 600,620" stroke="#2dd4bf" stroke-width="8" fill="none"/><path d="M430,670 C460,640 490,700 520,670 C550,640 580,700 600,670" stroke="#a78bfa" stroke-width="8" fill="none"/><path d="M430,715 C460,690 490,735 520,712 C550,690 580,735 600,712" stroke="#f472b6" stroke-width="7" fill="none"/>` }));
  s.push(`<rect x="420" y="560" width="184" height="190" rx="18" fill="#fff" opacity="0.18"/>`);
  s.push(part('M430,530 L594,530 L594,566 L430,566 Z', '#b08d57', { lw: 5 }));
  s.push(hl('M436,600 L436,720', 8, 0.6));
  s.push(paw(424, 660, 26, t), paw(600, 660, 26, t));
  // head with frilly gills
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) {
    const a = (-30 + i * 30) * Math.PI / 180, x0 = 512 + sx * 130, y0 = 380 + i * 30 - 30;
    s.push(limb(`M${x0},${y0} L${x0 + sx * Math.cos(a) * 80},${y0 + Math.sin(a) * 80 - 20}`, 22, '#f9a8d4'));
  }
  s.push(head(512, 400, 150, 110, t));
  s.push(face(512, 390, { eyes: 'dot', mouth: 'smile', gap: 170, r: 16, mouthY: 40, mw: 60 }));
  const front = sparkles([[200, 300, 16, '#5eead4'], [830, 260, 18, '#a78bfa'], [180, 560, 12, '#5eead4'], [860, 480, 12, '#f9a8d4']])
    + notes([[760, 160, 0.7, '#99f6e4', 8]]);
  return page({ accent: '#5eead4', glow: '#2fb3a3', figure: s.join('\n'), front, seed: 52 });
}

function spike() {
  const fur = '#a8323a', vest = '#1f1a24';
  const s = [];
  s.push(shadow(512, 220));
  // quills
  for (let i = 0; i < 16; i++) {
    const a = Math.PI * (1.0 + i / 15), r1 = 130, r2 = 220 + (i % 2) * 30;
    s.push(line(`M${512 + Math.cos(a) * r1},${430 + Math.sin(a) * r1} L${512 + Math.cos(a) * r2},${430 + Math.sin(a) * r2}`, '#3b0a0e', 18));
    s.push(line(`M${512 + Math.cos(a) * r1},${430 + Math.sin(a) * r1} L${512 + Math.cos(a) * (r2 - 6)},${430 + Math.sin(a) * (r2 - 6)}`, i % 3 ? '#f5e6d0' : '#ef4444', 8));
  }
  s.push(limb('M460,680 L450,790', 44, fur), limb('M564,680 L574,790', 44, fur));
  s.push(oval(446, 806, 40, 22, '#111'), oval(580, 806, 40, 22, '#111'));
  s.push(oval(512, 590, 120, 120, fur));
  // safety-pin vest
  s.push(part('M400,520 C430,500 470,520 490,560 L486,700 L420,690 C396,650 392,580 400,520 Z', vest), part('M624,520 C594,500 554,520 534,560 L538,700 L604,690 C628,650 632,580 624,520 Z', vest));
  for (const [x, y] of [[440, 580], [450, 630], [580, 600], [574, 650]]) s.push(line(`M${x},${y} l26,-8`, '#d1d5db', 5), dot(x + 28, y - 9, 6, 'none', 'stroke="#d1d5db" stroke-width="4"'));
  s.push(P.sticker(600, 560, '#facc15', 'tri', 16));
  // arm + megaphone
  s.push(limb(smooth([[600, 560], [660, 520], [690, 470]]), 34, fur));
  s.push(g(700, 420, 1, -20, part('M-30,-26 L90,-80 L90,80 L-30,26 Z', '#f8fafc', { ink: '#475569', inner: '<path d="M-30,-26 L-10,-35 L-10,35 L-30,26 Z" fill="#ef4444"/>' }) + oval(90, 0, 20, 80, '#cbd5e1', { ink: '#475569', lw: 5 })));
  // head
  s.push(head(500, 410, 120, 104, fur));
  s.push(oval(480, 450, 60, 44, '#f5d0b0', { off: [-6, -6] }));
  s.push(nose(470, 430, 15));
  s.push(face(490, 390, { eyes: 'dot', mouth: 'yell', brows: 'angry', gap: 80, r: 14, mouthY: 74, mw: 24, blush: false }));
  const front = `<g stroke="#fca5a5" stroke-width="8" stroke-linecap="round" fill="none"><path d="M820,300 C850,330 850,380 820,410"/><path d="M860,270 C900,320 900,400 860,450"/></g>`
    + sparkles([[200, 260, 20, '#ef4444'], [190, 600, 14, '#f5e6d0'], [520, 110, 16, '#ef4444']]);
  return page({ accent: '#991b1b', glow: '#c2283a', figure: s.join('\n'), front, seed: 53 });
}

function inky() {
  const ink = '#2f4a73', light = '#4f6fa3';
  const s = [];
  // gallery wall with tiny dark album frames
  const frames = [[230, 220, '#1e1b4b'], [330, 170, '#3b0764'], [720, 190, '#0f172a'], [810, 280, '#312e81'], [210, 360, '#134e4a']];
  for (const [x, y, c] of frames) s.push(g(x, y, 1, (x % 3) - 1, part('M-46,-46 L46,-46 L46,46 L-46,46 Z', '#b08d57', { lw: 5, off: [-4, -4], inner: `<rect x="-34" y="-34" width="68" height="68" fill="${c}"/><circle cx="0" cy="0" r="16" fill="${lighten(c, 0.3)}"/>` })));
  s.push(shadow(512, 230));
  // tentacles
  const tents = [[[420, 600], [340, 680], [300, 780], [360, 820]], [[460, 640], [440, 740], [480, 820]], [[560, 640], [580, 740], [540, 820]], [[600, 600], [680, 680], [720, 780], [660, 820]],
    [[400, 560], [320, 500], [260, 440], [230, 400]], [[620, 560], [700, 470], [740, 380], [770, 330]]];
  for (const t of tents) s.push(limb(smooth(t), 44, light, { ink: '#14233d' }));
  for (const [x, y] of [[300, 740], [480, 780], [700, 740]]) s.push(dot(x, y, 8, '#9ab3d6'));
  // the one he's hanging
  s.push(g(780, 300, 1, 8, part('M-46,-46 L46,-46 L46,46 L-46,46 Z', '#b08d57', { lw: 5, inner: '<rect x="-34" y="-34" width="68" height="68" fill="#4c1d95"/><circle r="16" fill="#a78bfa"/>' })));
  // head bulb
  s.push(part('M370,480 C350,340 420,250 512,250 C604,250 674,340 654,480 C640,580 590,620 512,620 C434,620 384,580 370,480 Z', ink, { ink: '#14233d' }));
  s.push(hl('M410,360 C420,310 450,282 490,270', 10, 0.4));
  s.push(face(512, 470, { eyes: 'lid', skin: ink, mouth: 'flat', gap: 100, r: 18, mouthY: 64, mw: 20, ink: '#0b1220' }));
  // monocle
  s.push(`<circle cx="562" cy="472" r="36" fill="#fff" fill-opacity="0.2" stroke="#d4a72c" stroke-width="7"/><path d="M590,496 C610,540 600,580 620,610" stroke="#d4a72c" stroke-width="4" fill="none"/>`);
  s.push(P.candle(180, 830, 140));
  const front = sparkles([[860, 520, 12, '#93c5fd'], [520, 120, 14, '#93c5fd']]) + notes([[860, 640, 0.7, '#7b9cd1', 8]]);
  return page({ accent: '#24344d', glow: '#3f5e94', figure: s.join('\n'), front, seed: 54 });
}

function copper() {
  const sh = '#c47c3e', skin = '#e8b48a';
  const s = [];
  // sand dune with records poking out
  s.push(part('M200,860 C260,760 400,720 520,730 C660,740 780,780 840,860 Z', '#f2d49b', { inner: '<path d="M300,800 c30,-10 60,-10 90,0 M600,790 c30,-10 60,-10 90,0" stroke="#d6a95c" stroke-width="6" fill="none"/>' }));
  s.push(g(690, 760, 1, 20, P.disc(0, 0, 54, '#f472b6')), g(330, 770, 1, -15, P.disc(0, 0, 46, '#22d3ee')));
  // metal detector
  s.push(line('M600,520 L760,780', '#6b7280', 12), oval(780, 800, 60, 22, '#9ca3af', { lw: 5 }));
  s.push(P.motion([[740, 840, 30, 0.2], [820, 840, 30, -0.2]], '#facc15'));
  // body: banded shell
  s.push(limb('M450,680 L430,760', 40, skin), limb('M560,680 L570,760', 40, skin));
  s.push(part('M360,640 C360,520 430,450 520,450 C610,450 670,520 670,640 C670,690 620,710 520,710 C420,710 360,690 360,640 Z', sh, {
    inner: [420, 470, 520, 570, 620].map(x => `<path d="M${x},460 C${x - 10},560 ${x - 10},640 ${x},710" stroke="${darken(sh, 0.6)}" stroke-width="7" fill="none"/>`).join(''),
  }));
  s.push(limb(smooth([[580, 560], [600, 530]]), 32, skin));
  // head with pith helmet
  s.push(part('M260,450 C260,380 310,340 370,350 C430,360 450,400 440,450 C430,500 380,520 330,520 C290,520 260,490 260,450 Z', skin));
  s.push(face(345, 440, { eyes: 'dot', mouth: 'grin', gap: 66, r: 13, mouthY: 50, mw: 16 }));
  s.push(oval(380, 380, 18, 28, skin, {}, 20), oval(320, 376, 18, 28, skin, {}, -20));
  s.push(part('M260,360 C270,280 420,270 440,350 Z', '#e9dcc0', { inner: '<path d="M262,340 L438,336" stroke="#8a6a3a" stroke-width="10"/>' }));
  s.push(part('M230,360 L470,352 C470,370 450,378 350,380 C250,382 230,374 230,360 Z', '#d8c8a8'));
  const front = sparkles([[200, 300, 18, '#fbbf24'], [820, 260, 20, '#f472b6'], [880, 520, 14, '#fbbf24'], [520, 160, 14, '#22d3ee']])
    + notes([[700, 520, 0.7, '#fbbf24', 10]]);
  return page({ accent: '#b87333', glow: '#d08a45', figure: s.join('\n'), front, seed: 55 });
}

function sage() {
  const body = '#e6c35a', brass = '#d4a72c';
  const s = [];
  s.push(shadow(512, 260));
  // snail foot/body
  s.push(part('M260,800 C260,740 330,720 420,720 L700,720 C760,720 780,760 780,800 Z', body));
  // French-horn shell: coil + bell
  s.push(circ(560, 560, 170, brass, { inner: '<circle cx="560" cy="560" r="120" fill="none" stroke="#8a6a1c" stroke-width="10"/><circle cx="560" cy="560" r="74" fill="none" stroke="#8a6a1c" stroke-width="10"/><circle cx="560" cy="560" r="32" fill="#8a6a1c"/>' }));
  s.push(part('M680,450 C720,380 780,330 860,320 C860,400 830,470 760,500 Z', brass, { inner: '<path d="M860,320 C850,380 820,440 760,500" stroke="#fff3c4" stroke-width="10" fill="none" opacity="0.6"/>' }));
  s.push(hl('M440,470 C460,430 500,410 540,404', 12, 0.55));
  // neck + head
  s.push(limb(smooth([[360, 740], [330, 640], [330, 560]]), 90, body));
  s.push(head(330, 500, 96, 86, body));
  s.push(line('M300,420 L280,340 M360,420 L380,340', '#8a6a1c', 8), dot(280, 336, 12, body, 'stroke="#8a6a1c" stroke-width="5"'), dot(380, 336, 12, body, 'stroke="#8a6a1c" stroke-width="5"'));
  s.push(face(330, 500, { eyes: 'dot', mouth: 'smile', gap: 60, r: 13, mouthY: 40, mw: 16 }));
  // liner notes + magnifier
  s.push(g(240, 640, 1, -10, part('M-70,-50 L70,-50 L70,50 L-70,50 Z', '#fff7e0', { lw: 5, inner: [-30, -14, 2, 18, 34].map(y => `<line x1="-54" y1="${y}" x2="54" y2="${y}" stroke="#9ca3af" stroke-width="4"/>`).join('') })));
  s.push(line('M330,700 L300,640', '#6b4423', 12), `<circle cx="280" cy="610" r="40" fill="#e0f2fe" fill-opacity="0.5" stroke="#6b4423" stroke-width="8"/>`);
  const front = sparkles([[180, 260, 16, '#fde68a'], [860, 200, 18, '#fde68a'], [880, 600, 12, '#fde68a']]) + notes([[900, 280, 0.8, '#fde68a', 8], [940, 380, 0.6, '#fde68a', -8]]);
  return page({ accent: '#c9a227', figure: s.join('\n'), front, seed: 56 });
}

function ember() {
  const fur = '#c2552a', cream = '#fff1e6';
  const s = [];
  // streetlamp
  s.push(`<ellipse cx="760" cy="190" rx="130" ry="130" fill="#fde68a" opacity="0.5" filter="url(#glow)"/><path d="M640,860 L880,860 L760,200 Z" fill="#fde68a" opacity="0.1"/>`);
  s.push(line('M780,840 L780,210', '#2a2433', 18), part('M720,150 L840,150 L820,220 L740,220 Z', '#2a2433', { inner: '<rect x="740" y="160" width="80" height="54" fill="#fde68a"/>' }), part('M710,150 L850,150 L780,110 Z', '#2a2433'));
  s.push(shadow(470, 200));
  // ferret: long body
  s.push(limb(smooth([[420, 700], [400, 780]]), 40, fur), limb(smooth([[520, 700], [540, 780]]), 40, fur));
  s.push(limb(smooth([[480, 700], [560, 740], [640, 760], [690, 730]]), 40, fur));
  s.push(oval(470, 590, 100, 140, fur, { inner: `<ellipse cx="470" cy="610" rx="56" ry="100" fill="${cream}"/>` }));
  // accordion
  s.push(part('M330,560 L380,540 L380,700 L330,680 Z', '#b91c1c', { lw: 5 }), part('M560,540 L610,560 L610,680 L560,700 Z', '#b91c1c', { lw: 5 }));
  let zig = 'M380,540'; for (let i = 0; i < 8; i++) zig += ` L${380 + (i + 0.5) * 22.5},${i % 2 ? 540 : 560} L${380 + (i + 1) * 22.5},${i % 2 ? 560 : 540}`;
  s.push(part('M380,540 L560,540 L560,700 L380,700 Z', '#f5e6d0', { lw: 5, inner: [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<line x1="${402 + i * 22.5}" y1="540" x2="${402 + i * 22.5}" y2="700" stroke="#7f1d1d" stroke-width="5"/>`).join('') }));
  s.push(paw(330, 620, 24, fur), paw(612, 620, 24, fur));
  // head
  s.push(ears('round', 470, 380, 104, fur, '#fbd2bf'));
  s.push(head(470, 380, 104, 92, fur));
  s.push(part('M380,370 C410,350 440,360 470,400 C500,360 530,350 560,370 C560,440 520,470 470,470 C420,470 380,440 380,370 Z', cream, { off: [-5, -5] }));
  s.push(part('M380,360 C420,330 450,340 470,360 C490,340 520,330 560,360 C540,380 500,380 470,370 C440,380 400,380 380,360 Z', '#5a2210', { off: [-4, -4], lw: 4 }));
  s.push(nose(470, 418, 13));
  s.push(face(470, 372, { eyes: 'shut', mouth: 'o', brows: 'worried', gap: 74, r: 14, mouthY: 70, mw: 18, tear: true }));
  const front = notes([[230, 330, 1.0, '#fdba74', -14], [180, 460, 0.8, '#fca5a5', 6], [620, 300, 0.7, '#fdba74', 10]]) + sparkles([[880, 520, 14, '#fde68a'], [200, 620, 12, '#fdba74']]);
  return page({ accent: '#b7410e', glow: '#d0582a', figure: s.join('\n'), front, seed: 57 });
}

function burrow() {
  const fur = '#5a3a28', dirt = '#3a2418';
  const s = [];
  // tunnel arch lined with records
  s.push(part('M160,860 L160,420 C160,220 330,130 512,130 C694,130 864,220 864,420 L864,860 Z', dirt, { ink: '#1a0f08', off: [0, 0],
    inner: [220, 300, 380, 460, 540, 620, 700, 780].map((x, i) => `<rect x="${x}" y="${260 + Math.abs(500 - x) * 0.25}" width="16" height="110" rx="3" fill="${['#f472b6', '#22d3ee', '#facc15', '#a78bfa', '#fb923c', '#86efac', '#f472b6', '#38bdf8'][i]}" stroke="#1a0f08" stroke-width="3"/><rect x="${x + 18}" y="${260 + Math.abs(500 - x) * 0.25}" width="16" height="110" rx="3" fill="#1b1722" stroke="#1a0f08" stroke-width="3"/>`).join('')
      + '<line x1="190" y1="390" x2="834" y2="390" stroke="#6b4423" stroke-width="10"/>' }));
  s.push(P.candle(240, 840, 120));
  s.push(shadow(540, 200));
  // mole
  s.push(oval(540, 640, 150, 170, fur, { inner: '<ellipse cx="540" cy="680" rx="90" ry="110" fill="#7a5640"/>' }));
  s.push(oval(470, 806, 44, 24, '#f9a8d4'), oval(610, 806, 44, 24, '#f9a8d4'));
  // clipboard + record
  s.push(g(560, 650, 1, -6, part('M-70,-90 L70,-90 L70,90 L-70,90 Z', '#b08d57', { lw: 5, inner: '<rect x="-56" y="-74" width="112" height="152" fill="#fff7e0"/>' + [-50, -30, -10, 10, 30, 50].map(y => `<line x1="-40" y1="${y}" x2="40" y2="${y}" stroke="#9ca3af" stroke-width="4"/><path d="M-50,${y - 4} l4,6 l8,-10" stroke="#16a34a" stroke-width="3" fill="none"/>`).join('') }) + part('M-24,-100 L24,-100 L24,-80 L-24,-80 Z', '#6b7280', { lw: 4 })));
  s.push(paw(470, 660, 30, '#f9a8d4'), paw(650, 640, 30, '#f9a8d4'));
  // head (part of body top)
  s.push(head(540, 460, 120, 100, fur));
  s.push(face(540, 450, { eyes: 'dot', mouth: 'flat', gap: 64, r: 9, mouthY: 70, mw: 14 }));
  s.push(`<g stroke="#3b2418" stroke-width="5" fill="#ffffff" fill-opacity="0.25"><circle cx="508" cy="450" r="24"/><circle cx="572" cy="450" r="24"/><path d="M532,450 L548,450" fill="none"/></g>`);
  // star nose
  let sn = ''; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; sn += `<ellipse cx="${540 + Math.cos(a) * 18}" cy="${494 + Math.sin(a) * 14}" rx="9" ry="5" transform="rotate(${a * 180 / Math.PI} ${540 + Math.cos(a) * 18} ${494 + Math.sin(a) * 14})" fill="#f472b6" stroke="#9d174d" stroke-width="2"/>`; }
  s.push(sn, dot(540, 494, 12, '#f472b6', 'stroke="#9d174d" stroke-width="3"'));
  const front = sparkles([[860, 120, 10, '#e9d5b5'], [120, 160, 10, '#e9d5b5']]);
  return page({ accent: '#4b2e1f', glow: '#8a5a3a', figure: s.join('\n'), front, seed: 58 });
}

export default {
  'the-indie-devotee': patch, 'the-ambient-collector': echo, 'the-subculture-rebel': spike, 'the-shadow-curator': inky,
  'the-vintage-explorer': copper, 'the-gentle-historian': sage, 'the-underground-romantic': ember, 'the-obscure-archivist': burrow,
};
