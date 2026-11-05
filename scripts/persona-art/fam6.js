import { page } from './kit.js';
import * as P from './parts.js';
const { g, oval, circ, blob, face, nose, ears, head, paw, limb, line, hl, smooth, part, ell, dot, darken, lighten, star, sparkles, notes, shadow } = P;

function fizz() {
  const y = '#d9e84a', belly = '#fefce8';
  const s = [];
  // radio waves arcs
  for (const [r, op] of [[120, 0.7], [200, 0.5], [280, 0.3]]) s.push(`<path d="M${512 - r},800 A${r},${r * 0.9} 0 0,1 ${512 + r},800" fill="none" stroke="#fde047" stroke-opacity="${op}" stroke-width="12" stroke-linecap="round"/>`);
  s.push(shadow(512, 140));
  // springy back legs
  s.push(limb(smooth([[460, 560], [360, 470], [330, 640]]), 30, y), limb(smooth([[560, 560], [660, 470], [690, 640]]), 30, y));
  s.push(line('M330,640 L310,680 M690,640 L710,680', darken(y, 0.5), 8));
  s.push(oval(512, 540, 100, 110, y, { inner: `<ellipse cx="512" cy="570" rx="60" ry="70" fill="${belly}"/>` + [530, 560, 590].map(yy => `<line x1="460" y1="${yy}" x2="564" y2="${yy}" stroke="#e7e5a0" stroke-width="5"/>`).join('') }));
  s.push(limb(smooth([[430, 500], [360, 440], [330, 380]]), 24, y), paw(326, 370, 18, y));
  s.push(limb(smooth([[594, 500], [650, 460], [680, 420]]), 24, y));
  s.push(P.phone(700, 390, 18, '#fde047', 0.75));
  // head + antennae
  s.push(line('M470,320 C440,230 400,200 360,190 M554,320 C584,230 624,200 664,190', darken(y, 0.45), 6), dot(360, 190, 10, '#f472b6'), dot(664, 190, 10, '#22d3ee'));
  s.push(head(512, 390, 100, 86, y));
  s.push(face(512, 380, { eyes: 'wide', mouth: 'grin', gap: 92, r: 18, mouthY: 56, mw: 18 }));
  const front = P.motion([[440, 760, 40, 1.57], [512, 770, 50, 1.57], [584, 760, 40, 1.57]], '#fef08a')
    + sparkles([[200, 260, 20, '#fde047'], [840, 230, 22, '#f472b6'], [860, 560, 16, '#22d3ee'], [180, 560, 14, '#fde047']]);
  return page({ accent: '#fde047', glow: '#d6b80f', figure: s.join('\n'), front, seed: 81 });
}

function marsh() {
  const p = '#fbcfe8', belly = '#fff';
  const s = [];
  // hammock between two posts
  s.push(line('M180,860 L200,360 M844,860 L824,360', '#8a5634', 22));
  s.push(line('M200,380 L300,560 M824,380 L724,560', '#d6c3a5', 6));
  s.push(part('M290,540 C380,700 640,700 734,540 C720,640 620,720 512,720 C404,720 304,640 290,540 Z', '#22d3ee', { inner: [0, 1, 2, 3].map(i => `<path d="M${320 + i * 100},590 L${360 + i * 100},700" stroke="#f472b6" stroke-width="18"/>`).join('') }));
  // marshmallow bunny lying in hammock
  s.push(ears('long', 470, 540, 140, p, '#f9a8d4'));
  s.push(oval(512, 590, 170, 90, p, { inner: '<ellipse cx="560" cy="610" rx="90" ry="40" fill="#fff"/>' }));
  s.push(head(450, 560, 110, 90, p));
  s.push(face(450, 560, { eyes: 'shut', mouth: 'smile', gap: 80, r: 15, mouthY: 40, mw: 14 }));
  s.push(P.earbud(560, 560, 1));
  s.push(paw(610, 560, 24, p), paw(680, 600, 24, p));
  const front = `<text x="560" y="420" font-family="Comic Sans MS, cursive" font-size="54" font-weight="700" fill="#fbcfe8" opacity="0.9">z</text><text x="610" y="370" font-family="Comic Sans MS, cursive" font-size="40" font-weight="700" fill="#fbcfe8" opacity="0.7">z</text><text x="650" y="330" font-family="Comic Sans MS, cursive" font-size="30" font-weight="700" fill="#fbcfe8" opacity="0.5">z</text>`
    + notes([[300, 300, 0.8, '#fbcfe8', -10]]) + sparkles([[860, 240, 14, '#fbcfe8'], [180, 220, 12, '#fde68a']]);
  return page({ accent: '#fbcfe8', glow: '#e88cbc', figure: s.join('\n'), front, seed: 82 });
}

