import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { tools } from '../src/data/tools.js'

const out=resolve(process.cwd(),'public','tool-art')
await mkdir(out,{recursive:true})

const palette={
  money:['#b7f34a','#55d6be'],
  image:['#4cc9ff','#6f8cff'],
  document:['#8ca7ff','#7968ff'],
  ai:['#d3a7ff','#a76cff'],
  general:['#ffd166','#ff9f43']
}

const tags={
  'take-home-pay':['NT$','NET PAY'],'labor-insurance':['LI','PREMIUM'],'nhi':['NHI','5.17%'],
  'income-tax':['TAX','2026'],'overtime-pay':['OT','× 1.33'],'minimum-wage':['29.5K','MIN WAGE'],
  'employer-cost':['6%','TOTAL COST'],'annual-salary':['13×','ANNUAL'],'percentage':['%','CHANGE'],
  'image-resize':['IMG','RESIZE'],'image-compress':['KB','COMPRESS'],'png-to-jpg':['PNG','→ JPG'],
  'jpg-to-png':['JPG','→ PNG'],'dpi-calculator':['DPI','300'],'qr-generator':['QR','CREATE'],
  'qr-scanner':['SCAN','DECODE'],'pdf-merge':['PDF','MERGE'],'pdf-split':['PDF','SPLIT'],
  'loan-payment':['APR','PAYMENT'],'random-picker':['SPIN','RANDOM'],'timer':['05:00','TIMER'],'taiwan-id-photo':['35×45','ID PHOTO'],'image-to-sketch':['SKETCH','PENCIL'],
  'taiwan-elder-care':['15K','CARE'],'ocr':['OCR','TEXT'],'receipt-to-json':['JSON','RECEIPT']
}

const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')

const qrPattern=(x=88,y=154,s=9)=>[
  [0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],
  [6,0],[7,0],[8,0],[6,1],[8,1],[6,2],[7,2],[8,2],
  [0,6],[1,6],[2,6],[0,7],[2,7],[0,8],[1,8],[2,8],
  [4,1],[4,3],[6,4],[8,4],[3,5],[5,5],[7,5],[4,7],[6,7],[8,8]
].map(([cx,cy])=>`<rect x="${x+cx*s}" y="${y+cy*s}" width="${s-2}" height="${s-2}" rx="2" fill="currentColor"/>`).join('')

