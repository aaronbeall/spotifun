// Reusable anime pieces: a 3/4 creature head, bust clothing, and night scenes.
import { T, theme, page, part, cast, shine, line, fill, glow, eye, brow, blushHatch, sparkle, tuft, smooth, ell, g, darken, lighten, mix, rng, motes, bokeh, rain, rays } from './kit.js';
export { T, theme, page, part, cast, shine, line, fill, glow, eye, brow, blushHatch, sparkle, tuft, smooth, ell, g, darken, lighten, mix, rng, motes, bokeh, rain, rays };

const MIRROR = 'translate(1024,0) scale(-1,1)';
export const circ = (x, y, r, c, o) => part(ell(x, y, r, r), c, o);

// ---------------------------------------------------------------- moods
const MOODS = {
  wistful: { open: 0.62, look: [14, -12], brow: 'soft', mouth: 'down', lid: true },
  dreamy: { open: 0.42, look: [12, -14], brow: 'soft', mouth: 'soft', lid: true },
  calm: { open: 0.48, look: [10, 14], brow: 'soft', mouth: 'soft', lid: true },
  closed: { open: 0, brow: 'soft', mouth: 'soft' },
  sad: { open: 0.6, look: [6, 14], brow: 'worried', mouth: 'down', tear: true, lid: true },
  smirk: { open: 0.55, look: [-12, 2], brow: 'flat', mouth: 'smirk', lid: true },
  fierce: { open: 0.86, look: [-10, 0], brow: 'angry', mouth: 'open' },
  bright: { open: 0.9, look: [-10, -2], brow: 'soft', mouth: 'smileOpen', sparkle: true },
  sing: { open: 0, brow: 'worried', mouth: 'open' },
  shy: { open: 0.66, look: [-14, 10], brow: 'worried', mouth: 'soft', lid: true },
};

