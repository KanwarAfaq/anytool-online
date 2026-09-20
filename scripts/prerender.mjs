import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { tools } from '../src/data/tools.js'

const root=process.cwd()
const template=await readFile(resolve(root,'dist/index.html'),'utf8')
const SITE='https://anytool.online'
const lastmod=process.env.SEO_LASTMOD || new Date().toISOString().slice(0,10)
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')
const xml=esc
const locales=[
 {code:'en',prefix:'',dir:'ltr',og:'en_US',free:'Free online tool'},
 {code:'zh-TW',prefix:'/zh-tw',dir:'ltr',og:'zh_TW',free:'免費線上工具'},
 {code:'ar',prefix:'/ar',dir:'rtl',og:'ar_AR',free:'أداة مجانية عبر الإنترنت'},
 {code:'ur',prefix:'/ur',dir:'rtl',og:'ur_PK',free:'مفت آن لائن ٹول'},
]

const localizedToolNames={
 'zh-TW':{
  'take-home-pay':'台灣實領薪資計算器','labor-insurance':'台灣勞保計算器','nhi':'台灣健保費計算器','income-tax':'台灣所得稅計算器','overtime-pay':'台灣加班費計算器','minimum-wage':'台灣最低工資檢查','employer-cost':'台灣雇主總成本計算器','annual-salary':'年薪 ↔ 月薪換算','percentage':'百分比計算器','image-resize':'圖片尺寸調整','image-compress':'圖片壓縮','png-to-jpg':'PNG 轉 JPG','jpg-to-png':'JPG 轉 PNG','dpi-calculator':'DPI 計算器','qr-generator':'QR Code 產生器','qr-scanner':'QR Code 掃描器','pdf-merge':'合併 PDF','pdf-split':'分割 PDF','loan-payment':'貸款月付計算器','taiwan-id-photo':'台灣護照／ARC 證件照製作','taiwan-elder-care':'台灣老人照護補助與床位查詢','ocr':'AI OCR 文字辨識','receipt-to-json':'收據轉 JSON'
 },
 ar:{
  'take-home-pay':'حاسبة صافي راتب تايوان','labor-insurance':'حاسبة تأمين العمل في تايوان','nhi':'حاسبة تأمين NHI في تايوان','income-tax':'حاسبة ضريبة الدخل في تايوان','overtime-pay':'حاسبة العمل الإضافي في تايوان','minimum-wage':'فحص الحد الأدنى للأجور في تايوان','employer-cost':'حاسبة تكلفة صاحب العمل في تايوان','annual-salary':'الراتب السنوي ↔ الشهري','percentage':'حاسبة النسبة المئوية','image-resize':'تغيير حجم الصورة','image-compress':'ضغط الصورة','png-to-jpg':'PNG إلى JPG','jpg-to-png':'JPG إلى PNG','dpi-calculator':'حاسبة DPI','qr-generator':'منشئ QR','qr-scanner':'ماسح QR','pdf-merge':'دمج PDF','pdf-split':'تقسيم PDF','loan-payment':'حاسبة دفعات القرض','taiwan-id-photo':'صانع صور جواز / ARC تايوان','taiwan-elder-care':'دعم رعاية المسنين وأسرة تايوان','ocr':'استخراج النص AI OCR','receipt-to-json':'إيصال إلى JSON'
 },
 ur:{
  'take-home-pay':'تائیوان نیٹ تنخواہ کیلکولیٹر','labor-insurance':'تائیوان لیبر انشورنس کیلکولیٹر','nhi':'تائیوان NHI کیلکولیٹر','income-tax':'تائیوان انکم ٹیکس کیلکولیٹر','overtime-pay':'تائیوان اوور ٹائم کیلکولیٹر','minimum-wage':'تائیوان کم از کم اجرت چیک','employer-cost':'تائیوان آجر لاگت کیلکولیٹر','annual-salary':'سالانہ ↔ ماہانہ تنخواہ','percentage':'فیصد کیلکولیٹر','image-resize':'تصویر ریسائز','image-compress':'تصویر کمپریس','png-to-jpg':'PNG سے JPG','jpg-to-png':'JPG سے PNG','dpi-calculator':'DPI کیلکولیٹر','qr-generator':'QR کوڈ جنریٹر','qr-scanner':'QR کوڈ اسکینر','pdf-merge':'PDF ضم کریں','pdf-split':'PDF تقسیم کریں','loan-payment':'قرض ادائیگی کیلکولیٹر','taiwan-id-photo':'تائیوان پاسپورٹ / ARC فوٹو میکر','taiwan-elder-care':'تائیوان بزرگ نگہداشت سبسڈی اور بیڈ فائنڈر','ocr':'AI OCR','receipt-to-json':'رسید سے JSON'
 }
}