function grim() {
  const robe = '#dc2626', dark = '#7f1d1d';
  const s = [];
  // club lights
  s.push(`<g opacity="0.25"><path d="M200,0 L120,860 L300,860 Z" fill="#22d3ee"/><path d="M820,0 L720,860 L900,860 Z" fill="#a855f7"/></g>`);
  s.push(shadow(512, 200));
  // robe body dancing
  s.push(part('M420,420 C400,560 360,700 340,800 C400,820 460,790 512,810 C564,790 624,820 684,800 C664,700 624,560 604,420 Z', robe, { inner: '<path d="M512,440 L512,800" stroke="#b91c1c" stroke-width="6" opacity="0.6"/>' }));
  s.push(limb(smooth([[430, 480], [350, 420], [310, 330]]), 34, robe), paw(306, 318, 20, '#f5f5f4'));
  s.push(limb(smooth([[594, 480], [670, 520], [730, 470]]), 34, robe));
  s.push(P.lightstick(760, 420, 0.8, 30, '#a3e635'));
  // hood + skull face
  s.push(part('M390,380 C380,260 440,200 512,200 C584,200 644,260 634,380 C630,440 590,470 512,470 C434,470 394,440 390,380 Z', robe));
  s.push(oval(512, 360, 82, 80, '#f5f5f4', { off: [-8, -8] }));
  s.push(`<ellipse cx="482" cy="350" rx="20" ry="24" fill="#1f1220"/><ellipse cx="542" cy="350" rx="20" ry="24" fill="#1f1220"/><circle cx="476" cy="342" r="6" fill="#fff"/><circle cx="536" cy="342" r="6" fill="#fff"/>`);
  s.push(line('M486,404 L538,404 M496,398 L496,410 M512,398 L512,410 M528,398 L528,410', '#1f1220', 5));
  s.push(P.blush(456, 386, 16, '#fb7185'), P.blush(568, 386, 16, '#fb7185'));
  const front = sparkles([[200, 240, 20, '#22d3ee'], [840, 220, 20, '#a855f7'], [860, 600, 16, '#a3e635'], [170, 600, 16, '#dc2626']]) + P.motion([[260, 300, 40, -2.4], [280, 360, 40, -2.8]], '#fecaca')
    + notes([[620, 200, 0.7, '#fca5a5', 10]]);
  return page({ accent: '#dc2626', figure: s.join('\n'), front, seed: 83 });
}

function loaf() {
  const fur = '#9ca3af';
  const s = [];
  // rainy window behind
  s.push(part('M200,140 L824,140 L824,520 L200,520 Z', '#1e293b', { ink: '#475569', lw: 10, inner: '<line x1="512" y1="140" x2="512" y2="520" stroke="#475569" stroke-width="10"/>' + P.drops([[260, 200], [340, 280], [420, 220], [600, 190], [700, 280], [760, 220], [300, 420], [660, 430], [560, 360]], '#93c5fd') }));
  s.push(part('M170,520 L854,520 L854,560 L170,560 Z', '#475569'));
  s.push(shadow(512, 220));
  // the loaf
  s.push(part('M300,800 C290,690 330,560 512,560 C694,560 734,690 724,800 Z', fur, { inner: '<path d="M380,620 C400,640 410,660 400,690 M620,620 C600,640 590,660 600,690 M512,600 L512,640" stroke="#6b7280" stroke-width="10" stroke-linecap="round" fill="none"/>' }));
  s.push(limb('M690,760 C760,760 780,720 760,690', 30, fur));
  s.push(paw(440, 806, 24, fur), paw(580, 806, 24, fur));
  s.push(ears('pointy', 512, 520, 130, fur, '#f9a8d4'));
  s.push(head(512, 520, 130, 100, fur));
  s.push(P.headphones(512, 520, 132, '#f9a8d4', '#f472b6'));
  s.push(face(512, 520, { eyes: 'shut', mouth: 'flat', gap: 96, r: 16, mouthY: 44, mw: 12 }));
  s.push(nose(512, 548, 9, '#f472b6'));
  s.push(line('M430,560 L370,550 M430,574 L374,580 M594,560 L654,550 M594,574 L650,580', '#d1d5db', 4));
  const front = P.teacup(220, 780, 0.8, '#e5e7eb') + notes([[820, 640, 0.7, '#d1d5db', 8]]);
  return page({ accent: '#9ca3af', glow: '#64748b', figure: s.join('\n'), front, seed: 84 });
}

