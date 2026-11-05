import { page } from './kit.js';
import * as P from './parts.js';
import baron from './chars/baron.js';
const { g, oval, circ, blob, face, nose, ears, head, paw, limb, line, hl, smooth, part, ell, dot, darken, lighten, star, sparkles, notes, shadow } = P;

const pad = (x, y, rx, rot, art) => g(x, y, 1, rot,
  part(`M0,0 L${rx * 0.94},${-rx * 0.36 * 0.34} A${rx},${rx * 0.36} 0 1,0 ${rx * 0.94},${rx * 0.36 * 0.34} Z`, '#4ade80', { off: [-8, -8] })
  + part(`M${-rx * 0.38},${-rx * 0.22} L${rx * 0.3},${-rx * 0.22} L${rx * 0.3},${rx * 0.18} L${-rx * 0.38},${rx * 0.18} Z`, art, { lw: 5, off: [-5, -5], inner: `<circle cx="${-rx * 0.04}" cy="0" r="${rx * 0.11}" fill="${lighten(art, 0.5)}"/>` }));

function hopscotch() {
  const pink = '#f472b6', belly = '#fde2ef';
  const s = [];
  s.push(pad(250, 640, 130, -6, '#38bdf8'), pad(780, 560, 120, 8, '#facc15'), pad(520, 830, 120, 0, '#a78bfa'));
  // back legs stretched
  s.push(limb(smooth([[440, 470], [360, 520], [300, 560]]), 44, pink));
  s.push(part('M300,560 L240,540 L262,570 L232,598 L280,590 L300,620 Z', pink, { lw: 5, off: [-4, -4] }));
  s.push(limb(smooth([[470, 500], [420, 570], [380, 620]]), 40, pink));
  // body
  s.push(oval(530, 440, 140, 96, pink, { inner: `<ellipse cx="560" cy="480" rx="90" ry="50" fill="${belly}"/>` }, -18));
  // front arms reaching
  s.push(limb(smooth([[620, 440], [690, 400], [740, 360]]), 34, pink), paw(746, 352, 22, pink));
  // eye bumps + face
  s.push(circ(500, 330, 50, pink), circ(610, 300, 50, pink));
  s.push(P.eye(500, 326, 22), P.eye(610, 296, 22));
  s.push(line('M520,400 C560,440 640,420 664,370', '#4a0f2a', 7));
  s.push(P.blush(500, 400, 22), P.blush(668, 344, 22));
  s.push(P.earbud(440, 360, -1));
  const front = P.motion([[300, 400, 60, 3.4], [330, 450, 50, 3.3], [320, 350, 40, 3.5]], '#f9a8d4')
    + sparkles([[860, 260, 20, '#f472b6'], [160, 300, 18, '#facc15'], [700, 160, 16, '#22d3ee'], [880, 700, 14, '#f472b6']]);
  return page({ accent: '#ec4899', figure: s.join('\n'), front, seed: 41 });
}

