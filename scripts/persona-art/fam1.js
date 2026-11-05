import { page } from './kit.js';
import * as P from './parts.js';
import goldie from './chars/goldie.js';
import volta from './chars/volta.js';
import basil from './chars/basil.js';
const { g, oval, circ, blob, face, nose, ears, head, paw, limb, line, hl, smooth, part, ell, dot, darken, lighten, star, sparkles, notes, shadow } = P;

function skye() {
  const fur = '#4cc9e0', cream = '#f2fbff', vest = '#fb7185';
  const s = [];
  // wave of album covers
  s.push(blob([[110, 830], [130, 660], [210, 520], [330, 430], [430, 440], [450, 520], [390, 540], [420, 600], [560, 650], [780, 700], [910, 780], [900, 840]], '#2f8fd8',
    { inner: `<path d="M180,620 C240,540 320,500 400,500" fill="none" stroke="#bae6fd" stroke-width="10" stroke-linecap="round" opacity="0.6"/><path d="M560,700 C660,720 760,740 860,790" fill="none" stroke="#bae6fd" stroke-width="10" stroke-linecap="round" opacity="0.5"/>` }));
  const covers = [[230, 520, -20, '#facc15'], [300, 456, -8, '#f472b6'], [380, 430, 10, '#a78bfa'], [168, 600, -30, '#86efac']];
  for (const [x, y, r, c] of covers) s.push(g(x, y, 1, r, part('M-34,-34 L34,-34 L34,34 L-34,34 Z', c, { off: [-6, -6], lw: 5, inner: `<circle cx="6" cy="4" r="14" fill="${lighten(c, 0.5)}"/>` })));
  // phone surfboard
  s.push(g(540, 726, 1, -10, part('M-190,-34 L190,-34 C210,-34 222,-22 222,0 C222,22 210,34 190,34 L-190,34 C-210,34 -222,22 -222,0 C-222,-22 -210,-34 -190,-34 Z', '#1f2937', { ink: '#0b0f17', inner: '<rect x="-196" y="-22" width="392" height="40" rx="14" fill="#22d3ee"/><rect x="-196" y="-22" width="130" height="40" rx="14" fill="#f472b6"/><rect x="-66" y="-22" width="130" height="40" fill="#facc15"/>' })));
  // tail
  s.push(limb(smooth([[600, 640], [680, 660], [740, 640]]), 46, fur));
  // legs
  s.push(limb(smooth([[480, 640], [470, 700]]), 48, fur), limb(smooth([[575, 640], [590, 696]]), 48, fur));
  // body + vest
  s.push(oval(530, 560, 100, 118, fur, { inner: `<ellipse cx="530" cy="590" rx="60" ry="80" fill="${cream}"/>` }));
  s.push(part('M440,480 C470,470 500,500 500,540 L500,640 C470,640 440,620 432,590 Z', vest, { off: [-8, -8] }), part('M620,480 C590,470 560,500 560,540 L560,640 C590,640 620,620 628,590 Z', vest, { off: [-8, -8] }));
  s.push(P.pin(470, 540, '#facc15', 16));
  // arms out, balancing
  s.push(limb(smooth([[450, 500], [380, 470], [320, 430]]), 40, fur), paw(314, 424, 24, fur));
  s.push(limb(smooth([[612, 500], [680, 450], [716, 380]]), 40, fur), paw(720, 370, 24, fur));
  // head
  s.push(ears('small', 530, 370, 120, fur));
  s.push(head(530, 370, 122, 106, fur));
  s.push(oval(530, 410, 74, 50, cream, { off: [-8, -6] }));
  s.push(nose(530, 392, 18));
  s.push(P.line('M470,420 L420,410 M470,430 L424,436 M590,420 L640,410 M590,430 L636,436', darken(fur, 0.4), 4));
  s.push(face(530, 350, { eyes: 'dot', mouth: 'grin', gap: 80, r: 17, mouthY: 70, mw: 22 }));
  s.push(P.earbud(410, 380, -1), P.earbud(650, 380, 1));
  const front = sparkles([[200, 360, 20, '#22d3ee'], [820, 300, 22, '#f472b6', 10], [770, 520, 16, '#facc15'], [600, 140, 18, '#22d3ee']])
    + P.drops([[150, 470], [450, 400], [860, 640]], '#7dd3fc');
  return page({ accent: '#22d3ee', figure: s.join('\n'), front, seed: 31 });
}

