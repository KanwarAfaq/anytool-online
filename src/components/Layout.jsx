import { Link, NavLink } from 'react-router-dom'
import { Wrench, Search, UserRound, Languages, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { tools } from '../data/tools'
import { useI18n } from '../i18n'

export default function Layout({children}){
 const {lang,setLang,languages,t,toolName,toolDescription,pathFor}=useI18n()
 const [q,setQ]=useState('')
 const nav={
  en:{tools:'Tools',sources:'Sources',methodology:'Methodology',contact:'Contact',trust:'{N.trust}',view:'View sources',trustGroup:'Trust & methodology',official:'Official sources',privacy:'Privacy',about:'About',contactUs:'Contact us',built:'{N.built}'},
  'zh-TW':{tools:'工具',sources:'官方來源',methodology:'方法',contact:'聯絡',trust:'台灣法規與公共服務工具會定期查核官方來源。',view:'查看來源',trustGroup:'信任與方法',official:'官方來源',privacy:'隱私權',about:'關於',contactUs:'聯絡我們',built:'快速、易用、具官方來源依據的實用工具。'},
  ar:{tools:'الأدوات',sources:'المصادر',methodology:'المنهجية',contact:'اتصل بنا',trust:'تتم مراجعة أدوات تايوان المبنية على المصادر الرسمية دورياً.',view:'عرض المصادر',trustGroup:'الثقة والمنهجية',official:'المصادر الرسمية',privacy:'الخصوصية',about:'حول',contactUs:'اتصل بنا',built:'أدوات سريعة وسهلة الوصول ومدعومة بمصادر.'},
  ur:{tools:'ٹولز',sources:'ذرائع',methodology:'طریقۂ کار',contact:'رابطہ',trust:'سرکاری ذرائع پر مبنی تائیوان ٹولز کا باقاعدہ جائزہ لیا جاتا ہے۔',view:'ذرائع دیکھیں',trustGroup:'اعتماد اور طریقۂ کار',official:'سرکاری ذرائع',privacy:'پرائیویسی',about:'تعارف',contactUs:'رابطہ کریں',built:'تیز، قابلِ رسائی اور ماخذ پر مبنی عملی ٹولز۔'}
 }[lang]||null
 const N=nav||{}
 const hits=useMemo(()=>q.trim()?tools.filter(tool=>(toolName(tool)+' '+toolDescription(tool)).toLowerCase().includes(q.toLowerCase())).slice(0,7):[],[q,lang])
 return <div className="min-h-screen">
  <div className="border-b border-emerald-300/10 bg-emerald-300/[0.06]">
   <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-xs text-emerald-100"><ShieldCheck size={14}/> Official-source Taiwan tools are reviewed regularly. <Link className="font-semibold underline decoration-emerald-400/50 underline-offset-2" to={pathFor('/sources')}>{N.view}</Link></div>
  </div>
  <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/90 backdrop-blur-xl">
   <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
    <Link to={pathFor('/')} className="flex items-center gap-2 font-black tracking-tight text-xl"><span className="grid size-9 place-items-center rounded-xl bg-emerald-400 text-slate-950"><Wrench size={18}/></span>AnyTool<span className="text-emerald-300">.online</span></Link>
    <nav className="hidden items-center gap-1 lg:flex">
      <a className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white" href={pathFor('/')+'#tools'}>{N.tools}</a>
      <Link className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white" to={pathFor('/sources')}>{N.sources}</Link>
      <Link className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white" to={pathFor('/methodology')}>{N.methodology}</Link>
      <Link className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white" to={pathFor('/contact')}>{N.contact}</Link>
    </nav>
    <div className="relative ms-auto hidden w-full max-w-sm md:block">
      <Search className="absolute start-3 top-2.5 text-slate-400" size={18}/>
      <input value={q} onChange={e=>setQ(e.target.value)} className="input ps-10" placeholder={t('search')}/>
      {hits.length>0&&<div className="absolute mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-2 shadow-2xl">{hits.map(tool=><Link key={tool.slug} onClick={()=>setQ('')} className="block rounded-lg px-3 py-2 hover:bg-white/10" to={pathFor('/tools/'+tool.slug)}>{toolName(tool)}</Link>)}</div>}
    </div>
    <div className="relative flex items-center">
      <Languages className="pointer-events-none absolute start-2.5 text-slate-400" size={16}/>
      <select aria-label="Language" className="rounded-xl border border-white/10 bg-white/5 py-2.5 ps-8 pe-7 text-sm outline-none" value={lang} onChange={e=>setLang(e.target.value)}>
       {languages.map(l=><option key={l.code} value={l.code} className="bg-slate-900">{l.label}</option>)}
      </select>
    </div>
    <NavLink className="btn-ghost" to={pathFor('/dashboard')}><UserRound size={17}/><span className="hidden sm:inline ms-2">{t('account')}</span></NavLink>
   </div>
  </header>
  <main>{children}</main>
  <footer className="mt-20 border-t border-white/10 bg-slate-950/40 py-12">
   <div className="mx-auto grid max-w-7xl gap-8 px-4 text-sm md:grid-cols-4">
    <div className="md:col-span-2"><div className="font-black text-lg text-white">AnyTool<span className="text-emerald-300">.online</span></div><p className="mt-3 max-w-xl leading-6 text-slate-400">{t('footer')} {t('disclaimer')}</p></div>
    <div><p className="font-semibold text-white">{N.trustGroup}</p><div className="mt-3 grid gap-2 text-slate-400"><Link to={pathFor('/sources')}>{N.official}</Link><Link to={pathFor('/methodology')}>Methodology</Link><Link to={pathFor('/privacy')}>{N.privacy}</Link></div></div>
    <div><p className="font-semibold text-white">AnyTool</p><div className="mt-3 grid gap-2 text-slate-400"><Link to={pathFor('/about')}>{N.about}</Link><Link to={pathFor('/contact')}>{N.contactUs}</Link><Link to={pathFor('/dashboard')}>Account</Link></div></div>
   </div>
   <div className="mx-auto mt-8 max-w-7xl border-t border-white/5 px-4 pt-6 text-xs text-slate-500">© {new Date().getFullYear()} AnyTool.online · Built for fast, accessible, source-backed utility work.</div>
  </footer>
 </div>
}
