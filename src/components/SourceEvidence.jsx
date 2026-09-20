import { ExternalLink, ShieldCheck } from 'lucide-react'
import { officialSources, toolSourceKeys } from '../data/officialSources'
import { useI18n } from '../i18n'

export default function SourceEvidence({slug}){
 const {lang}=useI18n()
 const keys=toolSourceKeys[slug]||[]
 if(!keys.length)return null
 const L={
  en:{title:'Official sources',verified:'Verified',note:'For controlling rules, follow the linked authority.'},
  'zh-TW':{title:'官方來源',verified:'查核日期',note:'正式規定請以連結主管機關的最新版本為準。'},
  ar:{title:'المصادر الرسمية',verified:'تم التحقق',note:'للنسخة المعتمدة راجع الجهة الرسمية المرتبطة.'},
  ur:{title:'سرکاری ذرائع',verified:'تصدیق',note:'حتمی اصول کے لیے متعلقہ سرکاری ادارے کا تازہ ورژن دیکھیں۔'}
 }[lang]
 return <details className="compact-details">
  <summary><span className="flex items-center gap-2"><ShieldCheck size={17} className="text-lime-300"/>{L.title}</span><span className="me-2 text-xs font-medium text-slate-500">{keys.length}</span></summary>
  <div className="border-t border-white/[0.06] p-4">
   <div className="grid gap-2 md:grid-cols-2">{keys.map(key=>{const s=officialSources[key];if(!s)return null;return <a key={key} href={s.url} target="_blank" rel="noreferrer" className="rounded-xl border border-white/[0.07] bg-[#080e16] p-3 transition hover:border-lime-300/20"><div className="flex items-start justify-between gap-3"><strong className="text-sm leading-5">{s.title}</strong><ExternalLink size={13} className="mt-1 shrink-0 text-lime-300"/></div><p className="mt-1 text-xs text-slate-500">{s.authority} · {L.verified} {s.verified}</p></a>})}</div>
   <p className="mt-3 text-xs text-slate-500">{L.note}</p>
  </div>
 </details>
}