function scene(tool,a,b){
  if(['qr-generator','qr-scanner'].includes(tool.slug))return `
    <g color="${a}"><rect x="72" y="136" width="126" height="126" rx="22" fill="#fff"/><g transform="translate(4 4)" color="#071018">${qrPattern()}</g></g>
    <path d="M222 160h42M222 188h54M222 216h34" stroke="${b}" stroke-width="8" stroke-linecap="round" opacity=".75"/>
    ${tool.slug==='qr-scanner'?'<path d="M58 132v-18h18M212 114h18v18M58 268v18h18M212 286h18v-18" fill="none" stroke="'+a+'" stroke-width="6" stroke-linecap="round"/>':''}`
  if(['image-resize','image-compress','png-to-jpg','jpg-to-png','dpi-calculator','taiwan-id-photo','image-to-sketch'].includes(tool.slug))return `
    <rect x="66" y="132" width="164" height="132" rx="22" fill="#0f2030" stroke="${a}" stroke-opacity=".45"/>
    <circle cx="190" cy="166" r="16" fill="${b}" opacity=".9"/>
    <path d="M80 242l45-48 34 32 23-23 34 39z" fill="${a}" opacity=".38"/>
    ${tool.slug==='image-resize'?'<path d="M58 126h28M58 126v28M238 270h-28M238 270v-28" stroke="'+a+'" stroke-width="5" stroke-linecap="round"/>':''}
    ${tool.slug==='taiwan-id-photo'?'<ellipse cx="148" cy="183" rx="24" ry="29" fill="'+a+'" opacity=".7"/><path d="M103 246c7-32 25-48 45-48s38 16 45 48" fill="'+a+'" opacity=".35"/>':''}`
  if(['pdf-merge','pdf-split'].includes(tool.slug))return `
    <g transform="translate(72 132)">
      <rect x="18" y="0" width="112" height="142" rx="16" fill="#101d2c" stroke="${b}" stroke-opacity=".45"/>
      <rect x="0" y="18" width="112" height="142" rx="16" fill="#0b1623" stroke="${a}" stroke-opacity=".7"/>
      <text x="56" y="82" text-anchor="middle" fill="${a}" font-family="Arial,sans-serif" font-size="24" font-weight="900">PDF</text>
      <path d="M27 108h58M27 126h42" stroke="#fff" stroke-opacity=".18" stroke-width="6" stroke-linecap="round"/>
    </g>
    <circle cx="226" cy="206" r="27" fill="${a}" opacity=".16"/>
    <path d="${tool.slug==='pdf-merge'?'M214 206h24M226 194v24':'M214 198h24M214 214h24'}" stroke="${a}" stroke-width="5" stroke-linecap="round"/>`
  if(['ocr','receipt-to-json'].includes(tool.slug))return `
    <rect x="72" y="130" width="154" height="148" rx="20" fill="#0c1724" stroke="${a}" stroke-opacity=".55"/>
    <path d="M96 164h78M96 188h105M96 212h86M96 236h96" stroke="#fff" stroke-opacity=".16" stroke-width="7" stroke-linecap="round"/>
    <path d="M63 151v-24h24M211 127h24v24M63 257v24h24M235 281h-24v-24" fill="none" stroke="${b}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="202" cy="162" r="10" fill="${a}"/>`
  if(tool.slug==='taiwan-elder-care')return `
    <rect x="66" y="158" width="168" height="108" rx="20" fill="#0d1b28" stroke="${a}" stroke-opacity=".45"/>
    <rect x="88" y="184" width="54" height="44" rx="10" fill="${a}" opacity=".28"/>
    <path d="M142 210h68v36M92 246v-58M210 246v-58" stroke="${a}" stroke-width="7" stroke-linecap="round"/>
    <path d="M164 142h24M176 130v24" stroke="${b}" stroke-width="6" stroke-linecap="round"/>`
  if(tool.slug==='random-picker')return `
    <circle cx="150" cy="205" r="70" fill="#0c1724" stroke="${a}" stroke-opacity=".6"/>
    <path d="M150 205V135A70 70 0 0 1 210 170z" fill="${a}" opacity=".85"/><path d="M150 205l60-35a70 70 0 0 1 2 66z" fill="${b}" opacity=".8"/><path d="M150 205l62 31a70 70 0 0 1-80 37z" fill="#ff6b6b" opacity=".8"/><path d="M150 205l-18 68a70 70 0 0 1-52-92z" fill="#ffd166" opacity=".82"/><path d="M150 205l-70-24a70 70 0 0 1 70-46z" fill="#06d6a0" opacity=".8"/><circle cx="150" cy="205" r="12" fill="#071018"/><path d="M150 121l-10 17h20z" fill="#fff"/>`
  if(tool.slug==='timer')return `
    <circle cx="150" cy="205" r="70" fill="#0c1724" stroke="${a}" stroke-width="7" stroke-opacity=".65"/><path d="M150 205V157M150 205l34 22" stroke="${b}" stroke-width="8" stroke-linecap="round"/><circle cx="150" cy="205" r="8" fill="${a}"/><path d="M126 120h48" stroke="${a}" stroke-width="8" stroke-linecap="round"/>`
  if(['percentage','loan-payment'].includes(tool.slug))return `
    <circle cx="145" cy="205" r="66" fill="#0c1724" stroke="${a}" stroke-opacity=".5"/>
    <path d="M145 205V145a60 60 0 0 1 54 34z" fill="${a}" opacity=".6"/>
    <text x="145" y="222" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="30" font-weight="900">${tool.slug==='percentage'?'%':'APR'}</text>`
  return `
    <rect x="70" y="144" width="166" height="118" rx="22" fill="#0c1724" stroke="${a}" stroke-opacity=".4"/>
    <rect x="91" y="224" width="22" height="20" rx="6" fill="${a}" opacity=".35"/>
    <rect x="124" y="199" width="22" height="45" rx="6" fill="${a}" opacity=".55"/>
    <rect x="157" y="174" width="22" height="70" rx="6" fill="${b}" opacity=".72"/>
    <rect x="190" y="154" width="22" height="90" rx="6" fill="${a}" opacity=".9"/>
    <path d="M88 172c32-10 57-19 91-47 14 9 24 13 42 9" fill="none" stroke="${b}" stroke-width="5" stroke-linecap="round"/>`
}

