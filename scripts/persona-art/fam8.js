import { page } from './kit.js';
import * as P from './parts.js';
const { g, oval, circ, blob, face, nose, ears, head, paw, limb, line, hl, smooth, part, ell, dot, darken, lighten, star, sparkles, notes, shadow } = P;

function pip() {
  const t = '#2dd4bf';
  const s = [];
  s.push(P.speaker(650, 640, 1.6, '#2a2433', 0));
  s.push(shadow(400, 160));
  // duckling on tiptoe leaning into the cone
  s.push(line('M380,720 L370,800 M430,720 L440,800', '#f59e0b', 10));
  s.push(oval(366, 806, 30, 12, '#f59e0b', { lw: 4 }), oval(446, 806, 30, 12, '#f59e0b', { lw: 4 }));
  s.push(oval(410, 640, 100, 92, t, { inner: '<ellipse cx="400" cy="670" rx="56" ry="50" fill="#ccfbf1"/>' }, -15));
  s.push(part('M330,620 C290,600 280,560 300,540 C320,570 340,590 360,600 Z', t));
  s.push(head(500, 520, 80, 74, t));
  s.push(part('M560,520 L620,530 L560,550 Z', '#f59e0b', { lw: 4, off: [-3, -3] }));
  s.push(line('M480,450 C470,420 490,400 510,410', darken(t, 0.42), 6));
  s.push(P.eye(520, 500, 18), P.blush(540, 540, 18));
  s.push(P.earbud(450, 520, -1));
  const front = `<g stroke="#99f6e4" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.8"><path d="M760,520 c30,30 30,80 0,110"/><path d="M800,490 c45,45 45,125 0,170"/></g>`
    + sparkles([[220, 260, 18, '#2dd4bf'], [500, 360, 14, '#facc15'], [860, 240, 16, '#f472b6']]) + `<text x="560" y="420" font-family="Comic Sans MS, cursive" font-size="64" font-weight="700" fill="#facc15">?</text>`;
  return page({ accent: '#14b8a6', glow: '#14b8a6', figure: s.join('\n'), front, seed: 101 });
}

function flutter() {
  const b = '#bfdbfe';
  const s = [];
  // headphone flower
  s.push(limb('M512,860 C500,760 530,680 512,600', 18, '#22c55e'));
  s.push(P.oval(470, 760, 40, 16, '#4ade80', { lw: 4 }, -30), P.oval(556, 700, 40, 16, '#4ade80', { lw: 4 }, 30));
  s.push(P.headphones(512, 560, 110, '#fbcfe8', '#f472b6'));
  s.push(circ(512, 560, 46, '#fde68a', { inner: '<circle cx="512" cy="560" r="20" fill="#f59e0b"/>' }));
  // butterfly landing
  const wing = (sx, top) => part(top
    ? `M512,400 C${512 + sx * 60},300 ${512 + sx * 200},260 ${512 + sx * 220},340 C${512 + sx * 230},400 ${512 + sx * 120},430 512,420 Z`
    : `M512,420 C${512 + sx * 100},430 ${512 + sx * 180},470 ${512 + sx * 160},530 C${512 + sx * 130},560 ${512 + sx * 60},500 512,440 Z`, b,
  { inner: `<circle cx="${512 + sx * (top ? 140 : 100)}" cy="${top ? 340 : 480}" r="${top ? 30 : 20}" fill="#f9a8d4" opacity="0.7"/>` });
  s.push(wing(-1, true), wing(1, true), wing(-1, false), wing(1, false));
  s.push(oval(512, 430, 20, 70, '#64748b'));
  s.push(line('M500,370 C480,330 470,310 450,300 M524,370 C544,330 554,310 574,300', '#64748b', 5), dot(450, 300, 8, '#f9a8d4'), dot(574, 300, 8, '#f9a8d4'));
  s.push(head(512, 370, 34, 30, '#94a3b8'));
  s.push(face(512, 370, { eyes: 'shut', mouth: 'smile', gap: 28, r: 7, mouthY: 16, mw: 8, blush: false }));
  const front = sparkles([[200, 260, 14, '#bfdbfe'], [840, 240, 16, '#f9a8d4'], [820, 560, 12, '#bfdbfe'], [200, 600, 12, '#fde68a']]) + notes([[280, 440, 0.6, '#dbeafe', -10]]);
  return page({ accent: '#bfdbfe', glow: '#7aa7e0', figure: s.join('\n'), front, seed: 102 });
}

