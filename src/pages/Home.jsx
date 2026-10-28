import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Calculator, Code2, FileText, Image as ImageIcon, BrainCircuit, Palette, Search, Shield, ShieldCheck, Sparkles, Type, WalletCards, Zap, Languages, ScanLine, Hammer } from 'lucide-react'
import { categories, tools, toolBySlug } from '../data/tools'
import { takeHome, money } from '../lib/calculators'
import Seo from '../components/Seo'
import { useI18n } from '../i18n'
import { faqFor } from '../data/homeFaq'

const categoryIcon={money:WalletCards,image:ImageIcon,document:FileText,ai:BrainCircuit,general:Calculator,developer:Code2,text:Type,security:Shield,design:Palette,renovation:Hammer}
const categoryAccent={money:'text-lime-300',image:'text-sky-300',document:'text-indigo-300',ai:'text-violet-300',general:'text-amber-300',developer:'text-cyan-300',text:'text-fuchsia-300',security:'text-emerald-300',design:'text-pink-300',renovation:'text-orange-300'}

function QuickSalary({copy,pathFor}){
 const [salary,setSalary]=useState(50000)
 const [dependents,setDependents]=useState(0)
 const r=takeHome(Number(salary)||0,Number(dependents)||0)
 return <div>
    <div className="flex items-center justify-between gap-3"><h2>{copy.quick}</h2><span className="rounded-full px-2.5 py-1 text-[11px] font-black" style={{background:'color-mix(in srgb,var(--on-accent) 18%,transparent)'}}>2026</span></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <label><span className="mb-1.5 block text-xs font-bold opacity-80">{copy.salary}</span><input aria-label={copy.salary} className="input" type="number" inputMode="numeric" min="0" value={salary===0?'':salary} placeholder="50000" onFocus={e=>e.target.select()} onChange={e=>setSalary(e.target.value===''?0:Number(e.target.value))}/></label>
      <label><span className="mb-1.5 block text-xs font-bold opacity-80">{copy.dependents}</span><select aria-label={copy.dependents} className="input" value={dependents} onChange={e=>setDependents(Number(e.target.value))}>{[0,1,2,3].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
    </div>
    <div className="hero-console mt-4 flex items-end justify-between gap-4 p-4">
      <div><p className="text-xs opacity-80">{copy.net}</p><p className="mt-1 text-3xl font-black tracking-tight">NT$ {money(r.net)}</p><p className="mt-1 text-xs opacity-80">{copy.deduct} NT$ {money(r.deductions)}</p></div>
      <Link to={pathFor('/tools/take-home-pay')} className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--on-accent)] text-[var(--accent)] transition hover:scale-105" aria-label={copy.open}><ArrowRight size={18}/></Link>
    </div>
 </div>
}

