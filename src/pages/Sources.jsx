import Seo from '../components/Seo'
import { officialSources } from '../data/officialSources'
import { useI18n } from '../i18n'

export default function Sources(){
 const {lang}=useI18n()
 const copy={
  en:{title:'Official sources',desc:'Official government sources used by AnyTool for Taiwan calculations, photo requirements and elderly-care information.',intro:'For regulated or public-service tools, AnyTool prioritizes the responsible government authority and records when the source was last reviewed.',verified:'Verified'},
  'zh-TW':{title:'官方來源',desc:'AnyTool 用於台灣計算、證件照規格與老人照護資訊的政府官方來源。',intro:'涉及法規或公共服務的工具，AnyTool 優先引用主管機關與政府開放資料，並記錄最後查核日期。',verified:'查核'},
  ar:{title:'المصادر الرسمية',desc:'المصادر الحكومية الرسمية التي يستخدمها AnyTool لحسابات تايوان ومتطلبات الصور ومعلومات رعاية المسنين.',intro:'في الأدوات التنظيمية أو العامة نعطي الأولوية للجهة الحكومية المسؤولة ونسجل تاريخ آخر مراجعة للمصدر.',verified:'تم التحقق'},
  ur:{title:'سرکاری ذرائع',desc:'تائیوان حسابات، تصویر قواعد اور بزرگ نگہداشت معلومات کے لیے AnyTool کے استعمال شدہ سرکاری حکومتی ذرائع۔',intro:'قانونی یا عوامی سروس ٹولز میں AnyTool متعلقہ سرکاری ادارے کو ترجیح دیتا اور آخری review تاریخ ریکارڈ کرتا ہے۔',verified:'تصدیق'}
 }[lang]||null
 const c=copy||{}
 const list=Object.values(officialSources)
 return <section className="mx-auto max-w-5xl px-4 py-16"><Seo title={(c.title||'Official Sources')+' | AnyTool.online'} description={c.desc||''}/><h1 className="text-4xl font-black">{c.title}</h1><p className="mt-4 max-w-3xl text-slate-300">{c.intro}</p><div className="mt-8 grid gap-4">{list.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="card p-5 transition hover:border-emerald-400/30"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">{s.title}</h2><span className="text-xs text-emerald-300">{c.verified} {s.verified}</span></div><p className="mt-2 text-sm text-slate-400">{s.authority}</p><p className="mt-2 text-sm leading-6 text-slate-300">{s.summary}</p></a>)}</div></section>
}