function nimbus() {
  const c = '#c7dcff';
  const s = [];
  s.push(shadow(470, 220));
  s.push(P.moon(440, 640, 2.4, '#fde68a'));
  // cloud body
  s.push(`<ellipse cx="560" cy="420" rx="230" ry="150" fill="#93c5fd" opacity="0.35" filter="url(#glow)"/>`);
  s.push(P.cloud(570, 410, 2.1, c, { ink: '#4f6fa8' }));
  s.push(P.headphones(570, 390, 228, '#ffffff', '#93c5fd'));
  s.push(face(570, 410, { eyes: 'shut', mouth: 'wobbly', gap: 110, r: 22, mouthY: 50, mw: 22, tear: true, brows: 'worried' }));
  // note rain
  s.push(notes([[470, 610, 0.7, '#93c5fd', 10], [580, 650, 0.8, '#bfdbfe', -6], [680, 600, 0.6, '#93c5fd', 4], [640, 740, 0.7, '#bfdbfe', 0]]));
  s.push(P.drops([[520, 690], [720, 680], [600, 560]], '#bfdbfe'));
  const front = sparkles([[190, 230, 16, '#bfdbfe'], [840, 220, 20, '#fde68a'], [860, 520, 14, '#bfdbfe'], [300, 140, 12, '#fde68a']]);
  return page({ accent: '#93c5fd', figure: s.join('\n'), front, seed: 32 });
}

function tweed() {
  const shell = '#ead7b0', skin = '#cfe3b4', brass = '#d4a72c';
  const s = [];
  s.push(shadow(520, 260));
  // gramophone horn growing out of the shell
  s.push(limb('M600,520 C640,440 660,400 680,370', 30, brass));
  s.push(part('M676,380 C660,320 650,250 690,170 C760,160 860,200 880,260 C820,290 760,330 676,380 Z', brass,
    { inner: '<path d="M700,190 C760,190 830,220 860,256" fill="none" stroke="#8a6a1c" stroke-width="6" opacity="0.6"/><path d="M690,260 C730,250 770,262 800,282" fill="none" stroke="#8a6a1c" stroke-width="5" opacity="0.5"/>' }));
  // legs
  for (const x of [380, 470, 590, 670]) s.push(oval(x, 760, 42, 52, skin, { off: [-6, -6] }));
  // shell
  s.push(part('M300,720 C300,520 420,430 540,430 C660,430 760,520 760,720 Z', shell, {
    inner: `<path d="M420,470 L460,560 L600,560 L640,470 M460,560 L420,660 M600,560 L640,660 M460,560 L530,620 L600,560 M530,620 L530,720 M330,620 L420,660 L640,660 L730,620" fill="none" stroke="${darken(shell, 0.55)}" stroke-width="6" stroke-linejoin="round"/>`,
  }));
  s.push(part('M290,712 L770,712 C770,744 740,756 700,756 L360,756 C320,756 290,744 290,712 Z', darken(shell, 0.85)));
  s.push(hl('M360,560 C390,500 440,470 490,460', 10, 0.5));
  // neck + head
  s.push(limb(smooth([[360, 640], [300, 560], [300, 480]]), 80, skin));
  s.push(head(300, 420, 100, 90, skin));
  s.push(face(300, 410, { eyes: 'shut', mouth: 'smile', gap: 70, r: 16, mouthY: 44, mw: 18 }));
  // flipper with teacup
  s.push(limb(smooth([[360, 610], [400, 560], [380, 500]]), 46, skin));
  s.push(P.teacup(380, 490, 0.9, '#f9fafb'));
  // tiny tweed scarf
  s.push(part('M230,470 C260,500 340,500 372,470 L380,500 C340,530 260,530 222,500 Z', '#a16207', { off: [-6, -6], inner: '<path d="M240,486 L360,486" stroke="#fde68a" stroke-width="4" stroke-dasharray="10 8"/>' }));
  const front = notes([[850, 160, 0.9, '#fde68a', 10], [930, 260, 0.7, '#f5e6c8', -8], [780, 110, 0.6, '#f5e6c8', 0]])
    + sparkles([[160, 260, 14, '#f5e6c8'], [200, 640, 12, '#fde68a']]);
  return page({ accent: '#f5e6c8', glow: '#d9b97a', figure: s.join('\n'), front, seed: 33 });
}

