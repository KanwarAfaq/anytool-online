import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowRight, BookOpen, Clock } from 'lucide-react'
import Seo from '../components/Seo'
import { useI18n } from '../i18n'
import { tools } from '../data/tools'
import { guides, guideBySlug, guideLocales, guidesHub } from '../data/guides'

const SITE='https://anytool.online'
const ui={en:{open:'Open the free tool',updated:'Updated',all:'All guides',read:'Read guide',home:'Home'},'zh-TW':{open:'開啟免費工具',updated:'更新',all:'所有指南',read:'閱讀指南',home:'首頁'}}

export function GuidesIndex(){
 const {lang,pathFor}=useI18n()
 if(!guideLocales.includes(lang))return <Navigate to="/guides" replace/>
 const H=guidesHub[lang],U=ui[lang]
 return <section className="mx-auto max-w-5xl px-4 py-10">
  <Seo title={H.title} description={H.desc} only={guideLocales}/>
  <div className="section-kicker"><BookOpen size={13}/>{guides.length} guides</div>
  <h1 className="mt-2 text-4xl font-black">{H.h1}</h1>
  <p className="mt-3 max-w-2xl text-lg opacity-80">{H.desc}</p>
  <div className="mt-8 grid gap-4 sm:grid-cols-2">{guides.map(g=>{const c=g[lang]||g.en;return <Link key={g.slug} to={pathFor('/guides/'+g.slug)} className="card guide-card p-5">
   <h2 className="text-xl font-black">{c.title}</h2><p className="mt-2 text-sm opacity-75">{c.desc}</p>
   <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[var(--accent-text)]">{U.read} <ArrowRight size={14}/></span></Link>})}</div>
 </section>
}

export default function GuidePage(){
 const {slug}=useParams()
 const {lang,pathFor,toolName}=useI18n()
 if(!guideLocales.includes(lang))return <Navigate to={'/guides/'+(slug||'')} replace/>
 const g=guideBySlug[slug]
 if(!g)return <Navigate to={pathFor('/guides')} replace/>
 const c=g[lang]||g.en,U=ui[lang]
 const tool=tools.find(t=>t.slug===g.tool)
 const url=SITE+pathFor('/guides/'+g.slug)
 const schemas=[
  {'@context':'https://schema.org','@type':'Article',headline:c.title,description:c.desc,inLanguage:lang,dateModified:g.updated,datePublished:g.updated,mainEntityOfPage:url,author:{'@type':'Person',name:'Kanwar Afaq',url:SITE+pathFor('/about')},publisher:{'@type':'Organization',name:'AnyTool.online',url:SITE+'/'}},
  {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'AnyTool',item:SITE+'/'},{'@type':'ListItem',position:2,name:guidesHub[lang].h1,item:SITE+pathFor('/guides')},{'@type':'ListItem',position:3,name:c.title,item:url}]}
 ]
 return <article className="mx-auto max-w-3xl px-4 py-10 guide-article">
  <Seo title={c.title+' | AnyTool.online'} description={c.desc} jsonLd={schemas} only={guideLocales}/>
  <nav aria-label="Breadcrumb" className="mb-4 text-xs font-semibold opacity-70"><Link to={pathFor('/guides')}>{U.all}</Link></nav>
  <h1 className="text-4xl font-black leading-tight">{c.title}</h1>
  <p className="mt-3 flex items-center gap-2 text-sm opacity-70"><Clock size={14}/>{U.updated}: <time dateTime={g.updated}>{g.updated}</time></p>
  <p className="mt-4 text-lg opacity-85">{c.desc}</p>
  {tool&&<Link className="btn-primary mt-5 inline-flex items-center gap-2" to={pathFor('/tools/'+tool.slug)}>{U.open}: {toolName(tool)} <ArrowRight size={16}/></Link>}
  {c.sections.map(s=><section key={s.h} className="mt-8"><h2 className="text-2xl font-black">{s.h}</h2>{(s.p||[]).map(t=><p key={t} className="mt-3 leading-8 opacity-90">{t}</p>)}{s.list&&<ul className="mt-3 grid gap-2 pl-5 leading-7 opacity-90" style={{listStyle:'disc'}}>{s.list.map(i=><li key={i}>{i}</li>)}</ul>}</section>)}
  {g.refs&&<section className="mt-8"><h2 className="text-xl font-black">{lang==='zh-TW'?'延伸閱讀':'Further reading'}</h2><ul className="mt-2 grid gap-1 pl-5" style={{listStyle:'disc'}}>{g.refs.map(r=><li key={r.url}><a href={r.url} target="_blank" rel="noopener noreferrer" className="underline">{r.label} ↗</a></li>)}</ul></section>}
  {tool&&<div className="mt-10"><Link className="btn-primary inline-flex items-center gap-2" to={pathFor('/tools/'+tool.slug)}>{U.open}: {toolName(tool)} <ArrowRight size={16}/></Link></div>}
 </article>
}