function peach() {
  const fur = '#d79a6b', snout = '#b9784c';
  const s = [];
  s.push(`<ellipse cx="512" cy="780" rx="340" ry="90" fill="#7dd3fc" opacity="0.55"/><path d="M220,780 C300,760 360,800 440,780 M600,790 C680,770 740,800 800,780" fill="none" stroke="#e0f2fe" stroke-width="6" stroke-linecap="round"/>`);
  // record pool ring: back half, capybara body, front half
  const ringIn = '<ellipse cx="512" cy="700" rx="240" ry="80" fill="none" stroke="#fff" stroke-opacity="0.12" stroke-width="4"/>';
  s.push(part('M232,700 A280,96 0 0,1 792,700 L672,700 A160,50 0 0,0 352,700 Z', '#1f1b27', { ink: '#000', off: [0, 0], inner: ringIn }));
  s.push(oval(512, 640, 150, 120, fur));
  s.push(`<path d="M232,700 L232,720 A280,96 0 0,0 792,720 L792,700 Z" fill="#0b0910"/>`);
  s.push(part('M232,700 A280,96 0 0,0 792,700 L672,700 A160,50 0 0,1 352,700 Z', '#1f1b27', { ink: '#000', off: [0, 0], inner: ringIn }));
  s.push(`<path d="M352,700 A160,50 0 0,0 672,700" fill="none" stroke="#ffcba4" stroke-width="14"/>`);
  // arms resting on the ring
  s.push(limb('M400,620 L330,690', 40, fur), limb('M624,620 L694,690', 40, fur));
  // boxy capybara head
  s.push(part('M380,470 C380,360 430,300 512,300 C600,300 648,360 648,470 C648,540 600,570 512,570 C424,570 380,540 380,470 Z', fur));
  s.push(hl('M400,420 C408,370 440,334 480,322', 10, 0.45));
  s.push(circ(420, 320, 22, fur), circ(604, 320, 22, fur));
  s.push(oval(512, 500, 86, 56, snout, { off: [-6, -6] }));
  s.push(`<ellipse cx="482" cy="482" rx="10" ry="6" fill="#3b2418"/><ellipse cx="542" cy="482" rx="10" ry="6" fill="#3b2418"/>`);
  s.push(face(512, 410, { eyes: 'shut', mouth: 'smile', gap: 120, r: 18, mouthY: 108, mw: 18 }));
  // a peach on the head
  s.push(circ(512, 268, 46, '#ffb38a', { inner: '<path d="M512,226 C500,250 500,290 512,312" fill="none" stroke="#e8875a" stroke-width="5"/>' }));
  s.push(P.oval(540, 222, 24, 11, '#4ade80', { lw: 4 }, -25));
  s.push(P.earbud(640, 430, 1));
  const front = notes([[230, 360, 0.9, '#ffcba4', -10], [800, 300, 0.8, '#ffe4d1', 8], [740, 180, 0.6, '#ffcba4', 0]])
    + sparkles([[180, 560, 12, '#ffe4d1'], [880, 520, 14, '#ffcba4']]);
  return page({ accent: '#ffcba4', glow: '#f2a477', figure: s.join('\n'), front, seed: 42 });
}

function riot() {
  const fur = '#a3a8b4', dark = '#3b3f4a', hood = '#dc2626';
  const s = [];
  s.push(shadow(512, 250));
  // ring tail
  s.push(limb(smooth([[600, 520], [700, 470], [760, 380], [770, 300]]), 54, fur));
  for (const [x, y] of [[700, 470], [752, 396], [770, 320]]) s.push(dot(x, y, 22, dark));
  // cart
  s.push(line('M300,500 L250,440', '#9ca3af', 12));
  s.push(speakerStack());
  // raccoon
  s.push(oval(512, 500, 96, 104, hood, { inner: '<path d="M480,450 L544,450 L536,560 L488,560 Z" fill="#b91c1c"/>' }));
  s.push(limb(smooth([[440, 450], [380, 360], [370, 280]]), 36, fur), paw(370, 270, 24, fur));
  s.push(limb(smooth([[584, 450], [640, 360], [650, 280]]), 36, fur), paw(652, 270, 24, fur));
  s.push(ears('pointy', 512, 340, 120, fur, dark));
  s.push(head(512, 340, 118, 100, fur));
  s.push(part('M400,330 C430,300 480,310 512,340 C544,310 594,300 624,330 C620,370 590,390 560,384 C536,380 524,370 512,370 C500,370 488,380 464,384 C434,390 404,370 400,330 Z', dark, { off: [-4, -4] }));
  s.push(oval(512, 392, 50, 34, '#f1f2f4', { off: [-5, -5] }));
  s.push(nose(512, 374, 14));
  s.push(face(512, 340, { eyes: 'wide', mouth: 'grin', brows: 'angry', gap: 90, r: 14, mouthY: 66, mw: 20, blush: false }));
  s.push(cart());
  const front = P.motion([[220, 620, 60, 3.1], [230, 680, 50, 3.1], [250, 560, 40, 3.2]], '#fca5a5')
    + sparkles([[220, 260, 20, '#ef4444'], [820, 200, 22, '#facc15'], [860, 520, 16, '#ef4444']])
    + g(800, 120, 0.8, 0, P.cloud(0, 0, 0.8, '#6b7280', { ink: '#2a2a33' }) + `<path d="M-10,40 L-30,80 L-6,76 L-22,116" stroke="#facc15" stroke-width="8" fill="none" stroke-linejoin="round"/>`);
  return page({ accent: '#dc2626', figure: s.join('\n'), front, seed: 43 });
  function speakerStack() { return P.speaker(400, 570, 0.7, '#2a2433', -8) + P.speaker(620, 570, 0.7, '#2a2433', 8); }
  function cart() {
    let grid = '';
    for (let x = 330; x <= 690; x += 40) grid += `<line x1="${x}" y1="600" x2="${x + (x - 512) * 0.06}" y2="740" stroke="#6b7280" stroke-width="4"/>`;
    for (let y = 630; y <= 720; y += 30) grid += `<line x1="320" y1="${y}" x2="704" y2="${y}" stroke="#6b7280" stroke-width="4"/>`;
    return part('M300,590 L724,590 L696,750 L328,750 Z', '#d1d5db', { ink: '#4b5563', off: [-6, -6], inner: grid })
      + line('M340,750 L340,800 M680,750 L680,800', '#6b7280', 10) + circ(340, 808, 22, '#2a2433') + circ(680, 808, 22, '#2a2433');
  }
}

