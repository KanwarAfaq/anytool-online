import { ExternalLink, ShieldCheck } from 'lucide-react'
import { officialSources, toolSourceKeys } from '../data/officialSources'
import { useI18n } from '../i18n'

export default function SourceEvidence({slug}){
  const {lang}=useI18n()
  const keys=toolSourceKeys[slug]||[]
  if(!keys.length)return null
  const label={
    en:{title:'Official sources used',verified:'Verified',note:'Rules and public-service data can change. Follow the linked authority for the controlling version.'},
    'zh-TW':{title:'採用的官方來源',verified:'查核日期',note:'法規與公共服務資料可能更新；如有差異，以連結的主管機關最新版本為準。'},
    ar:{title:'المصادر الرسمية المستخدمة',verified:'تم التحقق',note:'قد تتغير القواعد وبيانات الخدمات العامة؛ ارجع إلى الجهة الرسمية المرتبطة للحصول على النسخة المعتمدة.'},
    ur:{title:'استعمال شدہ سرکاری ذرائع',verified:'تصدیق',note:'قواعد اور عوامی سروس ڈیٹا بدل سکتا ہے؛ حتمی معلومات کے لیے متعلقہ سرکاری ادارے کا تازہ ترین ورژن دیکھیں۔'}
  }[lang]||null
  const L=label||{title:'Official sources used',verified:'Verified',note:'Rules and public-service data can change. Follow the linked authority for the controlling version.'}
  return <section className="mt-7 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.04] p-5">
    <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-300"/><h2 className="font-bold">{L.title}</h2></div>
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {keys.map(key=>{const s=officialSources[key];if(!s)return null;return <a key={key} href={s.url} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-slate-950/30 p-4 transition hover:border-emerald-400/30">
        <div className="flex items-start justify-between gap-3"><strong className="text-sm leading-5">{s.title}</strong><ExternalLink size={14} className="mt-0.5 shrink-0 text-emerald-300"/></div>
        <p className="mt-2 text-xs text-slate-500">{s.authority}</p>
        <p className="mt-2 text-xs leading-5 text-slate-400">{s.summary}</p>
        <p className="mt-2 text-[11px] text-emerald-300">{L.verified}: {s.verified}</p>
      </a>})}
    </div>
    <p className="mt-4 text-xs leading-5 text-slate-500">{L.note}</p>
  </section>
}