function cherry() {
  const c = '#e0294b', fluff = '#f8b4c0';
  const s = [];
  s.push(`<g opacity="0.2">${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${150 + i * 150}" cy="${100 + (i % 2) * 60}" r="30" fill="#fde68a"/>`).join('')}</g>`);
  s.push(shadow(470, 200));
  // skates
  s.push(limb('M440,680 L420,770', 32, c), limb('M520,680 L560,760', 32, c));
  for (const [x, y, r] of [[410, 790, -4], [570, 782, 10]]) s.push(g(x, y, 1, r, part('M-40,-36 L18,-36 C36,-36 50,-18 50,0 L50,8 L-40,8 Z', '#fff7ed', { lw: 5 }) + circ(-24, 24, 12, '#facc15') + circ(32, 24, 12, '#facc15')));
  // poodle: pompom body
  s.push(circ(480, 600, 110, fluff, { inner: '<circle cx="440" cy="570" r="40" fill="#fbcfe8" opacity="0.6"/>' }));
  s.push(part('M410,560 L550,560 L560,700 L400,700 Z', c, { inner: '<circle cx="450" cy="620" r="10" fill="#fff"/><circle cx="510" cy="650" r="10" fill="#fff"/>' }));
  s.push(limb(smooth([[420, 580], [360, 520], [330, 460]]), 26, fluff), circ(326, 450, 30, fluff));
  s.push(limb(smooth([[550, 600], [620, 640], [660, 620]]), 26, fluff));
  // cherry boombox
  s.push(line('M700,500 C720,440 760,420 800,420', '#16a34a', 10));
  s.push(circ(700, 600, 80, '#e11d48', { inner: '<circle cx="670" cy="600" r="26" fill="#2a2433"/><circle cx="730" cy="600" r="26" fill="#2a2433"/><circle cx="670" cy="600" r="9" fill="#f472b6"/><circle cx="730" cy="600" r="9" fill="#f472b6"/><path d="M660,560 C680,546 700,546 716,552" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.7"/>' }));
  s.push(P.oval(790, 430, 30, 14, '#22c55e', { lw: 4 }, -20));
  // head with poof
  s.push(circ(470, 290, 80, fluff));
  s.push(oval(380, 420, 46, 70, fluff, {}, 10), oval(560, 420, 46, 70, fluff, {}, -10));
  s.push(head(470, 400, 92, 84, fluff));
  s.push(face(470, 396, { eyes: 'happy', mouth: 'grin', gap: 70, r: 14, mouthY: 50, mw: 16 }));
  s.push(nose(470, 430, 12));
  const front = notes([[800, 260, 0.9, '#fda4af', 10], [210, 300, 0.8, '#fde68a', -10]]) + sparkles([[860, 760, 14, '#fde68a'], [180, 560, 16, '#f472b6'], [600, 140, 14, '#fde68a']]) + P.motion([[230, 700, 50, 3.1], [240, 750, 40, 3.1]], '#fecdd3');
  return page({ accent: '#c81d3f', glow: '#e0294b', figure: s.join('\n'), front, seed: 85 });
}

function dial() {
  const y = '#fdf4b0';
  const s = [];
  s.push(shadow(512, 220));
  s.push(P.radio(512, 720, 1.4, '#c08457'));
  // canary perched on top
  s.push(line('M480,620 L470,640 M540,620 L550,640', '#f59e0b', 8));
  s.push(part('M600,560 L700,580 L680,600 L720,620 L600,600 Z', '#f6e27a'));
  s.push(oval(512, 540, 100, 90, y, { inner: '<ellipse cx="500" cy="570" rx="56" ry="46" fill="#fffde8"/>' }));
  s.push(part('M560,520 C620,500 660,520 680,560 C640,566 600,560 560,550 Z', '#f6e27a'));
  s.push(head(490, 410, 82, 76, y));
  s.push(part('M420,350 C410,320 420,300 440,296 C440,320 450,336 460,346 Z', '#f6e27a'));
  s.push(part('M410,420 L360,432 L410,446 Z', '#f59e0b', { lw: 4, off: [-3, -3] }));
  s.push(face(480, 404, { eyes: 'shut', mouth: 'none', gap: 54, r: 12 }));
  const front = notes([[300, 340, 0.9, '#fef9c3', -12], [240, 250, 0.7, '#fde68a', 6], [740, 300, 0.7, '#fef9c3', 8]]) + sparkles([[860, 200, 14, '#fef9c3'], [160, 560, 12, '#fef9c3']]);
  return page({ accent: '#fefce8', glow: '#cbb85a', figure: s.join('\n'), front, seed: 86 });
}

function blaze() {
  const c = '#9b3b45', belly = '#f5c2b4';
  const s = [];
  // crowd silhouettes
  s.push(`<g fill="#1a0e14">${[180, 300, 720, 840].map((x, i) => `<circle cx="${x}" cy="${700 - (i % 2) * 20}" r="60"/><rect x="${x - 70}" y="${730 - (i % 2) * 20}" width="140" height="160" rx="50"/>`).join('')}</g>`);
  s.push(shadow(512, 200));
  s.push(limb(smooth([[600, 720], [700, 760], [760, 720]]), 34, c));
  s.push(limb('M460,700 L440,800', 40, c), limb('M564,700 L584,800', 40, c));
  s.push(oval(512, 600, 110, 130, c, { inner: `<ellipse cx="512" cy="630" rx="60" ry="90" fill="${belly}"/>` + [[440, 520], [580, 540], [470, 700]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#facc15" opacity="0.8"/>`).join('') }));
  // arm aloft with lighter
  s.push(limb(smooth([[590, 520], [650, 430], [660, 330]]), 32, c));
  s.push(part('M640,300 L684,300 L684,350 L640,350 Z', '#3b82f6', { lw: 4 }), part('M644,286 L680,286 L680,302 L644,302 Z', '#d1d5db', { lw: 4 }));
  s.push(`<ellipse cx="662" cy="240" rx="50" ry="60" fill="#ff9a3c" opacity="0.6" filter="url(#glow)"/><path d="M662,190 C686,220 680,260 662,272 C644,260 638,220 662,190 Z" fill="#ffb347" stroke="#c2410c" stroke-width="4"/><path d="M662,226 C670,240 668,256 662,262 C656,256 654,240 662,226 Z" fill="#fff6c8"/>`);
  s.push(limb(smooth([[440, 520], [390, 580], [420, 620]]), 30, c));
  s.push(head(500, 410, 110, 94, c));
  s.push(face(500, 400, { eyes: 'happy', mouth: 'grin', brows: 'worried', gap: 84, r: 16, mouthY: 56, mw: 18 }));
  s.push(P.tear(440, 420, 1), P.tear(566, 422, 1.1));
  const front = notes([[230, 330, 0.9, '#fca5a5', -10], [820, 330, 0.8, '#fde68a', 10]]) + sparkles([[200, 520, 14, '#ff9a3c'], [860, 520, 14, '#ff9a3c'], [460, 140, 14, '#fde68a']]);
  return page({ accent: '#722f37', glow: '#a3424e', figure: s.join('\n'), front, seed: 87 });
}

