import { page } from './kit.js';
import * as P from './parts.js';
const { g, oval, circ, blob, face, nose, ears, head, paw, limb, line, hl, smooth, part, ell, dot, darken, lighten, star, sparkles, notes, shadow } = P;

const turntable = (x, y, s = 1, label = '#f472b6') => g(x, y, s, 0,
  part('M-150,-30 L150,-30 L170,10 L-170,10 Z', '#4a3a40', { off: [-4, -4] })
  + part('M-170,10 L170,10 L170,90 L-170,90 Z', '#a0673f', { inner: '<circle cx="120" cy="50" r="12" fill="#d0213f"/><circle cx="84" cy="50" r="12" fill="#c9a227"/>' })
  + P.disc(-30, -12, 100, label, 20) + line('M110,-14 L40,-20', '#d8d8e0', 7) + dot(116, -14, 14, '#b08d57', 'stroke="#5a4020" stroke-width="4"'));

function glitter() {
  const pink = '#f472b6';
  const s = [];
  s.push(shadow(512, 180));
  // legs (one up, cheering kick)
  s.push(line('M500,640 L500,820', '#be185d', 16), line('M500,640 L500,820', pink, 8));
  s.push(line('M530,640 L600,700 L560,740', '#be185d', 16), line('M530,640 L600,700 L560,740', pink, 8));
  s.push(oval(500, 826, 36, 14, pink, { lw: 4 }));
  // homemade banner held by wing
  s.push(line('M150,330 L170,560 M400,300 L410,520', '#8a6a3a', 8));
  s.push(part('M130,320 L420,290 L428,390 L140,420 Z', '#fff7e0', { lw: 5, inner: '<text x="280" y="372" font-family="Comic Sans MS, cursive" font-size="50" font-weight="700" fill="#ec4899" text-anchor="middle" transform="rotate(-6 280 372)">ENCORE!</text>' }));
  // body
  s.push(oval(512, 580, 120, 90, pink, { inner: '<path d="M440,560 C480,600 560,610 600,580" stroke="#fbcfe8" stroke-width="8" fill="none"/>' }));
  s.push(part('M620,560 C680,540 720,560 740,600 C700,600 660,600 620,600 Z', '#ec4899'));
  // long neck + head
  s.push(limb('M430,540 C380,470 400,380 460,320', 40, pink));
  s.push(head(500, 280, 74, 66, pink));
  s.push(part('M548,282 C590,280 620,300 630,340 C610,330 580,320 550,312 Z', '#fff1f2', { lw: 5, inner: '<path d="M596,300 C612,310 624,324 630,340 C616,334 604,326 596,318 Z" fill="#1f2937"/>' }));
  s.push(face(490, 270, { eyes: 'happy', mouth: 'none', gap: 46, r: 12 }));
  // wing with lightstick
  s.push(limb(smooth([[600, 540], [700, 470], [760, 380]]), 34, pink));
  s.push(P.lightstick(780, 330, 0.9, 15, '#22d3ee'));
  const front = sparkles([[180, 240, 22, '#f472b6'], [850, 200, 20, '#facc15'], [880, 560, 16, '#22d3ee'], [160, 620, 14, '#f472b6']]) + P.motion([[820, 220, 40, -1.0], [860, 270, 40, -0.6]], '#a5f3fc');
  return page({ accent: '#ec4899', figure: s.join('\n'), front, seed: 71 });
}

