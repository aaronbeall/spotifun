import { page } from './kit.js';
import * as P from './parts.js';
const { g, oval, circ, blob, face, nose, ears, head, paw, limb, line, hl, smooth, part, ell, dot, darken, lighten, star, sparkles, notes, shadow } = P;

function cube() {
  const c = '#0891b2', belly = '#ecfeff';
  const s = [];
  s.push(shadow(512, 220));
  s.push(oval(450, 806, 46, 20, '#f59e0b'), oval(574, 806, 46, 20, '#f59e0b'));
  s.push(part('M370,540 C370,380 430,300 512,300 C594,300 654,380 654,540 C654,700 600,800 512,800 C424,800 370,700 370,540 Z', c, { ink: '#164e63', inner: `<path d="M420,520 C420,400 460,360 512,360 C564,360 604,400 604,520 C604,680 570,770 512,770 C454,770 420,680 420,520 Z" fill="${belly}"/>` }));
  s.push(face(512, 420, { eyes: 'dot', mouth: 'none', gap: 74, r: 15 }));
  s.push(part('M490,456 L534,456 L512,486 Z', '#f59e0b', { lw: 4, off: [-3, -3] }));
  s.push(P.synth(512, 640, 0.95, '#1f2937', '#22d3ee'));
  s.push(limb(smooth([[390, 520], [360, 590], [400, 630]]), 30, c, { ink: '#164e63' }), limb(smooth([[634, 520], [670, 570], [640, 610]]), 30, c, { ink: '#164e63' }));
  s.push(P.headphones(512, 420, 145, '#22d3ee', '#0e7490'));
  const front = notes([[230, 320, 0.9, '#67e8f9', -10], [800, 280, 0.8, '#67e8f9', 10]]) + sparkles([[180, 540, 14, '#22d3ee'], [860, 520, 16, '#a5f3fc'], [520, 140, 14, '#22d3ee']])
    + `<g stroke="#a5f3fc" stroke-width="6" stroke-linecap="round" opacity="0.7"><line x1="300" y1="700" x2="300" y2="${700 - 40}"/><line x1="270" y1="700" x2="270" y2="640"/><line x1="240" y1="700" x2="240" y2="670"/><line x1="750" y1="700" x2="750" y2="650"/><line x1="780" y1="700" x2="780" y2="620"/></g>`;
  return page({ accent: '#06b6d4', figure: s.join('\n'), front, seed: 91 });
}

function moss() {
  const m = '#6ee7b7';
  const s = [];
  s.push(shadow(512, 240));
  s.push(P.cassette(512, 690, 1.3, 0, '#f472b6'));
  // segments curling around the tape
  const seg = [[300, 760], [300, 680], [320, 600], [380, 550], [460, 530], [540, 530], [620, 540], [690, 580], [720, 650], [720, 730], [680, 790]];
  seg.forEach(([x, y], i) => s.push(circ(x, y, 50 - i * 1.2, i % 2 ? m : lighten(m, 0.15), { off: [-6, -6] })));
  for (const [x, y] of [[300, 806], [720, 778], [320, 640]]) s.push(dot(x, y, 10, '#047857'));
  // head
  s.push(head(260, 470, 90, 82, m));
  s.push(line('M230,400 C220,360 200,340 180,330 M290,400 C300,360 320,340 340,330', '#047857', 6), dot(180, 330, 10, '#f472b6'), dot(340, 330, 10, '#f472b6'));
  s.push(face(260, 470, { eyes: 'shut', mouth: 'smile', gap: 60, r: 13, mouthY: 40, mw: 14 }));
  s.push(g(250, 380, 1, 0, '<path d="M0,-12 C-8,-24 -24,-18 -20,-4 C-16,6 0,16 0,16 C0,16 16,6 20,-4 C24,-18 8,-24 0,-12 Z" fill="#f472b6" stroke="#9d174d" stroke-width="3"/>'));
  const front = sparkles([[860, 260, 14, '#a7f3d0'], [180, 260, 12, '#f9a8d4'], [800, 460, 10, '#a7f3d0']]) + notes([[600, 300, 0.7, '#a7f3d0', 8]]);
  return page({ accent: '#6ee7b7', glow: '#34b88a', figure: s.join('\n'), front, seed: 92 });
}