function shade() {
  const s = [];
  const stripes = ['#6a5acd', '#7c6ee6', '#3fb6c8', '#a78bfa', '#5b4bb7'];
  s.push(shadow(512, 260));
  // curled tail
  s.push(limb('M660,560 C760,560 800,620 780,680 C760,730 700,720 700,680 C700,650 730,650 740,670', 40, '#3fb6c8'));
  // body
  const body = 'M380,560 C380,470 460,430 560,440 C660,450 700,520 690,600 C680,660 600,690 520,690 C430,690 380,640 380,560 Z';
  s.push(part(body, stripes[0], { inner: stripes.map((c, i) => `<path d="M${380 + i * 70},430 C${400 + i * 70},520 ${380 + i * 70},620 ${400 + i * 70},700" stroke="${c}" stroke-width="44" fill="none"/>`).join('') }));
  // mixer
  s.push(part('M260,640 L760,640 L780,690 L240,690 Z', '#3b3646', { off: [-4, -4] }));
  s.push(part('M240,690 L780,690 L780,820 L240,820 Z', '#2a2433', {
    inner: [300, 360, 420].map(x => `<rect x="${x - 6}" y="710" width="12" height="80" rx="4" fill="#111"/><rect x="${x - 18}" y="${730 + (x % 7) * 6}" width="36" height="18" rx="4" fill="#a78bfa"/>`).join('')
      + `<rect x="540" y="770" width="160" height="12" rx="4" fill="#111"/><rect x="600" y="758" width="30" height="36" rx="5" fill="#3fb6c8"/>`
      + [560, 620, 680].map(x => `<circle cx="${x}" cy="725" r="14" fill="#6a5acd" stroke="#111" stroke-width="3"/>`).join(''),
  }));
  s.push(P.disc(300, 660, 90, '#6a5acd', 18), P.disc(720, 660, 90, '#3fb6c8', 18));
  // arm and chin on hand
  s.push(limb(smooth([[560, 600], [600, 640], [560, 560]]), 36, stripes[1]));
  // head with casque
  s.push(part('M420,420 C420,330 480,280 560,290 C640,300 680,360 670,430 C660,500 600,540 530,540 C460,540 420,490 420,420 Z', '#7c6ee6',
    { inner: '<path d="M440,360 C480,300 560,280 620,300" stroke="#3fb6c8" stroke-width="30" fill="none"/>' }));
  s.push(part('M470,300 C500,230 580,220 620,270 C580,270 520,280 470,300 Z', '#5b4bb7'));
  // turret eye
  s.push(circ(600, 400, 46, '#a78bfa', { inner: '<circle cx="606" cy="404" r="16" fill="#24142e"/><circle cx="600" cy="398" r="5" fill="#fff"/>' }));
  s.push(`<path d="M552,392 C570,380 630,380 648,392 L648,372 L552,372 Z" fill="#a78bfa"/>`, line('M556,392 C580,384 620,384 646,392', '#24142e', 6));
  s.push(line('M470,480 C500,490 540,490 570,480', '#24142e', 6));
  s.push(P.headphones(540, 520, 120, '#2a2433', '#a78bfa').replace(/C[^"]*?(?=")/, m => m));
  const front = notes([[200, 360, 0.8, '#a78bfa', -10], [830, 300, 0.8, '#3fb6c8', 8]]) + sparkles([[860, 480, 14, '#a78bfa'], [180, 520, 12, '#3fb6c8']]);
  return page({ accent: '#6a5acd', figure: s.join('\n'), front, seed: 44 });
}