function mochi() {
  const fur = '#fda4af', belly = '#fff1f2';
  const s = [];
  // sofa
  s.push(part('M220,520 C220,470 260,450 300,450 L724,450 C764,450 804,470 804,520 L804,640 L220,640 Z', '#a78bfa', { inner: '<path d="M512,460 L512,630" stroke="#7c3aed" stroke-width="6" opacity="0.5"/>' }));
  s.push(part('M180,600 C180,560 220,550 250,560 L270,800 L200,800 C190,800 180,790 180,780 Z', '#8b5cf6'), part('M844,600 C844,560 804,550 774,560 L754,800 L824,800 C834,800 844,790 844,780 Z', '#8b5cf6'));
  s.push(part('M240,640 L784,640 L784,780 L240,780 Z', '#8b5cf6'));
  s.push(line('M250,790 L250,830 M774,790 L774,830', '#4c1d95', 14));
  // hamster
  s.push(oval(512, 600, 140, 120, fur, { inner: `<ellipse cx="512" cy="630" rx="90" ry="80" fill="${belly}"/>` }));
  s.push(ears('round', 512, 450, 130, fur, '#fecdd3'));
  s.push(head(512, 450, 130, 106, fur));
  s.push(oval(512, 488, 60, 40, belly, { off: [-5, -5] }));
  s.push(nose(512, 470, 12, '#be185d'));
  s.push(face(512, 440, { eyes: 'dot', mouth: 'smile', gap: 100, r: 15, mouthY: 52, mw: 14 }));
  s.push(P.earbud(390, 450, -1), P.earbud(634, 450, 1));
  // top 10 list
  s.push(g(512, 640, 1, -4, part('M-80,-90 L80,-90 L80,90 L-80,90 Z', '#fffbe8', { lw: 5, inner: '<text x="-62" y="-58" font-family="Comic Sans MS, cursive" font-size="24" font-weight="700" fill="#be185d">TOP 10</text>' + [1, 2, 3, 4, 5].map(i => `<text x="-62" y="${-58 + i * 26}" font-family="Comic Sans MS, cursive" font-size="18" fill="#6b7280">${i}.</text><line x1="-36" y1="${-62 + i * 26}" x2="${40 - (i % 3) * 14}" y2="${-62 + i * 26}" stroke="#9ca3af" stroke-width="4"/>`).join('') + '<path d="M28,-56 l8,10 l18,-20" stroke="#16a34a" stroke-width="5" fill="none"/>' })));
  s.push(paw(420, 650, 26, fur), paw(604, 650, 26, fur));
  const front = notes([[230, 300, 0.8, '#fecdd3', -10], [800, 290, 0.8, '#fecdd3', 8]]) + sparkles([[860, 180, 14, '#fda4af'], [170, 200, 12, '#fecdd3']]);
  return page({ accent: '#fda4af', glow: '#f07892', figure: s.join('\n'), front, seed: 72 });
}

function velvet() {
  const r = '#d6336c', belly = '#ffd1dc';
  const s = [];
  s.push(shadow(512, 210));
  // tail
  s.push(limb(smooth([[600, 700], [700, 740], [780, 700]]), 40, r), part('M780,700 L820,660 L800,720 Z', '#9d174d'));
  // wings
  s.push(part('M420,520 L280,400 L300,460 L250,470 L300,520 L280,560 Z', '#9d174d'), part('M604,520 L744,400 L724,460 L774,470 L724,520 L744,560 Z', '#9d174d'));
  s.push(limb('M460,700 L450,790', 46, r), limb('M564,700 L574,790', 46, r));
  s.push(oval(512, 620, 116, 120, r, { inner: `<ellipse cx="512" cy="640" rx="66" ry="90" fill="${belly}"/>` + [600, 630, 660, 690].map(y => `<line x1="460" y1="${y}" x2="564" y2="${y}" stroke="#f9a8d4" stroke-width="5"/>`).join('') }));
  // mic arm
  s.push(limb(smooth([[440, 560], [380, 520], [390, 440]]), 34, r));
  s.push(P.mic(380, 410, 0.8, -20));
  // head
  s.push(part('M450,250 L430,180 L480,236 Z', '#fde68a', { lw: 5 }), part('M574,250 L594,180 L544,236 Z', '#fde68a', { lw: 5 }));
  s.push(head(512, 360, 118, 104, r));
  s.push(face(512, 340, { eyes: 'shut', mouth: 'yell', brows: 'worried', gap: 90, r: 16, mouthY: 64, mw: 22, tear: true }));
  // heartbreak flame
  s.push(`<path d="M512,450 C470,470 450,520 480,540" stroke="none" fill="none"/>`);
  s.push(part('M560,410 C620,380 680,330 700,260 C720,320 760,300 760,240 C800,300 790,380 730,420 C680,450 610,440 560,410 Z', '#fb923c', { ink: '#c2410c', inner: '<path d="M620,410 C670,390 720,350 740,300" stroke="#fde68a" stroke-width="12" fill="none"/>' }));
  s.push(g(720, 330, 1, 0, '<path d="M0,-14 C-10,-28 -30,-20 -24,-4 C-20,8 0,20 0,20 C0,20 20,8 24,-4 C30,-20 10,-28 0,-14 Z" fill="#e11d48" stroke="#7f1d1d" stroke-width="4"/><path d="M-4,-14 L4,0 L-4,8" stroke="#fff" stroke-width="3" fill="none"/>'));
  const front = sparkles([[200, 240, 20, '#f472b6'], [860, 520, 16, '#fb923c'], [160, 600, 14, '#f472b6']]) + P.motion([[260, 360, 40, -2.6], [270, 420, 40, -3.0]], '#fbcfe8');
  return page({ accent: '#d6336c', figure: s.join('\n'), front, seed: 73 });
}