function fang() {
  const fur = '#8a2a33', jacket = '#1f1a24';
  const s = [];
  s.push(P.moon(780, 180, 1.0, '#ef4444'));
  s.push(shadow(470, 220));
  s.push(limb('M420,690 L410,800', 44, fur), limb('M520,690 L530,800', 44, fur));
  s.push(oval(470, 610, 116, 120, jacket, { ink: '#000', inner: '<path d="M470,500 L470,720" stroke="#374151" stroke-width="6"/>' + [[400, 560], [420, 620], [400, 680], [540, 560], [520, 620], [540, 680]].map(([x, y]) => `<path d="M${x},${y - 10} l8,10 l-8,10 l-8,-10 Z" fill="#d1d5db"/>`).join('') }));
  s.push(P.pin(540, 600, '#ef4444', 16));
  s.push(limb(smooth([[390, 560], [340, 620], [360, 670]]), 34, jacket, { ink: '#000' }), limb(smooth([[550, 560], [590, 620], [570, 670]]), 34, jacket, { ink: '#000' }));
  // howling head tilted up
  s.push(g(470, 410, 1, -14, ears('pointy', 0, 0, 110, fur, '#3b0a0e') + head(0, 0, 108, 96, fur)
    + oval(0, 44, 56, 40, '#d6a3a3', { off: [-5, -5] }) + nose(0, 22, 13)
    + face(0, -10, { eyes: 'shut', mouth: 'o', gap: 70, r: 14, brows: 'angry', mouthY: 72, mw: 22 })));
  const front = `<g stroke="#fca5a5" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.8"><path d="M640,240 C660,220 680,220 700,240"/><path d="M620,200 C650,170 690,170 720,200"/></g>`
    + sparkles([[200, 240, 18, '#ef4444'], [180, 560, 14, '#fca5a5'], [860, 560, 14, '#ef4444']]);
  return page({ accent: '#991b1b', glow: '#c2283a', figure: s.join('\n'), front, seed: 93 });
}

function smoke() {
  const fur = '#4b5563', light = '#9ca3af';
  const s = [];
  // the glowing note it follows
  s.push(`<ellipse cx="760" cy="300" rx="90" ry="90" fill="#fde68a" opacity="0.55" filter="url(#glow)"/>`, P.note(760, 320, 1.4, '#fde68a', 10));
  s.push(shadow(470, 200));
  // ringed tail
  s.push(limb(smooth([[540, 720], [640, 700], [700, 620], [700, 520], [660, 460]]), 40, fur));
  for (const [x, y] of [[640, 700], [700, 620], [690, 520]]) s.push(dot(x, y, 20, light));
  s.push(oval(470, 650, 100, 120, fur, { inner: '<ellipse cx="470" cy="680" rx="56" ry="76" fill="#6b7280"/>' }));
  s.push(limb('M420,740 L410,810', 36, fur), limb('M520,740 L530,810', 36, fur));
  s.push(limb(smooth([[540, 600], [600, 560], [630, 520]]), 28, fur), paw(634, 512, 20, light));
  s.push(ears('round', 470, 450, 110, fur, light));
  s.push(head(470, 450, 110, 96, fur));
  s.push(oval(470, 470, 76, 60, light, { off: [-6, -6] }));
  // huge lantern eyes
  for (const x of [432, 508]) s.push(`<circle cx="${x}" cy="440" r="34" fill="#fbbf24" stroke="#1f2937" stroke-width="6"/><circle cx="${x + 10}" cy="438" r="17" fill="#111"/><circle cx="${x + 4}" cy="430" r="7" fill="#fff"/>`);
  s.push(nose(470, 492, 10), line('M450,512 C462,520 478,520 490,512', '#1f2937', 5));
  const front = sparkles([[860, 200, 10, '#fde68a'], [640, 160, 8, '#fde68a'], [200, 300, 10, '#9ca3af']]);
  return page({ accent: '#374151', glow: '#5b6b85', figure: s.join('\n'), front, seed: 94 });
}

