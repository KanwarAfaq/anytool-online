import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Wrench, Search, UserRound, Languages, ShieldCheck, Command, X, ArrowRight, Menu, Mail, Sun, Moon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { tools } from '../data/tools'
import SiteSidebar from './SiteSidebar'
import { useI18n } from '../i18n'
import { refsForPath } from '../data/externalRefs'
import { platforms } from '../data/platforms'

export default function Layout({children}){
 const {lang,setLang,languages,t,toolName,toolDescription,pathFor}=useI18n()
 const navigate=useNavigate()
 const location=useLocation()
 const [q,setQ]=useState('')
 const [palette,setPalette]=useState(false)
 const [mobile,setMobile]=useState(false)
 const [active,setActive]=useState(0)
 const [theme,setTheme]=useState(()=>{try{const saved=localStorage.getItem('anytool-theme');if(saved==='dark'||saved==='light')return saved}catch{}return typeof window!=='undefined'&&window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light'})
 useEffect(()=>{document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#0b0d13':'#f6f7fb')},[theme])
 const chooseTheme=next=>{setTheme(next);try{localStorage.setItem('anytool-theme',next)}catch{}}
 const cleanPath=location.pathname.replace(/^\/(zh-tw|ar|ur)(?=\/|$)/,'')||'/'
 const showSidebar=cleanPath!=='/'&&!/^\/(auth|dashboard|profile)(?:\/|$)/.test(cleanPath)
 const inputRef=useRef(null)
 const N={
  en:{tools:'Tools',sources:'Sources',contact:'Contact',verified:'2026 Taiwan data verified',search:'Search tools',menu:'Menu',close:'Close',account:'Account',privacy:'Privacy',about:'About',method:'Methodology',terms:'Terms',accessibility:'Accessibility',footer:'Free online tools that run in your browser.',further:'Further reading',need:'Need a tool?',send:'Tell us →'},
  'zh-TW':{tools:'工具',sources:'來源',contact:'聯絡',verified:'2026 台灣資料已查核',search:'搜尋工具',menu:'選單',close:'關閉',account:'帳戶',privacy:'隱私權',about:'關於',method:'方法',terms:'使用條款',accessibility:'無障礙',footer:'在瀏覽器中運作的免費線上工具。',further:'延伸閱讀',need:'需要其他工具？',send:'告訴我們 →'},
  ar:{tools:'الأدوات',sources:'المصادر',contact:'اتصل',verified:'تم التحقق من بيانات تايوان 2026',search:'ابحث عن أداة',menu:'القائمة',close:'إغلاق',account:'الحساب',privacy:'الخصوصية',about:'حول',method:'المنهجية',terms:'الشروط',accessibility:'إمكانية الوصول',footer:'أدوات مجانية تعمل داخل المتصفح.',further:'قراءات إضافية',need:'تحتاج أداة؟',send:'أخبرنا ←'},
  ur:{tools:'ٹولز',sources:'ذرائع',contact:'رابطہ',verified:'2026 تائیوان ڈیٹا تصدیق شدہ',search:'ٹول تلاش کریں',menu:'مینو',close:'بند کریں',account:'اکاؤنٹ',privacy:'پرائیویسی',about:'تعارف',method:'طریقۂ کار',terms:'شرائط',accessibility:'رسائی',footer:'براؤزر میں چلنے والے مفت ٹولز۔',further:'مزید مطالعہ',need:'کوئی ٹول چاہیے؟',send:'ہمیں بتائیں ←'}
 }[lang]
 const hits=useMemo(()=>q.trim()?tools.filter(tool=>(toolName(tool)+' '+toolDescription(tool)).toLowerCase().includes(q.toLowerCase())).slice(0,10):tools.slice(0,8),[q,lang,toolName,toolDescription])
 useEffect(()=>{const onKey=e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setPalette(v=>!v)}if(e.key==='Escape'){setPalette(false);setMobile(false)}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[])
 useEffect(()=>{if(palette)setTimeout(()=>inputRef.current?.focus(),30)},[palette])
 useEffect(()=>{setActive(0)},[q,palette])
 useEffect(()=>{if(!palette)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old}},[palette])
 const openTool=tool=>{if(!tool)return;setPalette(false);setQ('');navigate(pathFor('/tools/'+tool.slug))}
 const paletteKey=e=>{if(e.key==='ArrowDown'){e.preventDefault();setActive(v=>Math.min(hits.length-1,v+1))}else if(e.key==='ArrowUp'){e.preventDefault();setActive(v=>Math.max(0,v-1))}else if(e.key==='Enter'&&hits[active]){e.preventDefault();openTool(hits[active])}}
 return <div className="site-shell">
  <a className="skip-link" href="#main-content">Skip to content</a>
  <header className="site-header">
   <div className="site-header-bar">
    <Link to={pathFor('/')} className="site-brand" aria-label="AnyTool home">
      <span className="site-brand-mark"><img src="/favicon-192.png" alt="" width="36" height="36" className="size-full object-cover"/></span>
      <span className="text-lg">AnyTool</span>
    </Link>
    <nav className="header-nav" aria-label="Primary navigation">
      <NavLink className={({isActive})=>'modern-nav-link '+(isActive?'active':'')} to={pathFor('/tools')}>{N.tools}</NavLink>
      <NavLink className={({isActive})=>'modern-nav-link '+(isActive?'active':'')} to={pathFor('/sources')}>{N.sources}</NavLink>
      <NavLink className={({isActive})=>'modern-nav-link '+(isActive?'active':'')} to={pathFor('/about')}>{N.about}</NavLink>
      <NavLink className={({isActive})=>'modern-nav-link '+(isActive?'active':'')} to={pathFor('/contact')}>{N.contact}</NavLink>
      {platforms.map(p=><a key={p.id} className="modern-nav-link platform-link" href={p.url} target="_blank" rel="noopener noreferrer" data-platform={p.id}>{p.label[lang]||p.label.en}<span aria-hidden="true"> ↗</span></a>)}
    </nav>
    <button type="button" onClick={()=>setPalette(true)} aria-haspopup="dialog" aria-expanded={palette} className="header-search">
      <Search size={16}/><span className="truncate">{N.search}</span><span>⌘K</span>
    </button>
    <div className="header-actions">
     <button type="button" aria-label={N.search} aria-haspopup="dialog" aria-expanded={palette} className="icon-btn md:hidden" onClick={()=>setPalette(true)}><Search size={17}/></button>
     <div className="lang-select">
      <Languages size={15}/>
      <select aria-label="Language" value={lang} onChange={e=>setLang(e.target.value)}>
       {languages.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
     </div>
     <button type="button" className="theme-toggle" aria-label={theme==='dark'?'Switch to light theme':'Switch to dark theme'} title={theme==='dark'?'Light theme':'Dark theme'} aria-pressed={theme==='dark'} onClick={()=>chooseTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button>
     <NavLink aria-label={N.account} title={N.account} className="icon-btn" to={pathFor('/dashboard')}><UserRound size={17}/></NavLink>
     <button type="button" className="icon-btn mobile-toggle" aria-label={N.menu} aria-expanded={mobile} aria-controls="mobile-navigation" onClick={()=>setMobile(v=>!v)}>{mobile?<X size={18}/>:<Menu size={18}/>}</button>
    </div>
   </div>
   {mobile&&<div id="mobile-navigation" className="mobile-menu"><div className="mobile-menu-panel">
      <Link onClick={()=>setMobile(false)} to={pathFor('/tools')}>{N.tools}</Link>
      <Link onClick={()=>setMobile(false)} to={pathFor('/sources')}>{N.sources}</Link>
      <Link onClick={()=>setMobile(false)} to={pathFor('/about')}>{N.about}</Link>
      <Link onClick={()=>setMobile(false)} to={pathFor('/contact')}>{N.contact}</Link>
      <Link onClick={()=>setMobile(false)} to={pathFor('/platforms')}>{(({en:'More platforms','zh-TW':'更多平台',ar:'منصات أخرى',ur:'مزید پلیٹ فارمز'})[lang])||'More platforms'}</Link>
      {platforms.map(p=><a key={p.id} onClick={()=>setMobile(false)} href={p.url} target="_blank" rel="noopener noreferrer">{p.label[lang]||p.label.en} ↗</a>)}
      <select aria-label="Mobile language" className="input mt-1 sm:hidden" value={lang} onChange={e=>setLang(e.target.value)}>{languages.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}</select>
   </div></div>}
  </header>

  {palette&&<div className="command-backdrop" role="dialog" aria-modal="true" aria-label={N.search} onMouseDown={e=>{if(e.target===e.currentTarget)setPalette(false)}}>
    <div className="command-panel reveal">
      <div className="flex items-center gap-3 border-b border-[var(--line)] p-4">
        <Search className="text-slate-500" size={19}/>
        <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={paletteKey} aria-label={N.search} aria-controls="tool-search-results" aria-activedescendant={hits[active]?'tool-search-'+hits[active].slug:undefined} className="w-full" placeholder={N.search}/>
        <button onClick={()=>setPalette(false)} className="icon-btn" aria-label={N.close}><X size={16}/></button>
      </div>
      <div id="tool-search-results" role="listbox" aria-label={N.search} className="max-h-[55vh] overflow-auto p-2">{hits.map((tool,i)=><button id={'tool-search-'+tool.slug} role="option" aria-selected={i===active} key={tool.slug} onMouseEnter={()=>setActive(i)} onClick={()=>openTool(tool)} className="command-result flex w-full items-center gap-3 rounded-xl p-3 text-left" data-active={i===active?'true':'false'}>
        <span className={'tool-icon category-'+tool.category}><Wrench size={15}/></span>
        <span className="min-w-0"><span className="block truncate font-bold">{toolName(tool)}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{toolDescription(tool)}</span></span><ArrowRight className="ms-auto text-slate-500" size={15}/>
      </button>)}</div>
      <div className="border-t border-[var(--line)] px-4 py-3 text-xs text-slate-500"><Command className="me-1 inline" size={12}/> Ctrl / ⌘ + K</div>
    </div>
  </div>}

  <div className={showSidebar?'site-body-grid':'site-body-grid site-body-grid-plain'}>
   {showSidebar&&<SiteSidebar/>}
   <main id="main-content" className="min-w-0">{children}</main>
  </div>

  <footer className="site-footer">
   <div className="mx-auto max-w-[72rem] px-4 py-12">
    <div className="grid gap-10 md:grid-cols-[1.3fr_.8fr_.8fr_1.1fr]">
      <div><div className="footer-brand"><span className="grid size-9 place-items-center overflow-hidden rounded-full"><img src="/favicon-192.png" alt="" width="36" height="36" className="size-full object-cover"/></span>AnyTool</div><p className="mt-3 max-w-xs text-sm">{N.footer}</p></div>
      <div><h2>{N.tools}</h2><div className="footer-links"><Link to={pathFor('/tools')}>{N.tools}</Link><Link to={pathFor('/sources')}>{N.sources}</Link><Link to={pathFor('/methodology')}>{N.method}</Link><Link to={pathFor('/platforms')}>{(({en:'More platforms','zh-TW':'更多平台',ar:'منصات أخرى',ur:'مزید پلیٹ فارمز'})[lang])||'More platforms'}</Link>{platforms.map(p=><a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer">{p.label[lang]||p.label.en} ↗</a>)}</div></div>
      <div><h2>AnyTool</h2><div className="footer-links"><Link to={pathFor('/about')}>{N.about}</Link><Link to={pathFor('/privacy')}>{N.privacy}</Link><Link to={pathFor('/terms')}>{N.terms}</Link><Link to={pathFor('/accessibility')}>{N.accessibility}</Link><Link to={pathFor('/contact')}>{N.contact}</Link></div></div>
      <div><h2>{N.further}</h2><div className="footer-links">{refsForPath(cleanPath).map(r=><a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer">{r.label} ↗</a>)}</div></div>
    </div>
    <div className="footer-bottom">© {new Date().getFullYear()} AnyTool.online</div>
   </div>
  </footer>
 </div>
}
