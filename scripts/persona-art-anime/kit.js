// Moody anime kit: thin tinted line art, hard two-step cel shadows, coloured rim light,
// glossy layered eyes, painted atmospheric backdrops, bloom + colour grade.
let uid = 0;
export const id = p => `${p}${++uid}`;

function hex(c) { c = c.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join(''); return [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16)); }
function toHex(a) { return '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
export const darken = (c, k) => toHex(hex(c).map(v => v * k));
export const mix = (c1, c2, t) => { const a = hex(c1), b = hex(c2); return toHex(a.map((v, i) => v + (b[i] - v) * t)); };
export const lighten = (c, t) => mix(c, '#ffffff', t);

export function ell(cx, cy, rx, ry, deg = 0) {
  const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  const x1 = cx - rx * c, y1 = cy - rx * s, x2 = cx + rx * c, y2 = cy + rx * s;
  return `M${x1},${y1} A${rx},${ry} ${deg} 1,0 ${x2},${y2} A${rx},${ry} ${deg} 1,0 ${x1},${y1} Z`;
}
export function smooth(pts, closed = false) {
  const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M${P[1][0]},${P[1][1]}`;
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return closed ? d + ' Z' : d;
}
// pointed tuft / lock shape: from base a to base b, out to tip, with a bit of curl
export function tuft(ax, ay, bx, by, tx, ty, bend = 0.25) {
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  const nx = -(ty - my) * bend, ny = (tx - mx) * bend;
  return `M${ax},${ay} Q${(ax + tx) / 2 + nx},${(ay + ty) / 2 + ny} ${tx},${ty} Q${(bx + tx) / 2 + nx * 0.6},${(by + ty) / 2 + ny * 0.6} ${bx},${by} Z`;
}

// Scene lighting, set per character.
export const T = { key: [-20, -16], shadow: '#2a2456', rim: '#7dd3fc', rimW: 6, ink: '#1a1230', deep: 0.6 };
export const theme = o => Object.assign(T, o);

// Filled cel part. Shadow is either the shape shifted against the key light, or a drawn
// terminator shape (o.sh). Rim light is a sliver on the side away from the key.
export function part(d, base, o = {}) {
  const shade = o.shade || mix(darken(base, T.deep), T.shadow, 0.38);
  const ink = o.ink || mix(darken(base, 0.32), T.ink, 0.55);
  const ks = o.k ?? 1, [kx, ky] = (o.key || T.key).map(v => v * ks);
  const rimW = o.rim === false ? 0 : (o.rimW ?? T.rimW);
  const kl = Math.hypot(kx, ky) || 1;
  const cid = id('c'), mid = id('m');
  const shadowLayer = o.sh
    ? `<path d="${d}" fill="${base}"/><path d="${o.sh}" fill="${shade}" ${o.shT ? `transform="${o.shT}"` : ''}/>`
    : `<path d="${d}" fill="${shade}"/><path d="${d}" fill="${base}" transform="translate(${kx},${ky})"/>`;
  const rim = rimW ? `<mask id="${mid}" maskUnits="userSpaceOnUse" x="-200" y="-200" width="1424" height="1424"><path d="${d}" fill="#fff"/><path d="${d}" fill="#000" transform="translate(${kx / kl * rimW},${ky / kl * rimW})"/></mask><path d="${d}" fill="${o.rimC || T.rim}" mask="url(#${mid})" opacity="${o.rimOp ?? 0.95}"/>` : '';
  return `<g>
  <clipPath id="${cid}"><path d="${d}"/></clipPath>
  <g clip-path="url(#${cid})">
    ${shadowLayer}
    ${o.inner || ''}
    <path d="${d}" fill="url(#airbrush)"/>
  </g>
  ${rim}
  ${o.noLine ? '' : `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${o.lw || 3.2}" stroke-linejoin="round"/>`}
</g>`;
}
export const line = (d, color, w = 3.2, op = 1) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/>`;
export const fill = (d, color, op = 1, extra = '') => `<path d="${d}" fill="${color}" opacity="${op}" ${extra}/>`;
export const glow = (cx, cy, r, color, op = 0.6) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${op}" filter="url(#soft)"/>`;
export const g = (x, y, s, rot, inner) => `<g transform="translate(${x} ${y}) rotate(${rot || 0}) scale(${s || 1})">${inner}</g>`;

// Anime eye. open: 1 = wide, 0.55 = heavy-lidded, 0 = closed (draws a lash curve).
// side: -1 left eye (outer corner on the left), 1 right eye.
export function eye(x, y, w, h, o = {}) {
  const side = o.side ?? -1, open = o.open ?? 1, iris = o.iris || '#7c3aed';
  const lash = o.lash || T.ink, skin = o.skin || '#000';
  const ox = x + side * w / 2, ix = x - side * w / 2; // outer, inner corners
  const tilt = o.tilt ?? 6; // outer corner raised by tilt px
  const oy = y - tilt, iy = y + tilt * 0.3;
  if (open <= 0.05) {
    const d = `M${ix},${iy} Q${x},${y + h * 0.35} ${ox},${oy}`;
    return line(d, lash, 6) + line(`M${ox},${oy} l${side * 10},${-6}`, lash, 4);
  }
  const top = y - h * open * 0.95, bot = y + h * 0.5;
  const shape = `M${ix},${iy} C${ix + side * w * 0.12},${top} ${ox - side * w * 0.18},${top} ${ox},${oy} C${ox - side * w * 0.12},${bot} ${ix + side * w * 0.2},${bot} ${ix},${iy} Z`;
  const cid = id('e'), gid = id('ig');
  const lx = (o.look?.[0] ?? 0), ly = (o.look?.[1] ?? 0);
  const icx = x + lx, icy = y + h * 0.1 + ly, irx = w * (o.irisW ?? 0.34), iry = h * (o.irisH ?? 0.64);
  const out = [];
  out.push(`<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${darken(iris, 0.28)}"/><stop offset="0.5" stop-color="${iris}"/><stop offset="1" stop-color="${lighten(iris, 0.55)}"/></linearGradient></defs>`);
  out.push(`<clipPath id="${cid}"><path d="${shape}"/></clipPath>`);
  out.push(`<path d="${shape}" fill="#f4eef9"/>`);
  out.push(`<g clip-path="url(#${cid})">
    <ellipse cx="${icx}" cy="${icy}" rx="${irx}" ry="${iry}" fill="url(#${gid})" stroke="${darken(iris, 0.25)}" stroke-width="2.5"/>
    <ellipse cx="${icx}" cy="${icy + iry * 0.05}" rx="${irx * 0.45}" ry="${iry * 0.55}" fill="${darken(iris, 0.18)}"/>
    <path d="M${icx - irx * 0.75},${icy + iry * 0.35} Q${icx},${icy + iry * 0.85} ${icx + irx * 0.75},${icy + iry * 0.35}" fill="none" stroke="${lighten(iris, 0.75)}" stroke-width="3" opacity="0.8"/>
    <path d="M${ix - 20},${top - 40} L${ox + 20},${top - 40} L${ox + 20},${y - h * open * 0.45} Q${x},${y - h * open * 0.2} ${ix - 20},${y - h * open * 0.45} Z" fill="${mix(T.shadow, '#000', 0.2)}" opacity="0.45"/>
    <ellipse cx="${icx - irx * 0.35}" cy="${icy - iry * 0.42}" rx="${irx * 0.32}" ry="${iry * 0.24}" fill="#fff" transform="rotate(-20 ${icx - irx * 0.35} ${icy - iry * 0.42})"/>
    <circle cx="${icx + irx * 0.4}" cy="${icy + iry * 0.4}" r="${irx * 0.13}" fill="#fff" opacity="0.9"/>
    ${o.sparkle ? `<circle cx="${icx + irx * 0.1}" cy="${icy - iry * 0.6}" r="${irx * 0.09}" fill="#fff"/>` : ''}
  </g>`);
  // upper lash: thick tapered stroke + wing flick
  out.push(`<path d="M${ix},${iy + 2} C${ix + side * w * 0.12},${top - 2} ${ox - side * w * 0.18},${top - 2} ${ox + side * 6},${oy - 2}" fill="none" stroke="${lash}" stroke-width="${o.lashW || 8}" stroke-linecap="round"/>`);
  out.push(`<path d="M${ox - side * 4},${oy} l${side * 18},${-10} l${-side * 6},${12} Z" fill="${lash}"/>`);
  out.push(line(`M${ox - side * 6},${oy + h * 0.3} Q${x + side * w * 0.1},${bot + 2} ${x - side * w * 0.15},${bot - 2}`, lash, 2.6, 0.7));
  if (o.lid) out.push(line(`M${ix + side * 6},${top - 10} Q${x},${top - 22} ${ox - side * 2},${oy - 14}`, lash, 2.4, 0.5));
  return out.join('');
}
// cast shadow (multiplied), e.g. head onto neck
export const cast = (d, op = 0.55, c) => `<path d="${d}" fill="${c || T.shadow}" opacity="${op}" style="mix-blend-mode:multiply"/>`;
// anime hair shine band: a row of small lit wedges
export function shine(pts, c = '#fff', op = 0.55, w = 10) {
  return pts.map(([x, y, a]) => `<path d="M${x},${y} l${w * 0.5},${-w * 1.6} l${w * 0.5},${w * 1.6} l${-w * 0.5},${w * 0.9} Z" fill="${c}" opacity="${op}" transform="rotate(${a || 0} ${x} ${y})"/>`).join('');
}
export const brow = (x1, y1, x2, y2, c = T.ink, w = 5) => line(`M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 8} ${x2},${y2}`, c, w);
export const blushHatch = (x, y, c = '#ff7a9a', op = 0.6) =>
  `<ellipse cx="${x}" cy="${y}" rx="30" ry="12" fill="${c}" opacity="${op * 0.45}" filter="url(#soft4)"/>` +
  [0, 1, 2].map(i => line(`M${x - 14 + i * 12},${y + 5} l8,-11`, c, 2.4, op)).join('');
export const sparkle = (x, y, r, c = '#fff', op = 1) => `<path d="M${x},${y - r} Q${x + r * 0.12},${y - r * 0.12} ${x + r},${y} Q${x + r * 0.12},${y + r * 0.12} ${x},${y + r} Q${x - r * 0.12},${y + r * 0.12} ${x - r},${y} Q${x - r * 0.12},${y - r * 0.12} ${x},${y - r} Z" fill="${c}" opacity="${op}"/>`;

// seeded rng for scatter
export function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

export function motes(seed, n, color, box = [0, 0, 1024, 1024], size = [2, 6]) {
  const r = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const x = box[0] + r() * (box[2] - box[0]), y = box[1] + r() * (box[3] - box[1]), s = size[0] + r() * (size[1] - size[0]);
    out.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s.toFixed(1)}" fill="${color}" opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`);
  }
  return out.join('');
}
export function bokeh(seed, n, colors, box = [0, 0, 1024, 1024], size = [14, 46]) {
  const r = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const x = box[0] + r() * (box[2] - box[0]), y = box[1] + r() * (box[3] - box[1]), s = size[0] + r() * (size[1] - size[0]);
    const c = colors[Math.floor(r() * colors.length)];
    out.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s.toFixed(0)}" fill="${c}" opacity="${(0.12 + r() * 0.3).toFixed(2)}" stroke="${c}" stroke-opacity="0.5" stroke-width="2"/>`);
  }
  return `<g filter="url(#soft4)">${out.join('')}</g>`;
}
export function rain(seed, n, color = '#b9c7ff', op = 0.35, angle = 12) {
  const r = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const x = r() * 1100 - 40, y = r() * 1024, l = 30 + r() * 70;
    out.push(`<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x - l * Math.tan(angle * Math.PI / 180)).toFixed(0)}" y2="${(y + l).toFixed(0)}" stroke="${color}" stroke-width="${(1 + r() * 1.6).toFixed(1)}" opacity="${(op * (0.4 + r() * 0.6)).toFixed(2)}" stroke-linecap="round"/>`);
  }
  return out.join('');
}
export function rays(x, y, color, angles, len = 1200, spread = 5, op = 0.18) {
  return `<g style="mix-blend-mode:screen" filter="url(#soft4)">${angles.map(a => {
    const a1 = (a - spread) * Math.PI / 180, a2 = (a + spread) * Math.PI / 180;
    return `<path d="M${x},${y} L${x + Math.cos(a1) * len},${y + Math.sin(a1) * len} L${x + Math.cos(a2) * len},${y + Math.sin(a2) * len} Z" fill="${color}" opacity="${op}"/>`;
  }).join('')}</g>`;
}

