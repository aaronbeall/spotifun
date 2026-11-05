// Reusable creature parts and music props for the hand-drawn persona set.
import { part, limb, line, hl, dot, eye, blush, star, note, ell, smooth, darken, lighten, mix } from './kit.js';
export { part, limb, line, hl, dot, eye, blush, star, note, ell, smooth, darken, lighten, mix };

export const g = (x, y, s, rot, inner) => `<g transform="translate(${x} ${y}) rotate(${rot || 0}) scale(${s || 1})">${inner}</g>`;
export const oval = (cx, cy, rx, ry, color, o = {}, deg = 0) => part(ell(cx, cy, rx, ry, deg), color, o);
export const circ = (cx, cy, r, color, o = {}) => part(ell(cx, cy, r, r), color, o);
export const blob = (pts, color, o = {}) => part(smooth(pts, true), color, o);
export const INK = '#24142e';

// ---------- faces ----------
export function face(x, y, o = {}) {
  const gap = o.gap ?? 64, r = o.r ?? 18, ink = o.ink || INK, out = [];
  const L = x - gap / 2, R = x + gap / 2;
  const eyes = o.eyes || 'dot';
  if (eyes === 'dot' || eyes === 'sad' || eyes === 'wide') {
    const rr = eyes === 'wide' ? r * 1.25 : r;
    out.push(eye(L, y, rr, ink), eye(R, y, rr, ink));
  } else if (eyes === 'happy') {
    out.push(line(`M${L - r},${y + 4} C${L - r * 0.6},${y - r * 1.1} ${L + r * 0.6},${y - r * 1.1} ${L + r},${y + 4}`, ink, 8));
    out.push(line(`M${R - r},${y + 4} C${R - r * 0.6},${y - r * 1.1} ${R + r * 0.6},${y - r * 1.1} ${R + r},${y + 4}`, ink, 8));
  } else if (eyes === 'shut') {
    out.push(line(`M${L - r},${y - 2} C${L - r * 0.6},${y + r * 0.9} ${L + r * 0.6},${y + r * 0.9} ${L + r},${y - 2}`, ink, 7));
    out.push(line(`M${R - r},${y - 2} C${R - r * 0.6},${y + r * 0.9} ${R + r * 0.6},${y + r * 0.9} ${R + r},${y - 2}`, ink, 7));
  } else if (eyes === 'lid') {
    const skin = o.skin || '#888';
    for (const ex of [L, R]) {
      out.push(`<ellipse cx="${ex}" cy="${y}" rx="${r * 1.2}" ry="${r * 1.35}" fill="#fff8fb"/><ellipse cx="${ex + 3}" cy="${y + r * 0.35}" rx="${r * 0.66}" ry="${r * 0.8}" fill="${ink}"/><circle cx="${ex - 1}" cy="${y + r * 0.15}" r="${r * 0.22}" fill="#fff"/>`);
      out.push(`<path d="M${ex - r * 1.5},${y - r * 0.3} C${ex - r},${y - r * 1.5} ${ex + r},${y - r * 1.5} ${ex + r * 1.5},${y - r * 0.3} L${ex + r * 1.5},${y - r * 1.6} L${ex - r * 1.5},${y - r * 1.6} Z" fill="${skin}"/>`);
      out.push(line(`M${ex - r * 1.4},${y - r * 0.3} C${ex - r * 0.7},${y - r * 0.6} ${ex + r * 0.7},${y - r * 0.6} ${ex + r * 1.4},${y - r * 0.3}`, ink, 7));
    }
  }
  if (o.brows === 'worried' || eyes === 'sad') {
    out.push(line(`M${L - r},${y - r * 1.7} L${L + r * 0.9},${y - r * 2.2}`, ink, 7), line(`M${R + r},${y - r * 1.7} L${R - r * 0.9},${y - r * 2.2}`, ink, 7));
  } else if (o.brows === 'angry') {
    out.push(line(`M${L - r},${y - r * 2.1} L${L + r},${y - r * 1.5}`, ink, 8), line(`M${R + r},${y - r * 2.1} L${R - r},${y - r * 1.5}`, ink, 8));
  }
  const my = y + (o.mouthY ?? r * 2.6), mw = o.mw ?? r * 1.1;
  const m = o.mouth || 'smile';
  if (m === 'smile') out.push(line(`M${x - mw},${my - 4} C${x - mw * 0.5},${my + mw * 0.7} ${x + mw * 0.5},${my + mw * 0.7} ${x + mw},${my - 4}`, ink, 6));
  if (m === 'grin') out.push(`<path d="M${x - mw * 1.3},${my - 6} C${x - mw},${my + mw * 1.6} ${x + mw},${my + mw * 1.6} ${x + mw * 1.3},${my - 6} C${x + mw * 0.5},${my} ${x - mw * 0.5},${my} ${x - mw * 1.3},${my - 6} Z" fill="#4a1a2c" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="${x}" cy="${my + mw * 0.75}" rx="${mw * 0.6}" ry="${mw * 0.4}" fill="#ff7a9a"/>`);
  if (m === 'o') out.push(`<ellipse cx="${x}" cy="${my + 4}" rx="${mw * 0.55}" ry="${mw * 0.7}" fill="#4a1a2c" stroke="${ink}" stroke-width="4"/>`);
  if (m === 'flat') out.push(line(`M${x - mw * 0.7},${my + 2} L${x + mw * 0.7},${my + 2}`, ink, 6));
  if (m === 'frown') out.push(line(`M${x - mw * 0.8},${my + 8} C${x - mw * 0.4},${my - 4} ${x + mw * 0.4},${my - 4} ${x + mw * 0.8},${my + 8}`, ink, 6));
  if (m === 'wobbly') out.push(line(`M${x - mw},${my + 4} C${x - mw * 0.6},${my - 6} ${x - mw * 0.2},${my + 10} ${x},${my + 2} C${x + mw * 0.2},${my - 6} ${x + mw * 0.6},${my + 10} ${x + mw},${my}`, ink, 6));
  if (m === 'smirk') out.push(line(`M${x - mw * 0.8},${my + 2} C${x - mw * 0.2},${my + 10} ${x + mw * 0.5},${my + 8} ${x + mw},${my - 8}`, ink, 6));
  if (m === 'yell') out.push(`<path d="M${x - mw},${my - 8} L${x + mw},${my - 8} C${x + mw},${my + mw * 1.6} ${x - mw},${my + mw * 1.6} ${x - mw},${my - 8} Z" fill="#4a1a2c" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="${x}" cy="${my + mw * 0.8}" rx="${mw * 0.5}" ry="${mw * 0.3}" fill="#ff7a9a"/>`);
  if (o.fangs) out.push(`<path d="M${x - mw * 0.6},${my + 2} l5,18 l6,-16 Z M${x + mw * 0.3},${my + 4} l5,18 l6,-18 Z" fill="#fff" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>`);
  if (o.blush !== false) out.push(blush(L - r * 1.3, y + r * 1.6, r * 1.3, o.blushColor || '#ff6f91', 0.42), blush(R + r * 1.3, y + r * 1.6, r * 1.3, o.blushColor || '#ff6f91', 0.42));
  if (o.tear) out.push(tear(R + r * 0.6, y + r * 1.2));
  return out.join('');
}
export const tear = (x, y, s = 1) => `<path d="M${x},${y} C${x + 10 * s},${y + 16 * s} ${x + 9 * s},${y + 28 * s} ${x},${y + 30 * s} C${x - 9 * s},${y + 28 * s} ${x - 10 * s},${y + 16 * s} ${x},${y} Z" fill="#9be7ff" stroke="#2b82b8" stroke-width="4" stroke-linejoin="round"/>`;
export const nose = (x, y, w = 22, c = '#2a1a14') => `<path d="M${x - w},${y} C${x - w},${y - w * 0.7} ${x + w},${y - w * 0.7} ${x + w},${y} C${x + w},${y + w * 0.6} ${x + w * 0.3},${y + w * 0.9} ${x},${y + w * 0.9} C${x - w * 0.3},${y + w * 0.9} ${x - w},${y + w * 0.6} ${x - w},${y} Z" fill="${c}" stroke="${darken(c, 0.6)}" stroke-width="4"/><path d="M${x - w * 0.5},${y - w * 0.25} L${x},${y - w * 0.35}" stroke="#fff" stroke-opacity="0.6" stroke-width="4" stroke-linecap="round"/>`;

