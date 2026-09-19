import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { tools } from '../src/data/tools.js'

const root=process.cwd()
const template=await readFile(resolve(root,'dist/index.html'),'utf8')
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')
for(const tool of tools){
  const canonical='https://anytool.online/tools/'+tool.slug
  let html=template
    .replace(/<title>.*?<\/title>/s,`<title>${esc(tool.name)} | AnyTool.online</title>`)
    .replace(/<meta name="description" content=".*?" \/>/s,`<meta name="description" content="${esc(tool.description)}" />`)
    .replace(/<link rel="canonical" href=".*?" \/>/s,`<link rel="canonical" href="${canonical}" />`)
  const schema={ '@context':'https://schema.org','@type':'SoftwareApplication',name:tool.name,applicationCategory:'UtilitiesApplication',operatingSystem:'Web',url:canonical,description:tool.description,offers:{'@type':'Offer',price:'0',priceCurrency:'USD'} }
  html=html.replace('</head>',`<script type="application/ld+json">${JSON.stringify(schema)}</script></head>`)
  const out=resolve(root,'dist','tools',tool.slug,'index.html')
  await mkdir(dirname(out),{recursive:true})
  await writeFile(out,html)
}
const urls=['https://anytool.online/',...tools.map(t=>'https://anytool.online/tools/'+t.slug)]
const sitemap=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${u}</loc></url>`).join('')}</urlset>`
await writeFile(resolve(root,'dist','sitemap.xml'),sitemap)
console.log(`Pre-rendered metadata for ${tools.length} tools.`)