function mauve() {
  const c = '#6d5a8c', hood = '#8b78a8';
  const s = [];
  // bed + blanket
  s.push(part('M200,680 L824,680 L824,820 L200,820 Z', '#3b2f52', { inner: '<rect x="200" y="680" width="624" height="30" fill="#4c3d6b"/>' }));
  s.push(oval(300, 640, 120, 50, '#e9e3f5', { off: [-6, -6] }));
  // crow in hoodie
  s.push(oval(512, 560, 150, 150, hood, { inner: '<path d="M440,600 L584,600" stroke="#6d5a8c" stroke-width="6"/><path d="M470,640 L554,640 L554,690 L470,690 Z" fill="#7a679a"/>' }));
  s.push(part('M200,640 C300,610 700,610 824,640 L824,720 L200,720 Z', '#5b4a7a', { inner: '<path d="M240,660 L800,660 M260,690 L780,690" stroke="#7a679a" stroke-width="6" stroke-dasharray="16 12"/>' }));
  // phone glow
  s.push(`<ellipse cx="512" cy="460" rx="160" ry="120" fill="#a5b4fc" opacity="0.4" filter="url(#glow)"/>`);
  s.push(P.phone(520, 560, -10, '#c7d2fe', 0.8));
  s.push(paw(470, 590, 22, '#3a3050'), paw(570, 580, 22, '#3a3050'));
  // hood up + head
  s.push(oval(512, 410, 140, 126, hood));
  s.push(head(512, 420, 104, 94, '#3a3050', { ink: '#1a1426' }));
  s.push(part('M500,440 L560,456 L500,470 Z', '#6b7280', { lw: 4, off: [-3, -3] }));
  s.push(face(500, 410, { eyes: 'lid', skin: '#3a3050', mouth: 'none', gap: 64, r: 13, ink: '#0b0812' }));
  s.push(P.earbud(420, 430, -1));
  s.push(line('M460,486 L476,520 M548,486 L540,520', '#e9e3f5', 5));
  const front = P.moon(820, 180, 0.7, '#e9e3f5') + sparkles([[200, 220, 12, '#c7d2fe'], [740, 300, 10, '#c7d2fe']]) + notes([[230, 420, 0.7, '#a5b4fc', -10]]);
  return page({ accent: '#6d5a8c', glow: '#8a74b8', figure: s.join('\n'), front, seed: 74 });
}