function rosso() {
  const fur = '#c2311f', white = '#fff4ea', dress = '#1f1220';
  const s = [];
  s.push(shadow(512, 220));
  // bushy tail
  s.push(part('M600,620 C720,600 800,520 800,420 C840,500 840,620 760,690 C700,740 620,720 600,620 Z', fur, { inner: '<path d="M800,420 C840,500 840,580 810,640 C790,600 790,520 800,420 Z" fill="#fff4ea"/>' }));
  // legs + shoes
  s.push(limb('M470,700 L450,810', 40, fur), limb('M550,700 L580,808', 40, fur));
  s.push(oval(446, 822, 36, 20, '#111018', { lw: 5 }), oval(586, 820, 36, 20, '#111018', { lw: 5 }));
  // ruffled flamenco skirt
  let d = 'M420,560 L604,560 C640,640 690,700 700,740';
  for (let i = 0; i < 7; i++) d += ` A${(700 - 320) / 14},22 0 0,1 ${700 - (i + 1) * (380 / 7)},740`;
  d += ' C330,700 380,640 420,560 Z';
  s.push(part(d, dress, { ink: '#000', inner: '<path d="M370,690 C440,710 580,710 660,690" fill="none" stroke="#c2311f" stroke-width="10"/>' }));
  // body
  s.push(oval(512, 520, 92, 96, fur, { inner: `<ellipse cx="512" cy="540" rx="52" ry="70" fill="${white}"/>` }));
  // arm on hip
  s.push(limb(smooth([[430, 480], [370, 540], [430, 580]]), 36, fur));
  // arm up with record fan
  s.push(limb(smooth([[590, 470], [650, 380], [680, 290]]), 36, fur));
  s.push(P.disc(720, 220, 100, '#7f1d1d'));
  s.push(line('M640,220 L800,220 M720,140 L720,300 M664,164 L776,276 M664,276 L776,164', '#ffffff', 2).replace('stroke="#ffffff"', 'stroke="#ffffff" stroke-opacity="0.15"'));
  s.push(paw(684, 284, 24, fur));
  // head
  s.push(ears('pointy', 500, 330, 120, fur, '#2a1218'));
  s.push(head(500, 330, 118, 102, fur));
  s.push(part('M392,350 C420,330 470,340 500,380 C530,340 580,330 608,350 C600,420 560,452 500,452 C440,452 400,420 392,350 Z', white, { off: [-6, -6] }));
  s.push(nose(500, 392, 16));
  s.push(face(500, 330, { eyes: 'lid', skin: fur, mouth: 'flat', gap: 92, r: 15, mouthY: 82, mw: 16 }));
  // rose in teeth
  s.push(line('M430,418 L560,404', '#15803d', 7), circ(420, 416, 26, '#e11d48', { inner: '<path d="M408,410 C416,400 430,404 428,416 C424,428 410,424 414,414" fill="none" stroke="#7f1d1d" stroke-width="4"/>' }));
  s.push(P.oval(470, 404, 16, 8, '#22c55e', { lw: 4 }, -20));
  const front = P.motion([[300, 300, 50, -2.6], [290, 360, 40, -3.0], [850, 120, 40, -0.6]], '#fca5a5')
    + sparkles([[230, 520, 16, '#fca5a5'], [880, 420, 18, '#fecaca'], [520, 120, 14, '#fecaca']]);
  return page({ accent: '#7f1d1d', glow: '#c2311f', figure: s.join('\n'), front, seed: 34 });
}