function pebble() {
  const g1 = '#b5aea8';
  const s = [];
  s.push(`<ellipse cx="512" cy="836" rx="320" ry="70" fill="#5b8fb0" opacity="0.6"/><path d="M260,830 C320,814 380,846 440,830 M600,840 C660,824 720,856 780,836" stroke="#bae6fd" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7"/>`);
  // lily pad + radio
  s.push(g(720, 820, 1, 0, part('M0,0 L120,-16 A130,40 0 1,0 120,16 Z', '#4ade80', { off: [-6, -6] })));
  s.push(P.radio(720, 760, 0.55, '#c08457'));
  // heron
  s.push(line('M470,560 L460,830 M520,560 L530,830', '#57534e', 10));
  s.push(part('M380,520 C380,420 460,380 540,400 C620,420 660,480 680,560 C600,560 520,600 440,600 C400,600 380,570 380,520 Z', g1, { inner: '<path d="M560,440 C610,470 640,510 660,550" stroke="#78716c" stroke-width="10" fill="none"/>' }));
  s.push(limb('M430,450 C400,380 400,300 440,250', 30, g1));
  s.push(head(460, 230, 60, 52, g1));
  s.push(part('M500,228 L620,250 L500,256 Z', '#f59e0b', { lw: 4, off: [-3, -3] }));
  s.push(line('M430,200 C400,190 380,200 360,220', '#1f2937', 6));
  s.push(face(456, 226, { eyes: 'lid', skin: g1, mouth: 'none', gap: 40, r: 10 }));
  const front = notes([[790, 600, 0.6, '#d6d3d1', 10], [850, 520, 0.5, '#d6d3d1', -6]]) + P.moon(220, 200, 0.6, '#e7e5e4') + sparkles([[860, 200, 10, '#e7e5e4']]);
  return page({ accent: '#a8a29e', glow: '#7d756f', figure: s.join('\n'), front, seed: 88 });
}

export default {
  'the-mainstream-hopper': fizz, 'the-easy-listener': marsh, 'the-doom-dancer': grim, 'the-lofi-drifter': loaf,
  'the-retro-socialite': cherry, 'the-classic-radio-fan': dial, 'the-torchbearer': blaze, 'the-reflective-listener': pebble,
};