const staticPages=[
 {path:'/',titles:{en:'AnyTool.online — Taiwan Calculators, Image, PDF & AI Tools','zh-TW':'AnyTool.online — 台灣計算器、圖片、PDF 與 AI 工具',ar:'AnyTool.online — حاسبات تايوان وأدوات الصور وPDF والذكاء الاصطناعي',ur:'AnyTool.online — تائیوان کیلکولیٹر، تصویر، PDF اور AI ٹولز'},description:'Free source-backed Taiwan salary calculators, passport and ARC photo tools, PDF utilities, QR tools, OCR and practical online calculators.'},
 {path:'/about',titles:{en:'About AnyTool.online','zh-TW':'關於 AnyTool.online',ar:'حول AnyTool.online',ur:'AnyTool.online کے بارے میں'},description:'How AnyTool builds fast, privacy-conscious and source-backed calculators and online utilities.'},
 {path:'/contact',titles:{en:'Contact AnyTool.online','zh-TW':'聯絡 AnyTool.online',ar:'تواصل مع AnyTool.online',ur:'AnyTool.online سے رابطہ'},description:'Report a calculation issue, official-source update, broken tool, partnership idea or accessibility problem.'},
 {path:'/privacy',titles:{en:'Privacy | AnyTool.online','zh-TW':'隱私權 | AnyTool.online',ar:'الخصوصية | AnyTool.online',ur:'پرائیویسی | AnyTool.online'},description:'How AnyTool handles browser-side processing, accounts and AI-powered file tasks.'},
 {path:'/methodology',titles:{en:'Methodology & Data Quality | AnyTool.online','zh-TW':'方法與資料品質 | AnyTool.online',ar:'المنهجية وجودة البيانات | AnyTool.online',ur:'طریقۂ کار اور ڈیٹا کوالٹی | AnyTool.online'},description:'How AnyTool verifies calculator formulas, official sources, AI outputs and government data.'},
 {path:'/sources',titles:{en:'Official Sources | AnyTool.online','zh-TW':'官方資料來源 | AnyTool.online',ar:'المصادر الرسمية | AnyTool.online',ur:'سرکاری ذرائع | AnyTool.online'},description:'Official government sources used by AnyTool for Taiwan calculations, photo rules and elderly-care information.'},
 {path:'/categories/money',titles:{en:'Money & Taiwan Tools | AnyTool.online','zh-TW':'台灣薪資與金錢工具 | AnyTool.online',ar:'أدوات المال وتايوان | AnyTool.online',ur:'مالیاتی اور تائیوان ٹولز | AnyTool.online'},description:'Source-backed Taiwan salary, tax, insurance, overtime, employer-cost and elderly-care tools.'},
 {path:'/categories/image',titles:{en:'Image & ID Photo Tools | AnyTool.online','zh-TW':'圖片與證件照工具 | AnyTool.online',ar:'أدوات الصور وصور الهوية | AnyTool.online',ur:'تصویر اور شناختی فوٹو ٹولز | AnyTool.online'},description:'Image resize, compression, format conversion, DPI, QR and Taiwan passport / ARC photo tools.'},
 {path:'/categories/document',titles:{en:'PDF & Document Tools | AnyTool.online','zh-TW':'PDF 與文件工具 | AnyTool.online',ar:'أدوات PDF والمستندات | AnyTool.online',ur:'PDF اور دستاویز ٹولز | AnyTool.online'},description:'Privacy-conscious PDF merge, split and document utilities.'},
 {path:'/categories/ai',titles:{en:'AI & OCR Tools | AnyTool.online','zh-TW':'AI 與 OCR 工具 | AnyTool.online',ar:'أدوات AI وOCR | AnyTool.online',ur:'AI اور OCR ٹولز | AnyTool.online'},description:'Authenticated OCR and structured document extraction with provider fallback.'},
 {path:'/categories/general',titles:{en:'General Calculators | AnyTool.online','zh-TW':'一般計算器 | AnyTool.online',ar:'حاسبات عامة | AnyTool.online',ur:'عام کیلکولیٹر | AnyTool.online'},description:'Practical percentage, loan and everyday calculators.'},
]
const taiwan2026=new Set(['take-home-pay','labor-insurance','nhi','income-tax','overtime-pay','minimum-wage','employer-cost','taiwan-elder-care'])
const cleanPath=p=>p==='/'?'/':p.replace(/\/$/,'')
const localizedPath=(prefix,path)=>prefix+(path==='/'?'/':path)
const basePath=p=>p.replace(/^\/(zh-tw|ar|ur)(?=\/|$)/,'')||'/'
const alternateLinks=path=>locales.map(l=>`<link rel="alternate" hreflang="${l.code}" href="${SITE+localizedPath(l.prefix,path)}" />`).join('')+`<link rel="alternate" hreflang="x-default" href="${SITE+path}" />`
const localizedToolName=(tool,locale)=>localizedToolNames[locale.code]?.[tool.slug]||tool.name
const fallbackHtml=(title,description,path)=>`<main class="seo-prerender" style="max-width:70rem;margin:0 auto;padding:3rem 1rem;color:#e8f0f7;background:#07111f"><p style="color:#6ee7b7;font-weight:700">AnyTool.online</p><h1 style="font-size:2rem;line-height:1.15;margin:.75rem 0">${esc(title)}</h1><p style="max-width:48rem;color:#cbd5e1;line-height:1.7">${esc(description)}</p><nav style="margin-top:1.5rem"><a href="${SITE}/" style="color:#6ee7b7">AnyTool home</a> · <a href="${SITE}/sources" style="color:#6ee7b7">Official sources</a> · <a href="${SITE}/methodology" style="color:#6ee7b7">Methodology</a></nav><p style="margin-top:1rem;color:#94a3b8;font-size:.875rem">Interactive tool: ${esc(SITE+path)}</p></main>`

