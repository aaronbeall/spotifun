import fs from 'fs';import {chromium} from 'playwright';
const grad=`<linearGradient id="t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbbf24"/><stop offset=".55" stop-color="#fb7185"/><stop offset="1" stop-color="#d946ef"/></linearGradient>`;
const tape=`<g transform="rotate(-9 256 256)">
<rect x="78" y="140" width="356" height="240" rx="36" fill="#fff7ed"/>
<rect x="108" y="166" width="296" height="128" rx="24" fill="#7c3aed"/>
<rect x="144" y="196" width="224" height="70" rx="35" fill="#2e1065"/>
<circle cx="200" cy="231" r="26" fill="#fff"/><circle cx="312" cy="231" r="26" fill="#fff"/>
<circle cx="208" cy="226" r="11" fill="#2e1065"/><circle cx="320" cy="226" r="11" fill="#2e1065"/>
<path d="M150 380 L174 320 H338 L362 380 Z" fill="#fed7aa"/>
<path d="M222 340 Q256 368 290 340" fill="none" stroke="#7c3aed" stroke-width="11" stroke-linecap="round"/>
<circle cx="112" cy="352" r="9" fill="#fdba74"/><circle cx="400" cy="352" r="9" fill="#fdba74"/></g>`;
// Small-size tape: no screw dots, bigger eyes, thicker smile
const tapeSmall=`<g transform="rotate(-9 256 256)">
<rect x="60" y="128" width="392" height="264" rx="44" fill="#fff7ed"/>
<rect x="92" y="156" width="328" height="150" rx="30" fill="#7c3aed"/>
<rect x="128" y="184" width="256" height="94" rx="47" fill="#2e1065"/>
<circle cx="190" cy="231" r="36" fill="#fff"/><circle cx="322" cy="231" r="36" fill="#fff"/>
<circle cx="200" cy="225" r="16" fill="#2e1065"/><circle cx="332" cy="225" r="16" fill="#2e1065"/>
<path d="M214 338 Q256 376 298 338" fill="none" stroke="#7c3aed" stroke-width="20" stroke-linecap="round"/></g>`;
const sparkles=`<path d="M410 70 l9 24 24 9 -24 9 -9 24 -9 -24 -24 -9 24 -9z" fill="#fff"/>
<path d="M78 418 l6 15 15 6 -15 6 -6 15 -6 -15 -15 -6 15 -6z" fill="#fff" opacity=".85"/>`;
const svg=b=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs>${grad}</defs>${b}</svg>`;
const V={
 logo: svg(`<rect width="512" height="512" rx="116" fill="url(#t)"/>${tape}${sparkles}`),
 small: svg(`<rect width="512" height="512" rx="116" fill="url(#t)"/>${tapeSmall}`),
 bleed: svg(`<rect width="512" height="512" fill="url(#t)"/><g transform="translate(256 256) scale(.86) translate(-256 -256)">${tape}${sparkles}</g>`),
 mask: svg(`<rect width="512" height="512" fill="url(#t)"/><g transform="translate(256 256) scale(.72) translate(-256 -256)">${tape}</g>`),
};
const out=process.argv[2];fs.mkdirSync(out,{recursive:true});
for(const[k,v]of Object.entries(V))fs.writeFileSync(`${out}/${k}.svg`,v);
const jobs=[['logo',1024,'logo-1024.png'],['logo',512,'logo-512.png'],['bleed',180,'apple-icon.png'],['bleed',192,'icon-192.png'],['bleed',512,'icon-512.png'],['mask',192,'maskable-192.png'],['mask',512,'maskable-512.png'],['small',16,'fav16.png'],['small',32,'fav32.png'],['small',48,'fav48.png']];
(async()=>{const b=await chromium.launch();const p=await b.newPage();
for(const[k,s,f]of jobs){await p.setViewportSize({width:s,height:s});await p.setContent(`<style>*{margin:0}</style>${V[k].replace('<svg ',`<svg width="${s}" height="${s}" `)}`);await p.screenshot({path:`${out}/${f}`,omitBackground:true});}
await b.close()})();