// ---------------------------------------------------------------- head
// Local frame: cranium centred on 0,0 (radius ~180), facing +x, lit from the front (+x).
// o.f = 1 faces right, -1 faces left (mirrored); key light should come from the facing side.
export function head(o) {
  const f = o.f ?? 1, s = o.s ?? 1;
  const fur = o.fur, furLt = o.furLt || lighten(fur, 0.25), furDk = o.furDk || darken(fur, 0.78);
  const mood = { ...MOODS[o.mood || 'wistful'], ...(o.moodX || {}) };
  const saveKey = T.key; T.key = [Math.abs(T.key[0]) || 20, T.key[1]];
  const [sx, sy] = o.cran || [1, 1];
  const out = [];
  const P = pts => pts.map(([x, y]) => [Math.round(x * sx), Math.round(y * sy)]);
  out.push(o.back || '');
  // ears behind the cranium
  const E = o.ears || {};
  const ez = E.size ?? 1, ec = E.c || fur, ei = E.inner || mix(fur, '#ff9fbf', 0.55);
  if (E.type === 'pointy') {
    out.push(part(`M${40 * sx},${-176 * sy} L${(84 + 20 * ez) * sx},${-176 * sy - 130 * ez} L${130 * sx},${-120 * sy} Z`, ec, { inner: `<path d="M${60 * sx},${-170 * sy} L${(84 + 20 * ez) * sx},${-176 * sy - 100 * ez} L${112 * sx},${-130 * sy} Z" fill="${ei}"/>` }));
  } else if (E.type === 'round' || E.type === 'tiny') {
    const r = (E.type === 'tiny' ? 30 : 58) * ez;
    out.push(circ(70 * sx, -172 * sy, r, ec, { inner: `<circle cx="${70 * sx + 4}" cy="${-168 * sy}" r="${r * 0.55}" fill="${ei}"/>` }));
  } else if (E.type === 'long') {
    out.push(part(ell(40 * sx, -180 * sy - 150 * ez, 44, 170 * ez, 8), ec, { inner: `<ellipse cx="${44 * sx}" cy="${-170 * sy - 150 * ez}" rx="22" ry="${130 * ez}" fill="${ei}" transform="rotate(8 ${44 * sx} ${-170 * sy - 150 * ez})"/>` }));
  }
  // cranium
  const cran = smooth(P([[-30, -186], [74, -174], [146, -116], [168, -40], [148, 62], [96, 146], [0, 190], [-96, 166], [-160, 88], [-176, -20], [-150, -120], [-96, -170]]), true);
  const termSh = `M-260,-300 L${-40 * sx},-300 C${-80 * sx},-120 ${-90 * sx},0 ${-50 * sx},${88 * sy} C0,${160 * sy} ${100 * sx},${160 * sy} ${200 * sx},${100 * sy} L260,400 L-260,400 Z`;
  out.push(part(cran, fur, { sh: termSh, inner: o.headInner || '' }));
  if (o.cheek !== false) out.push(part(tuft(-104 * sx, 120 * sy, 0, 184 * sy, -128 * sx, 226 * sy, 0.12), o.cheekC || fur, { sh: `M-300,0 L${-30 * sx},0 C${-40 * sx},${120 * sy} 0,${200 * sy} 60,260 L-300,260 Z` }));
  if (o.mask) out.push(part(`M${-70 * sx},-70 C0,-96 140,-96 ${208 * sx},-52 L${200 * sx},12 C130,-6 40,4 ${-70 * sx},18 Z`, o.mask, { rim: false }));
  if (o.face) out.push(o.face); // e.g. pale face patch
  // muzzle
  const M = o.muzzle || 'mid', mc = o.muzzleC || fur, line_ = mix(darken(fur, 0.32), T.ink, 0.55);
  let mouthF, mouthB, noseAt;
  if (M === 'long') {
    out.push(part(smooth([[118, -16], [200, -8], [272, 4], [298, 30], [280, 64], [224, 90], [152, 102], [106, 70], [100, 4]], true), fur, { noLine: true, rim: false, sh: 'M60,64 C140,86 220,80 310,46 L310,160 L60,160 Z', inner: o.muzzleC ? `<path d="M100,66 C160,98 230,90 296,52 L296,140 L100,140 Z" fill="${mc}"/>` : '' }));
    out.push(line('M130,-12 C190,-10 240,-4 286,10', line_), line('M300,40 C280,70 230,92 164,100', line_));
    mouthF = [292, 46]; mouthB = [176, 96]; noseAt = [290, 22];
  } else if (M === 'mid') {
    out.push(part(smooth([[110, 4], [170, 8], [214, 22], [232, 48], [214, 78], [160, 94], [112, 82], [94, 40]], true), mc, { noLine: true, rim: false, sh: 'M60,70 C130,90 190,86 240,60 L240,160 L60,160 Z' }));
    out.push(line('M124,8 C164,8 198,14 224,30', line_), line('M232,58 C216,82 182,94 132,92', line_));
    mouthF = [226, 60]; mouthB = [140, 92]; noseAt = [224, 28];
  } else if (M === 'short' || M === 'flat') {
    const big = M === 'flat';
    out.push(part(ell(146, 50, big ? 74 : 56, big ? 54 : 40), mc, { rim: false, lw: 2.4, sh: 'M60,60 C110,96 170,96 230,70 L230,140 L60,140 Z' }));
    mouthF = [200, 70]; mouthB = [150, 74]; noseAt = [176, 30];
  } else if (M === 'beak') {
    const B = o.beak || {}, L = B.len ?? 90, dr = B.droop ?? 10, bc = B.c || '#f59e0b';
    const up = `M110,-14 C${110 + L * 0.5},-14 ${110 + L * 0.9},${dr} ${110 + L},${20 + dr} C${110 + L * 0.7},${30 + dr * 0.6} ${110 + L * 0.4},34 108,40 Z`;
    const lo = `M112,40 C${110 + L * 0.4},40 ${110 + L * 0.72},${42 + dr * 0.5} ${110 + L * 0.82},${36 + dr * 0.8} C${110 + L * 0.6},${62 + (B.open || 0)} 150,${70 + (B.open || 0)} 112,62 Z`;
    out.push(part(lo, darken(bc, 0.85), { rimW: 3, lw: 2.6 }), part(up, bc, { rimW: 3, lw: 2.6, sh: `M100,${26 + dr * 0.5} L${120 + L},${26 + dr * 0.5} L${120 + L},90 L100,90 Z` }));
    out.push(fill(ell(150, -2, 14, 4, 6), '#fff', 0.5));
    if (B.tip) out.push(fill(`M${110 + L * 0.82},${10 + dr} C${110 + L * 0.95},${dr} ${110 + L},${20 + dr} ${110 + L},${20 + dr} C${110 + L * 0.9},${34 + dr * 0.5} ${110 + L * 0.8},${30 + dr} Z`, B.tip));
    mouthF = null;
  } else {
    mouthF = [214, 62]; mouthB = [70, 84];
  }
  // nose
  const N = o.nose ?? (M === 'beak' || M === 'none' ? 'none' : 'dog');
  if (N !== 'none' && noseAt) {
    const [nx, ny] = noseAt, nc = o.noseC || '#25142c';
    if (N === 'dog') out.push(part(`M${nx - 22},${ny - 4} C${nx - 4},${ny - 18} ${nx + 18},${ny - 8} ${nx + 18},${ny + 6} C${nx + 18},${ny + 20} ${nx + 4},${ny + 26} ${nx - 8},${ny + 24} C${nx - 22},${ny + 20} ${nx - 30},${ny + 6} ${nx - 22},${ny - 4} Z`, nc, { rimW: 2, lw: 2.4, sh: `M${nx - 40},${ny + 10} L${nx + 40},${ny + 10} L${nx + 40},${ny + 40} L${nx - 40},${ny + 40} Z` }), fill(ell(nx - 4, ny - 4, 7, 3.5, -10), '#fff', 0.7));
    else out.push(part(`M${nx - 14},${ny - 6} C${nx - 6},${ny - 12} ${nx + 10},${ny - 10} ${nx + 12},${ny - 4} C${nx + 10},${ny + 6} ${nx},${ny + 12} ${nx - 4},${ny + 12} C${nx - 10},${ny + 8} ${nx - 16},${ny} ${nx - 14},${ny - 6} Z`, N === 'pink' ? '#e47b9a' : nc, { rimW: 1.5, lw: 2.2 }), fill(ell(nx - 4, ny - 6, 4, 2), '#fff', 0.7));
  }
  // mouth
  const mc2 = o.mouthC || '#2b0f22';
  if (mouthF) {
    const [fx, fy] = mouthF, [bx, by] = mouthB, mx = (fx + bx) / 2;
    const m = o.mouth || mood.mouth;
    if (M === 'short' || M === 'flat') {
      const cx = noseAt[0], cy = noseAt[1] + 32;
      if (m === 'open' || m === 'smileOpen') out.push(part(`M${cx - 24},${cy} C${cx - 14},${cy + (m === 'open' ? 40 : 26)} ${cx + 14},${cy + (m === 'open' ? 40 : 26)} ${cx + 24},${cy} C${cx + 10},${cy + 6} ${cx - 10},${cy + 6} ${cx - 24},${cy} Z`, '#5a1830', { rim: false, lw: 2.6, inner: `<ellipse cx="${cx}" cy="${cy + 24}" rx="12" ry="8" fill="#ff7a9a"/>` }));
      else if (m === 'down') out.push(line(`M${cx},${cy - 14} L${cx},${cy - 4} M${cx - 22},${cy + 8} C${cx - 12},${cy} ${cx - 4},${cy - 2} ${cx},${cy - 4} C${cx + 4},${cy - 2} ${cx + 12},${cy} ${cx + 22},${cy + 8}`, mc2, 3));
      else out.push(line(`M${cx},${cy - 14} L${cx},${cy - 4} M${cx - 22},${cy} C${cx - 12},${cy + 10} ${cx - 4},${cy + 8} ${cx},${cy - 4} C${cx + 4},${cy + 8} ${cx + 12},${cy + 10} ${cx + 22},${cy}`, mc2, 3));
    } else {
      if (m === 'open' || m === 'smileOpen') {
        const drop = m === 'open' ? 46 : 26;
        out.push(part(`M${fx},${fy} C${fx - 30},${fy + 22} ${bx + 30},${by + 4} ${bx},${by} C${bx + 30},${by + drop} ${fx - 20},${fy + drop} ${fx},${fy} Z`, '#5a1830', { rim: false, lw: 2.8, inner: `<ellipse cx="${mx}" cy="${(fy + by) / 2 + drop * 0.6}" rx="30" ry="12" fill="#ff7a9a"/>` }));
      } else {
        const end = m === 'down' ? by + 10 : m === 'smirk' ? by - 14 : by - 6;
        out.push(line(`M${fx},${fy} C${fx - 20},${fy + 26} ${mx},${by + 2} ${bx + 20},${by} C${bx + 10},${by} ${bx + 4},${end} ${bx},${end}`, mc2, 3.4));
      }
    }
    if (o.fang) out.push(`<path d="M${mx + 6},${(fy + by) / 2 + 12} l6,20 l7,-21 Z" fill="#fff" stroke="${mc2}" stroke-width="2.4" stroke-linejoin="round"/>`);
  }
  if (o.whiskers) out.push(line(`M${noseAt[0] - 40},${noseAt[1] + 20} L${noseAt[0] - 110},${noseAt[1] + 10} M${noseAt[0] - 40},${noseAt[1] + 30} L${noseAt[0] - 104},${noseAt[1] + 40}`, lighten(fur, 0.6), 2, 0.7));
  // near ear
  if (E.type === 'floppy') {
    const L = E.len ?? 1;
    out.push(part(`M-80,-138 C-140,-140 -182,-70 -196,20 C-208,${100 * L} -200,${170 * L} -178,${222 * L} L-160,${194 * L} L-148,${232 * L} L-126,${198 * L} L-104,${226 * L} C-82,${166 * L} -68,80 -66,0 C-64,-70 -54,-114 -80,-138 Z`, ec, { sh: `M-260,-160 L-140,-160 C-160,-20 -150,${120 * L} -120,${260 * L} L-260,${260 * L} Z` }));
    out.push(line(`M-120,-70 C-140,20 -146,${110 * L} -136,${180 * L}`, darken(ec, 0.55), 2.4, 0.6));
  } else if (E.type === 'pointy') {
    out.push(part(`M${-150 * sx},${-110 * sy} L${(-110 - 10 * ez) * sx},${-150 * sy - 150 * ez} L${-20 * sx},${-180 * sy} Z`, ec, { sh: `M-300,-400 L${-110 * sx},-400 L${-90 * sx},-100 L-300,-100 Z`, inner: `<path d="M${-128 * sx},${-122 * sy} L${(-110 - 10 * ez) * sx},${-150 * sy - 118 * ez} L${-46 * sx},${-170 * sy} Z" fill="${ei}"/>` }));
  } else if (E.type === 'round' || E.type === 'tiny') {
    const r = (E.type === 'tiny' ? 34 : 66) * ez;
    out.push(circ(-112 * sx, -150 * sy, r, ec, { inner: `<circle cx="${-108 * sx}" cy="${-146 * sy}" r="${r * 0.55}" fill="${ei}"/>`, sh: `M-300,-400 L${-112 * sx - r * 0.2},-400 L${-112 * sx - r * 0.2},0 L-300,0 Z` }));
  } else if (E.type === 'long') {
    out.push(part(ell(-70 * sx, -180 * sy - 160 * ez, 48, 180 * ez, -10), ec, { inner: `<ellipse cx="${-66 * sx}" cy="${-170 * sy - 160 * ez}" rx="24" ry="${140 * ez}" fill="${ei}" transform="rotate(-10 ${-66 * sx} ${-170 * sy - 160 * ez})"/>`, sh: `M-300,-700 L${-90 * sx},-700 L${-90 * sx},0 L-300,0 Z` }));
  }
  // fringe
  const fr = o.fringe ?? 'tufts', fc = o.fringeC || fur;
  if (fr === 'tufts' || fr === 'spiky') {
    const sp = fr === 'spiky' ? 1.35 : 1;
    out.push(part(tuft(-60 * sx, -164 * sy, 20 * sx, -178 * sy, 40 * sx, -178 * sy + 108 * sp, -0.22), fc));
    out.push(part(tuft(10 * sx, -178 * sy, 90 * sx, -158 * sy, 120 * sx, -158 * sy + 76 * sp, -0.25), fc));
    out.push(part(tuft(-100 * sx, -150 * sy, -40 * sx, -170 * sy, -48 * sx, -170 * sy + 100 * sp, 0.12), fc, { sh: `M-300,-300 L${-70 * sx},-300 L${-70 * sx},0 L-300,0 Z` }));
  }
  if (o.ahoge !== false && fr !== 'none') out.push(part(tuft(-30 * sx, -184 * sy, 10 * sx, -182 * sy, 48 * sx, -236 * sy, -0.4), fc));
  if (fr !== 'none' && o.shine !== false) out.push(shine([[-24 * sx, -138 * sy, 8], [0, -142 * sy, 14], [24 * sx, -142 * sy, 20], [48 * sx, -138 * sy, 28]], o.shineC || lighten(fur, 0.7), 0.6, 9));
  // eyes
  const lash = o.lash || T.ink, iris = o.iris || '#e5902f';
  const ex = o.eyeX || [40, 150], ey = o.eyeY || [-26, -44];
  const ew = o.eyeW || 104, eh = o.eyeH || 82;
  if (o.eyeBack) out.push(o.eyeBack);
  const eo = { open: mood.open, iris, look: mood.look || [0, 0], lid: mood.lid, sparkle: mood.sparkle, lash };
  out.push(eye(ex[0], ey[0], ew, eh, { ...eo, side: -1, tilt: 10 }));
  if (o.farEye !== false) out.push(eye(ex[1], ey[1], ew * 0.44, eh * 0.86, { ...eo, side: 1, irisW: 0.42, tilt: 8, lashW: 6, look: [(mood.look?.[0] ?? 0) * 0.4, mood.look?.[1] ?? 0] }));
  const bc = o.browC || darken(furDk, 0.5);
  const by0 = ey[0] - eh * 0.75;
  if (o.brows !== false) {
    if (mood.brow === 'worried') out.push(line(`M${ex[0] - 46},${by0 + 8} Q${ex[0]},${by0 - 2} ${ex[0] + 44},${by0 - 18}`, bc, 5));
    else if (mood.brow === 'angry') out.push(line(`M${ex[0] - 46},${by0 - 16} Q${ex[0]},${by0 - 8} ${ex[0] + 44},${by0 + 10}`, bc, 6));
    else if (mood.brow === 'flat') out.push(line(`M${ex[0] - 46},${by0 - 4} L${ex[0] + 44},${by0 + 2}`, bc, 5));
    else out.push(line(`M${ex[0] - 46},${by0} Q${ex[0]},${by0 - 10} ${ex[0] + 44},${by0 - 4}`, bc, 5));
  }
  if (o.blush !== false) out.push(blushHatch(ex[0] - 6, ey[0] + 70, o.blushC || '#ff6fa5', 0.55));
  if (o.tear ?? mood.tear) out.push(`<path d="M${ex[0] + 36},${ey[0] + 50} C${ex[0] + 44},${ey[0] + 66} ${ex[0] + 44},${ey[0] + 78} ${ex[0] + 36},${ey[0] + 82} C${ex[0] + 28},${ey[0] + 78} ${ex[0] + 28},${ey[0] + 66} ${ex[0] + 36},${ey[0] + 50} Z" fill="#cffafe" opacity="0.9"/>`);
  out.push(o.front || '');
  T.key = saveKey;
  return `<g transform="translate(${o.x} ${o.y}) rotate(${o.tilt || 0}) scale(${f * s} ${s})">${out.join('\n')}</g>`;
}