for(const tool of tools){
  const [a,b]=palette[tool.category]||palette.general
  const [tag,sub]=tags[tool.slug]||['TOOL','READY']
  const title=esc(tool.name.length>34?tool.name.slice(0,32)+'…':tool.name)
  const category=esc(tool.category.toUpperCase())
  const privacy=['image-resize','image-compress','png-to-jpg','jpg-to-png','qr-generator','qr-scanner','pdf-merge','pdf-split','dpi-calculator','percentage','loan-payment','random-picker','timer','image-to-sketch'].includes(tool.slug)
    ? 'BROWSER-FIRST'
    : tool.category==='money' ? 'SOURCE-BACKED' : 'SMART TOOL'

  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" role="img" aria-labelledby="title desc">
  <title id="title">${esc(tool.name)} visual preview</title><desc id="desc">${esc(tool.description)}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#132235"/><stop offset=".55" stop-color="#09131f"/><stop offset="1" stop-color="#071018"/></linearGradient>
    <linearGradient id="ac" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
    <radialGradient id="glow"><stop stop-color="${a}" stop-opacity=".24"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="640" height="360" rx="32" fill="url(#bg)"/>
  <circle cx="132" cy="184" r="170" fill="url(#glow)"/>
  <path d="M0 300C150 250 230 330 360 292s190-72 280-40v108H0z" fill="${a}" opacity=".035"/>
  <rect x="26" y="26" width="588" height="308" rx="26" fill="none" stroke="#fff" stroke-opacity=".075"/>
  <text x="48" y="62" fill="${a}" font-family="Arial,sans-serif" font-size="13" font-weight="900" letter-spacing="2.2">${category}</text>
  <text x="48" y="96" fill="#f8fafc" font-family="Arial,sans-serif" font-size="24" font-weight="800">${title}</text>
  ${scene(tool,a,b)}
  <g transform="translate(300 132)">
    <rect width="286" height="146" rx="22" fill="#071018" fill-opacity=".88" stroke="#fff" stroke-opacity=".075"/>
    <text x="24" y="32" fill="#7f93a9" font-family="Arial,sans-serif" font-size="12" font-weight="800" letter-spacing="1.6">LIVE PREVIEW</text>
    <text x="24" y="76" fill="${a}" font-family="Arial,sans-serif" font-size="${tag.length>6?25:34}" font-weight="900">${esc(tag)}</text>
    <text x="24" y="101" fill="#d9e4ef" font-family="Arial,sans-serif" font-size="13" font-weight="800">${esc(sub)}</text>
    <rect x="177" y="34" width="82" height="82" rx="20" fill="url(#ac)" opacity=".12"/>
    <path d="M194 92l17-17 13 12 22-27" fill="none" stroke="${b}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="246" cy="60" r="5" fill="${a}"/>
  </g>
  <rect x="300" y="294" width="132" height="24" rx="12" fill="${a}" opacity=".12"/>
  <text x="366" y="310" text-anchor="middle" fill="${a}" font-family="Arial,sans-serif" font-size="10" font-weight="900" letter-spacing="1">${privacy}</text>
  <text x="586" y="310" text-anchor="end" fill="#6f8296" font-family="Arial,sans-serif" font-size="11" font-weight="700">ANYTOOL.ONLINE</text>
</svg>`
  await writeFile(resolve(out,tool.slug+'.svg'),svg)
}

console.log('Generated '+tools.length+' distinct tool preview images.')