function byte() {
  const r = '#ff1744';
  const s = [];
  s.push(shadow(512, 220));
  // pixel slime: blocky silhouette
  const px = 40, rows = ['....XXXX....', '..XXXXXXXX..', '.XXXXXXXXXX.', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', '.XXXXXXXXXX.'];
  let d = '';
  rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === 'X') d += `M${272 + i * px},${500 + j * px} h${px} v${px} h${-px} Z `; }));
  s.push(`<path d="${d}" fill="${r}" stroke="${darken(r, 0.45)}" stroke-width="4"/>`);
  s.push(`<path d="${d}" fill="#ffffff" opacity="0.12" transform="translate(-10 -10)"/>`);
  // glitch slices
  s.push(`<rect x="250" y="620" width="520" height="22" fill="#22d3ee" opacity="0.7"/><rect x="290" y="700" width="460" height="14" fill="#a3e635" opacity="0.5"/>`);
  // pixel face
  s.push(`<rect x="392" y="580" width="40" height="40" fill="#111"/><rect x="592" y="580" width="40" height="40" fill="#111"/><rect x="400" y="584" width="12" height="12" fill="#fff"/><rect x="600" y="584" width="12" height="12" fill="#fff"/><rect x="472" y="660" width="80" height="20" fill="#111"/><rect x="452" y="650" width="20" height="20" fill="#111"/><rect x="552" y="650" width="20" height="20" fill="#111"/>`);
  s.push(`<rect x="372" y="540" width="60" height="12" fill="#111" transform="rotate(12 400 546)"/><rect x="592" y="540" width="60" height="12" fill="#111" transform="rotate(-12 620 546)"/>`);
  // bits floating off
  for (const [x, y, sz, c] of [[300, 440, 30, r], [700, 420, 26, r], [760, 360, 20, '#22d3ee'], [240, 360, 18, '#a3e635'], [640, 320, 16, r], [380, 300, 14, '#22d3ee']]) s.push(`<rect x="${x}" y="${y}" width="${sz}" height="${sz}" fill="${c}" stroke="${darken(c, 0.45)}" stroke-width="3"/>`);
  const front = P.earbud(250, 560, -1) + sparkles([[860, 240, 18, '#ff1744'], [180, 200, 14, '#22d3ee']]);
  return page({ accent: '#ff1744', figure: s.join('\n'), front, seed: 103 });
}

function hush() {
  const c = '#94a3b8';
  const s = [];
  // door
  s.push(part('M520,120 L860,120 L860,860 L520,860 Z', '#3b2f2a', { ink: '#1a1410', inner: '<rect x="560" y="160" width="260" height="280" rx="10" fill="none" stroke="#2a201a" stroke-width="8"/><rect x="560" y="480" width="260" height="320" rx="10" fill="none" stroke="#2a201a" stroke-width="8"/>' }));
  s.push(`<path d="M520,120 L520,860 L480,860 L480,120 Z" fill="#fde68a" opacity="0.12"/>`);
  s.push(circ(560, 500, 18, '#c9a227'));
  s.push(shadow(470, 160));
  // sheet ghost peeking from behind the door edge
  s.push(part('M330,820 C330,820 320,500 380,400 C420,330 500,320 540,380 L540,820 C510,800 490,830 460,810 C430,830 410,800 380,820 C360,840 340,820 330,820 Z', '#e2e8f0', { ink: '#64748b' }));
  s.push(face(450, 470, { eyes: 'dot', mouth: 'o', brows: 'worried', gap: 64, r: 14, mouthY: 50, mw: 14 }));
  // earbud cords dangling
  s.push(line('M380,500 C370,560 380,640 400,700 M520,500 C530,560 520,640 500,700', '#ffffff', 5));
  s.push(P.earbud(380, 480, -1), P.earbud(520, 480, 1));
  s.push(P.phone(450, 720, 0, '#94a3b8', 0.5));
  const front = sparkles([[200, 260, 10, '#cbd5e1'], [420, 200, 8, '#cbd5e1']]) + notes([[230, 440, 0.6, '#94a3b8', -10]]);
  return page({ accent: '#64748b', glow: '#64748b', figure: s.join('\n'), front, seed: 104 });
}

