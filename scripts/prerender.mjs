import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { tools } from '../src/data/tools.js'

const root=process.cwd()
const template=await readFile(resolve(root,'dist/index.html'),'utf8')
const SITE='https://anytool.online'
const lastmod=new Date().toISOString().slice(0,10)
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')
const xml=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
const locales=[
 {code:'en',prefix:'',dir:'ltr',suffix:'Free Online Tool'},
 {code:'zh-TW',prefix:'/zh-tw',dir:'ltr',suffix:'免費線上工具'},
 {code:'ar',prefix:'/ar',dir:'rtl',suffix:'أداة مجانية عبر الإنترنت'},
 {code:'ur',prefix:'/ur',dir:'rtl',suffix:'مفت آن لائن ٹول'},
]
const staticPages=[
 {path:'/',title:'AnyTool.online — Taiwan Calculators, Image, PDF & AI Tools',description:'Free source-backed Taiwan salary calculators, passport and ARC photo tools, PDF utilities, QR tools, OCR and practical online calculators.'},
 {path:'/about',title:'About AnyTool.online',description:'How AnyTool builds fast, privacy-conscious and source-backed calculators and online utilities.'},
 {path:'/contact',title:'Contact AnyTool.online',description:'Report a calculation issue, official-source update, broken tool, partnership idea or accessibility problem.'},
 {path:'/privacy',title:'Privacy | AnyTool.online',description:'How AnyTool handles browser-side processing, accounts and AI-powered file tasks.'},
 {path:'/methodology',title:'Methodology & Data Quality | AnyTool.online',description:'How AnyTool verifies calculator formulas, official sources, AI outputs and government data.'},
 {path:'/sources',title:'Official Sources | AnyTool.online',description:'Official government sources used by AnyTool for Taiwan calculations, photo rules and elderly-care information.'},
 {path:'/categories/money',title:'Money & Taiwan Tools | AnyTool.online',description:'Source-backed Taiwan salary, tax, insurance, overtime, employer-cost and elderly-care tools.'},
 {path:'/categories/image',title:'Image & ID Photo Tools | AnyTool.online',description:'Image resize, compression, format conversion, DPI, QR and Taiwan passport / ARC photo tools.'},
 {path:'/categories/document',title:'PDF & Document Tools | AnyTool.online',description:'Privacy-conscious PDF merge, split and document utilities.'},
 {path:'/categories/ai',title:'AI & OCR Tools | AnyTool.online',description:'Authenticated OCR and structured document extraction with provider fallback.'},
 {path:'/categories/general',title:'General Calculators | AnyTool.online',description:'Practical percentage, loan and everyday calculators.'},
]
const taiwan2026=new Set(['take-home-pay','labor-insurance','nhi','income-tax','overtime-pay','minimum-wage','employer-cost','taiwan-elder-care'])

const cleanPath=p=>p==='/'?'/':p.replace(/\/$/,'')
const localizedPath=(prefix,path)=>prefix+(path==='/'?'/':path)
const alternateLinks=path=>locales.map(l=>`<link rel="alternate" hreflang="${l.code}" href="${SITE+localizedPath(l.prefix,path)}" />`).join('')+`<link rel="alternate" hreflang="x-default" href="${SITE+path}" />`

async function emit(path,locale,title,description,schemas=[]){
 const p=cleanPath(path)
 const canonical=SITE+p
 let html=template
   .replace(/<html lang="[^"]*"(?: dir="[^"]*")?>/,`<html lang="${locale.code}" dir="${locale.dir}">`)
   .replace(/<title>.*?<\/title>/s,`<title>${esc(title)}</title>`)
   .replace(/<meta name="description" content=".*?" \/>/s,`<meta name="description" content="${esc(description)}" />`)
   .replace(/<link rel="canonical" href=".*?" \/>/s,`<link rel="canonical" href="${canonical}" />`)
 html=html.replace('</head>',`<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" /><meta property="og:title" content="${esc(title)}" /><meta property="og:description" content="${esc(description)}" /><meta property="og:url" content="${canonical}" /><meta property="og:type" content="website" /><meta property="og:site_name" content="AnyTool.online" /><meta name="twitter:card" content="summary_large_image" />${alternateLinks(p.replace(/^\/(zh-tw|ar|ur)(?=\/|$)/,'' )||'/')}${schemas.map(x=>`<script type="application/ld+json">${JSON.stringify(x)}</script>`).join('')}</head>`)
 const out=p==='/'?resolve(root,'dist','index.html'):resolve(root,'dist',p.slice(1),'index.html')
 await mkdir(dirname(out),{recursive:true})
 await writeFile(out,html)
}

for(const locale of locales){
 for(const page of staticPages){
   const path=localizedPath(locale.prefix,page.path)
   const title=locale.code==='en'?page.title:`${page.title} | ${locale.suffix}`
   const description=locale.code==='en'?page.description:`${page.description} — ${locale.suffix}.`
   const schemas=page.path==='/'?[
    {'@context':'https://schema.org','@type':'WebSite',name:'AnyTool.online',url:SITE+'/'},
    {'@context':'https://schema.org','@type':'Organization',name:'AnyTool.online',url:SITE+'/'}
   ]:[]
   await emit(path,locale,title,description,schemas)
 }
 for(const tool of tools){
   const base='/tools/'+tool.slug
   const path=localizedPath(locale.prefix,base)
   const yr=taiwan2026.has(tool.slug)?' 2026':''
   const title=locale.code==='en'?`${tool.name}${yr} | AnyTool.online`:`${tool.name}${yr} — ${locale.suffix} | AnyTool`
   const description=locale.code==='en'?tool.description:`${tool.description} ${locale.suffix}.`
   const canonical=SITE+path
   const schemas=[
    {'@context':'https://schema.org','@type':'SoftwareApplication',name:tool.name,applicationCategory:'UtilitiesApplication',operatingSystem:'Web',url:canonical,description:tool.description,offers:{'@type':'Offer',price:'0',priceCurrency:'USD'}},
    {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'AnyTool',item:SITE+'/'},{'@type':'ListItem',position:2,name:tool.name,item:canonical}]}
   ]
   await emit(path,locale,title,description,schemas)
 }
}

const indexable=[...staticPages.map(p=>p.path),...tools.map(t=>'/tools/'+t.slug)]
const entries=[]
for(const path of indexable){
 const alternates=locales.map(l=>({code:l.code,loc:SITE+localizedPath(l.prefix,path)}))
 for(const alt of alternates){
   entries.push(`<url><loc>${xml(alt.loc)}</loc><lastmod>${lastmod}</lastmod>${alternates.map(a=>`<xhtml:link rel="alternate" hreflang="${a.code}" href="${xml(a.loc)}" />`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${xml(SITE+path)}" /></url>`)
 }
}
const sitemap=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join('')}</urlset>`
await writeFile(resolve(root,'dist','sitemap.xml'),sitemap)
console.log(`Pre-rendered ${entries.length} indexable localized URLs for ${tools.length} tools.`)
