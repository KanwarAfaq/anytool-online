import Seo from '../components/Seo'
import { officialSources } from '../data/officialSources'

export default function Methodology(){
 return <section className="mx-auto max-w-5xl px-4 py-16"><Seo title="Methodology & Data Quality | AnyTool.online" description="How AnyTool verifies calculator rules, official sources, AI outputs and government data." canonical="https://anytool.online/methodology"/><h1 className="text-4xl font-black">Methodology & data quality</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">AnyTool separates deterministic calculations from AI tasks. Formula-based tools are implemented in JavaScript and regression-tested. Regulated Taiwan tools carry source references and verification dates. AI is not used to invent statutory rates.</p><div className="mt-10 grid gap-4 md:grid-cols-2">{[
 ['Deterministic first','Tax, insurance, salary and percentage math stays in code and is covered by regression tests.'],
 ['Official-source grounding','Government pages and open data are preferred over blogs or secondary summaries.'],
 ['Freshness monitoring','A scheduled source-monitor checks high-value official pages and flags changes for review instead of silently changing formulas.'],
 ['AI with fallback','OCR and extraction can route across multiple configured providers; the UI shows the provider used.'],
 ['Human-readable evidence','Important regulated tools display source authority, last-verified date and limitations next to the result.'],
 ['No fake precision','When a government source exposes approved beds but not live vacancies, AnyTool labels it as approved capacity rather than claiming it is available.']
 ].map(([h,p])=><article className="card p-5" key={h}><h2 className="font-bold">{h}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{p}</p></article>)}</div><h2 className="mt-12 text-2xl font-black">Current high-priority sources</h2><div className="mt-4 grid gap-3">{Object.values(officialSources).slice(0,5).map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="card p-4 hover:border-emerald-400/30"><strong>{s.title}</strong><p className="mt-1 text-sm text-slate-400">{s.authority} · verified {s.verified}</p></a>)}</div></section>
}
