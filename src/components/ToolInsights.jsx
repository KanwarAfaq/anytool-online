import { Lightbulb, CircleHelp, ListChecks } from 'lucide-react'
import { priorityToolContent } from '../data/toolContent'
import { useI18n } from '../i18n'

export default function ToolInsights({tool}){
 const {lang}=useI18n()
 const data=priorityToolContent[tool.slug]
 if(lang!=='en'||!data)return null
 return <section className="mt-5 grid gap-4 lg:grid-cols-3" aria-label="Examples and common questions">
  <article className="card p-5">
   <div className="flex items-center gap-2 text-sm font-black text-lime-200"><ListChecks size={17}/>Common uses</div>
   <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">{data.useCases.map(x=><li key={x} className="flex gap-2"><span aria-hidden="true" className="text-lime-300">•</span><span>{x}</span></li>)}</ul>
  </article>
  <article className="card p-5">
   <div className="flex items-center gap-2 text-sm font-black text-cyan-200"><Lightbulb size={17}/>Worked example</div>
   <h2 className="mt-3 text-base font-black">{data.example.title}</h2>
   <p className="mt-2 text-sm leading-6 text-slate-400">{data.example.body}</p>
  </article>
  <article className="card p-5">
   <div className="flex items-center gap-2 text-sm font-black text-violet-200"><CircleHelp size={17}/>Common questions</div>
   <div className="mt-3 space-y-4">{data.questions.map(([q,a])=><div key={q}><h2 className="text-sm font-bold">{q}</h2><p className="mt-1 text-sm leading-6 text-slate-400">{a}</p></div>)}</div>
  </article>
 </section>
}
