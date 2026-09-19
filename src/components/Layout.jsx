import { Link, NavLink } from 'react-router-dom'
import { Wrench, Search, UserRound, Languages } from 'lucide-react'
import { useMemo, useState } from 'react'
import { tools } from '../data/tools'
import { useI18n } from '../i18n'

export default function Layout({children}){
 const {lang,setLang,languages,t,toolName,toolDescription}=useI18n()
 const [q,setQ]=useState('')
 const hits=useMemo(()=>q.trim()?tools.filter(tool=>(toolName(tool)+' '+toolDescription(tool)).toLowerCase().includes(q.toLowerCase())).slice(0,6):[],[q,lang])
 return <div className="min-h-screen">
  <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/85 backdrop-blur-xl">
   <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
    <Link to="/" className="flex items-center gap-2 font-black tracking-tight text-xl"><span className="grid size-9 place-items-center rounded-xl bg-emerald-400 text-slate-950"><Wrench size={18}/></span>AnyTool<span className="text-emerald-300">.online</span></Link>
    <div className="relative ms-auto hidden w-full max-w-md md:block">
      <Search className="absolute start-3 top-2.5 text-slate-400" size={18}/>
      <input value={q} onChange={e=>setQ(e.target.value)} className="input ps-10" placeholder={t('search')}/>
      {hits.length>0&&<div className="absolute mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-2 shadow-2xl">{hits.map(tool=><Link key={tool.slug} onClick={()=>setQ('')} className="block rounded-lg px-3 py-2 hover:bg-white/10" to={'/tools/'+tool.slug}>{toolName(tool)}</Link>)}</div>}
    </div>
    <div className="relative flex items-center">
      <Languages className="pointer-events-none absolute start-2.5 text-slate-400" size={16}/>
      <select aria-label="Language" className="rounded-xl border border-white/10 bg-white/5 py-2.5 ps-8 pe-7 text-sm outline-none" value={lang} onChange={e=>setLang(e.target.value)}>
       {languages.map(l=><option key={l.code} value={l.code} className="bg-slate-900">{l.label}</option>)}
      </select>
    </div>
    <NavLink className="btn-ghost" to="/dashboard"><UserRound size={17}/><span className="hidden sm:inline ms-2">{t('account')}</span></NavLink>
   </div>
  </header>
  <main>{children}</main>
  <footer className="mt-20 border-t border-white/10 py-10">
   <div className="mx-auto grid max-w-7xl gap-4 px-4 text-sm text-slate-400 md:grid-cols-2">
    <p>© {new Date().getFullYear()} AnyTool.online. {t('footer')}</p>
    <p className="md:text-end">{t('disclaimer')}</p>
   </div>
  </footer>
 </div>
}
