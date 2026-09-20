import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ShieldCheck, Zap, WalletCards, Image as ImageIcon, FileText, BrainCircuit, Calculator, Search, Clock3, BadgeCheck, WandSparkles, TrendingUp, Languages, Gauge } from 'lucide-react'
import { categories, tools, toolBySlug } from '../data/tools'
import { takeHome, money } from '../lib/calculators'
import Seo from '../components/Seo'
import { useI18n } from '../i18n'

const categoryIcon={money:WalletCards,image:ImageIcon,document:FileText,ai:BrainCircuit,general:Calculator}
const categoryAccent={money:'text-emerald-300',image:'text-pink-300',document:'text-blue-300',ai:'text-violet-300',general:'text-amber-300'}

function QuickSalary({copy}){
 const [salary,setSalary]=useState(50000)
 const [dependents,setDependents]=useState(0)
 const r=takeHome(Number(salary)||0,Number(dependents)||0)
 const pct=salary>0?Math.max(0,Math.min(100,(r.net/salary)*100)):0
 return <div className="glass relative overflow-hidden rounded-[30px] p-5 sm:p-6">
   <div className="hero-glow -right-32 -top-32"/>
   <div className="relative">
    <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">{copy.quickTag}</p><h2 className="mt-1 text-xl font-black">{copy.quickTitle}</h2></div><span className="pulse-ring grid size-10 place-items-center rounded-2xl bg-emerald-300/10 text-emerald-300"><TrendingUp size={18}/></span></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2"><label><span className="mb-1.5 block text-xs font-semibold text-slate-400">{copy.salary}</span><input aria-label={copy.salary} className="input" type="number" inputMode="numeric" min="0" value={salary===0?'':salary} placeholder="50000" onFocus={e=>e.target.select()} onChange={e=>setSalary(e.target.value===''?0:Number(e.target.value))}/></label><label><span className="mb-1.5 block text-xs font-semibold text-slate-400">{copy.dependents}</span><select aria-label={copy.dependents} className="input" value={dependents} onChange={e=>setDependents(Number(e.target.value))}>{[0,1,2,3].map(n=><option className="bg-slate-950" value={n} key={n}>{n}</option>)}</select></label></div>
    <div className="mt-5 rounded-[24px] border border-white/10 bg-slate-950/45 p-5"><p className="text-xs text-slate-500">{copy.net}</p><div className="mt-1 flex items-end gap-2"><span className="text-4xl font-black tracking-tight text-white">NT$ {money(r.net)}</span><span className="mb-1 text-xs font-bold text-emerald-300">/{copy.month}</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-violet-400 transition-all duration-500" style={{width:pct+'%'}}/></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="metric"><p className="text-[11px] text-slate-500">{copy.deductions}</p><p className="mt-1 font-black">NT$ {money(r.deductions)}</p></div><div className="metric"><p className="text-[11px] text-slate-500">{copy.rate}</p><p className="mt-1 font-black">{pct.toFixed(1)}%</p></div></div></div>
    <Link to="/tools/take-home-pay" className="mt-4 inline-flex items-center text-sm font-bold text-cyan-300 transition hover:text-cyan-200">{copy.full} <ArrowRight className="ms-1" size={15}/></Link>
   </div>
  </div>
}

