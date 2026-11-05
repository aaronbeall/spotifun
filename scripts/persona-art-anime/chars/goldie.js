import { page, theme, part, cast, shine, line, fill, glow, eye, brow, blushHatch, sparkle, tuft, smooth, ell, darken, lighten, mix, rng, motes, bokeh, rays } from '../kit.js';

// Goldie: the golden retriever, alone on the dance floor after closing, looking up at the last mirror ball still turning.
export default function () {
  theme({ key: [34, -28], shadow: '#3a2370', rim: '#6ee7f9', rimW: 7, ink: '#2a1240', deep: 0.52 });
  const fur = mix('#f2b955', '#ff8ac0', 0.08), furDk = mix('#c27a2c', '#a8327a', 0.12), cream = '#fbe3c4';
  const jacket = '#6d28d9', shirt = '#f1e9ff';
  const R = rng(7);

  // ---------- background ----------
  const bg = [];
  bg.push(`<defs><linearGradient id="room" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#1d1442"/><stop offset="0.6" stop-color="#110c2a"/><stop offset="1" stop-color="#07060f"/></linearGradient></defs>`);
  bg.push(`<rect width="1024" height="1024" fill="url(#room)"/>`);
  // far wall panels, barely lit
  for (let i = 0; i < 7; i++) bg.push(`<rect x="${-20 + i * 160}" y="120" width="140" height="900" fill="#2a1d5c" opacity="${0.18 + (i % 2) * 0.08}"/>`);
  bg.push(glow(860, 150, 220, '#c084fc', 0.35));
  bg.push(rays(850, 160, '#f0abfc', [118, 132, 148, 165], 1400, 3.5, 0.16));
  bg.push(rays(850, 160, '#67e8f9', [105, 140, 178], 1400, 2.2, 0.14));
  // light speckles from the mirror ball on the walls
  const speck = [];
  for (let i = 0; i < 70; i++) {
    const x = R() * 1024, y = R() * 760, s = 4 + R() * 9, c = ['#f9a8d4', '#a5f3fc', '#fde68a', '#ffffff'][Math.floor(R() * 4)];
    speck.push(`<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${s.toFixed(1)}" height="${(s * 0.6).toFixed(1)}" fill="${c}" opacity="${(0.25 + R() * 0.55).toFixed(2)}" transform="rotate(${(R() * 60 - 30).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`);
  }
  bg.push(`<g>${speck.join('')}</g>`);
  bg.push(bokeh(3, 16, ['#f472b6', '#22d3ee', '#a78bfa', '#fbbf24'], [0, 520, 1024, 1024], [18, 48]));
  // mirror ball
  const bx = 860, by = 150, br = 92;
  bg.push(line(`M${bx},0 L${bx},${by - br}`, '#5b4a8a', 4));
  const tiles = [];
  for (let j = -4; j <= 4; j++) for (let i = -5; i <= 5; i++) {
    const yy = by + j * 20, ww = Math.sqrt(Math.max(0, br * br - (j * 20) ** 2));
    const xx = bx + i * 18 * (ww / br);
    if (Math.abs(xx - bx) > ww - 6) continue;
    const lit = (i + j * 2 + 40) % 5 === 0 ? '#ffffff' : (i < 0 && j < 0 ? '#c4b5fd' : '#6d5bb0');
    tiles.push(`<rect x="${(xx - 8 * ww / br).toFixed(1)}" y="${yy - 9}" width="${(16 * ww / br).toFixed(1)}" height="18" fill="${lit}" opacity="0.9"/>`);
  }
  bg.push(part(ell(bx, by, br, br), '#8b7cc8', { inner: tiles.join(''), rim: false }));
  bg.push(sparkle(bx - 40, by - 44, 34, '#fff'), sparkle(bx + 30, by + 30, 16, '#fbcfe8'));

  // ---------- figure ----------
  const f = [];
  const sequins = (() => { const s = []; const r2 = rng(11); for (let i = 0; i < 260; i++) { const x = 120 + r2() * 760, y = 690 + r2() * 340; s.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(2 + r2() * 3).toFixed(1)}" fill="${['#c4b5fd', '#f0abfc', '#a5f3fc', '#ffffff'][Math.floor(r2() * 4)]}" opacity="${(0.25 + r2() * 0.6).toFixed(2)}"/>`); } return s.join(''); })();
  // jacket, body turned a little toward the ball
  f.push(part('M110,1024 C120,900 170,800 270,748 C340,712 420,696 500,694 C600,694 680,716 740,754 C830,810 870,910 880,1024 Z', jacket, {
    inner: sequins, sh: 'M0,700 L420,700 C400,800 420,900 480,1024 L0,1024 Z',
  }));
  // shirt + wide 70s collar
  f.push(part('M440,700 L600,700 L560,880 L530,930 L500,880 Z', shirt, { sh: 'M400,690 L520,690 L520,940 L400,940 Z' }));
  f.push(part('M448,698 L330,752 L410,850 L480,748 Z', shirt, { sh: 'M300,700 L480,700 L480,900 L300,900 Z' }));
  f.push(part('M594,698 L712,752 L640,850 L566,748 Z', shirt));
  // lapels
  f.push(part('M426,704 L292,744 C284,820 330,900 380,990 L476,870 L430,780 Z', mix(jacket, '#000', 0.25), { sh: 'M250,700 L400,700 C380,800 400,900 420,1000 L250,1000 Z' }));
  f.push(part('M614,704 L748,744 C756,820 710,900 660,990 L564,870 L612,780 Z', mix(jacket, '#000', 0.25)));
  // neck
  f.push(part('M430,540 C440,610 436,670 426,720 L614,720 C606,660 610,600 632,540 Z', fur, { sh: 'M400,520 L680,520 L680,640 C600,660 520,640 400,600 Z' }));
  // chest fluff over the collar
  f.push(part('M436,650 C440,700 460,760 484,800 L500,762 L516,824 L536,760 L556,806 C580,760 600,700 610,650 C560,672 490,672 436,650 Z', cream, { sh: 'M420,640 C470,690 560,690 620,640 L620,600 L420,600 Z' }));

  // near ear (behind the cranium edge, hanging down the back)
  const ear = 'M420,262 C360,260 318,330 304,420 C292,500 300,570 322,622 L340,594 L352,632 L374,598 L396,626 C418,566 432,480 434,400 C436,330 446,286 420,262 Z';
  // cranium
  const cran = smooth([[470, 214], [574, 226], [646, 284], [668, 360], [648, 462], [596, 546], [500, 590], [404, 566], [340, 488], [324, 380], [350, 280], [404, 230]], true);
  f.push(part(cran, fur, { sh: 'M300,180 L460,180 C420,280 410,400 450,488 C500,560 600,560 680,500 L700,700 L300,700 Z' }));
  // back-of-jaw fluff
  f.push(part(tuft(396, 520, 500, 584, 380, 620, 0.12), fur, { sh: 'M300,500 L460,500 C450,560 470,600 520,620 L300,640 Z' }));
  // muzzle
  const muz = smooth([[618, 384], [700, 392], [772, 404], [798, 430], [780, 464], [724, 490], [652, 502], [606, 470], [600, 404]], true);
  f.push(part(muz, fur, { noLine: true, rim: false, sh: 'M560,464 C640,486 720,480 810,446 L810,560 L560,560 Z', inner: `<path d="M600,470 C660,500 730,492 790,456 L790,520 L600,520 Z" fill="${cream}" opacity="0.85"/>` }));
  f.push(line('M630,388 C690,390 740,396 786,410', mix(darken(fur, 0.32), '#2a1240', 0.55), 3.2), line('M800,440 C780,470 730,492 664,500', mix(darken(fur, 0.32), '#2a1240', 0.55), 3.2));
  // nose
  f.push(part('M766,398 C784,392 806,404 806,424 C806,440 792,448 780,446 C766,444 756,430 758,414 C759,406 762,400 766,398 Z', '#25142c', { rimW: 2, lw: 2.6, sh: 'M740,430 L820,430 L820,460 L740,460 Z' }));
  f.push(fill(ell(784, 406, 8, 4, -10), '#ffffff', 0.75));
  // wistful closed mouth, corner turned slightly down
  f.push(line('M786,448 C774,470 752,480 724,482 C706,484 690,488 676,496', '#3a1a3a', 3.4));
  // whisker dots
  f.push(['M708,448', 'M724,440', 'M740,446'].map(m => `<circle cx="${m.split(',')[0].slice(1)}" cy="${m.split(',')[1]}" r="2.6" fill="${darken(fur, 0.5)}"/>`).join(''));
  // ear on top of the cranium edge
  f.push(part(ear, furDk, { sh: 'M280,240 L400,240 C380,380 390,520 420,640 L280,640 Z' }));
  f.push(line('M380,330 C360,420 354,520 364,590', darken(furDk, 0.55), 2.4, 0.6));
  // fringe tufts sweeping forward
  f.push(part(tuft(440, 236, 520, 222, 540, 330, -0.22), fur, { sh: 'M400,300 L560,300 L560,360 L400,360 Z' }));
  f.push(part(tuft(510, 222, 590, 242, 620, 318, -0.25), fur));
  f.push(part(tuft(400, 250, 460, 230, 452, 330, 0.12), fur, { sh: 'M380,200 L440,200 L440,360 L380,360 Z' }));
  f.push(part(tuft(470, 214, 510, 216, 548, 164, -0.4), fur));
  f.push(shine([[476, 262, 8], [500, 258, 14], [524, 258, 20], [548, 262, 28]], '#fff4d8', 0.7, 9));
  // eyes: the near one large, the far one squeezed by perspective; both heavy-lidded, looking up at the ball
  const look = [14, -12];
  f.push(eye(548, 380, 104, 82, { side: -1, open: 0.62, iris: '#e5902f', look, lid: true, sparkle: true, tilt: 10 }));
  f.push(eye(654, 356, 46, 70, { side: 1, open: 0.6, iris: '#e5902f', look: [6, -10], irisW: 0.42, tilt: 8, lashW: 6 }));
  f.push(brow(504, 316, 580, 312, darken(furDk, 0.45), 5), brow(632, 304, 664, 296, darken(furDk, 0.45), 4));
  f.push(blushHatch(540, 456, '#ff6fa5'));
  // single tear catching the light
  f.push(`<path d="M584,434 C592,450 592,462 584,466 C576,462 576,450 584,434 Z" fill="#cffafe" opacity="0.85"/>`);

  // ---------- front: speckles on the figure, motes ----------
  const front = [];
  const R3 = rng(21);
  for (let i = 0; i < 26; i++) {
    const x = 300 + R3() * 520, y = 220 + R3() * 700, s = 5 + R3() * 8;
    front.push(`<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${s.toFixed(1)}" height="${(s * 0.6).toFixed(1)}" fill="${['#f9a8d4', '#a5f3fc', '#fde68a'][Math.floor(R3() * 3)]}" opacity="${(0.25 + R3() * 0.35).toFixed(2)}" transform="rotate(${(R3() * 60 - 30).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})" style="mix-blend-mode:screen"/>`);
  }
  front.push(motes(4, 40, '#fdf4ff', [0, 0, 1024, 1024], [1.2, 3]));
  return page({ bg: bg.join('\n'), figure: f.join('\n'), front: front.join(''), grade: { top: '#6b3fd1', bottom: '#0b0820', vignette: 0.7 }, bloom: 0.5 });
}