function rusty() {
  const fur = '#d9772f', light = '#f2c08a';
  const s = [];
  s.push(shadow(512, 240));
  // legs on skates
  s.push(limb(smooth([[460, 640], [420, 720], [400, 770]]), 40, fur), limb(smooth([[580, 640], [610, 720], [640, 760]]), 40, fur));
  for (const [x, y, r] of [[396, 790, -6], [646, 780, 10]]) s.push(g(x, y, 1, r, part('M-40,-40 L20,-40 C40,-40 56,-20 56,0 L56,10 L-40,10 Z', '#fff7ed', { lw: 5, off: [-5, -5] }) + circ(-24, 26, 14, '#22d3ee') + circ(36, 26, 14, '#f472b6')));
  // body with hump and boombox
  s.push(part('M380,600 C380,520 430,480 470,470 C490,400 580,400 600,470 C650,480 680,540 670,610 C660,680 600,700 520,700 C430,700 380,670 380,600 Z', fur, { inner: `<ellipse cx="530" cy="630" rx="80" ry="50" fill="${light}"/>` }));
  s.push(P.boombox(540, 390, 0.7, '#facc15', 6));
  s.push(line('M440,440 C470,500 600,500 640,440', '#7c2d12', 8));
  // neck + head
  s.push(limb(smooth([[420, 560], [370, 470], [360, 380]]), 64, fur));
  s.push(part('M290,330 C290,270 340,240 390,250 C440,260 460,300 450,340 C440,380 420,400 380,410 C330,420 290,390 290,330 Z', fur));
  s.push(oval(320, 380, 46, 32, light, { off: [-5, -5] }));
  s.push(`<ellipse cx="304" cy="374" rx="6" ry="4" fill="#3b2418"/><ellipse cx="330" cy="370" rx="6" ry="4" fill="#3b2418"/>`);
  s.push(oval(430, 250, 14, 26, fur, {}, 20));
  s.push(face(370, 320, { eyes: 'dot', mouth: 'smile', gap: 56, r: 13, mouthY: 72, mw: 16 }));
  // arms skating
  s.push(limb(smooth([[440, 560], [380, 600], [330, 580]]), 30, fur), limb(smooth([[640, 560], [700, 520], [740, 470]]), 30, fur));
  const front = P.motion([[180, 700, 60, 3.14], [190, 750, 50, 3.14], [210, 650, 40, 3.14]], '#fdba74')
    + notes([[700, 240, 0.8, '#fdba74', 10], [800, 340, 0.7, '#fde68a', -5]]) + sparkles([[200, 300, 18, '#fdba74'], [860, 600, 16, '#facc15']]);
  return page({ accent: '#c2410c', glow: '#e46a2a', figure: s.join('\n'), front, seed: 45 });
}

function honey() {
  const fur = '#d9bf95', wood = '#9a5b34';
  const s = [];
  s.push(shadow(512, 250));
  // rocking chair
  s.push(part('M330,260 C330,220 380,200 512,200 C644,200 694,220 694,260 L680,560 L344,560 Z', wood, { inner: [380, 440, 512, 584, 644].map(x => `<line x1="${x}" y1="230" x2="${x}" y2="540" stroke="#6b3a1f" stroke-width="6"/>`).join('') }));
  s.push(line('M270,820 C380,860 640,860 760,820', '#6b3a1f', 28), line('M270,820 C380,860 640,860 760,820', wood, 16));
  s.push(line('M350,640 L340,830 M674,640 L684,830', wood, 22));
  s.push(part('M300,600 L724,600 L724,650 L300,650 Z', wood));
  // bear body
  s.push(oval(512, 540, 140, 120, fur, { inner: '<ellipse cx="512" cy="560" rx="90" ry="80" fill="#f2e3c6"/>' }));
  s.push(limb('M440,640 L410,720', 50, fur), limb('M584,640 L614,720', 50, fur));
  s.push(oval(404, 736, 34, 24, '#c9a978'), oval(620, 736, 34, 24, '#c9a978'));
  // radio in lap with paws
  s.push(P.radio(512, 600, 0.75, '#e07a5f'));
  s.push(paw(420, 600, 28, fur), paw(604, 600, 28, fur));
  // head
  s.push(ears('round', 512, 340, 130, fur, '#f2c9a0'));
  s.push(head(512, 340, 130, 112, fur));
  s.push(oval(512, 390, 56, 40, '#f2e3c6', { off: [-6, -6] }));
  s.push(nose(512, 374, 18));
  s.push(face(512, 330, { eyes: 'shut', mouth: 'smile', gap: 96, r: 16, mouthY: 72, mw: 18 }));
  // knitted blanket
  s.push(part('M360,640 L664,640 L640,700 L380,700 Z', '#f59e0b', { inner: '<path d="M380,660 L650,660 M384,680 L644,680" stroke="#fde68a" stroke-width="6" stroke-dasharray="14 10"/>' }));
  const front = notes([[230, 300, 0.9, '#f2d8a7', -10], [800, 260, 0.8, '#f2d8a7', 8], [850, 420, 0.6, '#e0c9a6', 0]]) + sparkles([[200, 520, 12, '#f2d8a7'], [840, 560, 12, '#f2d8a7']]);
  return page({ accent: '#e0c9a6', glow: '#c9a46a', figure: s.join('\n'), front, seed: 46 });
}