function sherbet() {
  const c = '#fdba74';
  const s = [];
  s.push(shadow(512, 240));
  // legs (sideways shuffle)
  for (const [x, a] of [[380, -0.5], [420, -0.3], [600, 0.3], [640, 0.5]]) s.push(limb(`M${x},700 L${x + Math.sin(a) * 120},790`, 20, '#fb923c'));
  // cassette shell on the back
  s.push(P.cassette(560, 560, 1.4, -8, '#a78bfa'));
  // crab body
  s.push(oval(470, 680, 110, 70, c, { inner: '<ellipse cx="470" cy="700" rx="70" ry="36" fill="#fed7aa"/>' }));
  // claws up dancing
  s.push(limb(smooth([[380, 650], [300, 600], [280, 520]]), 24, c));
  s.push(part('M240,520 C230,460 280,430 320,450 L290,490 L330,500 C320,530 270,550 240,520 Z', c));
  s.push(limb(smooth([[560, 650], [700, 640], [760, 560]]), 24, c));
  s.push(part('M730,560 C720,500 770,470 810,490 L780,530 L820,540 C810,570 760,590 730,560 Z', c));
  // eye stalks
  s.push(line('M440,630 L430,560 M500,630 L510,560', '#fb923c', 10), P.eye(430, 548, 16), P.eye(510, 548, 16));
  s.push(line('M440,700 C460,716 490,716 510,700', '#7c2d12', 6), P.blush(410, 690, 18), P.blush(530, 690, 18));
  const front = P.motion([[180, 760, 50, 3.1], [190, 720, 40, 3.1]], '#fed7aa') + sparkles([[200, 300, 18, '#fdba74'], [860, 300, 18, '#a78bfa'], [880, 620, 14, '#fdba74']]) + notes([[700, 300, 0.8, '#fed7aa', 10]]);
  return page({ accent: '#fdba74', glow: '#e88a3a', figure: s.join('\n'), front, seed: 105 });
}

function linen() {
  const wool = '#f5efe2', face_ = '#5a4a40';
  const s = [];
  s.push(P.radio(780, 760, 0.8, '#c08457'));
  s.push(shadow(430, 220));
  // fluffy wool body
  const puffs = [[330, 620], [380, 560], [450, 540], [520, 560], [560, 620], [550, 700], [480, 740], [400, 740], [340, 690]];
  s.push(blob(puffs.flatMap(([x, y], i) => [[x, y]]), wool, { ink: '#b8a88a' }));
  for (const [x, y] of puffs) s.push(circ(x, y, 50, wool, { ink: '#b8a88a', off: [-6, -6] }));
  s.push(oval(450, 640, 110, 90, wool, { ink: '#b8a88a', noLine: true }));
  s.push(line('M380,760 L380,810 M520,760 L520,810', face_, 18));
  // knitting cassette-tape scarf
  s.push(part('M360,640 L560,640 L560,690 L360,690 Z', '#3b2f2a', { lw: 5, inner: '<path d="M370,652 L550,652 M370,668 L550,668 M370,684 L550,684" stroke="#6b5444" stroke-width="4"/>' }));
  s.push(line('M560,666 C620,640 660,700 700,720', '#3b2f2a', 8));
  s.push(line('M330,600 L500,700 M580,600 L410,700', '#c9a227', 8));
  s.push(paw(420, 660, 22, face_), paw(500, 660, 22, face_));
  // head
  s.push(circ(440, 450, 60, wool, { ink: '#b8a88a' }), circ(380, 470, 40, wool, { ink: '#b8a88a' }), circ(500, 470, 40, wool, { ink: '#b8a88a' }));
  s.push(oval(440, 500, 66, 64, face_));
  s.push(oval(366, 500, 40, 16, face_, {}, 20), oval(514, 500, 40, 16, face_, {}, -20));
  s.push(face(440, 500, { eyes: 'shut', mouth: 'smile', gap: 50, r: 11, mouthY: 30, mw: 10, ink: '#f5efe2' }));
  const front = notes([[680, 520, 0.8, '#f5efe2', 10], [760, 440, 0.6, '#f5efe2', -6]]) + sparkles([[200, 300, 12, '#f5efe2'], [860, 280, 12, '#fde68a']]);
  return page({ accent: '#f0e6d2', glow: '#bfae84', figure: s.join('\n'), front, seed: 106 });
}