export default function Home(){
 const {lang,t,toolName,toolDescription,pathFor}=useI18n()
 const location=useLocation()
 const [filter,setFilter]=useState('all')
 const [query,setQuery]=useState(()=>new URLSearchParams(location.search).get('q')||'')
 const [recent,setRecent]=useState([])
 useEffect(()=>{try{const ids=JSON.parse(localStorage.getItem('anytool_recent')||'[]');setRecent(ids.map(x=>toolBySlug[x]).filter(Boolean).slice(0,5))}catch{}},[])
 useEffect(()=>{const q=new URLSearchParams(location.search).get('q')||'';setQuery(q)},[location.search])
 const C={
  en:{try:'Try “passport”, “PDF” or “salary”',eyebrow:'Simple tools. Better results.',heroA:'Free online tools',heroB:'for every task.',body:'Free online tools for PDF, images, calculators and QR codes — fast, private and no sign-up.',browse:'Find a tool',salaryCta:'Try salary',live:'Live tool',quick:'Take-home pay',salary:'Monthly salary (NT$)',dependents:'NHI dependents',net:'Estimated take-home',deduct:'Estimated deductions',open:'Open full calculator',verified:'Official-source checks',langs:'4 languages',private:'Browser-first',ticker:'Popular right now',all:'All',find:'Search tools…',recent:'Recent',toolsTitle:'Popular free online tools',viewAll:'View all tools',noMatch:'No matching tools.'},
  'zh-TW':{try:'試試「護照」、「PDF」或「薪資」',eyebrow:'真正能完成工作的工具',heroA:'計算、轉換、',heroB:'掃描，完成。',body:'台灣計算器、證件照、PDF、QR 與 AI 工具，快速又專注。',browse:'找工具',salaryCta:'試算薪資',live:'即時工具',quick:'實領薪資',salary:'月薪（NT$）',dependents:'健保眷屬',net:'預估實領',deduct:'預估扣除',open:'開啟完整計算器',verified:'官方來源查核',langs:'4 種語言',private:'瀏覽器優先',ticker:'熱門工具',all:'全部',find:'搜尋工具…',recent:'最近使用',toolsTitle:'選一個工具就開始',viewAll:'查看全部工具',noMatch:'找不到相符工具。'},
  ar:{try:'جرّب «جواز» أو «PDF» أو «راتب»',eyebrow:'أدوات تنجز المهمة فعلاً',heroA:'احسب. حوّل.',heroB:'امسح. انتهى.',body:'حاسبات تايوان والصور وPDF وQR وأدوات AI — سريعة ومباشرة.',browse:'اعثر على أداة',salaryCta:'جرّب الراتب',live:'أداة مباشرة',quick:'صافي الراتب',salary:'الراتب الشهري (NT$)',dependents:'المعالون في NHI',net:'صافي الراتب التقديري',deduct:'الخصومات المقدرة',open:'افتح الحاسبة',verified:'مصادر رسمية',langs:'4 لغات',private:'المتصفح أولاً',ticker:'الأكثر استخداماً',all:'الكل',find:'ابحث عن أداة…',recent:'الأخيرة',toolsTitle:'اختر أداة وابدأ',viewAll:'عرض كل الأدوات',noMatch:'لا توجد أداة مطابقة.'},
  ur:{try:'آزمائیں: «پاسپورٹ»، «PDF» یا «تنخواہ»',eyebrow:'ٹولز جو واقعی کام کریں',heroA:'حساب کریں۔ تبدیل کریں۔',heroB:'اسکین کریں۔ مکمل۔',body:'تائیوان کیلکولیٹر، فوٹو، PDF، QR اور AI ٹولز — تیز اور سیدھے۔',browse:'ٹول تلاش کریں',salaryCta:'تنخواہ آزمائیں',live:'لائیو ٹول',quick:'نیٹ تنخواہ',salary:'ماہانہ تنخواہ (NT$)',dependents:'NHI زیرِ کفالت',net:'تخمینی نیٹ تنخواہ',deduct:'تخمینی کٹوتیاں',open:'مکمل کیلکولیٹر',verified:'سرکاری ذرائع',langs:'4 زبانیں',private:'براؤزر فرسٹ',ticker:'مقبول ٹولز',all:'سب',find:'ٹول تلاش کریں…',recent:'حالیہ',toolsTitle:'ٹول منتخب کریں اور شروع کریں',viewAll:'تمام ٹولز دیکھیں',noMatch:'کوئی ٹول نہیں ملا۔'}
 }[lang]
 const seo={
  en:{title:'Free Online Tools: PDF, Images, Calculators & QR | AnyTool',description:'Free online tools for PDF, images, calculators and QR codes, plus Taiwan salary, tax and insurance estimators. Fast, private, no sign-up.'},
  'zh-TW':{title:'2026 台灣薪資稅務計算、護照 ARC 證件照與實用工具 | AnyTool',description:'免費 2026 台灣薪資、所得稅、勞健保、加班費、老人照護、護照／ARC 證件照、PDF、QR 與 OCR 工具。'},
  ar:{title:'حاسبات تايوان 2026 وأدوات صور الجواز وARC | AnyTool',description:'حاسبات مجانية للرواتب والضرائب والتأمين والعمل الإضافي ورعاية المسنين في تايوان مع أدوات الصور وPDF وQR وOCR.'},
  ur:{title:'تائیوان کیلکولیٹر 2026، پاسپورٹ/ARC فوٹو اور مفت ٹولز | AnyTool',description:'مفت تائیوان تنخواہ، ٹیکس، انشورنس، بزرگ نگہداشت، پاسپورٹ/ARC فوٹو، PDF، QR اور OCR ٹولز۔'}
 }[lang]
 const filtered=useMemo(()=>tools.filter(tool=>(filter==='all'||tool.category===filter)&&(!query.trim()||(toolName(tool)+' '+toolDescription(tool)).toLowerCase().includes(query.toLowerCase()))),[filter,query,lang,toolName,toolDescription])
 const faqByLang=faqFor(lang)
 const ticker=[...tools.slice(0,10),...tools.slice(0,10)]
 const homeTools=filtered.slice(0,12)
 return <>
  <Seo title={seo.title} description={seo.description} image="/tool-art/take-home-pay.svg" jsonLd={[
    {'@context':'https://schema.org','@type':'WebSite',name:'AnyTool.online',alternateName:'AnyTool',url:'https://anytool.online/',inLanguage:lang,potentialAction:{'@type':'SearchAction',target:'https://anytool.online/?q={search_term_string}','query-input':'required name=search_term_string'}},
    {'@context':'https://schema.org','@type':'Organization',name:'AnyTool.online',alternateName:'AnyTool',url:'https://anytool.online/',logo:{'@type':'ImageObject',url:'https://anytool.online/favicon-192.png',width:192,height:192},email:'kmafaq2@gmail.com',founder:{'@type':'Person',name:'Kanwar Afaq',url:'https://anytool.online'+pathFor('/about'),image:'https://res.cloudinary.com/dfmi4udfs/image/upload/v1782224423/gallery/general/IMG_2017_dflq3u.jpg',sameAs:['https://github.com/KanwarAfaq']},contactPoint:{'@type':'ContactPoint',contactType:'customer support',email:'kmafaq2@gmail.com',url:'https://anytool.online'+pathFor('/contact')},sameAs:['https://github.com/KanwarAfaq/anytool-online']},
    {'@context':'https://schema.org','@type':'FAQPage',mainEntity:faqByLang.map(([question,answer])=>({'@type':'Question',name:question,acceptedAnswer:{'@type':'Answer',text:answer}}))},
    {'@context':'https://schema.org','@type':'ItemList',name:C.toolsTitle,itemListElement:tools.map((tool,i)=>({'@type':'ListItem',position:i+1,name:toolName(tool),url:'https://anytool.online'+pathFor('/tools/'+tool.slug),image:'https://anytool.online/tool-art/'+tool.slug+'.svg'}))}
  ]}/>

  <div className="anytool-light-home"><section className="home-hero">
   <div className="home-hero-inner reveal">
      <h1 className="home-title">{C.heroA}<br/><span className="mark-hl">{C.heroB}</span></h1>
      <p className="home-lead">{C.body}</p>
      <form className="home-search" role="search" onSubmit={e=>{e.preventDefault();document.getElementById('tools')?.scrollIntoView({behavior:'smooth'})}}>
        <Search size={18} aria-hidden="true"/>
        <input type="search" aria-label={C.browse} value={query} onChange={e=>setQuery(e.target.value)} placeholder={C.try} enterKeyHint="search"/>
        <button type="submit" className="btn-primary"><span>{C.browse}</span><ArrowRight size={16}/></button>
      </form>
      <nav className="home-suggest" aria-label="Popular tools">{['pdf-merge','qr-generator','take-home-pay','image-compress','json-formatter'].map(slug=>toolBySlug[slug]).filter(Boolean).map(tool=><Link key={tool.slug} to={pathFor('/tools/'+tool.slug)}>{toolName(tool)}</Link>)}</nav>
      <ul className="home-stats" aria-label="Highlights"><li><strong>{tools.length}</strong><span>{({en:'free tools','zh-TW':'個免費工具',ar:'أداة مجانية',ur:'مفت ٹولز'})[lang]||'free tools'}</span></li><li><strong>4</strong><span>{({en:'languages','zh-TW':'種語言',ar:'لغات',ur:'زبانیں'})[lang]||'languages'}</span></li><li><strong>0</strong><span>{({en:'sign-up needed','zh-TW':'免註冊',ar:'بدون تسجيل',ur:'سائن اپ درکار نہیں'})[lang]||'sign-up needed'}</span></li><li><strong>🔒</strong><span>{({en:'browser-private','zh-TW':'瀏覽器本機處理',ar:'خصوصية في المتصفح',ur:'براؤزر میں نجی'})[lang]||'browser-private'}</span></li></ul>
   </div>
  </section>

  <section className="bento" aria-label="Featured tools">
   <div className="bento-card bento-widget"><QuickSalary copy={C} pathFor={pathFor}/></div>
   {[['pdf-merge','bento-a'],['qr-generator','bento-b'],['taiwan-id-photo','bento-c'],['image-compress','bento-d']].map(([slug,cls])=>{const tool=toolBySlug[slug];if(!tool)return null;const I=categoryIcon[tool.category]||Sparkles;return <Link key={slug} to={pathFor('/tools/'+slug)} className={'bento-card '+cls}>
     <span className="bento-icon"><I size={18}/></span>
     <div><h3>{toolName(tool)}</h3><p>{toolDescription(tool)}</p></div>
     <span className="bento-arrow"><ArrowRight size={16}/></span>
   </Link>})}
  </section>

  {recent.length>0&&<section className="mx-auto max-w-[72rem] px-4 py-7">
    <div className="mb-3 text-xs font-black uppercase tracking-[.16em] text-slate-500">{C.recent}</div>
    <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2">{recent.map(tool=>{const I=categoryIcon[tool.category]||Sparkles;return <Link key={tool.slug} to={pathFor('/tools/'+tool.slug)} className={'tool-card category-'+tool.category+' min-w-[220px] p-4'}><div className="flex items-center gap-3"><span className="tool-icon"><I size={16}/></span><span className="font-bold leading-snug">{toolName(tool)}</span></div></Link>})}</div>
  </section>}

  <section id="tools" className="mx-auto max-w-[72rem] px-4 py-10">
   <div className="section-head">
    <div><div className="section-kicker"><ScanLine size={13}/>{tools.length} tools</div><h2 className="section-title">{C.toolsTitle}</h2><Link className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-[var(--accent-text)] hover:underline" to={pathFor('/tools')}>{C.viewAll}<ArrowRight size={14}/></Link></div>
    <label className="relative block w-full lg:max-w-sm"><span className="sr-only">{C.find}</span><Search className="absolute start-4 top-3.5 text-slate-500" size={16}/><input aria-label={C.find} className="input ps-11" value={query} onChange={e=>setQuery(e.target.value)} placeholder={C.find}/></label>
   </div>
   <div className="chip-row pb-4"><button onClick={()=>setFilter('all')} className={filter==='all'?'btn-primary whitespace-nowrap':'btn-ghost whitespace-nowrap'}>{C.all}</button>{categories.map(c=>{const I=categoryIcon[c.id]||Sparkles;return <button key={c.id} onClick={()=>setFilter(c.id)} className={filter===c.id?'btn-primary whitespace-nowrap':'btn-ghost whitespace-nowrap'}><I className="me-2" size={14}/>{t('categories.'+c.id)}</button>})}</div>
   <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{homeTools.map(tool=>{const I=categoryIcon[tool.category]||Sparkles;return <Link to={pathFor('/tools/'+tool.slug)} key={tool.slug} className={'card tool-card tool-tile category-'+tool.category}><span className="tool-icon"><I size={17}/></span><div><h3>{toolName(tool)}</h3><p>{toolDescription(tool)}</p></div></Link>})}</div>
   {filtered.length>12&&<div className="mt-6 text-center"><Link className="btn-ghost" to={pathFor('/tools')}>{C.viewAll} ({filtered.length})<ArrowRight className="ms-2" size={15}/></Link></div>}
   {filtered.length===0&&<div className="card mt-4 p-10 text-center text-slate-500">{C.noMatch}</div>}
  </section>
  <section className="mx-auto max-w-[72rem] px-4 pb-16" aria-label="Frequently asked questions"><h2 className="section-title mb-5">{lang==='zh-TW'?'常見問題':lang==='ar'?'الأسئلة الشائعة':lang==='ur'?'اکثر پوچھے گئے سوالات':'Frequently asked questions'}</h2><div className="home-faq md:grid-cols-2">{faqByLang.map(([question,answer],i)=><details key={question} className="compact-details" style={{marginTop:0}} open={i===0}><summary><h3 className="text-base font-bold">{question}</h3></summary><p className="px-4 pb-4 text-sm leading-6 text-slate-500">{answer}</p></details>)}</div></section></div>
 </>
}