function sunny() {
  const y = '#facc15';
  const s = [];
  s.push(P.jukebox(700, 620, 1.05, '#c81d3f'));
  s.push(shadow(400, 180));
  s.push(line('M360,680 L330,800', '#f97316', 12), line('M430,680 L470,780 L500,790', '#f97316', 12));
  s.push(part('M300,800 L360,800 L350,816 L300,816 Z', '#f97316', { lw: 4 }));
  s.push(oval(400, 560, 130, 140, y, { inner: '<ellipse cx="390" cy="600" rx="80" ry="80" fill="#fef9c3"/>' }));
  s.push(part('M290,540 C230,500 210,440 220,400 C260,440 290,480 310,500 Z', y), part('M510,540 C570,500 600,450 600,400 C560,440 520,470 490,500 Z', y));
  // pompadour
  s.push(part('M330,400 C320,330 380,290 450,300 C500,310 520,350 500,380 C470,360 420,360 390,380 Z', '#1f2937', { ink: '#000', inner: '<path d="M350,360 C380,320 440,310 480,330" stroke="#6b7280" stroke-width="6" fill="none"/>' }));
  s.push(face(400, 470, { eyes: 'happy', mouth: 'none', gap: 80, r: 16 }));
  s.push(part('M380,500 L430,512 L380,528 Z', '#f97316', { lw: 4, off: [-3, -3] }));
  const front = notes([[600, 300, 0.9, '#fde68a', 10], [180, 280, 0.8, '#facc15', -10]]) + sparkles([[200, 520, 16, '#facc15'], [880, 300, 18, '#f472b6'], [520, 160, 14, '#22d3ee']])
    + P.motion([[230, 620, 40, 3.1], [240, 660, 30, 3.1]], '#fde68a');
  return page({ accent: '#facc15', figure: s.join('\n'), front, seed: 75 });
}

function biscuit() {
  const fur = '#f0dcb8', mask = '#5a4636';
  const s = [];
  s.push(turntable(680, 660, 0.85, '#e8d5b7'));
  // the same three records
  for (let i = 0; i < 3; i++) s.push(g(820 - i * 16, 780 - i * 6, 1, -6 + i * 6, part('M-50,-50 L50,-50 L50,50 L-50,50 Z', ['#facc15', '#f472b6', '#38bdf8'][i], { lw: 5, inner: `<circle cx="0" cy="0" r="18" fill="#fff" opacity="0.6"/>` })));
  s.push(shadow(380, 200));
  // curled pug
  s.push(oval(380, 720, 180, 96, fur, { inner: '<path d="M260,720 C300,690 340,690 380,700" stroke="#d9c39a" stroke-width="6" fill="none"/>' }));
  s.push(limb(smooth([[530, 700], [560, 650], [520, 640]]), 30, fur));
  s.push(paw(300, 790, 26, fur), paw(380, 800, 26, fur));
  s.push(floppy());
  s.push(head(360, 610, 120, 100, fur));
  s.push(oval(360, 650, 70, 50, mask, { off: [-6, -6] }));
  s.push(nose(360, 630, 16, '#1a1410'));
  s.push(line('M330,600 C340,590 380,590 390,600 M320,580 C340,570 380,570 400,580', '#c9ad84', 5));
  s.push(face(360, 610, { eyes: 'shut', mouth: 'smile', gap: 96, r: 16, mouthY: 52, mw: 14 }));
  const front = notes([[620, 360, 0.8, '#f5e6c8', 10], [720, 300, 0.7, '#f5e6c8', -6]]) + sparkles([[180, 300, 12, '#f5e6c8'], [860, 250, 14, '#f5e6c8']]);
  return page({ accent: '#e8d5b7', glow: '#c4a46e', figure: s.join('\n'), front, seed: 76 });
  function floppy() { return oval(250, 600, 36, 54, mask, {}, 30) + oval(470, 600, 36, 54, mask, {}, -30); }
}

