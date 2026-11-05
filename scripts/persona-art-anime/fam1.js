import * as L from './lib.js';
import basil from './chars/basil.js';
import volta from './chars/volta.js';
import goldie from './chars/goldie.js';
const { theme, page, part, cast, line, fill, glow, eye, sparkle, tuft, smooth, ell, g, darken, lighten, mix, rng, motes, bokeh, rain, rays, head, bust, neckCast, circ } = L;

export default {
  // Skye: sea otter riding a night wave of album covers, phone up, band pin on the life vest
  'the-trend-voyager': () => {
    theme({ key: [30, -24], shadow: '#1d2a5c', rim: '#f0abfc', rimW: 7, ink: '#121a36', deep: 0.5 });
    const bg = [L.sky('#0b1d4a', '#0a0f24'), L.stars(2, 80), L.moon(200, 170, 54, '#f0f9ff', '#93c5fd')];
    bg.push(L.skyline(4, 600, '#0a1230', ['#f472b6', '#22d3ee', '#fde68a'], [40, 160]));
    bg.push(glow(512, 600, 400, '#22d3ee', 0.25));
    bg.push(L.water(5, 600, '#0b2350', ['#22d3ee', '#f472b6', '#a5f3fc'], 50));
    // big wave curling behind, studded with album covers
    bg.push(part('M-40,1024 C-20,760 120,560 320,500 C470,456 620,480 700,560 C640,540 560,560 540,620 C600,600 660,640 680,700 L1100,1024 Z', '#155e75', { rimC: '#a5f3fc', rimW: 8, sh: 'M-40,700 C200,700 400,820 600,1024 L-40,1024 Z', inner: (() => { const R = rng(9), s = []; for (let i = 0; i < 16; i++) { const x = 40 + R() * 640, y = 540 + R() * 420, c = ['#f472b6', '#fde68a', '#a78bfa', '#fb923c', '#22d3ee'][i % 5]; s.push(`<g transform="rotate(${(R() * 50 - 25).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"><rect x="${(x - 34).toFixed(0)}" y="${(y - 34).toFixed(0)}" width="68" height="68" fill="${c}" opacity="0.85"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="20" fill="${darken(c, 0.5)}" opacity="0.8"/></g>`); } return s.join(''); })() }));
    bg.push(L.motes(3, 40, '#e0f2fe', [0, 450, 1024, 1024], [1.5, 4]));
    const fur = '#7b5434', face = '#ecd6b6';
    const f = [];
    f.push(bust({ f: 1, kind: 'vest', c: '#1e293b', vest: '#f97316', neck: fur, pins: [[700, 820, '#22d3ee'], [740, 880, '#f472b6']] }));
    f.push(neckCast());
    f.push(head({ x: 500, y: 410, f: 1, fur, muzzle: 'short', muzzleC: face, ears: { type: 'tiny', size: 1 }, iris: '#22d3ee', mood: 'bright', whiskers: true, cran: [1.04, 0.96], face: part(smooth([[20, -60], [150, -50], [176, 40], [120, 130], [0, 150], [-60, 80]], true), face, { rim: false, lw: 2.4 }) }));
    // phone held up, lighting the face from below
    f.push(part('M700,1024 C700,900 720,800 760,760 C790,730 830,740 836,780 C842,840 820,940 800,1024 Z', fur));
    f.push(L.phone(790, 680, 14, '#67e8f9', 1.05));
    f.push(glow(640, 560, 160, '#67e8f9', 0.25));
    return page({ bg: bg.join('\n'), figure: f.join('\n'), grade: { top: '#2563eb', bottom: '#0b1024', vignette: 0.75 }, bloom: 0.5 });
  },
  'the-chill-curator': basil,
  'the-electric-escapist': volta,
  // Nimbus: a little cloud in headphones resting on the moon, raining music notes over a sleeping city
  'the-reflective-dreamer': () => {
    theme({ key: [-20, -24], shadow: '#3b4a8a', rim: '#fde68a', rimW: 6, ink: '#1b2350', deep: 0.7 });
    const bg = [L.sky('#0b1640', '#1e2a5a'), L.stars(7, 120, [0, 0, 1024, 700])];
    bg.push(L.clouds(3, 6, '#1f2c66', [0, 520, 1024, 820], 0.8));
    bg.push(L.skyline(8, 1000, '#0a1030', ['#fde68a', '#93c5fd'], [60, 200]));
    bg.push(glow(512, 980, 300, '#93c5fd', 0.25));
    const f = [];
    // crescent moon to sit on
    f.push(glow(520, 640, 300, '#fde68a', 0.35));
    f.push(part('M230,560 C260,780 470,880 680,820 C820,780 880,660 860,560 C820,700 680,780 540,770 C400,760 280,690 230,560 Z', '#fde9a8', { rimC: '#ffffff', key: [-14, -18], sh: 'M200,700 C400,860 700,860 900,700 L900,900 L200,900 Z' }));
    for (const [x, y, r] of [[420, 760, 16], [600, 790, 12], [700, 740, 9]]) f.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#e8cf7a" opacity="0.7"/>`);
    // the cloud
    const cloud = 'M300,560 C250,560 230,500 270,470 C250,400 320,350 380,380 C400,300 500,270 560,320 C620,280 720,320 720,400 C790,400 820,470 780,520 C800,570 760,600 720,590 C640,610 380,610 300,560 Z';
    f.push(part(cloud, '#e6ecff', { sh: 'M240,520 C400,580 640,590 820,500 L820,640 L240,640 Z', rimC: '#fde68a', lw: 3 }));
    f.push(L.headphonesOn(512, 450, 220, '#a5b4fc', '#312e81'));
    f.push(eye(450, 470, 84, 66, { side: -1, open: 0.42, iris: '#6366f1', look: [8, 14], lid: true, lash: '#1b2350' }), eye(580, 470, 84, 66, { side: 1, open: 0.42, iris: '#6366f1', look: [8, 14], lid: true, lash: '#1b2350' }));
    f.push(line('M412,410 Q440,398 474,404', '#1b2350', 4), line('M556,404 Q590,398 618,410', '#1b2350', 4));
    f.push(line('M496,526 C506,520 520,520 530,526', '#1b2350', 3.4));
    f.push(L.blushHatch(420, 520, '#f9a8d4', 0.6), L.blushHatch(610, 520, '#f9a8d4', 0.6));
    // rain of notes
    const R = rng(4);
    for (let i = 0; i < 12; i++) { const x = 320 + R() * 400, y = 640 + R() * 360; f.push(L.note(x, y, 0.7 + R() * 0.4, ['#93c5fd', '#c7d2fe', '#fde68a'][i % 3], -10 + R() * 20)); }
    f.push(L.rain(11, 40, '#c7d2fe', 0.35, 4).replace(/<line/g, '<line clip-path="url(#rainclip)"'));
    return page({ bg: bg.join('\n') + '<defs><clipPath id="rainclip"><rect x="300" y="580" width="440" height="460"/></clipPath></defs>', figure: f.join('\n'), grade: { top: '#4338ca', bottom: '#0b1030', vignette: 0.75 }, bloom: 0.55 });
  },
  'the-golden-revivalist': goldie,
  // Tweed: a tortoise in a warm study at dusk, gramophone horn growing from its shell, eyes closed over tea
  'the-vintage-enthusiast': () => {
    theme({ key: [28, -20], shadow: '#3a2a4a', rim: '#fcd9a8', rimW: 6, ink: '#2a1a1a', deep: 0.55 });
    const bg = [L.sky('#2a1c2c', '#120c14')];
    bg.push(L.window_(560, 80, 380, 460, L.sky('#f59e0b', '#7c2d12', 'dusk1') + L.clouds(5, 4, '#fb923c', [560, 120, 940, 400], 0.6) + `<circle cx="760" cy="420" r="70" fill="#fde68a" opacity="0.9"/>` + L.skyline(3, 560, '#4a1d1d', ['#fde68a'], [40, 140])));
    bg.push(L.rays(760, 380, '#fde68a', [150, 165, 180], 1000, 3, 0.15));
    bg.push(L.shelves(6, 20, 520, 120, 4, '#2b1d16', 0.5));
    bg.push(glow(760, 380, 260, '#fb923c', 0.35));
    bg.push(L.motes(5, 50, '#fde7c2', [0, 0, 1024, 1024], [1, 2.5]));
    const skin = '#8f9a5a', shell = '#6b4a2a';
    const f = [];
    // shell dome behind the shoulders with the horn sprouting from it
    f.push(part('M150,900 C150,620 330,520 512,520 C694,520 874,620 874,900 Z', shell, { sh: 'M100,600 L420,600 C380,700 400,800 440,900 L100,900 Z', inner: [[300, 700], [512, 620], [720, 700], [400, 820], [620, 820]].map(([x, y]) => `<path d="${ell(x, y, 80, 60)}" fill="none" stroke="#3a2614" stroke-width="5"/><path d="${ell(x, y, 60, 42)}" fill="#8a6038" opacity="0.6"/>`).join('') }));
    f.push(part('M680,560 C700,420 740,300 820,200 C780,170 880,90 960,140 C1000,200 950,280 880,260 C820,330 780,440 760,570 Z', '#d4a537', { rimC: '#fff1c2', sh: 'M640,400 L760,400 L780,600 L640,600 Z', inner: '<ellipse cx="920" cy="190" rx="50" ry="30" fill="#5c3d12" transform="rotate(-30 920 190)"/>' }));
    f.push(bust({ f: 1, kind: 'cardigan', c: '#8b5e3c', c2: '#efe3c8', neck: skin, pattern: [0, 1, 2, 3, 4, 5, 6].map(i => line(`M${200 + i * 100},700 L${160 + i * 100},1024`, '#6b4226', 4, 0.35) + line(`M${100 + i * 120},740 L${200 + i * 120},1024`, '#c08a5a', 3, 0.3)).join('') }));
    f.push(neckCast());
    f.push(head({ x: 500, y: 420, f: 1, fur: skin, muzzle: 'mid', nose: 'cat', noseC: '#3a3a1a', ears: {}, fringe: 'none', cheek: false, iris: '#7c5a2a', mood: 'closed', cran: [0.92, 0.9], blushC: '#f0a080',
      headInner: [[-60, -120], [20, -150], [-110, -40]].map(([x, y]) => `<path d="${ell(x, y, 30, 22)}" fill="#6f7a40" opacity="0.6"/>`).join('') }));
    // teacup with steam
    f.push(part('M600,820 C600,900 760,900 760,820 Z', '#f5ecd8', { rimW: 4, inner: '<rect x="600" y="830" width="160" height="10" fill="#c2410c" opacity="0.7"/>' }));
    f.push(part('M600,816 C620,806 740,806 760,816 C740,830 620,830 600,816 Z', '#7c3f12', { rim: false, lw: 2.4 }));
    f.push(line('M760,830 C800,830 800,870 756,868', '#f5ecd8', 8));
    f.push(line('M650,790 C640,760 666,740 654,710 M700,790 C690,760 716,740 704,700', '#fff', 4, 0.45));
    f.push(part('M560,1024 C560,940 580,880 620,860 L700,880 C700,940 690,990 680,1024 Z', skin));
    return page({ bg: bg.join('\n'), figure: f.join('\n'), grade: { top: '#f59e0b', bottom: '#2a0f1a', vignette: 0.8 }, bloom: 0.45 });
  },
  // Rosso: a fox mid-flamenco under a single red spotlight, a rose in its teeth and a record for a fan
  'the-restless-romantic': () => {
    theme({ key: [-30, -26], shadow: '#3a0a24', rim: '#fb7185', rimW: 7, ink: '#1a0710', deep: 0.42 });
    const bg = [L.sky('#1a0610', '#07030a')];
    bg.push(L.spot(330, -40, 80, '#f43f5e', 1300, 11, 0.35), L.spot(700, -40, 105, '#7f1d1d', 1300, 8, 0.25));
    bg.push(glow(400, 300, 300, '#be123c', 0.3));
    const R = rng(12);
    for (let i = 0; i < 26; i++) { const x = R() * 1024, y = R() * 1024; bg.push(`<path d="${ell(x, y, 10 + R() * 8, 5 + R() * 4, R() * 180)}" fill="${['#e11d48', '#be123c', '#fb7185'][i % 3]}" opacity="${(0.4 + R() * 0.5).toFixed(2)}"/>`); }
    bg.push(L.crowd(3, 1060, '#0d0306', 14));
    const fur = '#d9531e', cream = '#f8e6d4';
    const f = [];
    f.push(bust({ f: -1, kind: 'jacket', c: '#18080e', c2: '#b3123a', neck: fur, pattern: (() => { const s = []; for (let i = 0; i < 6; i++) s.push(line(`M${300 + i * 80},760 C${310 + i * 80},820 ${290 + i * 80},880 ${300 + i * 80},940`, '#b3123a', 3, 0.6)); return s.join(''); })() }));
    f.push(neckCast(512));
    f.push(head({ x: 524, y: 410, f: -1, fur, muzzle: 'long', muzzleC: cream, ears: { type: 'pointy', size: 1.1, inner: '#2a0f0a' }, iris: '#f59e0b', mood: 'smirk', fringe: 'spiky', cheekC: cream, lash: '#1a0710',
      front: g(220, 76, 1, 18, `${line('M-40,0 C0,4 40,-2 90,6', '#166534', 6)}${part(ell(-60, -6, 30, 26), '#e11d48', { rimW: 3, lw: 2.6, inner: '<path d="M-74,-14 C-64,-26 -46,-20 -50,-6 C-56,4 -70,0 -66,-10" fill="none" stroke="#7f1d1d" stroke-width="3"/>' })}${part(ell(10, 10, 16, 8, -20), '#16a34a', { rimW: 2, lw: 2 })}`) }));
    // record fan raised
    f.push(g(250, 640, 1, -24, `${part('M-40,40 C-50,100 -40,200 -20,300 L60,300 C50,200 40,100 30,40 Z', fur, { rimW: 4 })}${L.record(0, 0, 150, 150, '#e11d48')}`));
    return page({ bg: bg.join('\n'), figure: f.join('\n'), grade: { top: '#be123c', bottom: '#0a0206', vignette: 0.85 }, bloom: 0.5 });
  },
  // Sepia: an owl in a cardigan in an old archive at golden hour, hugging a stack of 45s, glasses fogged
  'the-sentimental-archivist': () => {
    theme({ key: [28, -22], shadow: '#3a2a3a', rim: '#fcd34d', rimW: 6, ink: '#24160e', deep: 0.5 });
    const bg = [L.sky('#3a2414', '#140c08')];
    bg.push(L.shelves(14, 0, 1024, 40, 6, '#24160c', 0.55));
    bg.push(L.rays(900, -40, '#fde68a', [115, 125, 135], 1400, 4, 0.22));
    bg.push(glow(860, 120, 260, '#fbbf24', 0.35));
    bg.push(L.motes(8, 90, '#fde7c2', [0, 0, 1024, 1024], [1, 3]));
    const fur = '#8a6440', disc = '#e9d6b4';
    const f = [];
    f.push(bust({ f: 1, kind: 'cardigan', c: '#5b6b4a', c2: '#f1e6d2', neck: fur, c3: '#d6b98a' }));
    f.push(neckCast());
    const faceDisc = part(smooth([[-40, -120], [80, -130], [170, -70], [190, 40], [140, 130], [30, 160], [-70, 110], [-110, 0]], true), disc, { rim: false, lw: 2.6, sh: 'M-200,-200 L-30,-200 C-70,-60 -60,60 0,200 L-200,200 Z' });
    const glasses = `<g opacity="0.95">${line('M-14,-26 C-14,-90 94,-90 94,-26 C94,34 -14,34 -14,-26 Z', '#5c3d1e', 5)}${line('M124,-44 C124,-96 176,-96 176,-44 C176,0 124,0 124,-44 Z', '#5c3d1e', 4)}${line('M94,-36 L124,-46', '#5c3d1e', 4)}<ellipse cx="40" cy="-26" rx="52" ry="54" fill="#f8fafc" opacity="0.35" filter="url(#soft4)"/><ellipse cx="150" cy="-44" rx="24" ry="44" fill="#f8fafc" opacity="0.3" filter="url(#soft4)"/></g>`;
    f.push(head({ x: 500, y: 410, f: 1, fur, muzzle: 'beak', beak: { len: 44, droop: 30, c: '#d9a441' }, ears: { type: 'pointy', size: 0.6 }, iris: '#f59e0b', mood: 'sad', face: faceDisc, front: glasses, fringe: 'tufts', blushC: '#f59e8b' }));
    // stack of 45s hugged to the chest
    f.push(g(520, 900, 1, -6, [0, 1, 2, 3].map(i => `<g transform="translate(${i * 8 - 12} ${-i * 26})">${part('M-130,-110 L130,-110 L130,110 L-130,110 Z', ['#c084fc', '#fb7185', '#fde68a', '#5eead4'][i], { rimW: 3, inner: `<circle cx="0" cy="0" r="70" fill="#14101a"/><circle cx="0" cy="0" r="26" fill="${['#fde68a', '#f1f5f9', '#fb7185', '#c084fc'][i]}"/><circle cx="0" cy="0" r="12" fill="#14101a"/>` })}</g>`).join('')));
    f.push(part('M300,1024 C300,940 330,860 400,820 C440,800 470,830 460,870 C440,930 420,980 410,1024 Z', '#5b6b4a'));
    f.push(part('M724,1024 C724,940 694,860 624,820 C584,800 554,830 564,870 C584,930 604,980 614,1024 Z', '#5b6b4a'));
    for (const [x, y] of [[440, 820], [584, 820]]) f.push(part(ell(x, y, 30, 24), fur, { rimW: 3 }));
    return page({ bg: bg.join('\n'), figure: f.join('\n'), grade: { top: '#d97706', bottom: '#1a0c08', vignette: 0.85 }, bloom: 0.45 });
  },
};
