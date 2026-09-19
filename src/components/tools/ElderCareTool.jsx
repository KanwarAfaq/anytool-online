import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, MapPin, Phone, RefreshCw } from 'lucide-react'
import { elderCitySources, officialSources } from '../../data/officialSources'
import { useI18n } from '../../i18n'

export default function ElderCareTool(){
  const {lang}=useI18n()
  const strings={
    en:{headline:'2026 Taiwan residential care subsidy',amount:'Up to NT$15,000 / month',annual:'Up to NT$180,000 / year',desc:'The central-government residential care subsidy is nationwide for eligible moderate/severe long-term-care residents. Local supplemental programs may differ.',city:'Facility / bed information',taoyuan:'Taoyuan integrated vacancies',loading:'Loading official vacancy data…',available:'Available beds',approved:'Approved beds',address:'Address',phone:'Phone',rating:'Rating',map:'Map',source:'Official source',refresh:'Refresh',empty:'No rows were returned by the government attachment. Use the official source link below.',warning:'Vacancies change quickly. Call the institution before making plans. AnyTool shows the government-published figure and source timestamp; it does not reserve a bed.',other:'Other official city systems',notLive:'Directory / approved beds',live:'Vacancy / occupancy system'},
    'zh-TW':{headline:'2026 台灣住宿式機構補助',amount:'每月最高 NT$15,000',annual:'全年最高 NT$180,000',desc:'中央住宿式服務機構補助適用全台符合資格的中、重度失能住民；地方加碼方案可能不同。',city:'機構／床位資訊',taoyuan:'桃園官方可收容床位整合查詢',loading:'正在載入官方床位資料…',available:'可收容床位',approved:'核定床位',address:'地址',phone:'電話',rating:'評鑑',map:'地圖',source:'官方來源',refresh:'重新整理',empty:'政府附件目前未回傳可顯示資料，請直接查看下方官方來源。',warning:'床位可能隨時變動，實際入住前請直接致電機構確認。AnyTool 僅顯示政府公開數據與時間，不提供床位保留。',other:'其他縣市官方系統',notLive:'名冊／核定床位',live:'空床／入住狀況'},
    ar:{headline:'دعم الرعاية السكنية في تايوان 2026',amount:'حتى NT$15,000 شهرياً',annual:'حتى NT$180,000 سنوياً',desc:'الدعم المركزي للمؤسسات السكنية متاح على مستوى تايوان للمؤهلين من حالات الرعاية المتوسطة/الشديدة، وقد تختلف الإضافات المحلية.',city:'معلومات المؤسسات والأسرة',taoyuan:'شواغر تاويوان الرسمية المدمجة',loading:'جارٍ تحميل بيانات الأسرة الرسمية…',available:'الأسرة المتاحة',approved:'الأسرة المعتمدة',address:'العنوان',phone:'الهاتف',rating:'التقييم',map:'الخريطة',source:'المصدر الرسمي',refresh:'تحديث',empty:'لم تُرجع المرفقات الحكومية صفوفاً قابلة للعرض. استخدم رابط المصدر الرسمي.',warning:'تتغير الشواغر بسرعة. اتصل بالمؤسسة قبل اتخاذ القرار. AnyTool يعرض الرقم الحكومي المنشور فقط ولا يحجز سريراً.',other:'أنظمة مدن رسمية أخرى',notLive:'دليل / أسرة معتمدة',live:'شواغر / إشغال'},
    ur:{headline:'2026 تائیوان رہائشی نگہداشت سبسڈی',amount:'ماہانہ زیادہ سے زیادہ NT$15,000',annual:'سالانہ زیادہ سے زیادہ NT$180,000',desc:'مرکزی حکومت کی رہائشی نگہداشت سبسڈی اہل درمیانی/شدید طویل مدتی نگہداشت کے رہائشیوں کے لیے پورے تائیوان میں ہے؛ مقامی اضافی پروگرام مختلف ہو سکتے ہیں۔',city:'ادارے / بیڈ کی معلومات',taoyuan:'تاؤیوان سرکاری خالی بیڈ ڈیٹا',loading:'سرکاری بیڈ ڈیٹا لوڈ ہو رہا ہے…',available:'دستیاب بیڈ',approved:'منظور شدہ بیڈ',address:'پتہ',phone:'فون',rating:'ریٹنگ',map:'نقشہ',source:'سرکاری ماخذ',refresh:'ریفریش',empty:'سرکاری فائل سے قابلِ نمایش ریکارڈ نہیں ملا۔ نیچے سرکاری ماخذ کھولیں۔',warning:'خالی بیڈ تیزی سے بدل سکتے ہیں۔ فیصلہ کرنے سے پہلے ادارے کو فون کر کے تصدیق کریں۔ AnyTool صرف سرکاری شائع شدہ عدد دکھاتا ہے، بکنگ نہیں کرتا۔',other:'دیگر سرکاری شہری نظام',notLive:'ڈائریکٹری / منظور شدہ بیڈ',live:'خالی / زیرِ استعمال'}
  }
  const L=strings[lang]||strings.en
  const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[fetchedAt,setFetchedAt]=useState('')
  async function load(){
    setLoading(true);setError('')
    try{
      const r=await fetch('/api/elder-care?city=taoyuan')
      const d=await r.json()
      if(!r.ok)throw new Error(d.error||'Could not load official data')
      setRows(d.rows||[]);setFetchedAt(d.fetchedAt||'')
    }catch(e){setError(e.message)}
    finally{setLoading(false)}
  }
  useEffect(()=>{load()},[])
  const sorted=useMemo(()=>[...rows].sort((a,b)=>(Number(b.availableBeds)||0)-(Number(a.availableBeds)||0)),[rows])
  const subsidy=officialSources.elderSubsidy2026
  return <div className="space-y-6">
    <section className="card p-5">
      <div className="grid gap-5 md:grid-cols-3">
        <div className="md:col-span-2"><p className="text-sm font-semibold text-emerald-300">{L.headline}</p><div className="mt-2 text-3xl font-black">{L.amount}</div><div className="mt-1 text-lg text-slate-300">{L.annual}</div><p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">{L.desc}</p></div>
        <div className="rounded-xl bg-white/5 p-4"><p className="text-xs text-slate-500">{L.source}</p><p className="mt-1 text-sm font-semibold">{subsidy.authority}</p><a className="mt-3 inline-flex items-center text-sm text-emerald-300" href={subsidy.url} target="_blank" rel="noreferrer">MOHW 2026 announcement <ExternalLink className="ms-1" size={14}/></a><p className="mt-2 text-xs text-slate-500">Verified {subsidy.verified}</p></div>
      </div>
    </section>
    <section className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-black">{L.taoyuan}</h3><p className="mt-1 text-sm text-slate-500">{fetchedAt?new Date(fetchedAt).toLocaleString():''}</p></div><button className="btn-ghost" onClick={load}><RefreshCw size={15} className="me-2"/>{L.refresh}</button></div>
      <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-xs leading-5 text-amber-100/90">{L.warning}</p>
      {loading&&<p className="py-8 text-slate-400">{L.loading}</p>}
      {error&&<div className="py-6"><p className="text-amber-300">{error}</p><a className="mt-3 inline-flex text-emerald-300" href={officialSources.taoyuanBeds.url} target="_blank" rel="noreferrer">{L.source} <ExternalLink className="ms-1" size={14}/></a></div>}
      {!loading&&!error&&!sorted.length&&<p className="py-8 text-slate-400">{L.empty}</p>}
      {!!sorted.length&&<div className="mt-5 overflow-x-auto"><table className="w-full min-w-[820px] text-start text-sm"><thead className="text-slate-500"><tr className="border-b border-white/10"><th className="px-2 py-3 text-start">Facility</th><th className="px-2 py-3 text-start">{L.available}</th><th className="px-2 py-3 text-start">{L.approved}</th><th className="px-2 py-3 text-start">{L.rating}</th><th className="px-2 py-3 text-start">{L.address}</th><th className="px-2 py-3 text-start">{L.phone}</th></tr></thead><tbody>{sorted.map((r,i)=><tr key={i} className="border-b border-white/5 align-top"><td className="px-2 py-3 font-semibold">{r.name}</td><td className="px-2 py-3 text-emerald-300">{r.availableBeds||'—'}</td><td className="px-2 py-3">{r.approvedBeds||'—'}</td><td className="px-2 py-3">{r.rating||'—'}</td><td className="px-2 py-3"><a className="inline-flex hover:text-emerald-300" target="_blank" rel="noreferrer" href={'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(r.address||r.name)}><MapPin className="me-1 mt-0.5 shrink-0" size={14}/>{r.address||'—'}</a></td><td className="px-2 py-3">{r.phone?<a className="inline-flex hover:text-emerald-300" href={'tel:'+r.phone.replace(/[^0-9+]/g,'')}><Phone className="me-1" size={14}/>{r.phone}</a>:'—'}</td></tr>)}</tbody></table></div>}
    </section>
    <section><h3 className="mb-3 text-xl font-black">{L.other}</h3><div className="grid gap-3 md:grid-cols-2">{elderCitySources.filter(x=>x.city!=='Taoyuan').map(item=>{const s=officialSources[item.key];return <a key={item.city} href={s.url} target="_blank" rel="noreferrer" className="card p-4 transition hover:border-emerald-400/30"><div className="flex items-center justify-between gap-3"><strong>{item.city}</strong><span className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-400">{item.live?L.live:L.notLive}</span></div><p className="mt-2 text-sm text-slate-400">{s.summary}</p><p className="mt-3 text-xs text-emerald-300">{s.authority} ↗</p></a>})}</div></section>
  </div>
}