function sepia() {
  const fur = '#9a6b45', face_ = '#e8cfa8', card = '#d4a03a';
  const s = [];
  s.push(shadow(512, 210));
  // owl body
  s.push(part('M370,420 C370,300 440,240 512,240 C584,240 654,300 654,420 L660,640 C660,760 600,820 512,820 C424,820 364,760 364,640 Z', fur, { inner: '<path d="M440,560 c10,10 20,10 30,0 M520,600 c10,10 20,10 30,0 M470,660 c10,10 20,10 30,0" fill="none" stroke="#6b4423" stroke-width="5"/>' }));
  // tufts
  s.push(part('M400,290 L380,200 L450,262 Z', fur), part('M624,290 L644,200 L574,262 Z', fur));
  // cardigan
  s.push(part('M366,520 C400,500 450,520 470,560 L470,820 L420,812 C380,790 364,740 364,660 Z', card, { inner: '<path d="M380,560 L380,800 M400,560 L400,800 M420,560 L420,810 M440,560 L440,815" stroke="#a0731c" stroke-width="3" opacity="0.5"/>' }));
  s.push(part('M658,520 C624,500 574,520 554,560 L554,820 L604,812 C644,790 660,740 660,660 Z', card, { inner: '<path d="M640,560 L640,800 M620,560 L620,800 M600,560 L600,810 M580,560 L580,815" stroke="#a0731c" stroke-width="3" opacity="0.5"/>' }));
  // stack of 45s hugged
  const sl = ['#f472b6', '#38bdf8', '#facc15', '#a78bfa', '#fb923c'];
  sl.forEach((c, i) => s.push(g(512, 720 - i * 34, 1, (i % 2 ? 3 : -3), part('M-110,-16 L110,-16 L110,16 L-110,16 Z', c, { off: [-6, -6], lw: 5 }))));
  s.push(P.disc(512, 560, 90, '#7c5a3a', 26));
  // wings hugging
  s.push(part('M380,520 C330,600 340,700 420,740 C440,700 460,650 450,580 Z', darken(fur, 0.85)), part('M644,520 C694,600 684,700 604,740 C584,700 564,650 574,580 Z', darken(fur, 0.85)));
  // face disc + glasses
  s.push(oval(462, 360, 70, 66, face_, { off: [-6, -6] }), oval(562, 360, 70, 66, face_, { off: [-6, -6] }));
  s.push(face(512, 362, { eyes: 'dot', gap: 100, r: 15, mouth: 'none', blush: false }));
  for (const x of [462, 562]) s.push(`<circle cx="${x}" cy="362" r="50" fill="#ffffff" fill-opacity="0.55" stroke="#3b2418" stroke-width="7"/><path d="M${x - 30},350 C${x - 20},330 ${x},326 ${x + 16},330" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none"/>`);
  s.push(line('M512,356 L512,356', '#3b2418', 10), line('M498,350 C506,342 518,342 526,350', '#3b2418', 7));
  s.push(part('M496,404 L528,404 L512,434 Z', '#f59e0b', { lw: 4, off: [-3, -3] }));
  s.push(P.tear(600, 412, 0.9));
  const front = notes([[230, 330, 0.8, '#d6b48a', -10], [800, 280, 0.7, '#d6b48a', 8]]) + sparkles([[820, 520, 12, '#e8cfa8'], [200, 560, 12, '#e8cfa8']]);
  return page({ accent: '#7c5a3a', glow: '#b07a48', figure: s.join('\n'), front, seed: 35 });
}

export default {
  'the-trend-voyager': skye, 'the-chill-curator': basil, 'the-electric-escapist': volta, 'the-reflective-dreamer': nimbus,
  'the-golden-revivalist': goldie, 'the-vintage-enthusiast': tweed, 'the-restless-romantic': rosso, 'the-sentimental-archivist': sepia,
};
