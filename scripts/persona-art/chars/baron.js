import { page, part, limb, line, hl, dot, blush, note, star, ell, smooth, darken, lighten } from '../kit.js';

function candle(x, base, h) {
  const top = base - h;
  return `<g>
  <ellipse cx="${x}" cy="${top - 24}" rx="44" ry="52" fill="#ff9a3c" opacity="0.55" filter="url(#glow)"/>
  ${part(`M${x - 22},${base} L${x - 22},${top + 6} C${x - 22},${top - 4} ${x + 22},${top - 4} ${x + 22},${top + 6} L${x + 22},${base} Z`, '#f8ecd6', { off: [-8, -4], lw: 5 })}
  <path d="M${x + 8},${top + 2} C${x + 16},${top + 18} ${x + 6},${top + 30} ${x + 14},${top + 40}" fill="none" stroke="#e8d6b8" stroke-width="9" stroke-linecap="round"/>
  <path d="M${x},${top - 46} C${x + 18},${top - 22} ${x + 14},${top - 6} ${x},${top - 4} C${x - 14},${top - 6} ${x - 18},${top - 22} ${x},${top - 46} Z" fill="#ffb347" stroke="#c2410c" stroke-width="4"/>
  <path d="M${x},${top - 28} C${x + 7},${top - 18} ${x + 6},${top - 10} ${x},${top - 9} C${x - 6},${top - 10} ${x - 7},${top - 18} ${x},${top - 28} Z" fill="#fff6c8"/>
  </g>`;
}