// ---------------------------------------------------------------- bust
// f: facing (1 = light from the right, so the body's left side is in shadow)
export function bust(o) {
  const f = o.f ?? 1, c = o.c, c2 = o.c2 || '#f1e9ff', out = [];
  const shT = f === 1 ? undefined : MIRROR;
  const body = 'M110,1024 C120,900 170,800 270,748 C340,712 420,696 512,694 C604,696 684,712 754,748 C854,800 904,900 914,1024 Z';
  const bodySh = 'M0,690 L420,690 C400,800 420,900 480,1024 L0,1024 Z';
  const K = o.kind || 'jacket';
  if (K === 'hoodie') out.push(part('M320,724 C330,630 694,630 704,724 C690,780 334,780 320,724 Z', darken(c, 0.82), { sh: bodySh, shT }));
  const neckC = o.neck || o.fur;
  if (neckC) out.push(part('M448,520 C456,600 450,660 444,712 L580,712 C574,660 568,600 576,520 Z', neckC, { sh: 'M400,500 L480,500 C470,600 480,660 500,720 L400,720 Z', shT }));
  out.push(part(body, c, { sh: bodySh, shT, inner: o.pattern || '' }));
  if (K === 'jacket' || K === 'cardigan' || K === 'coat') {
    out.push(part('M440,700 L584,700 L560,870 L512,920 L464,870 Z', c2, { sh: 'M400,690 L500,690 L500,940 L400,940 Z', shT }));
    if (K === 'cardigan') for (const y of [800, 860, 920]) out.push(circ(512 + (y - 740) * 0.2, y, 8, o.c3 || '#e7d3b0', { rimW: 2, lw: 2 }));
    const lap = K === 'coat' ? 1.4 : 1;
    out.push(part(`M430,704 L${512 - 220 * lap},748 C${512 - 230 * lap},820 330,900 380,990 L476,870 L432,780 Z`, darken(c, 0.78), { sh: 'M250,700 L400,700 C380,800 400,900 420,1000 L250,1000 Z', shT }));
    out.push(part(`M594,704 L${512 + 220 * lap},748 C${512 + 230 * lap},820 694,900 644,990 L548,870 L592,780 Z`, darken(c, 0.78), { sh: 'M250,700 L400,700 C380,800 400,900 420,1000 L250,1000 Z', shT }));
  } else if (K === 'sweater') {
    out.push(part('M390,700 C400,650 624,650 634,700 C644,740 614,768 512,770 C410,768 380,740 390,700 Z', lighten(c, 0.08), { sh: 'M340,640 L470,640 L470,780 L340,780 Z', shT, inner: [410, 450, 490, 530, 570, 610].map(x => line(`M${x},680 L${x + 4},760`, darken(c, 0.55), 3, 0.5)).join('') }));
  } else if (K === 'tee' || K === 'hoodie' || K === 'vest') {
    out.push(part('M440,700 C450,750 574,750 584,700 C590,720 570,770 512,772 C454,770 434,720 440,700 Z', darken(c, 0.8), { rim: false }));
    if (o.print) out.push(o.print);
    if (K === 'hoodie') out.push(line('M480,760 C478,800 486,840 482,880', '#f5f5f5', 5), line('M544,760 C546,800 538,840 542,880', '#f5f5f5', 5));
    if (K === 'vest') {
      const v = o.vest || '#3b5b8c';
      out.push(part('M150,1024 C160,900 210,790 300,740 C360,712 420,700 450,700 L470,860 L420,1024 Z', v, { sh: bodySh, shT }));
      out.push(part('M874,1024 C864,900 814,790 724,740 C664,712 604,700 574,700 L554,860 L604,1024 Z', v));
      (o.pins || []).forEach(([x, y, pc]) => out.push(circ(x, y, 16, pc, { rimW: 2, lw: 2.4, inner: `<circle cx="${x - 4}" cy="${y - 4}" r="5" fill="#fff" opacity="0.7"/>` })));
    }
  } else if (K === 'cape') {
    out.push(part('M340,740 L210,500 C290,540 360,560 420,640 Z', c2), part('M684,740 L814,500 C734,540 664,560 604,640 Z', c2, { sh: 'M650,480 L860,480 L860,760 L650,760 Z' }));
  } else if (K === 'bare') {
    out.push(part('M420,650 C430,710 452,770 478,812 L496,770 L512,834 L530,770 L548,812 C574,770 594,710 604,650 C560,676 464,676 420,650 Z', c2, { sh: 'M400,640 C470,700 560,700 620,640 L620,600 L400,600 Z' }));
  }
  if (o.scarf) out.push(part('M400,690 C420,650 604,650 624,690 C640,730 600,770 512,772 C424,770 384,730 400,690 Z', o.scarf, { sh: 'M340,640 L470,640 L470,780 L340,780 Z', shT }), part('M560,750 L610,750 L630,920 L570,930 Z', o.scarf, { sh: 'M560,750 L585,750 L590,930 L560,930 Z' }));
  if (o.headphones) out.push(line('M372,700 C382,764 642,764 652,700', '#1f1a2a', 16), line('M372,700 C382,764 642,764 652,700', o.headphones, 7), part(ell(372, 690, 36, 46, -18), '#26203a', { rimW: 4, inner: `<ellipse cx="372" cy="690" rx="22" ry="30" fill="${o.headphones}" transform="rotate(-18 372 690)"/>` }), part(ell(652, 690, 36, 46, 18), '#26203a', { rimW: 4, inner: `<ellipse cx="652" cy="690" rx="22" ry="30" fill="${o.headphones}" transform="rotate(18 652 690)"/>` }));
  return out.join('\n');
}
// shadow the head drops on the neck/collar
export const neckCast = (x = 512, op = 0.7) => cast(`M${x - 112},590 C${x - 90},690 ${x - 40},730 ${x + 8},734 C${x + 70},730 ${x + 110},680 ${x + 120},590 Z`, op);

