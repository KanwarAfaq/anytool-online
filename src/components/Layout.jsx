import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Wrench, Search, UserRound, Languages, ShieldCheck, Command, X, ArrowRight, Menu, Mail } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { tools } from '../data/tools'
import { useI18n } from '../i18n'

export default function Layout({children}){
 const {lang,setLang,languages,t,toolName,toolDescription,pathFor}=useI18n()
 const navigate=useNavigate()
 const [q,setQ]=useState('')
 const [palette,setPalette]=useState(false)
 const [mobile,setMobile]=useState(false)
 const [active,setActive]=useState(0)
 const inputRef=useRef(null)
 const N={
  en:{tools:'Tools',sources:'Sources',contact:'Contact',verified:'2026 Taiwan data verified',search:'Search tools',menu:'Menu',close:'Close',account:'Account',privacy:'Privacy',about:'About',method:'Methodology',footer:'Fast tools. Clear results. Less clutter.',need:'Need a tool?',send:'Tell us →'},
  'zh-TW':{tools:'工具',sources:'來源',contact:'聯絡',verified:'2026 台灣資料已查核',search:'搜尋工具',menu:'選單',close:'關閉',account:'帳戶',privacy:'隱私權',about:'關於',method:'方法',footer:'快速工具、清楚結果、少一點干擾。',need:'需要其他工具？',send:'告訴我們 →'},
  ar:{tools:'الأدوات',sources:'المصادر',contact:'اتصل',verified:'تم التحقق من بيانات تايوان 2026',search:'ابحث عن أداة',menu:'القائمة',close:'إغلاق',account:'الحساب',privacy:'الخصوصية',about:'حول',method:'المنهجية',footer:'أدوات سريعة. نتائج واضحة. فوضى أقل.',need:'تحتاج أداة؟',send:'أخبرنا ←'},
  ur:{tools:'ٹولز',sources:'ذرائع',contact:'رابطہ',verified:'2026 تائیوان ڈیٹا تصدیق شدہ',search:'ٹول تلاش کریں',menu:'مینو',close:'بند کریں',account:'اکاؤنٹ',privacy:'پرائیویسی',about:'تعارف',method:'طریقۂ کار',footer:'تیز ٹولز۔ واضح نتائج۔ کم شور۔',need:'کوئی ٹول چاہیے؟',send:'ہمیں بتائیں ←'}
 }[lang]
 const hits=useMemo(()=>q.trim()?tools.filter(tool=>(toolName(tool)+' '+toolDescription(tool)).toLowerCase().includes(q.toLowerCase())).slice(0,10):tools.slice(0,8),[q,lang,toolName,toolDescription])
 useEffect(()=>{const onKey=e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setPalette(v=>!v)}if(e.key==='Escape'){setPalette(false);setMobile(false)}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[])
 useEffect(()=>{if(palette)setTimeout(()=>inputRef.current?.focus(),30)},[palette])
 useEffect(()=>{setActive(0)},[q,palette])
 useEffect(()=>{if(!palette)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old}},[palette])
 const openTool=tool=>{if(!tool)return;setPalette(false);setQ('');navigate(pathFor('/tools/'+tool.slug))}
 const paletteKey=e=>{if(e.key==='ArrowDown'){e.preventDefault();setActive(v=>Math.min(hits.length-1,v+1))}else if(e.key==='ArrowUp'){e.preventDefault();setActive(v=>Math.max(0,v-1))}else if(e.key==='Enter'&&hits[active]){e.preventDefault();openTool(hits[active])}}
 return <div className="site-shell min-h-screen">
  <a className="skip-link" href="#main-content">Skip to content</a>
  <span className="aurora aurora-a"/><span className="aurora aurora-b"/>
  <header className="sticky top-0 z-50 px-3 pt-3">
   <div className="glass mx-auto flex max-w-7xl items-center gap-2 rounded-2xl px-3 py-2.5">
    <Link to={pathFor('/')} className="group flex shrink-0 items-center gap-2 font-black tracking-tight">
      <span className="grid size-9 place-items-center rounded-xl bg-lime-300 text-[#07100c] transition group-hover:rotate-6"><Wrench size={17}/></span>
      <span className="hidden text-lg sm:inline">AnyTool<span className="text-lime-300">.online</span></span>
    </Link>
    <nav className="ms-3 hidden items-center gap-1 lg:flex">
      <Link className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-400 hover:bg-white/[0.04] hover:text-white" to={pathFor('/tools')}>{N.tools}</Link>
      <Link className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-400 hover:bg-white/[0.04] hover:text-white" to={pathFor('/sources')}>{N.sources}</Link>
      <Link className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-400 hover:bg-white/[0.04] hover:text-white" to={pathFor('/contact')}>{N.contact}</Link>
    </nav>
    <button onClick={()=>setPalette(true)} aria-haspopup="dialog" aria-expanded={palette} className="ms-auto hidden min-w-[12rem] max-w-sm flex-1 items-center gap-2 rounded-xl border border-white/[0.08] bg-[#080e16] px-3 py-2.5 text-left text-sm text-slate-400 transition hover:border-lime-300/30 hover:bg-white/[0.045] md:flex">
      <Search size={16}/><span className="truncate">{N.search}</span><span className="ms-auto rounded-md border border-white/[0.07] px-1.5 py-0.5 text-[10px]">⌘K</span>
    </button>
    <button aria-label={N.search} aria-haspopup="dialog" aria-expanded={palette} className="btn-ghost px-3 md:hidden" onClick={()=>setPalette(true)}><Search size={17}/></button>
    <div className="relative hidden sm:flex">
      <Languages className="pointer-events-none absolute start-2.5 top-3 text-slate-500" size={15}/>
      <select aria-label="Language" className="rounded-xl border border-white/[0.08] bg-[#080e16] py-2.5 ps-8 pe-7 text-sm font-semibold text-slate-300 outline-none" value={lang} onChange={e=>setLang(e.target.value)}>
       {languages.map(l=><option key={l.code} value={l.code} className="bg-slate-950">{l.label}</option>)}
      </select>
    </div>
    <NavLink aria-label={N.account} title={N.account} className="btn-ghost px-3" to={pathFor('/dashboard')}><UserRound size={17}/></NavLink>
    <button className="btn-ghost px-3 lg:hidden" aria-label={N.menu} aria-expanded={mobile} aria-controls="mobile-navigation" onClick={()=>setMobile(v=>!v)}>{mobile?<X size={18}/>:<Menu size={18}/>}</button>
   </div>
   {mobile&&<div id="mobile-navigation" className="glass mx-auto mt-2 grid max-w-7xl gap-1 rounded-2xl p-3 lg:hidden">
      <Link onClick={()=>setMobile(false)} className="rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5" to={pathFor('/tools')}>{N.tools}</Link>
      <Link onClick={()=>setMobile(false)} className="rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5" to={pathFor('/sources')}>{N.sources}</Link>
      <Link onClick={()=>setMobile(false)} className="rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5" to={pathFor('/contact')}>{N.contact}</Link>
      <select aria-label="Mobile language" className="input mt-1 sm:hidden" value={lang} onChange={e=>setLang(e.target.value)}>{languages.map(l=><option key={l.code} value={l.code} className="bg-slate-950">{l.label}</option>)}</select>
   </div>}
  </header>

  {palette&&<div className="command-backdrop" role="dialog" aria-modal="true" aria-label={N.search} onMouseDown={e=>{if(e.target===e.currentTarget)setPalette(false)}}>
    <div className="command-panel reveal">
      <div className="flex items-center gap-3 border-b border-white/[0.07] p-4">
        <Search className="text-lime-300" size={19}/>
        <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={paletteKey} aria-label={N.search} aria-controls="tool-search-results" aria-activedescendant={hits[active]?'tool-search-'+hits[active].slug:undefined} className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500" placeholder={N.search}/>
        <button onClick={()=>setPalette(false)} className="rounded-lg border border-white/[0.07] p-2 text-slate-500 hover:text-white" aria-label={N.close}><X size={16}/></button>
      </div>
      <div id="tool-search-results" role="listbox" aria-label={N.search} className="max-h-[55vh] overflow-auto p-2">{hits.map((tool,i)=><button id={'tool-search-'+tool.slug} role="option" aria-selected={i===active} key={tool.slug} onMouseEnter={()=>setActive(i)} onClick={()=>openTool(tool)} className="command-result flex w-full items-center gap-3 rounded-xl p-3 text-left" data-active={i===active?'true':'false'}>
        <span className={'tool-icon category-'+tool.category}><Wrench size={15}/></span>
        <span className="min-w-0"><span className="block truncate font-bold">{toolName(tool)}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{toolDescription(tool)}</span></span><ArrowRight className="ms-auto text-slate-500" size={15}/>
      </button>)}</div>
      <div className="border-t border-white/[0.07] px-4 py-3 text-xs text-slate-500"><Command className="me-1 inline" size={12}/> Ctrl / ⌘ + K</div>
    </div>
  </div>}

  <main id="main-content">{children}</main>

  <footer className="mt-20 border-t border-white/[0.06] bg-[#070c13]">
   <div className="mx-auto max-w-7xl px-4 py-10">
    <div className="grid gap-8 md:grid-cols-[1.4fr_.8fr_.8fr]">
      <div><div className="flex items-center gap-2 font-black"><span className="grid size-8 place-items-center rounded-lg bg-lime-300 text-[#07100c]"><Wrench size={14}/></span>AnyTool<span className="text-lime-300">.online</span></div><p className="mt-3 max-w-md text-sm text-slate-500">{N.footer}</p><Link to={pathFor('/contact')} className="mt-4 inline-flex items-center text-sm font-bold text-lime-300"><Mail className="me-2" size={14}/>{N.need} {N.send}</Link></div>
      <div><p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">{N.tools}</p><div className="mt-3 grid gap-2 text-sm"><Link className="text-slate-400 hover:text-white" to={pathFor('/tools')}>{N.tools}</Link><Link className="text-slate-400 hover:text-white" to={pathFor('/sources')}>{N.sources}</Link><Link className="text-slate-400 hover:text-white" to={pathFor('/methodology')}>{N.method}</Link></div></div>
      <div><p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">AnyTool</p><div className="mt-3 grid gap-2 text-sm"><Link className="text-slate-400 hover:text-white" to={pathFor('/about')}>{N.about}</Link><Link className="text-slate-400 hover:text-white" to={pathFor('/privacy')}>{N.privacy}</Link><Link className="text-slate-400 hover:text-white" to={pathFor('/contact')}>{N.contact}</Link></div></div>
    </div>
    <div className="mt-8 border-t border-white/[0.06] pt-5 text-xs text-slate-500">© {new Date().getFullYear()} AnyTool.online</div>
   </div>
  </footer>
 </div>
}
