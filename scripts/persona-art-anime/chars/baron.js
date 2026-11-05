import { page, theme, part, cast, shine, line, fill, glow, eye, brow, sparkle, tuft, smooth, ell, g, darken, lighten, mix, rng, motes, rays } from '../kit.js';

// Baron: a vampire bat DJing alone in a moonlit chapel, candles burning low, one hand on the record.
export default function () {
  theme({ key: [-26, 22], shadow: '#1e1440', rim: '#a5c8ff', rimW: 7, ink: '#14081c', deep: 0.45 });
  const fur = '#6b3a5e', furLt = '#8f5579', skin = '#c46a8e', inner = '#e79ab6', capeOut = '#1b1426', capeIn = '#b3123a';
  const bg = [];
  bg.push(`<defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151a3a"/><stop offset="1" stop-color="#07060f"/></linearGradient>
    <radialGradient id="moonG" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f5f7ff"/><stop offset="0.7" stop-color="#dbe4ff"/><stop offset="1" stop-color="#a5b4fc"/></radialGradient>
    <clipPath id="arch"><path d="M300,900 L300,330 C300,180 400,90 512,70 C624,90 724,180 724,330 L724,900 Z"/></clipPath>
  </defs>`);
  bg.push(`<rect width="1024" height="1024" fill="url(#wall)"/>`);
  // stone blocks
  const R = rng(3);
  for (let y = 0; y < 1024; y += 64) for (let x = (y / 64) % 2 ? -60 : 0; x < 1024; x += 120) bg.push(`<rect x="${x + 3}" y="${y + 3}" width="114" height="58" rx="4" fill="#1d2248" opacity="${(0.25 + R() * 0.25).toFixed(2)}"/>`);
  // tall gothic window with the moon in it
  bg.push(`<path d="M300,900 L300,330 C300,180 400,90 512,70 C624,90 724,180 724,330 L724,900 Z" fill="#1d3170"/>`);
  bg.push(`<g clip-path="url(#arch)"><rect x="300" y="60" width="430" height="840" fill="#26408a" opacity="0.6"/>
    ${glow(560, 250, 160, '#c7d2fe', 0.7)}<circle cx="560" cy="250" r="96" fill="url(#moonG)"/>
    <circle cx="530" cy="230" r="14" fill="#c7d2fe" opacity="0.6"/><circle cx="590" cy="280" r="20" fill="#c7d2fe" opacity="0.5"/>
    <path d="M300,560 C380,520 460,600 540,560 C620,520 680,580 730,560 L730,900 L300,900 Z" fill="#141b3d" opacity="0.8"/>
  </g>`);
  bg.push(`<path d="M290,910 L290,330 C290,170 396,80 512,58 C628,80 734,170 734,330 L734,910 L724,910 L724,330 C724,180 624,90 512,70 C400,90 300,180 300,330 L300,910 Z" fill="#0d0f24"/>`);
  bg.push(`<rect x="505" y="70" width="14" height="840" fill="#0d0f24"/><rect x="300" y="420" width="424" height="12" fill="#0d0f24"/>`);
  bg.push(rays(560, 250, '#c7d2fe', [100, 115, 128, 140], 1100, 3, 0.12));
  // candles on the left, low and dripping
  const candle = (x, base, h) => {
    const top = base - h;
    return `${glow(x, top - 30, 90, '#fb923c', 0.6)}${part(`M${x - 18},${base} L${x - 18},${top + 6} C${x - 18},${top - 2} ${x + 18},${top - 2} ${x + 18},${top + 6} L${x + 18},${base} Z`, '#efe1c8', { rimW: 3, lw: 2.6, key: [-8, -6], inner: `<path d="M${x + 6},${top + 2} C${x + 12},${top + 20} ${x + 2},${top + 30} ${x + 10},${top + 44}" stroke="#d9c7a8" stroke-width="7" fill="none" stroke-linecap="round"/>` })}
      <path d="M${x},${top - 40} C${x + 15},${top - 20} ${x + 12},${top - 6} ${x},${top - 4} C${x - 12},${top - 6} ${x - 15},${top - 20} ${x},${top - 40} Z" fill="#fdba74"/>
      <path d="M${x},${top - 26} C${x + 6},${top - 16} ${x + 5},${top - 9} ${x},${top - 8} C${x - 5},${top - 9} ${x - 6},${top - 16} ${x},${top - 26} Z" fill="#fffbe6"/>`;
  };
  bg.push(candle(90, 1024, 300), candle(170, 1024, 220), candle(240, 1024, 140), candle(940, 1024, 200));
  bg.push(motes(12, 60, '#ffd8a8', [0, 300, 1024, 1024], [1, 2.4]));

  const f = [];
  // cape body
  f.push(part('M150,1024 C170,880 240,780 330,740 C400,712 450,704 512,704 C580,704 640,716 700,744 C790,786 850,880 870,1024 Z', capeOut, { sh: 'M560,690 C600,800 640,900 660,1024 L900,1024 L900,690 Z' }));
  // high collar, red lining
  f.push(part('M340,740 L210,500 C290,540 360,560 420,640 Z', capeIn));
  f.push(part('M684,740 L814,500 C734,540 664,560 604,640 Z', capeIn, { sh: 'M650,480 L860,480 L860,760 L650,760 Z' }));
  // shirt + cravat
  f.push(part('M440,704 L584,704 L560,860 L512,900 L464,860 Z', '#e8e4f0', { sh: 'M544,690 C540,780 550,850 562,910 L600,910 L600,690 Z' }));
  f.push(part('M480,716 C500,700 524,700 544,716 L560,790 C540,810 484,810 464,790 Z', capeIn));
  f.push(part(ell(512, 726, 16, 13), '#facc15', { rimW: 2, lw: 2.4 }));
  // headphones resting on the collar
  f.push(line('M380,700 C390,760 634,760 644,700', '#2a2338', 14), line('M380,700 C390,760 634,760 644,700', '#6b6480', 6));
  f.push(part(ell(378, 690, 34, 44, -18), '#2a2338', { rimW: 4 }), part(ell(646, 690, 34, 44, 18), '#2a2338', { rimW: 4 }));
  // neck
  f.push(part('M450,560 C456,620 452,670 446,710 L578,710 C572,670 568,620 574,560 Z', fur, { sh: 'M548,540 C534,620 552,680 584,720 L620,720 L620,540 Z' }));
  f.push(cast('M440,600 C470,660 560,670 590,600 Z', 0.6));
  // ears: big, pointed, translucent pink inside
  const earL = 'M392,330 C340,300 270,200 250,90 C320,120 410,170 456,260 Z';
  const earR = 'M632,330 C684,300 754,200 774,90 C704,120 614,170 568,260 Z';
  f.push(part(earL, fur, { sh: 'M380,60 L520,60 L520,360 L420,360 Z', inner: `<path d="M398,300 C356,270 300,200 282,128 C336,156 400,196 436,262 Z" fill="${inner}" opacity="0.9"/>` }));
  f.push(part(earR, fur, { sh: 'M600,60 L800,60 L800,360 L600,360 Z', inner: `<path d="M626,300 C668,270 724,200 742,128 C688,156 624,196 588,262 Z" fill="${inner}" opacity="0.9"/>` }));
  // head
  const head = smooth([[512, 238], [598, 252], [654, 306], [668, 386], [646, 470], [592, 540], [512, 570], [432, 540], [378, 470], [356, 386], [370, 306], [426, 252]], true);
  f.push(part(head, fur, { sh: 'M540,200 C620,260 660,360 640,440 C620,500 600,540 560,600 L720,600 L720,200 Z' }));
  // swept fringe
  f.push(part(tuft(420, 270, 520, 240, 430, 360, 0.2), furLt));
  f.push(part(tuft(480, 246, 580, 254, 520, 350, 0.14), furLt));
  f.push(part(tuft(560, 252, 640, 290, 616, 352, -0.12), furLt));
  f.push(part(tuft(500, 242, 530, 240, 580, 196, -0.4), furLt));
  f.push(shine([[440, 286, -24], [462, 274, -16], [484, 266, -8]], '#ffd6e8', 0.55, 8));
  // muzzle
  const muz = smooth([[512, 440], [560, 452], [584, 490], [566, 528], [512, 542], [458, 528], [440, 490], [464, 452]], true);
  f.push(part(muz, skin, { rimW: 3, sh: 'M520,430 C560,470 570,510 560,560 L620,560 L620,430 Z' }));
  // leaf nose
  f.push(part('M494,462 C494,446 530,446 530,462 C530,476 518,486 512,488 C506,486 494,476 494,462 Z', '#4a1a36', { rimW: 2, lw: 2.4 }));
  f.push(line('M512,436 L512,450', '#4a1a36', 4));
  // smirk with one fang
  f.push(line('M470,508 C490,516 520,518 548,500', '#2b0a1e', 3.6));
  f.push(`<path d="M528,510 l6,20 l7,-22 Z" fill="#fff" stroke="#2b0a1e" stroke-width="2.4" stroke-linejoin="round"/>`);
  // eyes: half-lidded, crimson, a little glow
  f.push(glow(450, 400, 40, '#f43f5e', 0.5), glow(578, 400, 40, '#f43f5e', 0.5));
  f.push(eye(450, 398, 88, 66, { side: -1, open: 0.55, iris: '#e11d48', look: [-6, 2], lid: true, tilt: 12, lash: '#12060e' }));
  f.push(eye(576, 398, 88, 66, { side: 1, open: 0.55, iris: '#e11d48', look: [-6, 2], lid: true, tilt: 12, lash: '#12060e' }));
  f.push(line('M404,338 L486,354', '#12060e', 5), line('M622,338 L540,354', '#12060e', 5));

  // the turntable in the foreground, lit by the candles
  const T1 = [];
  T1.push(part('M90,1024 L170,850 L870,850 L950,1024 Z', '#2a2236', { sh: 'M600,840 L960,840 L960,1024 L700,1024 Z', key: [-10, -10] }));
  T1.push(`<ellipse cx="460" cy="930" rx="250" ry="70" fill="#0e0b14" stroke="#3b3448" stroke-width="3"/>`);
  for (const k of [0.9, 0.75, 0.6]) T1.push(`<ellipse cx="460" cy="930" rx="${250 * k}" ry="${70 * k}" fill="none" stroke="#fff" stroke-opacity="0.08" stroke-width="2"/>`);
  T1.push(`<ellipse cx="460" cy="930" rx="70" ry="20" fill="${capeIn}"/><ellipse cx="460" cy="930" rx="6" ry="2" fill="#000"/>`);
  T1.push(`<path d="M260,912 A230,62 0 0,1 420,866" fill="none" stroke="#fde68a" stroke-opacity="0.4" stroke-width="4" stroke-linecap="round"/>`);
  T1.push(line('M800,880 L760,920 L640,950', '#b8b2c8', 7), part(ell(810, 876, 20, 14), '#6b6480', { rimW: 2 }));
  // wing-claw resting on the record, mid-scratch
  T1.push(part('M300,1024 C300,960 330,906 380,890 C420,878 450,900 446,930 C440,970 400,990 380,1024 Z', fur, { sh: 'M380,880 L460,880 L460,1024 L360,1024 Z' }));
  for (const [x, y] of [[392, 886], [418, 884], [440, 894]]) T1.push(part(tuft(x - 7, y + 10, x + 7, y + 10, x + 10, y - 22, -0.2), '#efe6f2', { rimW: 2, lw: 2.2 }));
  T1.push(line('M560,890 C600,872 640,878 670,900', '#fde68a', 3, 0.5), line('M572,908 C610,894 640,900 660,916', '#fde68a', 3, 0.35));
  f.push(T1.join('\n'));

  const front = [sparkle(600, 220, 10, '#fff', 0.8), sparkle(330, 140, 7, '#c7d2fe', 0.7)].join('');
  return page({ bg: bg.join('\n'), figure: f.join('\n'), front, grade: { top: '#1e3a8a', bottom: '#3b0a1e', vignette: 0.85 }, bloom: 0.5 });
}