// ---------------------------------------------------------------- props
export function headphonesOn(x, y, r, c = '#e5e7eb', cup = '#26203a') {
  return line(`M${x - r},${y} C${x - r * 1.05},${y - r * 1.5} ${x + r * 1.05},${y - r * 1.5} ${x + r},${y}`, '#1a1626', 26) + line(`M${x - r},${y} C${x - r * 1.05},${y - r * 1.5} ${x + r * 1.05},${y - r * 1.5} ${x + r},${y}`, c, 12)
    + part(ell(x - r, y + 10, r * 0.24, r * 0.34), cup, { rimW: 4, inner: `<ellipse cx="${x - r}" cy="${y + 10}" rx="${r * 0.14}" ry="${r * 0.24}" fill="${c}"/>` })
    + part(ell(x + r, y + 10, r * 0.24, r * 0.34), cup, { rimW: 4, inner: `<ellipse cx="${x + r}" cy="${y + 10}" rx="${r * 0.14}" ry="${r * 0.24}" fill="${c}"/>` });
}
export const earbud = (x, y) => part(ell(x, y, 14, 16), '#f4f4f8', { rimW: 2, lw: 2.4 }) + line(`M${x + 2},${y + 14} C${x + 6},${y + 60} ${x - 10},${y + 120} ${x},${y + 200}`, '#f4f4f8', 3, 0.9);
export function phone(x, y, rot = 0, screen = '#7dd3fc', s = 1) {
  return g(x, y, s, rot, `${glow(0, 0, 90, screen, 0.5)}${part('M-44,-80 L44,-80 C52,-80 56,-76 56,-68 L56,68 C56,76 52,80 44,80 L-44,80 C-52,80 -56,76 -56,68 L-56,-68 C-56,-76 -52,-80 -44,-80 Z', '#1d2233', { rimW: 3 })}<rect x="-46" y="-70" width="92" height="140" rx="6" fill="${screen}"/><rect x="-36" y="-56" width="72" height="72" rx="4" fill="${lighten(screen, 0.4)}" opacity="0.8"/><rect x="-36" y="26" width="56" height="6" rx="3" fill="#fff" opacity="0.8"/><rect x="-36" y="40" width="40" height="5" rx="2.5" fill="#fff" opacity="0.5"/>`);
}
export function sleeve(x, y, s = 1, rot = 0, c = '#e7c6a7', art = ['#0f766e', '#fb7185', '#fde68a']) {
  return g(x, y, s, rot, part('M-150,-150 L150,-150 L150,150 L-150,150 Z', c, { sh: 'M-160,40 L160,90 L160,160 L-160,160 Z', inner: `<circle cx="30" cy="-20" r="96" fill="${art[0]}"/><circle cx="30" cy="-20" r="60" fill="${art[1]}"/><circle cx="30" cy="-20" r="22" fill="${art[2]}"/>` }));
}
export function record(x, y, rx, ry, label = '#f43f5e') {
  return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#0e0b14" stroke="#3b3448" stroke-width="3"/>${[0.85, 0.7, 0.55].map(k => `<ellipse cx="${x}" cy="${y}" rx="${rx * k}" ry="${ry * k}" fill="none" stroke="#fff" stroke-opacity="0.09" stroke-width="2"/>`).join('')}<ellipse cx="${x}" cy="${y}" rx="${rx * 0.3}" ry="${ry * 0.3}" fill="${label}"/><path d="M${x - rx * 0.8},${y - ry * 0.3} A${rx * 0.85},${ry * 0.85} 0 0,1 ${x - rx * 0.1},${y - ry * 0.85}" fill="none" stroke="#fff" stroke-opacity="0.3" stroke-width="4" stroke-linecap="round"/>`;
}
export function cassette(x, y, s = 1, rot = 0, c = '#f97316') {
  return g(x, y, s, rot, part('M-90,-56 L90,-56 C96,-56 100,-52 100,-46 L100,46 C100,52 96,56 90,56 L-90,56 C-96,56 -100,52 -100,46 L-100,-46 C-100,-52 -96,-56 -90,-56 Z', c, { rimW: 4 }) + `<rect x="-70" y="-38" width="140" height="48" rx="8" fill="#fff6e8"/><circle cx="-38" cy="-14" r="15" fill="#2a2433"/><circle cx="38" cy="-14" r="15" fill="#2a2433"/><circle cx="-38" cy="-14" r="6" fill="#fff6e8"/><circle cx="38" cy="-14" r="6" fill="#fff6e8"/><path d="M-56,54 L-44,30 L44,30 L56,54" fill="${darken(c, 0.7)}"/>`);
}
export function mic(x, y, s = 1, rot = 0, c = '#a1a1aa') {
  return g(x, y, s, rot, part('M-14,40 L14,40 L10,200 L-10,200 Z', '#1f1a2a', { rimW: 3 }) + part(ell(0, 0, 44, 54), c, { inner: [-28, -12, 4, 20, 36].map(d => `<line x1="-50" y1="${d}" x2="50" y2="${d}" stroke="${darken(c, 0.5)}" stroke-width="3"/>`).join('') }));
}
export function lighter(x, y, s = 1, rot = 0) {
  return g(x, y, s, rot, `${glow(0, -70, 70, '#fb923c', 0.8)}${part('M-20,-20 L20,-20 L20,60 L-20,60 Z', '#dc2626', { rimW: 3 })}${part('M-20,-34 L20,-34 L20,-20 L-20,-20 Z', '#d4d4d8', { rimW: 2 })}<path d="M0,-110 C18,-80 16,-50 0,-40 C-16,-50 -18,-80 0,-110 Z" fill="#fdba74"/><path d="M0,-80 C8,-66 7,-54 0,-50 C-7,-54 -8,-66 0,-80 Z" fill="#fffbe6"/>`);
}
export function radio(x, y, s = 1, c = '#d6a46a', rot = 0) {
  return g(x, y, s, rot, line('M40,-60 L100,-160', '#9ca3af', 6) + part('M-110,-60 L110,-60 C120,-60 126,-54 126,-44 L126,54 C126,64 120,70 110,70 L-110,70 C-120,70 -126,64 -126,54 L-126,-44 C-126,-54 -120,-60 -110,-60 Z', c, { rimW: 4 })
    + `<circle cx="-56" cy="5" r="44" fill="${darken(c, 0.55)}"/>${[-24, -8, 8, 24].map(d => `<line x1="-94" y1="${5 + d}" x2="-18" y2="${5 + d}" stroke="${darken(c, 0.35)}" stroke-width="3"/>`).join('')}<rect x="20" y="-34" width="84" height="34" rx="6" fill="#fde68a"/><line x1="58" y1="-32" x2="58" y2="-2" stroke="#dc2626" stroke-width="3"/><circle cx="40" cy="36" r="13" fill="${lighten(c, 0.4)}"/><circle cx="86" cy="36" r="13" fill="${lighten(c, 0.4)}"/>`);
}
export const note = (x, y, s, c, rot = 0) => g(x, y, s, rot, `<path d="M14,-4 L14,-62 C30,-52 40,-44 36,-24" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="17" ry="12" transform="rotate(-25)" fill="${c}"/>`);

