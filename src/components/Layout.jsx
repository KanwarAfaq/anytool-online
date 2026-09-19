import { Link, NavLink } from 'react-router-dom'
import { Wrench, Search, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { tools } from '../data/tools'

export default function Layout({children}){
 const [q,setQ]=useState('')
 const hits=useMemo(()=>q.trim()?tools.filter(t=>(t.name+t.description).toLowerCase().includes(q.toLowerCase())).slice(0,6):[],[q])
 return <div className="min-h-screen">
  <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/85 backdrop-blur-xl">
   <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
    <Link to="/" className="flex items-center gap-2 font-black tracking-tight text-xl"><span className="grid size-9 place-items-center rounded-xl bg-emerald-400 text-slate-950"><Wrench size={18}/></span>AnyTool<span className="text-emerald-300">.online</span></Link>
    <div className="relative ml-auto hidden w-full max-w-md md:block">
      <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
      <input value={q} onChange={e=>setQ(e.target.value)} className="input pl-10" placeholder="Search tools..."/>
      {hits.length>0&&<div className="absolute mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-2 shadow-2xl">{hits.map(t=><Link key={t.slug} onClick={()=>setQ('')} className="block rounded-lg px-3 py-2 hover:bg-white/10" to={'/tools/'+t.slug}>{t.name}</Link>)}</div>}
    </div>
    <NavLink className="btn-ghost" to="/dashboard"><UserRound size={17}/><span className="hidden sm:inline ml-2">Account</span></NavLink>
   </div>
  </header>
  <main>{children}</main>
  <footer className="mt-20 border-t border-white/10 py-10">
   <div className="mx-auto grid max-w-7xl gap-4 px-4 text-sm text-slate-400 md:grid-cols-2">
    <p>© {new Date().getFullYear()} AnyTool.online. Fast, privacy-conscious utilities.</p>
    <p className="md:text-right">Calculations are estimates. Verify regulated or financial results with official sources.</p>
   </div>
  </footer>
 </div>
}