function brass() {
  const c = '#9a8a2e', shell = '#b5a642';
  const s = [];
  s.push(shadow(512, 220));
  for (const [x1, y1, x2, y2] of [[420, 660, 360, 780], [460, 690, 440, 800], [604, 660, 664, 780], [564, 690, 584, 800]]) s.push(line(`M${x1},${y1} L${x2},${y2}`, '#3f3a1a', 12));
  s.push(part('M360,600 C360,480 430,420 512,420 C594,420 664,480 664,600 C664,700 594,740 512,740 C430,740 360,700 360,600 Z', shell, { inner: '<path d="M512,420 L512,740" stroke="#6b5f1a" stroke-width="7"/><circle cx="440" cy="560" r="16" fill="#d4c76a"/><circle cx="584" cy="600" r="12" fill="#d4c76a"/>' }));
  s.push(hl('M400,520 C420,470 460,446 500,440', 10, 0.55));
  // head with trumpet horn
  s.push(head(512, 380, 90, 70, c));
  s.push(limb('M512,320 C512,260 530,220 560,200', 22, '#e8c547'));
  s.push(part('M550,210 C580,160 640,130 690,140 C670,190 620,220 570,230 Z', '#e8c547', { ink: '#8a6a1c', inner: '<path d="M690,140 C680,170 660,190 630,206" stroke="#fff3c4" stroke-width="7" fill="none" opacity="0.7"/>' }));
  s.push(face(512, 384, { eyes: 'dot', mouth: 'grin', gap: 66, r: 14, mouthY: 40, mw: 14 }));
  // polishing cloth
  s.push(limb(smooth([[440, 400], [460, 300], [540, 240]]), 18, '#3f3a1a'));
  s.push(part('M530,226 L590,236 L570,276 L520,266 Z', '#f472b6', { lw: 4 }));
  const front = sparkles([[640, 120, 20, '#fde68a'], [720, 180, 14, '#fde68a'], [200, 300, 18, '#d4c76a'], [860, 520, 14, '#fde68a']])
    + notes([[760, 300, 0.9, '#fde68a', 10], [240, 520, 0.7, '#d4c76a', -10]]);
  return page({ accent: '#b5a642', glow: '#9a8a2e', figure: s.join('\n'), front, seed: 95 });
}