function mist() {
  const body = '#b8bec8', wing = '#d6dae1';
  const s = [];
  s.push(shadow(512, 160));
  // wings: faded cassette labels
  const w = (dx, dy, sx, sy, rot) => g(512 + dx, 440 + dy, 1, rot, part(`M0,0 C${sx * 60},${sy * 160} ${sx * 220},${sy * 200} ${sx * 260},${sy * 110} C${sx * 280},${sy * 40} ${sx * 160},${sy * -20} 0,0 Z`, wing, {
    inner: `<path d="M${sx * 60},${sy * 60} L${sx * 220},${sy * 100}" stroke="#a5b4fc" stroke-width="14" opacity="0.5"/><path d="M${sx * 70},${sy * 96} L${sx * 200},${sy * 130}" stroke="#fca5a5" stroke-width="8" opacity="0.4"/><circle cx="${sx * 150}" cy="${sy * 80}" r="16" fill="none" stroke="#6b7280" stroke-width="5"/><circle cx="${sx * 210}" cy="${sy * 96}" r="16" fill="none" stroke="#6b7280" stroke-width="5"/>`,
  }));
  s.push(w(0, 0, -1, -1, 10), w(0, 0, 1, -1, -10), w(0, 30, -0.8, 0.8, 0), w(0, 30, 0.8, 0.8, 0));
  // fuzzy body
  s.push(oval(512, 520, 70, 140, body, { inner: '<path d="M450,520 L574,520 M452,560 L572,560 M460,600 L564,600" stroke="#8b929e" stroke-width="6"/>' }));
  // arm holding lantern
  s.push(limb(smooth([[560, 480], [640, 540], [660, 600]]), 22, body));
  s.push(P.lantern(670, 690, 0.95, '#ffd27a'));
  // head
  s.push(line('M480,330 C460,260 420,230 390,220 M544,330 C564,260 604,230 634,220', '#6b7280', 7));
  s.push(P.line('M420,236 l-14,-20 M440,256 l-18,-14 M604,236 l14,-20 M584,256 l18,-14', '#6b7280', 5));
  s.push(head(512, 370, 86, 76, '#e3e6ea'));
  s.push(face(512, 370, { eyes: 'shut', mouth: 'frown', gap: 64, r: 14, mouthY: 40, mw: 14, brows: 'worried' }));
  const front = sparkles([[200, 260, 14, '#e5e7eb'], [820, 200, 12, '#e5e7eb'], [860, 420, 10, '#fde68a'], [170, 560, 10, '#e5e7eb']])
    + notes([[260, 680, 0.6, '#d1d5db', -10]]);
  return page({ accent: '#9ca3af', glow: '#7c8597', figure: s.join('\n'), front, seed: 47 });
}

export default {
  'the-playlist-hopper': hopscotch, 'the-easy-explorer': peach, 'the-chaos-seeker': riot, 'the-moody-mixer': shade,
  'the-retro-nomad': rusty, 'the-gentle-nostalgic': honey, 'the-haunted-dj': baron, 'the-fading-wanderer': mist,
};