export default function Home(){
 const {lang,t,toolName,toolDescription,pathFor}=useI18n()
 const [filter,setFilter]=useState('all')
 const [query,setQuery]=useState('')
 const [recent,setRecent]=useState([])
 useEffect(()=>{
   try{const ids=JSON.parse(localStorage.getItem('anytool_recent')||'[]');setRecent(ids.map(x=>toolBySlug[x]).filter(Boolean).slice(0,4))}catch{}
 },[])
 const C={
  en:{eyebrow:'A smarter utility workspace',heroA:'One beautiful place for',heroB:'everyday tools.',body:'Accurate Taiwan calculators, privacy-first image and PDF tools, AI extraction and official-source guidance — designed to feel fast, clear and trustworthy.',browse:'Explore all tools',taiwan:'Taiwan salary 2026',quickTag:'Live calculator',quickTitle:'Quick salary snapshot',salary:'Monthly salary (NT$)',dependents:'NHI dependents',net:'Estimated take-home',month:'month',deductions:'Est. deductions',rate:'Take-home rate',full:'Open detailed calculator',all:'All',find:'Filter tools by name…',recent:'Continue where you left off',recentBody:'Your recently opened tools stay on this device.',popular:'Popular workflows',official:'Official-source checks',languages:'4 languages',toolsCount:'useful tools',private:'Browser-first processing',why:'Built for real tasks, not static demo pages',whyBody:'Interactive results, downloads, source evidence and account features are integrated into the tools themselves.',source:'Government-backed Taiwan data',sourceBody:'Regulated calculators show their reviewed official sources and verification dates.',local:'Private by default',localBody:'Image, QR and PDF work stays in your browser whenever possible.',fast:'Fast on phone and desktop',fastBody:'Lazy-loaded tools, responsive controls and keyboard search keep the interface quick.'},
  'zh-TW':{eyebrow:'更聰明的實用工具工作區',heroA:'把日常需要的工具，',heroB:'集中在一個漂亮的地方。',body:'精準的台灣計算器、重視隱私的圖片與 PDF 工具、AI 擷取與官方來源說明，操作快速、清楚、可信。',browse:'瀏覽所有工具',taiwan:'2026 台灣薪資',quickTag:'即時計算',quickTitle:'快速實領薪資預覽',salary:'月薪（NT$）',dependents:'健保眷屬人數',net:'預估實領',month:'月',deductions:'預估扣除',rate:'實領比例',full:'開啟完整計算器',all:'全部',find:'依名稱篩選工具…',recent:'繼續剛才的工具',recentBody:'最近開啟的工具只保留在此裝置。',popular:'熱門工作流程',official:'官方來源查核',languages:'4 種語言',toolsCount:'實用工具',private:'瀏覽器優先處理',why:'為真實工作而做，不是靜態展示頁',whyBody:'互動結果、下載、來源證據與帳戶功能直接整合進工具。',source:'台灣官方資料依據',sourceBody:'法規相關計算器會顯示官方來源與最近查核日期。',local:'預設保護隱私',localBody:'圖片、QR 與 PDF 能在瀏覽器完成就不會上傳。',fast:'手機與桌機都快速',fastBody:'工具延遲載入、響應式控制與鍵盤搜尋保持流暢。'},
  ar:{eyebrow:'مساحة أدوات أذكى',heroA:'مكان جميل واحد',heroB:'لكل أدواتك اليومية.',body:'حاسبات تايوان الدقيقة وأدوات الصور وPDF وAI مع إرشادات من مصادر رسمية — سريعة وواضحة وموثوقة.',browse:'استكشف كل الأدوات',taiwan:'راتب تايوان 2026',quickTag:'حاسبة مباشرة',quickTitle:'تقدير سريع لصافي الراتب',salary:'الراتب الشهري (NT$)',dependents:'المعالون في NHI',net:'صافي الراتب التقديري',month:'شهر',deductions:'الخصومات المقدرة',rate:'نسبة صافي الراتب',full:'افتح الحاسبة التفصيلية',all:'الكل',find:'فلترة الأدوات بالاسم…',recent:'تابع من حيث توقفت',recentBody:'الأدوات الأخيرة محفوظة على هذا الجهاز فقط.',popular:'مسارات شائعة',official:'فحص المصادر الرسمية',languages:'4 لغات',toolsCount:'أداة مفيدة',private:'المعالجة في المتصفح أولاً',why:'مصمم لمهام حقيقية، لا لصفحات عرض ثابتة',whyBody:'النتائج التفاعلية والتنزيلات والمصادر والحساب مدمجة في الأدوات.',source:'بيانات تايوان الرسمية',sourceBody:'الحاسبات المنظمة تعرض المصادر الرسمية وتاريخ المراجعة.',local:'الخصوصية افتراضياً',localBody:'الصور وQR وPDF تبقى في المتصفح متى أمكن.',fast:'سريع على الهاتف والكمبيوتر',fastBody:'تحميل كسول وتصميم متجاوب وبحث بلوحة المفاتيح.'},
  ur:{eyebrow:'زیادہ ذہین یوٹیلیٹی ورک اسپیس',heroA:'روزمرہ کے تمام ٹولز کے لیے',heroB:'ایک خوبصورت جگہ۔',body:'درست تائیوان کیلکولیٹر، پرائیویسی فرسٹ امیج/PDF ٹولز، AI ایکسٹریکشن اور سرکاری ذرائع کی رہنمائی — تیز، واضح اور قابلِ اعتماد۔',browse:'تمام ٹولز دیکھیں',taiwan:'تائیوان تنخواہ 2026',quickTag:'لائیو کیلکولیٹر',quickTitle:'فوری نیٹ تنخواہ',salary:'ماہانہ تنخواہ (NT$)',dependents:'NHI زیرِ کفالت',net:'تخمینی نیٹ تنخواہ',month:'ماہ',deductions:'تخمینی کٹوتیاں',rate:'نیٹ تنخواہ شرح',full:'تفصیلی کیلکولیٹر کھولیں',all:'سب',find:'نام سے ٹول فلٹر کریں…',recent:'جہاں چھوڑا تھا وہاں سے جاری رکھیں',recentBody:'حالیہ ٹولز صرف اسی ڈیوائس پر محفوظ رہتے ہیں۔',popular:'مقبول ورک فلو',official:'سرکاری ذرائع کی جانچ',languages:'4 زبانیں',toolsCount:'مفید ٹولز',private:'براؤزر فرسٹ پراسیسنگ',why:'حقیقی کام کے لیے، جامد ڈیمو پیجز کے لیے نہیں',whyBody:'انٹرایکٹو نتائج، ڈاؤن لوڈ، ذرائع اور اکاؤنٹ فیچرز ٹولز میں شامل ہیں۔',source:'تائیوان سرکاری ڈیٹا',sourceBody:'ریگولیٹڈ کیلکولیٹر سرکاری ذرائع اور ریویو تاریخ دکھاتے ہیں۔',local:'پرائیویسی بطور ڈیفالٹ',localBody:'امیج، QR اور PDF جہاں ممکن ہو براؤزر میں رہتے ہیں۔',fast:'فون اور ڈیسک ٹاپ پر تیز',fastBody:'لیزی لوڈنگ، ریسپانسیو کنٹرولز اور کی بورڈ سرچ۔'}
 }[lang]
 const seo={
  en:{title:'Taiwan Calculators 2026, Passport/ARC Photo & Free Tools | AnyTool',description:'Free 2026 Taiwan salary, tax, insurance, overtime and elderly-care tools plus official passport/ARC photo guidance, PDF, QR and OCR utilities.'},
  'zh-TW':{title:'2026 台灣薪資稅務計算、護照 ARC 證件照與實用工具 | AnyTool',description:'免費 2026 台灣薪資、所得稅、勞健保、加班費、老人照護補助與床位工具，並提供官方護照／ARC 證件照規格、PDF、QR 與 OCR 工具。'},
  ar:{title:'حاسبات تايوان 2026 وأدوات صور الجواز وARC | AnyTool',description:'حاسبات مجانية للرواتب والضرائب والتأمين والعمل الإضافي ورعاية المسنين في تايوان 2026، مع أدوات صور الجواز وARC وPDF وQR وOCR.'},
  ur:{title:'تائیوان کیلکولیٹر 2026، پاسپورٹ/ARC فوٹو اور مفت ٹولز | AnyTool',description:'مفت 2026 تائیوان تنخواہ، ٹیکس، انشورنس، اوور ٹائم اور بزرگ نگہداشت ٹولز، سرکاری پاسپورٹ/ARC فوٹو رہنمائی، PDF، QR اور OCR کے ساتھ۔'}
 }[lang]
 const filtered=useMemo(()=>tools.filter(tool=>(filter==='all'||tool.category===filter)&&(!query.trim()||(toolName(tool)+' '+toolDescription(tool)).toLowerCase().includes(query.toLowerCase()))),[filter,query,lang,toolName,toolDescription])
 const featureCards=[[ShieldCheck,C.source,C.sourceBody,'text-emerald-300'],[WandSparkles,C.local,C.localBody,'text-pink-300'],[Gauge,C.fast,C.fastBody,'text-cyan-300']]
 return <>
  <Seo title={seo.title} description={seo.description} jsonLd={[{'@context':'https://schema.org','@type':'WebSite',name:'AnyTool.online',url:'https://www.anytool.online/',potentialAction:{'@type':'SearchAction',target:'https://www.anytool.online/?q={search_term_string}','query-input':'required name=search_term_string'}},{'@context':'https://schema.org','@type':'Organization',name:'AnyTool.online',url:'https://www.anytool.online/'}]}/>

  <section className="relative overflow-hidden pb-14 pt-12 sm:pt-20">
   <div className="hero-grid"/><div className="hero-glow left-[44%] top-0"/>
   <div className="relative mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
    <div className="reveal">
      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-1.5 text-sm font-bold text-cyan-200"><Sparkles size={15}/>{C.eyebrow}</div>
      <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-7xl"><span className="text-white">{C.heroA}</span><br/><span className="gradient-text">{C.heroB}</span></h1>
      <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">{C.body}</p>
      <div className="mt-8 flex flex-wrap gap-3"><a href="#tools" className="btn-primary">{C.browse}<ArrowRight className="ms-2" size={17}/></a><Link to={pathFor('/tools/take-home-pay')} className="btn-ghost"><WalletCards className="me-2 text-emerald-300" size={17}/>{C.taiwan}</Link></div>
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-400"><span className="flex items-center gap-2"><BadgeCheck size={15} className="text-emerald-300"/>{C.official}</span><span className="flex items-center gap-2"><Languages size={15} className="text-violet-300"/>{C.languages}</span><span className="flex items-center gap-2"><Zap size={15} className="text-amber-300"/>{tools.length} {C.toolsCount}</span></div>
    </div>
    <div className="reveal reveal-delay-1 lg:ps-4"><QuickSalary copy={C}/></div>
   </div>
  </section>

  {recent.length>0&&<section className="mx-auto max-w-7xl px-4 py-5 reveal">
    <div className="flex items-end justify-between gap-4"><div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-violet-300"><Clock3 size={14}/>{C.recent}</div><p className="mt-1 text-sm text-slate-500">{C.recentBody}</p></div></div>
    <div className="scrollbar-none mt-4 flex gap-3 overflow-x-auto pb-2">{recent.map(tool=><Link key={tool.slug} to={pathFor('/tools/'+tool.slug)} className={'tool-card category-'+tool.category+' min-w-[250px] flex-1 rounded-[20px] border border-white/10 bg-white/[0.04] p-4'}><div className="flex items-center gap-3"><span className="tool-icon">{(()=>{const I=categoryIcon[tool.category]||Sparkles;return <I size={17} className={categoryAccent[tool.category]}/>})()}</span><div className="min-w-0"><p className="truncate font-bold">{toolName(tool)}</p><p className="mt-1 line-clamp-1 text-xs text-slate-500">{toolDescription(tool)}</p></div></div></Link>)}</div>
  </section>}

  <section className="mx-auto max-w-7xl px-4 py-10">
   <div className="glass rounded-[30px] p-6 md:p-8"><div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[.2em] text-pink-300">{C.popular}</p><h2 className="mt-2 text-3xl font-black tracking-tight">{C.why}</h2><p className="mt-3 text-slate-400">{C.whyBody}</p></div><div className="mt-7 grid gap-4 md:grid-cols-3">{featureCards.map(([Icon,title,desc,color])=><article className="rounded-[22px] border border-white/10 bg-slate-950/30 p-5" key={title}><span className={'tool-icon '+color}><Icon size={18}/></span><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p></article>)}</div></div>
  </section>

  <section id="tools" className="mx-auto max-w-7xl px-4 py-12">
   <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">{C.popular}</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{t('browse')}</h2></div><label className="relative block w-full lg:max-w-sm"><Search className="absolute start-4 top-3.5 text-slate-500" size={17}/><input className="input ps-11" value={query} onChange={e=>setQuery(e.target.value)} placeholder={C.find}/></label></div>
   <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-4"><button onClick={()=>setFilter('all')} className={filter==='all'?'btn-primary whitespace-nowrap':'btn-ghost whitespace-nowrap'}>{C.all}</button>{categories.map(c=>{const I=categoryIcon[c.id]||Sparkles;return <button key={c.id} onClick={()=>setFilter(c.id)} className={filter===c.id?'btn-primary whitespace-nowrap':'btn-ghost whitespace-nowrap'}><I className="me-2" size={15}/>{t('categories.'+c.id)}</button>})}</div>
   <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((tool,i)=>{const I=categoryIcon[tool.category]||Sparkles;return <Link to={pathFor('/tools/'+tool.slug)} key={tool.slug} className={'card tool-card category-'+tool.category+' group p-5 reveal'} style={{animationDelay:Math.min(i,8)*35+'ms'}}><div className="flex items-start justify-between gap-4"><span className="tool-icon"><I className={categoryAccent[tool.category]} size={18}/></span><span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-slate-500">{tool.category}</span></div><h3 className="mt-5 text-lg font-black tracking-tight transition group-hover:text-cyan-200">{toolName(tool)}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{toolDescription(tool)}</p><span className="mt-5 inline-flex items-center text-sm font-bold text-cyan-300">{t('open')}<ArrowRight className="ms-1 transition group-hover:translate-x-1" size={15}/></span></Link>})}</div>
   {filtered.length===0&&<div className="card mt-4 p-10 text-center text-slate-400">No matching tools.</div>}
  </section>
 </>
}