// ---------- ears ----------
export function ears(type, cx, cy, rx, color, inner) {
  inner = inner || lighten(color, 0.45);
  const out = [];
  for (const s of [-1, 1]) {
    const bx = cx + s * rx * 0.62, by = cy - rx * 0.62;
    if (type === 'round') out.push(circ(bx, by, rx * 0.34, color, { inner: `<circle cx="${bx}" cy="${by + 4}" r="${rx * 0.18}" fill="${inner}"/>` }));
    if (type === 'pointy') {
      const tip = [bx + s * rx * 0.12, by - rx * 0.62];
      const d = `M${bx - rx * 0.32},${by + rx * 0.22} L${tip[0]},${tip[1]} L${bx + rx * 0.34},${by + rx * 0.16} Z`;
      out.push(part(d, color, { inner: `<path d="M${bx - rx * 0.16},${by + rx * 0.12} L${tip[0]},${tip[1] + rx * 0.2} L${bx + rx * 0.18},${by + rx * 0.08} Z" fill="${inner}"/>` }));
    }
    if (type === 'long') {
      out.push(oval(bx - s * rx * 0.1, by - rx * 0.55, rx * 0.2, rx * 0.62, color, { inner: `<ellipse cx="${bx - s * rx * 0.1}" cy="${by - rx * 0.5}" rx="${rx * 0.09}" ry="${rx * 0.45}" fill="${inner}"/>` }, s * 10));
    }
    if (type === 'small') out.push(circ(bx + s * rx * 0.2, by + rx * 0.15, rx * 0.2, color));
  }
  return out.join('');
}
export const floppyEars = (cx, cy, rx, color) => [-1, 1].map(s =>
  oval(cx + s * rx * 0.92, cy + rx * 0.2, rx * 0.3, rx * 0.68, color, { off: [-10, -8] }, s * -12)).join('');