function lace() {
  const fur = '#e3d6bd';
  const s = [];
  // record shop bins + shelves
  s.push(part('M160,320 L864,320 L864,340 L160,340 Z', '#8a5634', { lw: 5 }));
  for (let i = 0; i < 12; i++) s.push(`<rect x="${180 + i * 56}" y="230" width="44" height="90" rx="3" fill="${['#f472b6', '#38bdf8', '#facc15', '#a78bfa', '#fb923c', '#86efac'][i % 6]}" stroke="#2a1a14" stroke-width="3"/>`);
  s.push(part('M200,680 L360,680 L370,830 L190,830 Z', '#a0673f', { inner: '<text x="280" y="770" font-family="Comic Sans MS, cursive" font-size="34" font-weight="700" fill="#fff7e0" text-anchor="middle">JAZZ</text>' }));
  s.push(part('M664,680 L824,680 L834,830 L654,830 Z', '#a0673f', { inner: '<text x="744" y="770" font-family="Comic Sans MS, cursive" font-size="34" font-weight="700" fill="#fff7e0" text-anchor="middle">SOUL</text>' }));
  for (let i = 0; i < 4; i++) s.push(`<rect x="${206 + i * 36}" y="${630 + i * 4}" width="30" height="60" fill="${['#f472b6', '#38bdf8', '#facc15', '#a78bfa'][i]}" stroke="#2a1a14" stroke-width="3"/>`, `<rect x="${670 + i * 36}" y="${630 + i * 4}" width="30" height="60" fill="${['#86efac', '#fb923c', '#f472b6', '#38bdf8'][i]}" stroke="#2a1a14" stroke-width="3"/>`);
  s.push(shadow(512, 160));
  // mouse holding up LP
  s.push(line('M560,760 C620,780 640,740 620,720', '#e8a0a0', 6));
  s.push(oval(512, 700, 80, 100, fur, { inner: '<ellipse cx="512" cy="720" rx="46" ry="66" fill="#f7efe0"/>' }));
  s.push(oval(470, 806, 30, 16, '#f9a8d4'), oval(554, 806, 30, 16, '#f9a8d4'));
  s.push(limb(smooth([[450, 650], [420, 560], [430, 480]]), 22, fur), limb(smooth([[574, 650], [604, 560], [594, 480]]), 22, fur));
  s.push(g(512, 420, 1, 0, part('M-110,-110 L110,-110 L110,110 L-110,110 Z', '#f59e0b', { inner: '<circle cx="0" cy="0" r="70" fill="#fde68a"/><circle cx="0" cy="0" r="30" fill="#c2410c"/><path d="M-90,80 L60,80" stroke="#7c2d12" stroke-width="8"/>' })));
  s.push(paw(430, 480, 18, '#f9a8d4'), paw(594, 480, 18, '#f9a8d4'));
  s.push(circ(430, 570, 44, fur, { inner: '<circle cx="430" cy="572" r="26" fill="#f9a8d4"/>' }), circ(594, 570, 44, fur, { inner: '<circle cx="594" cy="572" r="26" fill="#f9a8d4"/>' }));
  s.push(head(512, 610, 72, 64, fur));
  s.push(face(512, 600, { eyes: 'shut', mouth: 'smile', gap: 50, r: 12, mouthY: 36, mw: 12 }));
  s.push(nose(512, 624, 8, '#f472b6'));
  const front = sparkles([[512, 270, 18, '#fde68a'], [380, 330, 12, '#fde68a'], [650, 330, 12, '#fde68a']]) + notes([[860, 440, 0.7, '#f5e6c8', 8]]);
  return page({ accent: '#ddd0b8', glow: '#b8a47a', figure: s.join('\n'), front, seed: 96 });
}