// ---------------------------------------------------------------- scenes
// Each returns background SVG. p = palette overrides.
export function sky(top, bottom, id = 'skyG') {
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#${id})"/>`;
}
export function stars(seed, n, box = [0, 0, 1024, 600]) {
  const R = rng(seed), out = [];
  for (let i = 0; i < n; i++) { const x = box[0] + R() * (box[2] - box[0]), y = box[1] + R() * (box[3] - box[1]); out.push(R() < 0.1 ? sparkle(x, y, 6 + R() * 6, '#fff', 0.8) : `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(0.8 + R() * 1.8).toFixed(1)}" fill="#fff" opacity="${(0.3 + R() * 0.6).toFixed(2)}"/>`); }
  return out.join('');
}
export function moon(x, y, r, c = '#f5f7ff', halo = '#c7d2fe', crescent = false) {
  return glow(x, y, r * 2, halo, 0.6) + `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>` + (crescent ? `<circle cx="${x + r * 0.45}" cy="${y - r * 0.2}" r="${r * 0.92}" fill="${crescent}"/>` : `<circle cx="${x - r * 0.3}" cy="${y - r * 0.2}" r="${r * 0.16}" fill="${halo}" opacity="0.6"/><circle cx="${x + r * 0.3}" cy="${y + r * 0.3}" r="${r * 0.22}" fill="${halo}" opacity="0.5"/>`);
}
export function skyline(seed, base, color, lit, h = [120, 360], op = 1) {
  const R = rng(seed), out = [];
  let x = -20;
  while (x < 1044) {
    const w = 50 + R() * 90, hh = h[0] + R() * (h[1] - h[0]);
    out.push(`<rect x="${x.toFixed(0)}" y="${(base - hh).toFixed(0)}" width="${w.toFixed(0)}" height="${(hh + 400).toFixed(0)}" fill="${color}" opacity="${op}"/>`);
    for (let wy = base - hh + 16; wy < base - 10; wy += 22) for (let wx = x + 10; wx < x + w - 12; wx += 18) if (R() < 0.22) out.push(`<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="8" height="10" fill="${lit[Math.floor(R() * lit.length)]}" opacity="${(0.5 + R() * 0.5).toFixed(2)}"/>`);
    x += w + 4;
  }
  return out.join('');
}
export function clouds(seed, n, color, box = [0, 0, 1024, 700], op = 0.5) {
  const R = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const x = box[0] + R() * (box[2] - box[0]), y = box[1] + R() * (box[3] - box[1]), w = 160 + R() * 260;
    out.push(`<g opacity="${op}">${[0, 1, 2, 3].map(k => `<ellipse cx="${(x + (k - 1.5) * w * 0.28).toFixed(0)}" cy="${(y - (k % 2) * 18).toFixed(0)}" rx="${(w * 0.26).toFixed(0)}" ry="${(30 + (k % 2) * 16).toFixed(0)}" fill="${color}"/>`).join('')}<rect x="${(x - w * 0.55).toFixed(0)}" y="${y.toFixed(0)}" width="${(w * 1.1).toFixed(0)}" height="26" rx="13" fill="${color}"/></g>`);
  }
  return out.join('');
}
export function trees(seed, base, color, n = 9, h = [260, 520]) {
  const R = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 1100 - 40 + (R() * 60 - 30), hh = h[0] + R() * (h[1] - h[0]), w = 70 + R() * 70;
    out.push(`<path d="M${x},${base - hh} L${x + w},${base} L${x - w},${base} Z" fill="${color}"/><path d="M${x},${base - hh + 60} L${x + w * 1.2},${base + 60} L${x - w * 1.2},${base + 60} Z" fill="${color}"/><rect x="${x - 8}" y="${base}" width="16" height="400" fill="${color}"/>`);
  }
  return out.join('');
}
export function fireflies(seed, n, c = '#fde68a', box = [0, 300, 1024, 1024]) {
  const R = rng(seed), out = [];
  for (let i = 0; i < n; i++) { const x = box[0] + R() * (box[2] - box[0]), y = box[1] + R() * (box[3] - box[1]), r = 2 + R() * 4; out.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(r * 4).toFixed(0)}" fill="${c}" opacity="0.25" filter="url(#soft4)"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="#fffbe6"/>`); }
  return out.join('');
}
export function spot(x, y, angle, color, len = 1300, spread = 9, op = 0.22) {
  const a1 = (angle - spread) * Math.PI / 180, a2 = (angle + spread) * Math.PI / 180;
  return `<path d="M${x},${y} L${x + Math.cos(a1) * len},${y + Math.sin(a1) * len} L${x + Math.cos(a2) * len},${y + Math.sin(a2) * len} Z" fill="${color}" opacity="${op}" filter="url(#soft4)" style="mix-blend-mode:screen"/>`;
}
export function crowd(seed, base, color, n = 18) {
  const R = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const x = i * (1100 / n) - 30 + R() * 30, hy = base - 40 - R() * 60;
    out.push(`<circle cx="${x.toFixed(0)}" cy="${hy.toFixed(0)}" r="${(26 + R() * 10).toFixed(0)}" fill="${color}"/><rect x="${(x - 46).toFixed(0)}" y="${(hy + 22).toFixed(0)}" width="92" height="300" rx="36" fill="${color}"/>`);
    if (R() < 0.35) out.push(line(`M${x + 30},${hy + 40} L${x + 60 + R() * 30},${hy - 90 - R() * 60}`, color, 22));
  }
  return out.join('');
}
export function shelves(seed, x0, x1, y0, rows, color = '#2b1d16', op = 0.6) {
  const R = rng(seed), out = [];
  for (let r = 0; r < rows; r++) {
    const y = y0 + r * 190;
    let x = x0;
    while (x < x1) { const w = 12 + R() * 14, h = 120 + R() * 50; out.push(`<rect x="${x.toFixed(0)}" y="${(y + 170 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${['#7c2d12', '#be185d', '#1d4ed8', '#ca8a04', '#065f46', '#7e22ce', '#334155'][Math.floor(R() * 7)]}" opacity="${op}"/>`); x += w + 2; }
    out.push(`<rect x="${x0 - 10}" y="${y + 170}" width="${x1 - x0 + 20}" height="14" fill="${color}"/>`);
  }
  return out.join('');
}
export function water(seed, y0, base, refl, n = 30) {
  const R = rng(seed), out = [`<rect x="0" y="${y0}" width="1024" height="${1024 - y0}" fill="${base}"/>`];
  for (let i = 0; i < n; i++) { const y = y0 + 10 + R() * (1024 - y0), w = 40 + R() * 200, x = R() * 1024; out.push(`<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${(2 + R() * 4).toFixed(0)}" rx="2" fill="${refl[Math.floor(R() * refl.length)]}" opacity="${(0.2 + R() * 0.5).toFixed(2)}"/>`); }
  return out.join('');
}
export function window_(x, y, w, h, inner, frame = '#130f20') {
  const cid = `win${x}${y}`;
  return `<defs><clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#${cid})">${inner}</g><path d="M${x - 14},${y - 14} L${x + w + 14},${y - 14} L${x + w + 14},${y + h + 14} L${x - 14},${y + h + 14} Z M${x},${y} L${x},${y + h} L${x + w},${y + h} L${x + w},${y} Z" fill="${frame}" fill-rule="evenodd"/><rect x="${x + w / 2 - 6}" y="${y}" width="12" height="${h}" fill="${frame}"/><rect x="${x}" y="${y + h / 2 - 6}" width="${w}" height="12" fill="${frame}"/>`;
}
export function fairyLights(seed, y, colors, sag = 50) {
  const R = rng(seed), out = [line(`M-20,${y} Q256,${y + sag} 512,${y} Q768,${y + sag} 1044,${y}`, '#1f1a2a', 2.4)];
  for (let i = 0; i < 22; i++) { const t = i / 21, x = -20 + t * 1064, yy = y + Math.sin((t * 2) % 1 * Math.PI) * sag * 0.75; const c = colors[i % colors.length]; out.push(glow(x, yy + 6, 16, c, 0.8), `<circle cx="${x.toFixed(0)}" cy="${(yy + 6).toFixed(0)}" r="5" fill="${lighten(c, 0.6)}"/>`); }
  return out.join('');
}