// head with highlight
export const head = (cx, cy, rx, ry, color, o = {}) => oval(cx, cy, rx, ry, color, o) + hl(`M${cx - rx * 0.72},${cy - ry * 0.4} C${cx - rx * 0.6},${cy - ry * 0.75} ${cx - rx * 0.3},${cy - ry * 0.92} ${cx - rx * 0.05},${cy - ry * 0.95}`, 10, 0.5);
export const paw = (x, y, r, color) => circ(x, y, r, color, { off: [-6, -6] });

// ---------- music props (drawn around 0,0) ----------
export function headphones(cx, cy, rx, color = '#f4f4f8', cup) {
  cup = cup || color;
  const ink = darken(color, 0.45);
  return line(`M${cx - rx * 1.02},${cy} C${cx - rx * 1.05},${cy - rx * 1.45} ${cx + rx * 1.05},${cy - rx * 1.45} ${cx + rx * 1.02},${cy}`, ink, 28)
    + line(`M${cx - rx * 1.02},${cy} C${cx - rx * 1.05},${cy - rx * 1.45} ${cx + rx * 1.05},${cy - rx * 1.45} ${cx + rx * 1.02},${cy}`, color, 14)
    + oval(cx - rx * 1.0, cy + 6, rx * 0.2, rx * 0.3, cup) + oval(cx + rx * 1.0, cy + 6, rx * 0.2, rx * 0.3, cup);
}
export const earbud = (x, y, flip = 1) => oval(x, y, 15, 17, '#ffffff', { ink: '#8f8aa3', lw: 4, off: [-4, -4] }) + limb(`M${x + flip * 4},${y + 14} L${x + flip * 8},${y + 40}`, 10, '#ffffff', { ink: '#8f8aa3' });
export const phone = (x, y, rot = 0, screen = '#86efac', s = 1) => g(x, y, s, rot,
  part('M-30,-50 L30,-50 C36,-50 40,-46 40,-40 L40,40 C40,46 36,50 30,50 L-30,50 C-36,50 -40,46 -40,40 L-40,-40 C-40,-46 -36,-50 -30,-50 Z', '#1f2937', { ink: '#0b0f17', lw: 5, off: [-4, -4] })
  + `<rect x="-31" y="-41" width="62" height="78" rx="6" fill="${screen}" opacity="0.9"/><rect x="-31" y="-41" width="62" height="78" rx="6" fill="${screen}" opacity="0.5" filter="url(#glow)"/>`);
