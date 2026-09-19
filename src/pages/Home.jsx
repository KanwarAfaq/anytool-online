import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react'
import { categories, tools } from '../data/tools'
import Seo from '../components/Seo'

export default function Home(){
 return <>
  <Seo title="AnyTool.online — Calculators, Image, PDF & AI Tools" description="Fast Taiwan calculators, image utilities, PDF tools, QR tools and AI document extraction." canonical="https://anytool.online/"/>
  <section className="mx-auto max-w-7xl px-4 pb-8 pt-16 md:pt-24">
   <div className="max-w-4xl">
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-200"><Sparkles size={15}/> One place for everyday tools</div>
    <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Useful tools, without the clutter.</h1>
    <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Taiwan salary calculators, image utilities, PDF tools, QR tools and AI document extraction — built to be fast on desktop and mobile.</p>
    <div className="mt-8 flex flex-wrap gap-3"><a href="#tools" className="btn-primary">Browse tools <ArrowRight className="ml-2" size={17}/></a><Link to="/tools/take-home-pay" className="btn-ghost">Try salary calculator</Link></div>
   </div>
   <div className="mt-12 grid gap-4 sm:grid-cols-3">
    {[[Zap,'Fast','Most basic tools run instantly in your browser.'],[ShieldCheck,'Privacy-first','Local processing where possible; signed uploads when needed.'],[Sparkles,'AI fallback','AI requests can route across multiple configured providers.']].map(([Icon,t,d])=><div className="card p-5" key={t}><Icon className="text-emerald-300"/><h3 className="mt-3 font-bold">{t}</h3><p className="mt-1 text-sm text-slate-400">{d}</p></div>)}
   </div>
  </section>
  <section id="tools" className="mx-auto max-w-7xl px-4 py-10">
   {categories.map(c=>{const list=tools.filter(t=>t.category===c.id);return <div key={c.id} className="mb-12"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">{c.id}</p><h2 className="text-2xl font-black">{c.label}</h2></div><span className="text-sm text-slate-500">{list.length} tools</span></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(t=><Link to={'/tools/'+t.slug} key={t.slug} className="card group p-5 transition hover:-translate-y-0.5 hover:border-emerald-400/30"><h3 className="font-bold group-hover:text-emerald-300">{t.name}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{t.description}</p><span className="mt-4 inline-flex items-center text-sm text-emerald-300">Open <ArrowRight className="ml-1" size={15}/></span></Link>)}</div></div>})}
  </section>
 </>
}
