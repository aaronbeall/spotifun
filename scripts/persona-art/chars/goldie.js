import { page, part, limb, line, hl, dot, eye, blush, star, ell, smooth, darken, lighten, mix } from '../kit.js';

export default function () {
  const fur = '#f4b73a', furDk = '#d48a1c', cream = '#fff0d2', jacket = '#7c3aed', shoe = '#ec4fc0';
  const s = [];
  // tail
  s.push(limb(smooth([[600, 640], [668, 610], [700, 540], [688, 480]]), 40, fur));
  // legs
  s.push(limb(smooth([[460, 660], [452, 740], [440, 800]]), 64, fur));
  s.push(limb(smooth([[560, 650], [628, 700], [652, 770]]), 64, fur));
  // platform shoes
  s.push(part('M378,790 C378,770 410,762 440,764 C478,766 500,778 500,800 L500,840 C500,850 490,856 478,856 L392,856 C382,856 376,848 376,838 Z', shoe, { off: [-10, -10] }));
  s.push(hl('M394,790 C410,778 440,776 462,780', 7));
  s.push(part('M600,770 C604,750 640,744 668,752 C700,760 716,776 712,796 L704,832 C702,842 692,846 682,844 L604,826 C594,824 590,816 592,806 Z', shoe, { off: [-10, -10] }));
  // body / jacket with sequin pattern
  const body = ell(512, 560, 148, 156);
  s.push(`<defs><pattern id="seq" width="26" height="22" patternUnits="userSpaceOnUse">
    <circle cx="13" cy="11" r="10" fill="${lighten(jacket, 0.18)}" stroke="${darken(jacket, 0.62)}" stroke-width="2"/>
    <circle cx="0" cy="0" r="10" fill="${lighten(jacket, 0.3)}" stroke="${darken(jacket, 0.62)}" stroke-width="2"/>
    <circle cx="26" cy="0" r="10" fill="${lighten(jacket, 0.3)}" stroke="${darken(jacket, 0.62)}" stroke-width="2"/>
    <circle cx="0" cy="22" r="10" fill="${lighten(jacket, 0.3)}" stroke="${darken(jacket, 0.62)}" stroke-width="2"/>
    <circle cx="26" cy="22" r="10" fill="${lighten(jacket, 0.3)}" stroke="${darken(jacket, 0.62)}" stroke-width="2"/>
    <circle cx="9" cy="7" r="3" fill="#fff" opacity="0.8"/></pattern></defs>`);
  s.push(part(body, jacket, { inner: `<path d="${body}" fill="url(#seq)" opacity="0.55"/>` }));
  // chest + lapels
  s.push(part('M470,420 L554,420 L530,560 L512,600 L494,560 Z', cream, { off: [-6, -6] }));
  s.push(part('M452,418 L496,424 L488,520 Z', '#fffaf2', { off: [-5, -5], lw: 5 }));
  s.push(part('M572,418 L528,424 L536,520 Z', '#fffaf2', { off: [-5, -5], lw: 5 }));
  // band pin
  s.push(dot(452, 560, 20, '#ff4fa3', `stroke="${darken('#ff4fa3', 0.45)}" stroke-width="5"`));
  s.push(star(452, 560, 11, '#fff3b0', 0, false));
  // left arm on hip
  s.push(limb(smooth([[400, 480], [334, 552], [372, 628]]), 54, jacket));
  s.push(part(ell(390, 636, 34, 30), cream, { off: [-6, -6] }));
  // right arm raised
  s.push(limb(smooth([[612, 470], [676, 370], [712, 262]]), 54, jacket));
  s.push(part(ell(716, 246, 32, 30), cream, { off: [-6, -6] }));
  s.push(limb('M722,222 L726,190', 16, cream));
  // mirror ball
  const bx = 732, by = 132, br = 66;
  const tiles = [];
  for (let i = -3; i <= 3; i++) tiles.push(`<ellipse cx="${bx}" cy="${by}" rx="${Math.abs(Math.cos(i * 0.42)) * br}" ry="${br}" fill="none" stroke="#3d3a52" stroke-width="3"/>`);
  for (let j = -2; j <= 2; j++) { const y = by + j * 24; const w = Math.sqrt(Math.max(0, br * br - (j * 24) ** 2)); tiles.push(`<line x1="${bx - w}" y1="${y}" x2="${bx + w}" y2="${y}" stroke="#3d3a52" stroke-width="3"/>`); }
  const sq = [[-30, -30], [-6, -42], [14, -18], [-22, 4], [30, 12], [-4, 30], [40, -30]].map(([x, y], i) => `<rect x="${bx + x - 7}" y="${by + y - 7}" width="14" height="14" rx="2" fill="#fff" opacity="${i % 2 ? 0.95 : 0.6}"/>`).join('');
  s.push(`<circle cx="${bx}" cy="${by}" r="${br + 26}" fill="#ffffff" opacity="0.25" filter="url(#glow)"/>`);
  s.push(part(ell(bx, by, br, br), '#bdbbd6', { ink: '#3d3a52', inner: tiles.join('') + sq }));
  // head
  const head = ell(500, 318, 168, 156);
  s.push(part(head, fur));
  s.push(hl('M380,250 C400,212 440,190 480,186', 10, 0.6));
  // floppy ears
  s.push(part('M372,232 C320,236 300,300 306,380 C310,440 338,470 366,460 C392,452 396,400 396,350 C396,300 404,250 372,232 Z', furDk, { off: [-10, -8] }));
  s.push(part('M628,232 C680,236 700,300 694,380 C690,440 662,470 634,460 C608,452 604,400 604,350 C604,300 596,250 628,232 Z', furDk, { off: [-10, -8] }));
  // muzzle, nose, mouth
  s.push(part(ell(500, 384, 88, 64), cream, { off: [-8, -8] }));
  s.push(part('M474,346 C474,334 526,334 526,346 C526,364 510,374 500,374 C490,374 474,364 474,346 Z', '#3b2418', { off: [-4, -4], lw: 4 }));
  s.push(hl('M486,344 C492,340 500,340 506,341', 5, 0.7));
  s.push(part('M460,396 C470,428 492,440 500,440 C512,440 532,428 540,396 C522,404 478,404 460,396 Z', '#4a1a2c', { off: [0, 0], lw: 5, inner: '<ellipse cx="500" cy="436" rx="22" ry="16" fill="#ff7a9a"/>' }));
  // eyes, blush, tuft
  s.push(eye(436, 296, 20), eye(564, 296, 20));
  s.push(blush(410, 362), blush(590, 362));
  s.push(line('M484,170 C478,150 490,136 506,138 M508,168 C510,150 526,144 538,152', darken(fur, 0.42), 6));
  const front = [
    star(250, 200, 22, '#f472b6', 10), star(300, 380, 18, '#22d3ee', -8), star(820, 280, 20, '#f472b6', 5),
    star(220, 560, 18, '#facc15', 0), star(850, 450, 24, '#facc15', 12), star(560, 90, 18, '#22d3ee', 0),
  ].join('');
  return page({ accent: '#eab308', figure: s.join('\n'), front, seed: 4 });
}