export function cassette(x, y, s = 1, rot = 0, color = '#f97316') {
  return g(x, y, s, rot, part('M-80,-50 L80,-50 C86,-50 90,-46 90,-40 L90,40 C90,46 86,50 80,50 L-80,50 C-86,50 -90,46 -90,40 L-90,-40 C-90,-46 -86,-50 -80,-50 Z', color, { off: [-8, -6] })
    + `<rect x="-62" y="-32" width="124" height="42" rx="8" fill="#fff6e8" stroke="${darken(color, 0.45)}" stroke-width="4"/>
       <circle cx="-34" cy="-11" r="13" fill="#2a2433"/><circle cx="34" cy="-11" r="13" fill="#2a2433"/><circle cx="-34" cy="-11" r="5" fill="#fff6e8"/><circle cx="34" cy="-11" r="5" fill="#fff6e8"/>
       <path d="M-50,48 L-40,28 L40,28 L50,48" fill="${darken(color, 0.75)}" stroke="${darken(color, 0.45)}" stroke-width="4"/>
       <line x1="-52" y1="-24" x2="52" y2="-24" stroke="${darken(color, 0.45)}" stroke-width="3"/>`);
}
export function radio(x, y, s = 1, color = '#e0a96d', rot = 0) {
  const ink = darken(color, 0.42);
  return g(x, y, s, rot, line('M40,-60 L90,-150', '#9a9aa6', 8) + dot(90, -150, 9, '#c0c0c8')
    + part('M-100,-60 L100,-60 C112,-60 120,-52 120,-40 L120,50 C120,62 112,70 100,70 L-100,70 C-112,70 -120,62 -120,50 L-120,-40 C-120,-52 -112,-60 -100,-60 Z', color)
    + `<circle cx="-50" cy="5" r="44" fill="${darken(color, 0.7)}" stroke="${ink}" stroke-width="5"/>
       ${[-24, -8, 8, 24].map(dy => `<line x1="-86" y1="${5 + dy}" x2="-14" y2="${5 + dy}" stroke="${ink}" stroke-width="4" opacity="0.6"/>`).join('')}
       <rect x="20" y="-34" width="80" height="34" rx="6" fill="#fff3c4" stroke="${ink}" stroke-width="4"/><line x1="56" y1="-32" x2="56" y2="-2" stroke="#d0213f" stroke-width="4"/>
       <circle cx="40" cy="36" r="14" fill="${lighten(color, 0.5)}" stroke="${ink}" stroke-width="4"/><circle cx="84" cy="36" r="14" fill="${lighten(color, 0.5)}" stroke="${ink}" stroke-width="4"/>`);
}
export function gramophone(x, y, s = 1, color = '#c9a227', rot = 0) {
  return g(x, y, s, rot, part('M-90,40 L90,40 L80,120 L-80,120 Z', '#8a5634')
    + `<ellipse cx="0" cy="40" rx="86" ry="14" fill="#1b1722" stroke="#000" stroke-width="3"/>`
    + limb('M30,36 C40,-10 10,-40 -10,-60', 14, '#b08d57')
    + part('M-10,-60 C-60,-80 -120,-160 -140,-230 C-60,-250 40,-220 70,-170 C30,-140 10,-100 -10,-60 Z', color,
      { inner: `<path d="M-120,-220 C-60,-236 20,-210 50,-172" fill="none" stroke="${darken(color, 0.55)}" stroke-width="5" opacity="0.6"/><path d="M-80,-140 C-50,-160 -10,-160 20,-140" fill="none" stroke="${darken(color, 0.55)}" stroke-width="5" opacity="0.5"/>` }));
}
export function disc(x, y, r = 80, label = '#f472b6', ry) {
  ry = ry ?? r;
  return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${ry}" fill="#1b1722" stroke="#0b0910" stroke-width="5"/>
    <ellipse cx="${x}" cy="${y}" rx="${r * 0.72}" ry="${ry * 0.72}" fill="none" stroke="#fff" stroke-opacity="0.12" stroke-width="3"/>
    <ellipse cx="${x}" cy="${y}" rx="${r * 0.32}" ry="${ry * 0.32}" fill="${label}" stroke="${darken(label, 0.5)}" stroke-width="3"/>
    <ellipse cx="${x}" cy="${y}" rx="${r * 0.05}" ry="${ry * 0.05}" fill="#0b0910"/>
    <path d="M${x - r * 0.7},${y - ry * 0.35} A${r * 0.8},${ry * 0.8} 0 0,1 ${x - r * 0.2},${y - ry * 0.78}" fill="none" stroke="#fff" stroke-opacity="0.25" stroke-width="5" stroke-linecap="round"/>`;
}
export const sleeve = (x, y, s = 1, rot = 0, color = '#38bdf8', label = '#fde68a') => g(x, y, s, rot,
  part('M-80,-80 L80,-80 L80,80 L-80,80 Z', color, { off: [-8, -8] }) + disc(30, 0, 62, label).replace(/^/, '') + part('M-80,-80 L40,-80 L40,80 L-80,80 Z', color, { off: [-8, -8], inner: `<circle cx="-20" cy="-10" r="28" fill="${lighten(color, 0.4)}"/><path d="M-60,50 L20,50" stroke="${darken(color, 0.5)}" stroke-width="6"/>` }));
export const mic = (x, y, s = 1, rot = 0, color = '#9a9aa6') => g(x, y, s, rot,
  limb('M0,30 L0,130', 22, '#2a2433', { ink: '#0b0910' })
  + part(ell(0, 0, 38, 46), color, { inner: [-20, -6, 8, 22].map(d => `<line x1="-40" y1="${d}" x2="40" y2="${d}" stroke="${darken(color, 0.5)}" stroke-width="4"/>`).join('') }));
export const lantern = (x, y, s = 1, glowC = '#ffd27a') => g(x, y, s, 0,
  `<circle cx="0" cy="10" r="70" fill="${glowC}" opacity="0.55" filter="url(#glow)"/>`
  + line('M-20,-60 C-20,-90 20,-90 20,-60', '#5a4a3a', 7)
  + part('M-34,-50 L34,-50 L40,60 L-40,60 Z', glowC, { ink: '#6b4a20', inner: `<line x1="0" y1="-50" x2="0" y2="60" stroke="#6b4a20" stroke-width="5"/><ellipse cx="0" cy="10" rx="14" ry="22" fill="#fff8d6"/>` })
  + part('M-44,-62 L44,-62 L34,-46 L-34,-46 Z', '#5a4a3a', { lw: 5 }) + part('M-44,56 L44,56 L44,70 L-44,70 Z', '#5a4a3a', { lw: 5 }));
export function candle(x, base, h) {
  const top = base - h;
  return `<ellipse cx="${x}" cy="${top - 24}" rx="44" ry="52" fill="#ff9a3c" opacity="0.55" filter="url(#glow)"/>`
    + part(`M${x - 22},${base} L${x - 22},${top + 6} C${x - 22},${top - 4} ${x + 22},${top - 4} ${x + 22},${top + 6} L${x + 22},${base} Z`, '#f8ecd6', { off: [-8, -4], lw: 5 })
    + `<path d="M${x},${top - 46} C${x + 18},${top - 22} ${x + 14},${top - 6} ${x},${top - 4} C${x - 14},${top - 6} ${x - 18},${top - 22} ${x},${top - 46} Z" fill="#ffb347" stroke="#c2410c" stroke-width="4"/>
       <path d="M${x},${top - 28} C${x + 7},${top - 18} ${x + 6},${top - 10} ${x},${top - 9} C${x - 6},${top - 10} ${x - 7},${top - 18} ${x},${top - 28} Z" fill="#fff6c8"/>`;
}
export function boombox(x, y, s = 1, color = '#ec4899', rot = 0) {
  const ink = darken(color, 0.42);
  return g(x, y, s, rot, line('M-70,-60 C-70,-100 70,-100 70,-60', '#2a2433', 12)
    + part('M-130,-60 L130,-60 C140,-60 146,-54 146,-44 L146,60 C146,70 140,76 130,76 L-130,76 C-140,76 -146,70 -146,60 L-146,-44 C-146,-54 -140,-60 -130,-60 Z', color)
    + `<circle cx="-82" cy="12" r="44" fill="#2a2433" stroke="${ink}" stroke-width="5"/><circle cx="-82" cy="12" r="18" fill="${lighten(color, 0.4)}"/>
       <circle cx="82" cy="12" r="44" fill="#2a2433" stroke="${ink}" stroke-width="5"/><circle cx="82" cy="12" r="18" fill="${lighten(color, 0.4)}"/>
       <rect x="-30" y="-40" width="60" height="34" rx="5" fill="#fff6e8" stroke="${ink}" stroke-width="4"/><circle cx="-12" cy="-23" r="7" fill="#2a2433"/><circle cx="12" cy="-23" r="7" fill="#2a2433"/>
       <rect x="-30" y="20" width="60" height="16" rx="4" fill="${lighten(color, 0.3)}" stroke="${ink}" stroke-width="3"/>`);
}
export function speaker(x, y, s = 1, color = '#2a2433', rot = 0) {
  return g(x, y, s, rot, part('M-60,-90 L60,-90 C68,-90 74,-84 74,-76 L74,90 C74,98 68,104 60,104 L-60,104 C-68,104 -74,98 -74,90 L-74,-76 C-74,-84 -68,-90 -60,-90 Z', color)
    + `<circle cx="0" cy="-42" r="26" fill="#111" stroke="#555" stroke-width="5"/><circle cx="0" cy="40" r="46" fill="#111" stroke="#555" stroke-width="6"/><circle cx="0" cy="40" r="16" fill="#3b3646"/>`);
}
export const lightstick = (x, y, s = 1, rot = 0, color = '#f472b6') => g(x, y, s, rot,
  `<ellipse cx="0" cy="-70" rx="40" ry="60" fill="${color}" opacity="0.7" filter="url(#glow)"/>` + limb('M0,0 L0,70', 22, '#2a2433', { ink: '#0b0910' })
  + part(ell(0, -60, 34, 56), lighten(color, 0.35), { ink: darken(color, 0.5), inner: `<path d="M0,-90 l9,20 l22,2 l-17,14 l6,22 l-20,-12 l-20,12 l6,-22 l-17,-14 l22,-2 Z" fill="#fff" opacity="0.85"/>` }));
export const teacup = (x, y, s = 1, color = '#f9fafb') => g(x, y, s, 0,
  line('M38,-14 C64,-14 64,22 34,22', darken(color, 0.5), 14) + line('M38,-14 C64,-14 64,22 34,22', color, 6)
  + part('M-46,-30 L46,-30 C46,10 30,34 0,34 C-30,34 -46,10 -46,-30 Z', color, { inner: `<ellipse cx="0" cy="-28" rx="44" ry="9" fill="#b45309"/>` })
  + line('M-10,-50 C-20,-70 0,-80 -8,-100', '#ffffff', 5).replace('stroke="#ffffff"', 'stroke="#ffffff" stroke-opacity="0.5"'));
export function walkman(x, y, s = 1, rot = 0, color = '#3b82f6') {
  return g(x, y, s, rot, part('M-50,-70 L50,-70 C58,-70 64,-64 64,-56 L64,70 C64,78 58,84 50,84 L-50,84 C-58,84 -64,78 -64,70 L-64,-56 C-64,-64 -58,-70 -50,-70 Z', color)
    + `<rect x="-44" y="-50" width="88" height="66" rx="8" fill="#2a2433"/><circle cx="-18" cy="-17" r="11" fill="#e5e7eb"/><circle cx="18" cy="-17" r="11" fill="#e5e7eb"/>
       <rect x="-44" y="34" width="22" height="14" rx="3" fill="${lighten(color, 0.5)}"/><rect x="-12" y="34" width="22" height="14" rx="3" fill="${lighten(color, 0.5)}"/><rect x="20" y="34" width="22" height="14" rx="3" fill="#ef4444"/>`);
}
export function jukebox(x, y, s = 1, color = '#c81d3f') {
  const ink = darken(color, 0.42);
  return g(x, y, s, 0, `<ellipse cx="0" cy="-60" rx="140" ry="160" fill="#fcd34d" opacity="0.35" filter="url(#glow)"/>`
    + part('M-110,170 L-110,-60 C-110,-180 110,-180 110,-60 L110,170 Z', color)
    + `<path d="M-80,-50 C-80,-140 80,-140 80,-50 L80,20 L-80,20 Z" fill="#fde68a" stroke="${ink}" stroke-width="5"/>
       ${[-50, -20, 10, 40].map(dx => `<line x1="${dx}" y1="-110" x2="${dx}" y2="20" stroke="#f59e0b" stroke-width="5"/>`).join('')}
       <rect x="-70" y="44" width="140" height="56" rx="8" fill="#2a2433" stroke="${ink}" stroke-width="4"/>
       ${[-48, -16, 16, 48].map(dx => `<circle cx="${dx}" cy="72" r="10" fill="${['#22d3ee', '#facc15', '#f472b6', '#86efac'][(dx + 48) / 32]}"/>`).join('')}
       <rect x="-90" y="120" width="180" height="30" rx="6" fill="${lighten(color, 0.3)}" stroke="${ink}" stroke-width="4"/>`);
}
export function synth(x, y, s = 1, color = '#2a2433', accent = '#22d3ee') {
  let keys = '';
  for (let i = 0; i < 10; i++) keys += `<rect x="${-110 + i * 22}" y="0" width="20" height="44" rx="3" fill="#fafafa" stroke="#555" stroke-width="2"/>`;
  for (const i of [0, 1, 3, 4, 5, 7, 8]) keys += `<rect x="${-96 + i * 22}" y="0" width="12" height="26" rx="2" fill="#222"/>`;
  return g(x, y, s, 0, part('M-124,-50 L124,-50 C130,-50 134,-46 134,-40 L134,50 C134,56 130,60 124,60 L-124,60 C-130,60 -134,56 -134,50 L-134,-40 C-134,-46 -130,-50 -124,-50 Z', color)
    + `<g transform="translate(0 6)">${keys}</g>` + [-90, -50, -10, 30].map(dx => `<circle cx="${dx}" cy="-24" r="11" fill="${accent}" stroke="#111" stroke-width="3"/>`).join('')
    + `<rect x="60" y="-36" width="60" height="24" rx="4" fill="${accent}" opacity="0.9"/>`);
}
export const cloud = (x, y, s = 1, color = '#e5e7eb', o = {}) => g(x, y, s, 0,
  blob([[-110, 30], [-120, -10], [-80, -50], [-30, -60], [10, -90], [70, -70], [100, -30], [130, 0], [110, 40], [0, 50]], color, o));
export const moon = (x, y, s = 1, color = '#fde68a') => g(x, y, s, 0,
  `<circle cx="0" cy="0" r="80" fill="${color}" opacity="0.4" filter="url(#glow)"/>` + part('M30,-80 C-40,-80 -80,-30 -80,10 C-80,60 -40,90 10,90 C50,90 80,60 86,30 C40,50 -10,20 -10,-30 C-10,-50 5,-70 30,-80 Z', color));
export const drops = (pts, color = '#93c5fd') => pts.map(([x, y]) => `<path d="M${x},${y} C${x + 8},${y + 12} ${x + 7},${y + 22} ${x},${y + 24} C${x - 7},${y + 22} ${x - 8},${y + 12} ${x},${y} Z" fill="${color}" stroke="${darken(color, 0.5)}" stroke-width="3"/>`).join('');
export const motion = (pts, color = '#fff') => pts.map(([x, y, len, ang]) => `<path d="M${x},${y} l${Math.cos(ang) * len},${Math.sin(ang) * len}" stroke="${color}" stroke-opacity="0.6" stroke-width="6" stroke-linecap="round"/>`).join('');
export const pin = (x, y, color = '#ff4fa3', r = 18) => dot(x, y, r, color, `stroke="${darken(color, 0.45)}" stroke-width="5"`) + star(x, y, r * 0.55, '#fff3b0', 0, false);
export const sticker = (x, y, color, shape = 'circle', r = 16) => shape === 'circle'
  ? dot(x, y, r, color, `stroke="#fff" stroke-width="4"`)
  : `<path d="M${x},${y - r} L${x + r},${y + r * 0.8} L${x - r},${y + r * 0.8} Z" fill="${color}" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>`;
export const shadow = (cx, rx = 200, cy = 856) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.17}" fill="#000" opacity="0.45"/>`;
export const sparkles = (list) => list.map(([x, y, r, c, rot]) => star(x, y, r, c, rot || 0)).join('');
export const notes = (list) => list.map(([x, y, s, c, rot]) => note(x, y, s, c, rot || 0)).join('');