function diva() {
  const sw = '#8b1a3e';
  const s = [];
  s.push(`<path d="M380,0 L640,0 L760,860 L260,860 Z" fill="#fde68a" opacity="0.13"/>`);
  s.push(shadow(512, 200));
  // cape
  s.push(part('M450,500 C390,620 350,720 330,820 L694,820 C674,720 634,620 574,500 Z', '#1f1220', { ink: '#000', inner: '<path d="M334,800 L690,800" stroke="#c9a227" stroke-width="10"/>' }));
  // swan body
  s.push(oval(512, 600, 140, 110, sw, { inner: '<path d="M420,620 C470,660 560,660 610,620" stroke="#c4577a" stroke-width="8" fill="none"/>' }));
  s.push(part('M620,560 C720,440 760,360 740,280 C700,360 640,440 590,520 Z', sw, { inner: '<path d="M620,520 L720,330 M640,540 L740,360" stroke="#c4577a" stroke-width="5" opacity="0.6"/>' }));
  s.push(limb('M450,530 C400,460 400,380 460,320', 44, sw));
  s.push(head(500, 290, 70, 62, sw));
  s.push(part('M548,290 L620,312 L548,320 Z', '#f59e0b', { lw: 4, off: [-3, -3], inner: '<path d="M548,290 L560,294 L560,318 L548,320 Z" fill="#111"/>' }));
  s.push(face(500, 284, { eyes: 'lid', skin: sw, mouth: 'none', gap: 46, r: 11 }));
  // tiny crown
  s.push(part('M470,230 L476,200 L490,220 L500,196 L510,220 L524,200 L530,230 Z', '#facc15', { lw: 4, off: [-2, -2] }));
  const front = notes([[230, 340, 1.0, '#fda4af', -10], [800, 160, 0.8, '#fde68a', 8], [860, 420, 0.7, '#fda4af', 0]]) + sparkles([[200, 560, 14, '#fde68a'], [520, 120, 16, '#fde68a']]) + P.drops([[560, 330]], '#9be7ff');
  return page({ accent: '#5c1027', glow: '#a3214a', figure: s.join('\n'), front, seed: 77 });
}

function droop() {
  const fur = '#a8865a', ear = '#6b4f2e';
  const s = [];
  // rainy window
  s.push(part('M600,140 L880,140 L880,460 L600,460 Z', '#1e293b', { ink: '#6b4423', lw: 10, inner: '<line x1="740" y1="140" x2="740" y2="460" stroke="#6b4423" stroke-width="10"/><line x1="600" y1="300" x2="880" y2="300" stroke="#6b4423" stroke-width="10"/>' + P.drops([[640, 180], [700, 240], [780, 200], [830, 330], [660, 360], [800, 400]], '#93c5fd') }));
  s.push(turntable(680, 720, 0.8, '#8b6f47'));
  s.push(shadow(360, 200));
  // basset hound lying
  s.push(oval(360, 740, 190, 80, fur, { inner: '<ellipse cx="360" cy="770" rx="140" ry="40" fill="#e9d8b8"/>' }));
  s.push(paw(220, 800, 30, fur), paw(300, 806, 30, fur));
  s.push(head(300, 610, 110, 96, fur));
  s.push(oval(300, 670, 66, 44, '#e9d8b8', { off: [-5, -5] }));
  s.push(nose(300, 650, 18));
  s.push(face(300, 610, { eyes: 'sad', mouth: 'frown', gap: 84, r: 14, mouthY: 70, mw: 16 }));
  s.push(oval(190, 680, 40, 110, ear, {}, 14), oval(410, 680, 40, 110, ear, {}, -14));
  const front = notes([[560, 360, 0.7, '#c9ad84', -10]]) + sparkles([[180, 300, 10, '#c9ad84']]);
  return page({ accent: '#8b6f47', glow: '#a07c4c', figure: s.join('\n'), front, seed: 78 });
}

export default {
  'the-pop-loyalist': glitter, 'the-chart-regular': mochi, 'the-modern-melancholic': velvet, 'the-brooding-fan': mauve,
  'the-classic-loyalist': sunny, 'the-vintage-devotee': biscuit, 'the-dramatic-traditionalist': diva, 'the-melancholy-purist': droop,
};
