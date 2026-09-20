import Seo from '../components/Seo'
import { officialSources } from '../data/officialSources'

export default function Sources(){
 const list=Object.values(officialSources)
 return <section className="mx-auto max-w-5xl px-4 py-16"><Seo title="Official Sources | AnyTool.online" description="Official government sources used by AnyTool for Taiwan calculators, photo requirements and elderly care information." canonical="https://anytool.online/sources"/><h1 className="text-4xl font-black">Official sources</h1><p className="mt-4 max-w-3xl text-slate-300">For regulated or public-service tools, AnyTool prioritizes the responsible government authority and records when the source was last reviewed.</p><div className="mt-8 grid gap-4">{list.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="card p-5 transition hover:border-emerald-400/30"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">{s.title}</h2><span className="text-xs text-emerald-300">Verified {s.verified}</span></div><p className="mt-2 text-sm text-slate-400">{s.authority}</p><p className="mt-2 text-sm leading-6 text-slate-300">{s.summary}</p></a>)}</div></section>
}