function abyss() {
  const c = '#7a1530';
  const s = [];
  s.push(`<g opacity="0.5">${[[200, 300, 10], [260, 500, 7], [820, 380, 8], [760, 560, 6], [180, 640, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#fda4af" stroke-width="3"/>`).join('')}</g>`);
  s.push(shadow(512, 220));
  // lure with glowing record
  s.push(line('M470,400 C440,280 520,200 620,210', '#4a0a1a', 10));
  s.push(`<circle cx="650" cy="230" r="80" fill="#fda4af" opacity="0.6" filter="url(#glow)"/>`, P.disc(650, 230, 52, '#fda4af'));
  // fish body
  s.push(part('M260,560 C260,440 360,380 480,390 C600,400 680,470 700,560 C720,660 640,740 500,740 C360,740 260,680 260,560 Z', c, { ink: '#3b0510' }));
  s.push(part('M690,560 L820,480 L800,560 L820,650 Z', c, { ink: '#3b0510' }));
  s.push(part('M440,720 L480,800 L520,730 Z', c, { ink: '#3b0510' }));
  // singing mouth with tiny teeth
  s.push(part('M290,540 C320,520 400,520 440,560 C420,640 340,660 290,620 Z', '#2a0410', { ink: '#000', inner: [300, 330, 360, 390].map(x => `<path d="M${x},${530 + (x - 300) * 0.1} l8,16 l8,-16 Z" fill="#fff"/>`).join('') + '<ellipse cx="360" cy="600" rx="30" ry="16" fill="#ff7a9a"/>' }));
  s.push(`<circle cx="420" cy="460" r="30" fill="#fff8fb" stroke="#000" stroke-width="5"/><circle cx="414" cy="466" r="14" fill="#111"/><circle cx="420" cy="458" r="5" fill="#fff"/>`);
  s.push(line('M390,420 L450,436', '#000', 7));
  s.push(P.blush(470, 520, 24, '#ff3d7f'));
  const front = notes([[200, 400, 1.0, '#fda4af', -14], [150, 520, 0.8, '#fb7185', 6]]) + sparkles([[860, 200, 16, '#fda4af'], [520, 140, 12, '#fda4af']]);
  return page({ accent: '#5c0a1f', glow: '#9b1c3e', figure: s.join('\n'), front, seed: 97 });
}

function acorn() {
  const fur = '#7a4a2c', bark = '#4a2f1f';
  const s = [];
  // tree trunk with hollow full of records
  s.push(part('M560,120 L860,120 L880,860 L540,860 Z', bark, { ink: '#1f130b', inner: '<path d="M600,200 C620,300 600,400 620,500 M820,240 C800,340 820,440 800,560" stroke="#2a1a10" stroke-width="8" fill="none"/>' }));
  s.push(oval(710, 440, 100, 140, '#1a0f08', { ink: '#2a1a10' }));
  for (let i = 0; i < 5; i++) s.push(`<rect x="${650 + i * 24}" y="${380 + (i % 2) * 6}" width="18" height="120" rx="3" fill="${['#f472b6', '#facc15', '#38bdf8', '#86efac', '#a78bfa'][i]}" stroke="#000" stroke-width="3"/>`);
  s.push(shadow(380, 180));
  // squirrel with big tail
  s.push(part('M300,760 C180,740 140,620 180,500 C210,420 290,400 330,440 C290,480 260,560 300,640 C320,680 340,720 300,760 Z', '#9a6240', { inner: '<path d="M200,520 C220,460 270,440 300,450" stroke="#c48a5e" stroke-width="10" fill="none"/>' }));
  s.push(oval(390, 660, 90, 110, fur, { inner: '<ellipse cx="400" cy="690" rx="50" ry="70" fill="#d9b48a"/>' }));
  s.push(oval(360, 780, 40, 20, fur), oval(440, 780, 40, 20, fur));
  s.push(limb(smooth([[440, 620], [520, 560], [600, 480]]), 26, fur));
  s.push(g(620, 460, 1, -20, P.disc(0, 0, 54, '#f97316')));
  s.push(ears('pointy', 390, 500, 92, fur, '#d9b48a'));
  s.push(head(390, 500, 92, 82, fur));
  s.push(oval(400, 530, 44, 30, '#d9b48a', { off: [-4, -4] }));
  s.push(nose(406, 516, 10));
  s.push(face(390, 490, { eyes: 'sad', mouth: 'flat', gap: 66, r: 12, mouthY: 52, mw: 12 }));
  const front = sparkles([[200, 260, 10, '#d9b48a'], [460, 180, 10, '#d9b48a']]) + P.cloud(260, 170, 0.5, '#6b7280', { ink: '#374151' }) + P.drops([[230, 230], [270, 250], [300, 226]], '#93c5fd');
  return page({ accent: '#4b2e1f', glow: '#8a5a3a', figure: s.join('\n'), front, seed: 98 });
}

export default {
  'the-minimalist-creator': cube, 'the-soft-collector': moss, 'the-niche-rebel': fang, 'the-shadow-follower': smoke,
  'the-revival-purist': brass, 'the-vintage-collector': lace, 'the-obscure-devotee': abyss, 'the-preservationist': acorn,
};