function scramble() {
  const c = '#b9502f';
  const s = [];
  // record stacks as cliffs
  const stack = (x, base, n, w) => Array.from({ length: n }, (_, i) => part(`M${x - w / 2 + (i % 2) * 6},${base - i * 22} L${x + w / 2 + (i % 2) * 6},${base - i * 22} L${x + w / 2 + (i % 2) * 6},${base - i * 22 - 20} L${x - w / 2 + (i % 2) * 6},${base - i * 22 - 20} Z`, ['#f472b6', '#38bdf8', '#facc15', '#a78bfa', '#fb923c', '#86efac'][i % 6], { lw: 4, off: [-3, -3] })).join('');
  s.push(stack(270, 840, 14, 180), stack(760, 840, 9, 180));
  // goat mid-leap between stacks
  s.push(limb(smooth([[440, 520], [380, 560], [330, 600]]), 26, c), limb(smooth([[600, 520], [660, 560], [700, 540]]), 26, c));
  s.push(oval(520, 480, 120, 76, c, { inner: '<ellipse cx="520" cy="500" rx="80" ry="40" fill="#e9a58a"/>' }, -10));
  s.push(limb(smooth([[480, 530], [430, 600]]), 26, c), limb(smooth([[580, 520], [620, 600]]), 26, c));
  s.push(line('M330,600 L320,620 M430,600 L420,620 M620,600 L630,620 M700,540 L720,550', '#2a1a14', 10));
  s.push(limb('M620,440 C650,400 660,360 650,330', 40, c));
  s.push(head(660, 300, 64, 56, c));
  s.push(limb('M630,250 C600,200 560,190 540,210', 18, '#e7e5e4', { ink: '#57534e' }), limb('M680,250 C700,200 740,190 760,210', 18, '#e7e5e4', { ink: '#57534e' }));
  s.push(part('M640,340 L660,400 L680,340 Z', '#f5f5f4', { lw: 4 }));
  s.push(face(660, 296, { eyes: 'dot', mouth: 'frown', brows: 'worried', gap: 46, r: 11, mouthY: 30, mw: 10 }));
  const front = P.motion([[300, 420, 60, 3.4], [320, 470, 50, 3.3]], '#fca5a5') + sparkles([[860, 200, 16, '#fca5a5'], [200, 220, 14, '#facc15']]) + notes([[860, 460, 0.7, '#fca5a5', 10]]);
  return page({ accent: '#a3402b', glow: '#c25a3a', figure: s.join('\n'), front, seed: 107 });
}

function dusk() {
  const c = '#64748b';
  const s = [];
  // faraway gramophone tiny on the horizon
  s.push(P.gramophone(800, 760, 0.4, '#c9a227'));
  s.push(`<g stroke="#fde68a" stroke-width="4" fill="none" opacity="0.4" stroke-dasharray="6 10"><path d="M760,680 C700,600 640,560 600,520"/></g>`);
  s.push(shadow(470, 140));
  // firefly with flickering glow
  s.push(`<circle cx="470" cy="600" r="120" fill="#fde68a" opacity="0.45" filter="url(#glow)"/>`);
  s.push(oval(360, 380, 90, 50, '#cbd5e1', { ink: '#64748b', inner: '' }, -30), oval(580, 380, 90, 50, '#cbd5e1', { ink: '#64748b' }, 30));
  s.push(oval(470, 520, 70, 110, c));
  s.push(oval(470, 610, 60, 60, '#fef08a', { ink: '#ca8a04' }));
  s.push(oval(470, 610, 30, 30, '#fffbe6', { noLine: true }));
  s.push(head(470, 400, 74, 66, c));
  s.push(line('M440,340 C420,290 400,270 380,260 M500,340 C520,290 540,270 560,260', '#475569', 6), dot(380, 260, 10, '#fde68a'), dot(560, 260, 10, '#fde68a'));
  s.push(face(470, 400, { eyes: 'shut', mouth: 'flat', brows: 'worried', gap: 50, r: 12, mouthY: 36, mw: 10 }));
  s.push(limb('M420,560 L390,640', 16, c), limb('M520,560 L550,640', 16, c));
  const front = notes([[620, 470, 0.5, '#fde68a', 10], [700, 560, 0.4, '#fde68a', -6]]) + sparkles([[220, 220, 10, '#fde68a'], [260, 640, 8, '#fde68a'], [860, 300, 8, '#fde68a'], [700, 160, 8, '#fde68a']]);
  return page({ accent: '#64748b', glow: '#4f5d78', figure: s.join('\n'), front, seed: 108 });
}

export default {
  'the-curious-casual': pip, 'the-gentle-dabbler': flutter, 'the-glitch-drifter': byte, 'the-quiet-ghost': hush,
  'the-retro-casual': sherbet, 'the-soft-traditionalist': linen, 'the-restless-historian': scramble, 'the-fading-whisperer': dusk,
};