export default function () {
  const skin = '#8e2b5c', skinLt = '#c25686', inner = '#f19ab8', capeOut = '#2e1a3d', capeIn = '#d0213f', mem = '#5a1a3f';
  const s = [];
  // cape + high collar
  s.push(part('M330,470 C300,560 280,660 270,760 L750,760 C740,660 720,560 690,470 Z', capeIn, { ink: '#5c0a1f' }));
  s.push(part('M330,470 C300,560 282,660 270,760 L340,760 C360,660 380,560 400,480 Z', capeOut));
  s.push(part('M690,470 C720,560 738,660 750,760 L680,760 C660,660 640,560 620,480 Z', capeOut));
  s.push(part('M360,470 L250,300 C320,330 360,340 410,400 Z', capeIn, { ink: '#5c0a1f' }));
  s.push(part('M660,470 L770,300 C700,330 660,340 610,400 Z', capeIn, { ink: '#5c0a1f' }));
  // raised wing (right)
  s.push(part('M600,500 L700,330 L820,200 L850,290 C820,300 816,330 840,360 C800,366 790,400 808,430 C770,428 752,456 760,488 C720,476 690,500 680,530 Z', mem, { ink: '#2a0a1c' }));
  s.push(line('M640,480 L700,330 L820,200', skin, 12), line('M700,330 L840,360', skin, 8), line('M700,330 L808,430', skin, 8), line('M700,330 L760,488', skin, 8));
  s.push(`<path d="M818,200 L836,170 L838,206 Z" fill="#f5e6d0" stroke="#7a5a3a" stroke-width="3"/>`);
  // body
  s.push(part(ell(510, 580, 116, 132), skin, { inner: `<ellipse cx="510" cy="600" rx="70" ry="90" fill="${skinLt}"/>` }));
  // vintage headphones round the neck
  s.push(line('M410,470 C430,520 590,520 610,470', '#b08d57', 14));
  s.push(part(ell(404, 474, 30, 36, -15), '#6b4428', { lw: 5 }), part(ell(616, 474, 30, 36, 15), '#6b4428', { lw: 5 }));
  // turntable deck
  const wood = '#8a5634';
  s.push(part('M250,660 L770,660 L790,700 L230,700 Z', '#4a3a40', { off: [-4, -4] }));
  s.push(part('M230,700 L790,700 L790,820 C790,830 782,836 772,836 L248,836 C238,836 230,830 230,820 Z', wood, {
    inner: `<line x1="250" y1="760" x2="770" y2="760" stroke="${darken(wood, 0.6)}" stroke-width="4" opacity="0.6"/>
      <circle cx="660" cy="790" r="14" fill="#d0213f"/><circle cx="700" cy="790" r="14" fill="#c9a227"/><circle cx="740" cy="790" r="14" fill="#c9a227"/>
      <path d="M270,790 h120" stroke="#f5e6d0" stroke-width="6" stroke-linecap="round" opacity="0.6"/>`,
  }));
  // platter + record
  s.push(part(ell(420, 676, 130, 26), '#9a9aa6', { lw: 5, off: [-4, -4] }));
  s.push(part(ell(420, 672, 118, 22), '#16131b', { ink: '#000', lw: 4, off: [0, 0], inner: '<ellipse cx="420" cy="672" rx="90" ry="16" fill="none" stroke="#fff" stroke-opacity="0.12" stroke-width="3"/><ellipse cx="420" cy="672" rx="36" ry="7" fill="#d0213f"/>' }));
  // tonearm
  s.push(dot(640, 672, 18, '#b08d57', 'stroke="#5a4020" stroke-width="5"'), line('M640,672 L540,664', '#d8d8e0', 8), line('M540,664 L520,672', '#2e1a3d', 12));
  // dusty cobweb on the deck corner
  s.push(`<g stroke="#e5e7eb" stroke-opacity="0.55" stroke-width="2.5" fill="none"><path d="M770,660 L700,660 M770,660 L716,690 M770,660 L752,700"/><path d="M730,660 C738,668 742,676 740,684 M748,660 C752,666 754,674 752,680"/></g>`);
  // left arm scratching the record
  s.push(limb(smooth([[420, 530], [370, 600], [392, 650]]), 40, skin));
  s.push(part(ell(398, 656, 26, 20), darken(skin, 0.8), { lw: 5 }));
  s.push(line('M330,640 C320,650 318,664 326,674 M318,630 C302,646 300,668 312,684', '#f5d0fe', 4));
  // head + ears
  s.push(part('M392,300 L350,120 C400,150 440,200 460,240 Z', skin, { inner: '<path d="M398,270 L372,160 C404,184 428,214 440,240 Z" fill="' + inner + '"/>' }));
  s.push(part('M628,300 L670,120 C620,150 580,200 560,240 Z', skin, { inner: '<path d="M622,270 L648,160 C616,184 592,214 580,240 Z" fill="' + inner + '"/>' }));
  s.push(part(ell(510, 352, 140, 128), skin));
  s.push(hl('M402,300 C414,268 446,244 484,236', 10, 0.45));
  // half-lidded cool eyes
  for (const x of [456, 564]) {
    s.push(`<ellipse cx="${x}" cy="350" rx="24" ry="28" fill="#fff6fb"/><ellipse cx="${x + 4}" cy="358" rx="13" ry="16" fill="#1d0f1a"/><circle cx="${x}" cy="352" r="4" fill="#fff"/>`);
    s.push(`<path d="M${x - 30},340 C${x - 20},318 ${x + 20},318 ${x + 30},340 L${x + 30},322 L${x - 30},322 Z" fill="${skin}"/>`);
    s.push(line(`M${x - 28},340 C${x - 14},334 ${x + 14},334 ${x + 28},340`, '#3a0f22', 7));
  }
  // snout, smirk, fangs
  s.push(`<path d="M498,396 C498,388 522,388 522,396 C522,404 514,408 510,408 C506,408 498,404 498,396 Z" fill="#2a0f1c"/>`);
  s.push(line('M474,430 C494,446 530,446 552,424', '#3a0f22', 6));
  s.push(`<path d="M484,436 L490,456 L496,440 Z" fill="#fff" stroke="#3a0f22" stroke-width="3" stroke-linejoin="round"/><path d="M528,438 L534,458 L540,436 Z" fill="#fff" stroke="#3a0f22" stroke-width="3" stroke-linejoin="round"/>`);
  s.push(blush(420, 400, 22, '#ff6f91', 0.4), blush(600, 400, 22, '#ff6f91', 0.4));
  // candles
  s.push(candle(190, 850, 150), candle(848, 846, 110), candle(900, 880, 70));
  const front = [
    note(230, 380, 1.0, '#f472b6', -12), note(150, 230, 0.8, '#c4b5fd', 6), note(880, 520, 0.9, '#f472b6', 10),
    star(560, 110, 18, '#c4b5fd', 0), star(300, 120, 14, '#f472b6', 0),
  ].join('');
  return page({ accent: '#5c1a35', glow: '#a3245e', figure: s.join('\n'), front, seed: 21 });
}
