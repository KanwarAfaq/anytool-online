import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react'
import { categories, tools } from '../data/tools'
import Seo from '../components/Seo'
import { useI18n } from '../i18n'

export default function Home(){
 const {t,toolName,toolDescription,pathFor}=useI18n()
 return <>
  <Seo title="AnyTool.online — Taiwan Calculators, Image, PDF & AI Tools" description="Free source-backed Taiwan salary calculators, passport and ARC photo tools, PDF utilities, QR tools, OCR and practical online calculators." jsonLd={[{'@context':'https://schema.org','@type':'WebSite',name:'AnyTool.online',url:'https://anytool.online/'},{'@context':'https://schema.org','@type':'Organization',name:'AnyTool.online',url:'https://anytool.online/'}]}/>
  <section className="mx-auto max-w-7xl px-4 pb-8 pt-16 md:pt-24">
   <div className="max-w-4xl">
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-200"><Sparkles size={15}/> {t('brandTag')}</div>
    <h1 className="text-4xl font-black tracking-tight sm:text-6xl">{t('hero')}</h1>
    <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{t('heroDesc')}</p>
    <div className="mt-8 flex flex-wrap gap-3"><a href="#tools" className="btn-primary">{t('browse')} <ArrowRight className="ms-2" size={17}/></a><Link to={pathFor('/tools/take-home-pay')} className="btn-ghost">{t('trySalary')}</Link></div>
   </div>
   <div className="mt-12 grid gap-4 sm:grid-cols-3">
    {[[Zap,t('fast'),t('fastDesc')],[ShieldCheck,t('privacy'),t('privacyDesc')],[Sparkles,t('aiFallback'),t('aiFallbackDesc')]].map(([Icon,title,desc])=><div className="card p-5" key={title}><Icon className="text-emerald-300"/><h3 className="mt-3 font-bold">{title}</h3><p className="mt-1 text-sm text-slate-400">{desc}</p></div>)}
   </div>
  </section>
  <section id="tools" className="mx-auto max-w-7xl px-4 py-10">
   {categories.map(c=>{const list=tools.filter(tool=>tool.category===c.id);return <div key={c.id} className="mb-12"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">{c.id}</p><h2 className="text-2xl font-black"><Link className="hover:text-emerald-300" to={pathFor('/categories/'+c.id)}>{t('categories.'+c.id)}</Link></h2></div><span className="text-sm text-slate-500">{list.length} {t('tools')}</span></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(tool=><Link to={pathFor('/tools/'+tool.slug)} key={tool.slug} className="card group p-5 transition hover:-translate-y-0.5 hover:border-emerald-400/30"><h3 className="font-bold group-hover:text-emerald-300">{toolName(tool)}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{toolDescription(tool)}</p><span className="mt-4 inline-flex items-center text-sm text-emerald-300">{t('open')} <ArrowRight className="ms-1" size={15}/></span></Link>)}</div></div>})}
  </section>
 </>
}
