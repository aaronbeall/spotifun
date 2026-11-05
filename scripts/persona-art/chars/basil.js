import { page, part, limb, line, hl, dot, blush, note, ell, smooth, darken, lighten } from '../kit.js';

export default function () {
  const mint = '#8ff0b4', mintDk = '#3f9e6e', cream = '#f6fbe9', bag = '#8b5cf6', wood = '#e0a96d', claw = '#fff3d6';
  const s = [];
  // beanbag: shadow, back cushion, seat
  s.push('<ellipse cx="490" cy="858" rx="320" ry="56" fill="#000" opacity="0.5"/>');
  s.push(part(smooth([[300, 560], [340, 440], [470, 400], [600, 420], [690, 500], [700, 620], [520, 650], [320, 640]], true), bag));
  s.push(part(smooth([[180, 740], [230, 650], [380, 610], [560, 606], [720, 640], [800, 720], [760, 820], [600, 856], [380, 858], [220, 820]], true), bag,
    { inner: `<path d="M260,740 C300,700 340,690 380,700" fill="none" stroke="${darken(bag, 0.6)}" stroke-width="6" stroke-linecap="round" opacity="0.7"/><path d="M640,700 C680,720 700,740 712,770" fill="none" stroke="${darken(bag, 0.6)}" stroke-width="6" stroke-linecap="round" opacity="0.7"/>` }));
  s.push(hl('M230,700 C280,650 360,630 420,628', 10, 0.45));
  // body
  s.push(part(ell(470, 600, 128, 140), mint, { inner: `<ellipse cx="470" cy="628" rx="78" ry="96" fill="${cream}"/>` }));
  // dangling legs with claws
  for (const [x0, x1] of [[410, 380], [530, 560]]) {
    s.push(limb(smooth([[x0, 690], [x1, 760]]), 52, mint));
    for (const dx of [-14, 0, 14]) s.push(limb(`M${x1 + dx},790 L${x1 + dx * 1.4},812`, 8, claw, { ink: '#a08a5a' }));
  }
  // left arm with phone on belly
  s.push(limb(smooth([[370, 540], [352, 620], [430, 650]]), 46, mint));
  s.push(part('M430,586 L478,578 C486,577 492,582 493,590 L500,654 C501,662 496,668 488,669 L440,676 C432,677 426,672 425,664 L418,600 C417,592 422,587 430,586 Z', '#1f2937', { ink: '#0b0f17', off: [-4, -4], lw: 5, inner: `<path d="M432,596 L480,590 L486,650 L440,656 Z" fill="${mint}" opacity="0.85"/>` }));
  s.push(`<path d="M432,596 L480,590 L486,650 L440,656 Z" fill="${mint}" opacity="0.35" filter="url(#glow)"/>`);
  // record crate (right)
  const cx = 720, cy = 640;
  const sleeves = ['#f472b6', '#38bdf8', '#facc15', '#f97316', '#a78bfa'];
  sleeves.forEach((c, i) => s.push(part(`M${cx + 14 + i * 10},${cy - 40 - i * 4} L${cx + 168 + i * 6},${cy - 56 - i * 6} L${cx + 172 + i * 4},${cy + 80} L${cx + 18 + i * 8},${cy + 90} Z`, c, { off: [-6, -6], lw: 5 })));
  s.push(part(`M${cx},${cy + 40} L${cx + 200},${cy + 30} L${cx + 210},${cy + 180} L${cx + 6},${cy + 190} Z`, wood, {
    inner: `<line x1="${cx}" y1="${cy + 100}" x2="${cx + 210}" y2="${cy + 92}" stroke="${darken(wood, 0.5)}" stroke-width="6"/>
      <circle cx="${cx + 50}" cy="${cy + 140}" r="16" fill="#f472b6"/><circle cx="${cx + 110}" cy="${cy + 148}" r="13" fill="#22d3ee"/><circle cx="${cx + 160}" cy="${cy + 128}" r="15" fill="#facc15"/><path d="M${cx + 100},${cy + 60} l12,-10 l12,10 z" fill="#a78bfa"/>`,
  }));
  // the pulled-up record
  s.push(part(`M${cx + 30},${cy - 30} L${cx + 150},${cy - 120} L${cx + 230},${cy - 14} L${cx + 110},${cy + 76} Z`, '#f9a8d4', {
    inner: `<ellipse cx="${cx + 130}" cy="${cy - 22}" rx="48" ry="46" fill="#1b1722"/><ellipse cx="${cx + 130}" cy="${cy - 22}" rx="18" ry="17" fill="${mint}"/>`,
  }));
  // long right arm reaching the crate
  s.push(limb(smooth([[560, 530], [650, 560], [728, 590]]), 46, mint));
  for (const dy of [-14, 0, 14]) s.push(limb(`M748,${600 + dy} L770,${606 + dy * 1.3}`, 8, claw, { ink: '#a08a5a' }));
  // headphones round neck
  s.push(line('M372,470 C390,520 550,520 568,470', '#6b6880', 26), line('M372,470 C390,520 550,520 568,470', '#ffffff', 14));
  s.push(part(ell(366, 470, 28, 34, -20), '#ffffff', { ink: '#8f8aa3', lw: 5 }), part(ell(574, 470, 28, 34, 20), '#ffffff', { ink: '#8f8aa3', lw: 5 }));
  // head
  s.push(part(ell(468, 352, 156, 136), mint));
  s.push(hl('M346,300 C360,258 400,232 446,224', 10, 0.55));
  s.push(part(smooth([[350,380],[372,318],[420,300],[468,318],[516,300],[564,318],[586,380],[560,440],[468,466],[376,440]], true), cream, { off: [-10, -8] }));
  s.push(part(ell(416, 374, 44, 22, -24), mintDk, { off: [-4, -4], lw: 4 }), part(ell(520, 374, 44, 22, 24), mintDk, { off: [-4, -4], lw: 4 }));
  s.push(line('M404,364 C412,352 430,352 438,364', '#10301e', 7), line('M498,364 C506,352 524,352 532,364', '#10301e', 7));
  s.push(part(ell(468, 390, 20, 13), '#2a1a14', { off: [-3, -3], lw: 3 }));
  s.push(line('M440,416 C452,436 484,436 496,416', '#2a1a14', 6));
  s.push(blush(388, 404, 22), blush(548, 404, 22));
  // shaggy tuft
  s.push(line('M440,220 C430,196 448,184 462,194 C466,176 490,174 494,196 C506,186 524,196 516,216', darken(mint, 0.42), 7));
  const front = [
    note(230, 300, 1.1, '#bbf7d0', -12), note(300, 190, 0.9, '#bbf7d0', 8), note(700, 260, 1.0, '#bbf7d0', 10)
  ].join('');
  return page({ accent: '#86efac', figure: s.join('\n'), front, seed: 12 });
}
