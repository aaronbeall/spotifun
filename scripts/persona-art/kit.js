// Hand-drawn persona kit: flat colour, cel shade crescent, coloured ink line, wobble + paper grain.
let uid = 0;
const id = p => `${p}${++uid}`;

function hex(c) { c = c.replace('#', ''); return [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16)); }
function toHex(a) { return '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
export const darken = (c, k) => toHex(hex(c).map(v => v * k));
export const mix = (c1, c2, t) => { const a = hex(c1), b = hex(c2); return toHex(a.map((v, i) => v + (b[i] - v) * t)); };
export const lighten = (c, t) => mix(c, '#ffffff', t);

// ellipse as path (supports rotation in degrees)
export function ell(cx, cy, rx, ry, deg = 0) {
  const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  const x1 = cx - rx * c, y1 = cy - rx * s, x2 = cx + rx * c, y2 = cy + rx * s;
  return `M${x1},${y1} A${rx},${ry} ${deg} 1,0 ${x2},${y2} A${rx},${ry} ${deg} 1,0 ${x1},${y1} Z`;
}
// smooth path through points (Catmull-Rom -> cubic bezier)
export function smooth(pts, closed = false) {
  const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M${P[1][0]},${P[1][1]}`;
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return closed ? d + ' Z' : d;
}

const LW = 7; // ink line weight

// A filled part: base colour, shade crescent (light from top-left), coloured ink outline, optional highlight.
export function part(d, base, o = {}) {
  const ink = o.ink || darken(base, 0.42);
  const shade = o.shade || mix(darken(base, 0.76), '#5b3a8c', 0.14);
  const [sx, sy] = o.off || [-24, -20];
  const cid = id('c');
  return `<g>
  <clipPath id="${cid}"><path d="${d}"/></clipPath>
  <path d="${d}" fill="${shade}"/>
  <g clip-path="url(#${cid})"><path d="${d}" transform="translate(${sx},${sy})" fill="${base}"/>${o.inner || ''}</g>
  ${o.noLine ? '' : `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${o.lw || LW}" stroke-linejoin="round"/>`}
</g>`;
}
// A limb / tube drawn as a stroke
export function limb(d, w, base, o = {}) {
  const ink = o.ink || darken(base, 0.42), shade = o.shade || darken(base, 0.8);
  return `<g fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="${d}" stroke="${ink}" stroke-width="${w + LW * 2}"/>
  <path d="${d}" stroke="${shade}" stroke-width="${w}"/>
  <path d="${d}" stroke="${base}" stroke-width="${w * 0.62}" transform="translate(${-w * 0.14},${-w * 0.14})"/>
</g>`;
}
export const line = (d, color, w = LW) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
export const hl = (d, w = 9, op = 0.75) => `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${op}" stroke-width="${w}" stroke-linecap="round"/>`;
export const dot = (x, y, r, fill, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;

export function eye(x, y, r = 18, ink = '#24142e') {
  return `<g>${`<ellipse cx="${x}" cy="${y}" rx="${r * 0.85}" ry="${r * 1.12}" fill="${ink}"/>`}
  <circle cx="${x - r * 0.28}" cy="${y - r * 0.4}" r="${r * 0.34}" fill="#fff"/>
  <circle cx="${x + r * 0.3}" cy="${y + r * 0.42}" r="${r * 0.14}" fill="#fff"/></g>`;
}
export const blush = (x, y, rx = 26, c = '#ff6f91', op = 0.45) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.6}" fill="${c}" opacity="${op}"/>`;

export function star(x, y, r, color, rot = 0, glow = true) {
  let d = '';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.3 : r;
    d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ',' + (y + Math.sin(a) * rr).toFixed(1);
  }
  d += 'Z';
  return `<g transform="rotate(${rot} ${x} ${y})">${glow ? `<path d="${d}" fill="${color}" filter="url(#glow)" opacity="0.9"/>` : ''}<path d="${d}" fill="${lighten(color, 0.55)}" stroke="${color}" stroke-width="3" stroke-linejoin="round"/></g>`;
}
export function note(x, y, s, color, rot = 0) {
  const ink = darken(color, 0.55);
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
  <g filter="url(#glow)" opacity="0.7"><ellipse cx="0" cy="0" rx="17" ry="12" transform="rotate(-25)" fill="${color}"/></g>
  <path d="M14,-4 L14,-62 C30,-52 40,-44 36,-24" fill="none" stroke="${ink}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M14,-4 L14,-62 C30,-52 40,-44 36,-24" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <ellipse cx="0" cy="0" rx="17" ry="12" transform="rotate(-25)" fill="${color}" stroke="${ink}" stroke-width="4"/>
  </g>`;
}

export function record(label, cx = 512, cy = 862) {
  const g = [];
  g.push(`<ellipse cx="${cx}" cy="${cy + 20}" rx="372" ry="92" fill="#0b0910"/>`);
  g.push(`<ellipse cx="${cx}" cy="${cy}" rx="372" ry="92" fill="#1b1722" stroke="#0b0910" stroke-width="6"/>`);
  for (const k of [0.9, 0.8, 0.7, 0.6, 0.5, 0.42]) g.push(`<ellipse cx="${cx}" cy="${cy}" rx="${372 * k}" ry="${92 * k}" fill="none" stroke="#ffffff" stroke-opacity="${k > 0.55 ? 0.07 : 0.05}" stroke-width="3"/>`);
  g.push(`<path d="M${cx - 300},${cy - 30} A320,78 0 0,1 ${cx - 40},${cy - 82}" fill="none" stroke="#fff" stroke-opacity="0.18" stroke-width="7" stroke-linecap="round"/>`);
  g.push(`<ellipse cx="${cx}" cy="${cy}" rx="118" ry="29" fill="${label}" stroke="${darken(label, 0.5)}" stroke-width="5"/>`);
  g.push(`<ellipse cx="${cx}" cy="${cy}" rx="88" ry="21" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="3"/>`);
  g.push(`<ellipse cx="${cx}" cy="${cy}" rx="9" ry="3" fill="#0b0910"/>`);
  return g.join('\n');
}

export function page({ accent, glow, figure, back = '', front = '', seed = 3 }) {
  glow = glow || accent;
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#0a0812}svg{display:block}</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
<defs>
  <radialGradient id="bgGlow" cx="50%" cy="44%" r="55%"><stop offset="0" stop-color="${glow}" stop-opacity="0.7"/><stop offset="0.5" stop-color="${glow}" stop-opacity="0.24"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#150e26"/><stop offset="1" stop-color="#08060e"/></linearGradient>
  <filter id="wobble" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="${seed}" result="n1"/>
    <feDisplacementMap in="SourceGraphic" in2="n1" scale="9" xChannelSelector="R" yChannelSelector="G" result="d1"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="${seed + 7}" result="n2"/>
    <feDisplacementMap in="d1" in2="n2" scale="3.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="grainAll"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="9"/><feColorMatrix type="saturate" values="0"/></filter>
</defs>
<rect width="1024" height="1024" fill="url(#bg)"/>
<rect width="1024" height="1024" fill="url(#bgGlow)"/>
<g filter="url(#wobble)">${back}${record(accent)}${figure}</g>
${front}
<rect width="1024" height="1024" filter="url(#grainAll)" opacity="0.13" style="mix-blend-mode:overlay"/>
</svg></body></html>`;
}