// grade: {top, bottom} tints laid over everything (soft-light), plus vignette strength
export function page({ bg, figure, front = '', grade = {}, bloom = 0.55 }) {
  const top = grade.top || '#3b2a7a', bottom = grade.bottom || '#0c0a1e', vig = grade.vignette ?? 0.75;
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#07060d}svg{display:block}</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1024" height="1024" viewBox="0 0 1024 1024">
<defs>
  <linearGradient id="airbrush" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#fff" stop-opacity="0.10"/><stop offset="0.55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="${T.shadow}" stop-opacity="0.32"/></linearGradient>
  <radialGradient id="vig" cx="50%" cy="46%" r="72%"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#05040a" stop-opacity="${vig}"/></radialGradient>
  <linearGradient id="gradeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
  <filter id="soft" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="22"/></filter>
  <filter id="soft4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
  <filter id="blur10" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="bloom" x="0" y="0" width="100%" height="100%">
    <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0.33 0.33 0.33 0 -0.62" result="b"/>
    <feComponentTransfer in="b"><feFuncA type="linear" slope="3"/></feComponentTransfer>
    <feGaussianBlur stdDeviation="16"/>
  </filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5"/><feColorMatrix type="saturate" values="0"/></filter>
</defs>
<g id="art">
${bg}
${figure}
${front}
</g>
<use href="#art" filter="url(#bloom)" style="mix-blend-mode:screen" opacity="${bloom}"/>
<rect width="1024" height="1024" fill="url(#gradeG)" style="mix-blend-mode:soft-light" opacity="0.55"/>
<rect width="1024" height="1024" fill="url(#vig)"/>
<rect width="1024" height="1024" filter="url(#grain)" opacity="0.08" style="mix-blend-mode:overlay"/>
</svg></body></html>`;
}
