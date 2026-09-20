import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { tools } from '../src/data/tools.js'
import { officialSources, toolSourceKeys } from '../src/data/officialSources.js'

const root=process.cwd()
const template=await readFile(resolve(root,'dist/index.html'),'utf8')
const SITE='https://www.anytool.online'
let lastmod=process.env.SEO_LASTMOD||''
if(!lastmod){try{lastmod=execFileSync('git',['log','-1','--format=%cs'],{encoding:'utf8'}).trim()}catch{lastmod=new Date().toISOString().slice(0,10)}}
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
 {path:'/',titles:{en:'Taiwan Calculators 2026, Passport/ARC Photo & Free Tools | AnyTool','zh-TW':'2026 台灣薪資稅務計算、護照 ARC 證件照與實用工具 | AnyTool',ar:'حاسبات تايوان 2026 وأدوات صور الجواز وARC | AnyTool',ur:'تائیوان کیلکولیٹر 2026، پاسپورٹ/ARC فوٹو اور مفت ٹولز | AnyTool'},description:'Free 2026 Taiwan salary, tax, insurance, overtime and elderly-care tools plus official passport/ARC photo guidance, PDF, QR and OCR utilities.'},
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
const gitDate=file=>{try{return execFileSync('git',['log','-1','--format=%cs','--',file],{encoding:'utf8'}).trim()||lastmod}catch{return lastmod}}
const toolTemplateDate=gitDate('src/pages/ToolPage.jsx')
const toolsDataDate=gitDate('src/data/tools.js')
const staticDateByPath={
 '/':gitDate('src/pages/Home.jsx'),
 '/about':gitDate('src/pages/About.jsx'),
 '/contact':gitDate('src/pages/Contact.jsx'),
 '/privacy':gitDate('src/pages/Privacy.jsx'),
 '/methodology':gitDate('src/pages/Methodology.jsx'),
 '/sources':gitDate('src/pages/Sources.jsx'),
 '/categories/money':gitDate('src/pages/Category.jsx'),
 '/categories/image':gitDate('src/pages/Category.jsx'),
 '/categories/document':gitDate('src/pages/Category.jsx'),
 '/categories/ai':gitDate('src/pages/Category.jsx'),
 '/categories/general':gitDate('src/pages/Category.jsx'),
}
const maxDate=(...xs)=>xs.filter(Boolean).sort().at(-1)||lastmod
const contentLastmod=path=>{
 const clean=basePath(path)
 const slug=clean.match(/^\/tools\/([^/]+)$/)?.[1]
 if(slug){
   const verified=(toolSourceKeys[slug]||[]).map(k=>officialSources[k]?.verified).filter(Boolean)
   return maxDate(toolTemplateDate,toolsDataDate,...verified)
 }
 return staticDateByPath[clean]||lastmod
}
const metaDescription=(tool,locale,name)=>{
 if(locale.code==='en')return tool.description
 if(locale.code==='zh-TW')return `${name}：免費互動式線上工具。提供清楚操作步驟與相關工具；涉及台灣法規或公共服務時，頁面會顯示官方來源、查核日期與限制。`
 if(locale.code==='ar')return `${name}: أداة تفاعلية مجانية مع خطوات واضحة وأدوات مرتبطة. عند التعامل مع قواعد أو خدمات تايوان، تعرض الصفحة المصادر الحكومية وتاريخ التحقق والقيود.`
 return `${name}: مفت انٹرایکٹو آن لائن ٹول، واضح استعمال کے مراحل اور متعلقہ ٹولز کے ساتھ۔ تائیوان کے قواعد یا عوامی خدمات کے لیے سرکاری ذرائع، تصدیق کی تاریخ اور حدود دکھائی جاتی ہیں۔`
}
const fallbackHtml=(title,description,path)=>{
 const clean=basePath(path)
 const slug=clean.match(/^\/tools\/([^/]+)$/)?.[1]||''
 const tool=tools.find(t=>t.slug===slug)
 const code=path.startsWith('/zh-tw')?'zh-TW':path.startsWith('/ar')?'ar':path.startsWith('/ur')?'ur':'en'
 const ui={
  en:{about:'What this tool does',how:'How to use it',sources:'Official sources & verification',privacy:'Processing & reliability',step1:'Enter your values or choose the file that matches your task.',step2:'Review the result and adjust the available controls.',step3:'For regulated Taiwan information, verify special cases with the official source links.',privacyText:'Deterministic calculations stay in code and files are processed in the browser when practical. Verify AI output and changing government vacancy data before important decisions.',related:'Related tools'},
  'zh-TW':{about:'這個工具可以做什麼',how:'如何使用',sources:'官方來源與查核',privacy:'處理方式與可靠性',step1:'輸入符合情況的數值，或選擇要處理的檔案。',step2:'查看結果並調整可用設定。',step3:'涉及台灣法規或公共服務時，請用下方官方來源確認特殊情況。',privacyText:'可確定的公式保留在程式中；可行時檔案直接在瀏覽器處理。AI 輸出與會變動的政府床位資料在重要決策前仍應再次確認。',related:'相關工具'},
  ar:{about:'ماذا تفعل هذه الأداة',how:'كيفية الاستخدام',sources:'المصادر الرسمية والتحقق',privacy:'المعالجة والموثوقية',step1:'أدخل القيم المناسبة أو اختر الملف المطلوب.',step2:'راجع النتيجة واضبط الإعدادات المتاحة.',step3:'لقواعد وخدمات تايوان، تحقق من الحالات الخاصة عبر المصادر الرسمية أدناه.',privacyText:'تبقى الحسابات الحتمية في الشيفرة وتتم معالجة الملفات في المتصفح متى أمكن. تحقق من مخرجات AI وبيانات الشواغر الحكومية المتغيرة قبل القرارات المهمة.',related:'أدوات ذات صلة'},
  ur:{about:'یہ ٹول کیا کرتا ہے',how:'استعمال کا طریقہ',sources:'سرکاری ذرائع اور تصدیق',privacy:'پراسیسنگ اور قابلِ اعتماد معلومات',step1:'اپنی صورتحال کے مطابق اقدار درج کریں یا مطلوبہ فائل منتخب کریں۔',step2:'نتیجہ دیکھیں اور دستیاب سیٹنگز ایڈجسٹ کریں۔',step3:'تائیوان کے قواعد یا عوامی خدمات کے لیے خصوصی حالات کو نیچے سرکاری ذرائع سے چیک کریں۔',privacyText:'یقینی حسابات کوڈ میں رہتے ہیں اور جہاں ممکن ہو فائلیں براؤزر میں پراسیس ہوتی ہیں۔ اہم فیصلوں سے پہلے AI نتائج اور بدلتے سرکاری بیڈ ڈیٹا کی تصدیق کریں۔',related:'متعلقہ ٹولز'}
 }[code]
 const sourceKeys=tool?toolSourceKeys[tool.slug]||[]:[]
 const sourceHtml=sourceKeys.length?`<section><h2>${esc(ui.sources)}</h2><ul>${sourceKeys.map(k=>{const x=officialSources[k];return x?`<li><a href="${esc(x.url)}">${esc(x.title)}</a> — ${esc(x.authority)} · verified ${esc(x.verified)}<p>${esc(x.summary||'')}</p></li>`:''}).join('')}</ul></section>`:''
 const prefix=code==='zh-TW'?'/zh-tw':code==='ar'?'/ar':code==='ur'?'/ur':''
 const related=tool?tools.filter(x=>x.slug!==tool.slug&&x.category===tool.category).slice(0,4):[]
 const relatedHtml=related.length?`<section><h2>${esc(ui.related)}</h2><ul>${related.map(x=>`<li><a href="${SITE}${prefix}/tools/${x.slug}">${esc(localizedToolName(x,{code}))}</a></li>`).join('')}</ul></section>`:''
 const categoryMatch=clean.match(/^\/categories\/([^/]+)$/)
 const listing=!tool&&(clean==='/'||categoryMatch)?tools.filter(x=>!categoryMatch||x.category===categoryMatch[1]):[]
 const listingHtml=listing.length?`<section><h2>${esc(code==='zh-TW'?'可用工具':code==='ar'?'الأدوات المتاحة':code==='ur'?'دستیاب ٹولز':'Available tools')}</h2><ul>${listing.map(x=>`<li><a href="${SITE}${prefix}/tools/${x.slug}">${esc(localizedToolName(x,{code}))}</a> — ${esc(x.description)}</li>`).join('')}</ul></section>`:''
 return `<main class="seo-prerender" style="max-width:70rem;margin:0 auto;padding:3rem 1rem;color:#e8f0f7;background:#07111f;font-family:system-ui,sans-serif"><nav><a href="${SITE}/" style="color:#6ee7b7">AnyTool.online</a> · <a href="${SITE}/sources" style="color:#6ee7b7">${esc(ui.sources)}</a> · <a href="${SITE}/methodology" style="color:#6ee7b7">Methodology</a></nav><h1 style="font-size:2.25rem;line-height:1.15;margin:1rem 0">${esc(title)}</h1><p style="max-width:52rem;color:#cbd5e1;line-height:1.75">${esc(description)}</p>${tool?`<section><h2>${esc(ui.about)}</h2><p style="max-width:52rem;line-height:1.7">${esc(description)}</p></section><section><h2>${esc(ui.how)}</h2><ol><li>${esc(ui.step1)}</li><li>${esc(ui.step2)}</li><li>${esc(ui.step3)}</li></ol></section><section><h2>${esc(ui.privacy)}</h2><p style="max-width:52rem;line-height:1.7">${esc(ui.privacyText)}</p></section>`:''}${sourceHtml}${relatedHtml}${listingHtml}<p style="margin-top:1.5rem;color:#94a3b8;font-size:.875rem">Interactive URL: ${esc(SITE+path)}</p></main>`
}

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
 html=html.replace('</head>',`<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" /><meta name="application-name" content="AnyTool.online" /><meta property="og:title" content="${esc(title)}" /><meta property="og:description" content="${esc(description)}" /><meta property="og:url" content="${canonical}" /><meta property="og:type" content="website" /><meta property="og:site_name" content="AnyTool.online" /><meta property="og:locale" content="${locale.og}" /><meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${esc(title)}" /><meta name="twitter:description" content="${esc(description)}" />${alternateLinks(base)}${schemas.map(x=>`<script type="application/ld+json" data-anytool-prerender-jsonld="1">${JSON.stringify(x)}</script>`).join('')}</head>`)
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
    {'@context':'https://schema.org','@type':'Organization',name:'AnyTool.online',url:SITE+'/',logo:SITE+'/favicon.svg',contactPoint:{'@type':'ContactPoint',contactType:'customer support',url:SITE+'/contact'}}
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
   const description=metaDescription(tool,locale,name)
   const canonical=SITE+path
   const schemas=[
    {'@context':'https://schema.org','@type':'WebPage',name:title,url:canonical,description,inLanguage:locale.code,dateModified:contentLastmod(path),isPartOf:{'@type':'WebSite',name:'AnyTool.online',url:SITE+'/'}},
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
   entries.push(`<url><loc>${xml(alt.loc)}</loc><lastmod>${contentLastmod(path)}</lastmod>${alternates.map(a=>`<xhtml:link rel="alternate" hreflang="${a.code}" href="${xml(a.loc)}" />`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${xml(SITE+path)}" /></url>`)
 }
}
const sitemap=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join('')}</urlset>`
await writeFile(resolve(root,'dist','sitemap.xml'),sitemap)
await writeFile(resolve(root,'dist','tool-catalog.json'),JSON.stringify({
 generatedAt:new Date().toISOString(),
 canonicalSite:SITE,
 tools:tools.map(t=>({
  slug:t.slug,
  name:t.name,
  category:t.category,
  description:t.description,
  url:SITE+'/tools/'+t.slug,
  lastModified:contentLastmod('/tools/'+t.slug),
  officialSources:(toolSourceKeys[t.slug]||[]).map(k=>({key:k,...officialSources[k]}))
 }))
},null,2))
await writeFile(resolve(root,'dist','official-sources.json'),JSON.stringify({
 generatedAt:new Date().toISOString(),
 sources:officialSources
},null,2))
console.log(`Pre-rendered ${entries.length} indexable localized URLs for ${tools.length} tools.`)