async function emit(path,locale,title,description,schemas=[]){
 const p=cleanPath(path)
 const canonical=SITE+p
 const base=basePath(p)
 let html=template
   .replace(/<html lang="[^"]*"(?: dir="[^"]*")?>/,`<html lang="${locale.code}" dir="${locale.dir}">`)
   .replace(/<title>.*?<\/title>/s,`<title>${esc(title)}</title>`)
   .replace(/<meta name="description" content=".*?" \/>/s,`<meta name="description" content="${esc(description)}" />`)
   .replace(/<link rel="canonical" href=".*?" \/>/s,`<link rel="canonical" href="${canonical}" />`)
   .replace('<div id="root"></div>',`<div id="root">${fallbackHtml(title,description,p)}</div>`)
 html=html.replace('</head>',`<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" /><meta name="application-name" content="AnyTool.online" /><meta property="og:title" content="${esc(title)}" /><meta property="og:description" content="${esc(description)}" /><meta property="og:url" content="${canonical}" /><meta property="og:type" content="website" /><meta property="og:site_name" content="AnyTool.online" /><meta property="og:locale" content="${locale.og}" /><meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${esc(title)}" /><meta name="twitter:description" content="${esc(description)}" />${alternateLinks(base)}${schemas.map(x=>`<script type="application/ld+json">${JSON.stringify(x)}</script>`).join('')}</head>`)
 const out=p==='/'?resolve(root,'dist','index.html'):resolve(root,'dist',p.slice(1),'index.html')
 await mkdir(dirname(out),{recursive:true})
 await writeFile(out,html)
}

for(const locale of locales){
 for(const page of staticPages){
   const path=localizedPath(locale.prefix,page.path)
   const title=page.titles[locale.code]||page.titles.en
   const description=locale.code==='en'?page.description:`${page.description} ${locale.free}.`
   const canonical=SITE+path
   const schemas=page.path==='/'?[
    {'@context':'https://schema.org','@type':'WebSite',name:'AnyTool.online',url:SITE+'/',inLanguage:locale.code},
    {'@context':'https://schema.org','@type':'Organization',name:'AnyTool.online',url:SITE+'/'}
   ]:[
    {'@context':'https://schema.org','@type':page.path.startsWith('/categories/')?'CollectionPage':'WebPage',name:title,description,url:canonical,inLanguage:locale.code,isPartOf:{'@type':'WebSite',name:'AnyTool.online',url:SITE+'/'}}
   ]
   await emit(path,locale,title,description,schemas)
 }
 for(const tool of tools){
   const base='/tools/'+tool.slug
   const path=localizedPath(locale.prefix,base)
   const name=localizedToolName(tool,locale)
   const yr=taiwan2026.has(tool.slug)?' 2026':''
   const title=`${name}${yr} | AnyTool.online`
   const description=locale.code==='en'?tool.description:`${name} — ${locale.free}. ${tool.description}`
   const canonical=SITE+path
   const schemas=[
    {'@context':'https://schema.org','@type':'WebPage',name:title,url:canonical,description,inLanguage:locale.code,dateModified:lastmod,isPartOf:{'@type':'WebSite',name:'AnyTool.online',url:SITE+'/'}},
    {'@context':'https://schema.org','@type':'SoftwareApplication',name,applicationCategory:'UtilitiesApplication',operatingSystem:'Web',url:canonical,description,offers:{'@type':'Offer',price:'0',priceCurrency:'USD'}},
    {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'AnyTool',item:SITE+'/'},{'@type':'ListItem',position:2,name,item:canonical}]}
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
