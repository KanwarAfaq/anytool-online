import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Wrench, Search, UserRound, Languages, ShieldCheck, Command, X, ArrowRight, Sparkles, Mail, Menu } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { tools } from '../data/tools'
import { useI18n } from '../i18n'

export default function Layout({children}){
 const {lang,setLang,languages,t,toolName,toolDescription,pathFor}=useI18n()
 const navigate=useNavigate()
 const [q,setQ]=useState('')
 const [palette,setPalette]=useState(false)
 const [mobile,setMobile]=useState(false)
 const inputRef=useRef(null)
 const nav={
  en:{tools:'Tools',sources:'Sources',methodology:'Methodology',contact:'Contact',trust:'Taiwan tools are checked against official sources.',view:'Verified sources',trustGroup:'Trust & methodology',official:'Official sources',privacy:'Privacy',about:'About',contactUs:'Contact us',built:'Fast, accessible, source-backed utility work.',palette:'Quick launcher',paletteHint:'Search any calculator, photo, PDF or AI tool',shortcut:'⌘ K',close:'Close',cta:'Need a specific tool?',ctaBody:'Tell us what you need and we will use it to prioritize the next useful tool.',message:'Send a suggestion'},
  'zh-TW':{tools:'工具',sources:'官方來源',methodology:'方法',contact:'聯絡',trust:'台灣工具會依官方來源定期查核。',view:'已驗證來源',trustGroup:'信任與方法',official:'官方來源',privacy:'隱私權',about:'關於',contactUs:'聯絡我們',built:'快速、易用、具官方來源依據的實用工具。',palette:'快速啟動器',paletteHint:'搜尋計算器、證件照、PDF 或 AI 工具',shortcut:'⌘ K',close:'關閉',cta:'想要特定工具？',ctaBody:'告訴我們需求，我們會依實用性安排下一個工具。',message:'提出建議'},
  ar:{tools:'الأدوات',sources:'المصادر',methodology:'المنهجية',contact:'اتصل بنا',trust:'تتم مراجعة أدوات تايوان وفق المصادر الرسمية.',view:'مصادر موثقة',trustGroup:'الثقة والمنهجية',official:'المصادر الرسمية',privacy:'الخصوصية',about:'حول',contactUs:'اتصل بنا',built:'أدوات سريعة وسهلة الوصول ومدعومة بمصادر.',palette:'مشغل سريع',paletteHint:'ابحث عن حاسبة أو صورة أو PDF أو أداة AI',shortcut:'⌘ K',close:'إغلاق',cta:'تحتاج أداة محددة؟',ctaBody:'أخبرنا بما تحتاج وسنستخدمه لتحديد الأداة التالية.',message:'أرسل اقتراحاً'},
  ur:{tools:'ٹولز',sources:'ذرائع',methodology:'طریقۂ کار',contact:'رابطہ',trust:'تائیوان ٹولز سرکاری ذرائع کے مطابق چیک کیے جاتے ہیں۔',view:'تصدیق شدہ ذرائع',trustGroup:'اعتماد اور طریقۂ کار',official:'سرکاری ذرائع',privacy:'پرائیویسی',about:'تعارف',contactUs:'رابطہ کریں',built:'تیز، قابلِ رسائی اور ماخذ پر مبنی عملی ٹولز۔',palette:'فوری لانچر',paletteHint:'کیلکولیٹر، فوٹو، PDF یا AI ٹول تلاش کریں',shortcut:'⌘ K',close:'بند کریں',cta:'کسی خاص ٹول کی ضرورت ہے؟',ctaBody:'اپنی ضرورت بتائیں، ہم اگلے مفید ٹول کو ترجیح دیں گے۔',message:'تجویز بھیجیں'}
 }[lang]
 const N=nav
 const hits=useMemo(()=>q.trim()?tools.filter(tool=>(toolName(tool)+' '+toolDescription(tool)).toLowerCase().includes(q.toLowerCase())).slice(0,10):tools.slice(0,8),[q,lang,toolName,toolDescription])
 useEffect(()=>{
  const onKey=e=>{
   if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setPalette(v=>!v)}
   if(e.key==='Escape')setPalette(false)
  }
  window.addEventListener('keydown',onKey)
  return()=>window.removeEventListener('keydown',onKey)
 },[])
 useEffect(()=>{if(palette)setTimeout(()=>inputRef.current?.focus(),30)},[palette])
 const openTool=tool=>{setPalette(false);setQ('');navigate(pathFor('/tools/'+tool.slug))}
 return <div className="site-shell min-h-screen">
  <span className="aurora aurora-a"/><span className="aurora aurora-b"/><span className="aurora aurora-c"/>
  <div className="border-b border-cyan-300/10 bg-gradient-to-r from-cyan-300/[0.06] via-violet-400/[0.05] to-pink-400/[0.06]">
   <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-xs text-cyan-50/90"><ShieldCheck size={14} className="text-emerald-300"/> {N.trust} <Link className="font-bold text-cyan-300 hover:text-cyan-200" to={pathFor('/sources')}>{N.view} →</Link></div>
  </div>
  <header className="sticky top-0 z-50 px-2 pt-2 sm:px-4">
   <div className="glass mx-auto flex max-w-7xl items-center gap-2 rounded-[22px] px-3 py-2.5 sm:px-4">
    <Link to={pathFor('/')} className="group flex shrink-0 items-center gap-2.5 font-black tracking-tight text-xl">
      <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 via-emerald-300 to-violet-400 text-slate-950 shadow-lg shadow-cyan-500/10 transition group-hover:rotate-6 group-hover:scale-105"><Wrench size={18}/></span>
      <span className="hidden sm:inline">AnyTool<span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">.online</span></span>
    </Link>
    <nav className="ms-2 hidden items-center gap-0.5 xl:flex">
      <a className="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white" href={pathFor('/')+'#tools'}>{N.tools}</a>
      <Link className="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white" to={pathFor('/sources')}>{N.sources}</Link>
      <Link className="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white" to={pathFor('/methodology')}>{N.methodology}</Link>
      <Link className="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white" to={pathFor('/contact')}>{N.contact}</Link>
    </nav>
    <button onClick={()=>setPalette(true)} className="ms-auto hidden min-w-[13rem] max-w-sm flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-2.5 text-left text-sm text-slate-400 transition hover:border-cyan-300/30 hover:bg-slate-950/65 md:flex">
      <Search size={17}/><span className="truncate">{t('search')}</span><span className="ms-auto rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] font-bold text-slate-500">{N.shortcut}</span>
    </button>
    <button aria-label={N.palette} className="btn-ghost px-3 md:hidden" onClick={()=>setPalette(true)}><Search size={17}/></button>
    <div className="relative hidden items-center sm:flex">
      <Languages className="pointer-events-none absolute start-2.5 text-violet-300" size={16}/>
      <select aria-label="Language" className="rounded-2xl border border-white/10 bg-white/[0.045] py-2.5 ps-8 pe-7 text-sm font-semibold text-slate-200 outline-none transition hover:bg-white/[0.07]" value={lang} onChange={e=>setLang(e.target.value)}>
       {languages.map(l=><option key={l.code} value={l.code} className="bg-slate-950">{l.label}</option>)}
      </select>
    </div>
    <NavLink className="btn-ghost px-3 sm:px-4" to={pathFor('/dashboard')}><UserRound size={17}/><span className="hidden lg:inline ms-2">{t('account')}</span></NavLink>
    <button className="btn-ghost px-3 xl:hidden" aria-label="Menu" onClick={()=>setMobile(v=>!v)}>{mobile?<X size={18}/>:<Menu size={18}/>}</button>
   </div>
   {mobile&&<div className="glass mx-auto mt-2 grid max-w-7xl gap-1 rounded-[22px] p-3 xl:hidden">
      <a onClick={()=>setMobile(false)} className="rounded-xl px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5" href={pathFor('/')+'#tools'}>{N.tools}</a>
      <Link onClick={()=>setMobile(false)} className="rounded-xl px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5" to={pathFor('/sources')}>{N.sources}</Link>
      <Link onClick={()=>setMobile(false)} className="rounded-xl px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5" to={pathFor('/methodology')}>{N.methodology}</Link>
      <Link onClick={()=>setMobile(false)} className="rounded-xl px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5" to={pathFor('/contact')}>{N.contact}</Link>
      <select aria-label="Mobile language" className="input mt-1 sm:hidden" value={lang} onChange={e=>setLang(e.target.value)}>{languages.map(l=><option key={l.code} value={l.code} className="bg-slate-950">{l.label}</option>)}</select>
   </div>}
  </header>

  {palette&&<div className="command-backdrop" role="dialog" aria-modal="true" aria-label={N.palette} onMouseDown={e=>{if(e.target===e.currentTarget)setPalette(false)}}>
    <div className="command-panel reveal">
      <div className="flex items-center gap-3 border-b border-white/10 p-4">
        <Search className="text-cyan-300" size={20}/>
        <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500" placeholder={N.paletteHint}/>
        <button onClick={()=>setPalette(false)} className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white" aria-label={N.close}><X size={17}/></button>
      </div>
      <div className="max-h-[55vh] overflow-auto p-2">
       {hits.map((tool,i)=><button key={tool.slug} onClick={()=>openTool(tool)} className="command-result flex w-full items-center gap-3 rounded-2xl p-3 text-left" data-active={i===0?'true':'false'}>
         <span className={'tool-icon category-'+tool.category}><Sparkles size={16} className="text-cyan-200"/></span>
         <span className="min-w-0"><span className="block truncate font-bold text-slate-100">{toolName(tool)}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{toolDescription(tool)}</span></span>
         <ArrowRight className="ms-auto shrink-0 text-slate-600" size={16}/>
       </button>)}
      </div>
      <div className="border-t border-white/10 px-4 py-3 text-xs text-slate-500"><Command className="me-1 inline" size={13}/> Ctrl / ⌘ + K · Esc {N.close}</div>
    </div>
  </div>}

  <main>{children}</main>

  <footer className="mt-24 border-t border-white/[0.07] bg-slate-950/35">
   <div className="mx-auto max-w-7xl px-4 pt-12">
    <div className="glass relative overflow-hidden rounded-[28px] p-6 md:p-8">
      <div className="absolute -right-16 -top-20 size-56 rounded-full bg-violet-500/15 blur-3xl"/><div className="absolute -bottom-24 left-10 size-56 rounded-full bg-cyan-400/10 blur-3xl"/>
      <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-sm font-bold text-cyan-300">{N.cta}</p><h2 className="mt-2 max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">{N.ctaBody}</h2></div><Link className="btn-primary" to={pathFor('/contact')}><Mail className="me-2" size={17}/>{N.message}</Link></div>
    </div>
    <div className="grid gap-8 py-12 text-sm md:grid-cols-4">
      <div className="md:col-span-2"><div className="flex items-center gap-2 font-black text-lg text-white"><span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-violet-400 text-slate-950"><Wrench size={15}/></span>AnyTool<span className="text-cyan-300">.online</span></div><p className="mt-3 max-w-xl leading-6 text-slate-400">{t('footer')} {t('disclaimer')}</p></div>
      <div><p className="font-bold text-white">{N.trustGroup}</p><div className="mt-3 grid gap-2.5 text-slate-400"><Link className="hover:text-cyan-300" to={pathFor('/sources')}>{N.official}</Link><Link className="hover:text-cyan-300" to={pathFor('/methodology')}>{N.methodology}</Link><Link className="hover:text-cyan-300" to={pathFor('/privacy')}>{N.privacy}</Link></div></div>
      <div><p className="font-bold text-white">AnyTool</p><div className="mt-3 grid gap-2.5 text-slate-400"><Link className="hover:text-cyan-300" to={pathFor('/about')}>{N.about}</Link><Link className="hover:text-cyan-300" to={pathFor('/contact')}>{N.contactUs}</Link><Link className="hover:text-cyan-300" to={pathFor('/dashboard')}>{t('account')}</Link></div></div>
    </div>
    <div className="border-t border-white/[0.06] py-6 text-xs text-slate-500">© {new Date().getFullYear()} AnyTool.online · {N.built}</div>
   </div>
  </footer>
 </div>
}
