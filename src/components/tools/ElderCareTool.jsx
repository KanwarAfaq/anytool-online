import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, MapPin, Phone, RefreshCw, Search } from 'lucide-react'
import { elderCitySources, officialSources } from '../../data/officialSources'
import { useI18n } from '../../i18n'

const localPrograms=[
  {city:'Taoyuan',key:'taoyuanLocalElderPlacement',amount:'NT$10,000 / NT$24,000 per month',contact:'03-3350598'},
  {city:'Taipei',key:'taipeiLocalElderPlacement',amount:'NT$4,320–27,250 per month',contact:'1999 / 02-27208889'},
  {city:'New Taipei',key:'newTaipeiLocalElderPlacement',amount:'NT$6,000 / 10,000 / 24,000 per month',contact:'02-29603456'},
  {city:'Taichung',key:'taichungLocalElderPlacement',amount:'NT$10,000 / up to 21,000 (+ up to 10,000 care support)',contact:'Use official program page'},
  {city:'Tainan',key:'tainanLocalElderPlacement',amount:'NT$12,000–25,400 per month',contact:'06-2991111 ext. 8012, 8979'},
]

export default function ElderCareTool(){
  const {lang}=useI18n()
  const strings={
    en:{headline:'2026 Taiwan residential care subsidy',amount:'Up to NT$15,000 / month',annual:'Up to NT$180,000 / year',desc:'For eligible residents who need medium or severe long-term care. MOHW says the 2026 increase applies retroactively from January 1, 2026.',eligibility:'Key eligibility',eligible1:'Long-term care need level 4 or above, or qualifying moderate-or-higher disability status.',eligible2:'A recognized month generally requires actual stay for at least half of that calendar month. Some residents continuously placed since before 2023 can fall under a NT$5,000/month transition rule.',eligible3:'Local placement programs below have separate income, disability, residency and non-duplication rules.',city:'Official bed dataset',search:'Search facility, district or address',taoyuan:'Taoyuan elderly welfare vacancies',taipei:'Taipei public nursing homes — open beds',loading:'Loading official government data…',available:'Published open / available beds',approved:'Approved beds',address:'Address',phone:'Phone',rating:'Rating',source:'Official source',refresh:'Refresh',empty:'No matching rows were returned. Try another search or use the official source link.',warning:'Bed figures can change quickly. Call the institution before making plans. AnyTool shows government-published data and never claims to reserve a bed.',other:'Other official city / national systems',notLive:'Directory / approved capacity',live:'Vacancy / occupancy source',localTitle:'Verified local / means-tested placement programs',localNote:'These programs are separate from the central residential-care subsidy. Amounts shown are from current official program material; do not automatically add programs together.',contact:'Contact',dataNote:'Dataset note'},
    'zh-TW':{headline:'2026 台灣住宿式機構補助',amount:'每月最高 NT$15,000',annual:'全年最高 NT$180,000',desc:'適用符合中、重度長照需求的機構住民；衛福部公告 2026 年加碼追溯自 1 月 1 日適用。',eligibility:'資格重點',eligible1:'長照需要等級 4 級以上，或符合中度以上身心障礙等方案條件。',eligible2:'原則上當月實際入住達該月日曆天數二分之一以上才認列 1 個月；112 年以前即持續入住的部分既有住民另有每月 NT$5,000 過渡規定。',eligible3:'下方地方安置方案另有所得、失能、設籍及不得重複補助等條件。',city:'官方床位資料',search:'搜尋機構、行政區或地址',taoyuan:'桃園老人福利機構可收容床位',taipei:'臺北市公立護理之家開放床位',loading:'正在載入政府官方資料…',available:'公告開放／可收容床位',approved:'核定床位',address:'地址',phone:'電話',rating:'評鑑',source:'官方來源',refresh:'重新整理',empty:'沒有符合搜尋條件的資料，請修改搜尋或直接查看官方來源。',warning:'床位可能隨時變動，實際入住前請直接致電機構確認。AnyTool 僅顯示政府公開數據，不提供床位保留。',other:'其他縣市／全國官方系統',notLive:'名冊／核定容量',live:'空床／入住狀況來源',localTitle:'已查核的地方／經濟資格安置補助',localNote:'這些地方方案與中央住宿式補助不同。金額來自目前官方方案資料，不應自行假設可重複加總。',contact:'洽詢',dataNote:'資料說明'},
    ar:{headline:'دعم الرعاية السكنية في تايوان 2026',amount:'حتى NT$15,000 شهرياً',annual:'حتى NT$180,000 سنوياً',desc:'للمقيمين المؤهلين ذوي احتياجات الرعاية المتوسطة أو الشديدة، وبأثر رجعي من 1 يناير 2026 وفق MOHW.',eligibility:'أهم شروط الأهلية',eligible1:'مستوى حاجة رعاية طويلة الأجل 4 أو أعلى، أو حالة إعاقة مؤهلة متوسطة فأعلى.',eligible2:'يُحتسب الشهر عادةً عند الإقامة الفعلية لنصف أيام الشهر على الأقل، مع قاعدة انتقالية قدرها NT$5,000 شهرياً لبعض المقيمين المستمرين منذ ما قبل 2023.',eligible3:'برامج المدن أدناه لها شروط مستقلة للدخل والعجز والإقامة وعدم الجمع.',city:'بيانات الأسرة الرسمية',search:'ابحث باسم المؤسسة أو المنطقة أو العنوان',taoyuan:'شواغر مؤسسات كبار السن في تاويوان',taipei:'أسرة دور التمريض العامة في تايبيه',loading:'جارٍ تحميل البيانات الحكومية الرسمية…',available:'الأسرة المفتوحة / المتاحة المنشورة',approved:'الأسرة المعتمدة',address:'العنوان',phone:'الهاتف',rating:'التقييم',source:'المصدر الرسمي',refresh:'تحديث',empty:'لا توجد نتائج مطابقة. غيّر البحث أو افتح المصدر الرسمي.',warning:'قد تتغير أرقام الأسرة بسرعة. اتصل بالمؤسسة قبل اتخاذ القرار. AnyTool يعرض البيانات الحكومية المنشورة ولا يحجز الأسرة.',other:'أنظمة مدن / أنظمة وطنية رسمية أخرى',notLive:'دليل / سعة معتمدة',live:'مصدر شواغر / إشغال',localTitle:'برامج محلية / مرتبطة بالدخل تم التحقق منها',localNote:'هذه البرامج منفصلة عن الدعم المركزي. لا تفترض أنه يمكن جمعها تلقائياً.',contact:'اتصال',dataNote:'ملاحظة البيانات'},
    ur:{headline:'2026 تائیوان رہائشی نگہداشت سبسڈی',amount:'ماہانہ زیادہ سے زیادہ NT$15,000',annual:'سالانہ زیادہ سے زیادہ NT$180,000',desc:'اہل درمیانی یا شدید طویل مدتی نگہداشت کے رہائشیوں کے لیے، MOHW کے مطابق 1 جنوری 2026 سے مؤثر۔',eligibility:'اہلیت کے اہم نکات',eligible1:'طویل مدتی نگہداشت ضرورت لیول 4 یا اس سے اوپر، یا اہل درمیانی/زیادہ معذوری کی حیثیت۔',eligible2:'عام طور پر مہینے کے کم از کم نصف دن اصل رہائش پر ایک مہینہ شمار ہوتا ہے؛ 2023 سے پہلے سے مسلسل مقیم بعض افراد کے لیے NT$5,000 ماہانہ عبوری قاعدہ ہے۔',eligible3:'نیچے مقامی پروگراموں کے آمدنی، معذوری، رہائش اور عدم تکرار کے الگ قواعد ہیں۔',city:'سرکاری بیڈ ڈیٹا',search:'ادارہ، ضلع یا پتہ تلاش کریں',taoyuan:'تاؤیوان بزرگ فلاحی اداروں کے دستیاب بیڈ',taipei:'تائی پے پبلک نرسنگ ہوم اوپن بیڈ',loading:'سرکاری ڈیٹا لوڈ ہو رہا ہے…',available:'شائع شدہ اوپن / دستیاب بیڈ',approved:'منظور شدہ بیڈ',address:'پتہ',phone:'فون',rating:'ریٹنگ',source:'سرکاری ماخذ',refresh:'ریفریش',empty:'کوئی مماثل ریکارڈ نہیں ملا۔ تلاش بدلیں یا سرکاری ماخذ کھولیں۔',warning:'بیڈ کی تعداد تیزی سے بدل سکتی ہے۔ فیصلہ کرنے سے پہلے ادارے کو فون کریں۔ AnyTool صرف سرکاری شائع شدہ ڈیٹا دکھاتا ہے اور بکنگ نہیں کرتا۔',other:'دیگر سرکاری شہری / قومی نظام',notLive:'ڈائریکٹری / منظور شدہ گنجائش',live:'خالی / زیرِ استعمال ماخذ',localTitle:'تصدیق شدہ مقامی / آمدنی پر مبنی سبسڈی پروگرام',localNote:'یہ مرکزی سبسڈی سے الگ پروگرام ہیں۔ انہیں خودکار طور پر جمع نہ سمجھیں۔',contact:'رابطہ',dataNote:'ڈیٹا نوٹ'}
  }
  const L=strings[lang]||strings.en
  const [dataset,setDataset]=useState('taoyuan')
  const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[meta,setMeta]=useState({})
  const [query,setQuery]=useState('')

  async function load(next=dataset){
    setLoading(true);setError('')
    try{
      const r=await fetch('/api/elder-care?city='+encodeURIComponent(next))
      const d=await r.json()
      if(!r.ok)throw new Error(d.error||'Could not load official data')
      setRows(d.rows||[]);setMeta(d)
    }catch(e){setRows([]);setError(e.message)}
    finally{setLoading(false)}
  }
  useEffect(()=>{load(dataset)},[dataset])

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase()
    return [...rows].filter(r=>!q||[r.name,r.district,r.address,r.service].some(x=>String(x||'').toLowerCase().includes(q)))
      .sort((a,b)=>(Number(b.availableBeds)||0)-(Number(a.availableBeds)||0))
  },[rows,query])

  const subsidy=officialSources.elderSubsidy2026
  const currentSource=dataset==='taoyuan'?officialSources.taoyuanBeds:officialSources.taipeiPublicNursingBeds

  return <div className="space-y-6">
    <section className="card p-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
        <div><p className="text-sm font-semibold text-emerald-300">{L.headline}</p><div className="mt-2 text-3xl font-black">{L.amount}</div><div className="mt-1 text-lg text-slate-300">{L.annual}</div><p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">{L.desc}</p>
          <h3 className="mt-5 font-bold">{L.eligibility}</h3>
          <ul className="mt-2 list-disc space-y-1 ps-5 text-sm leading-6 text-slate-400"><li>{L.eligible1}</li><li>{L.eligible2}</li><li>{L.eligible3}</li></ul>
        </div>
        <div className="rounded-xl bg-white/5 p-4"><p className="text-xs text-slate-500">{L.source}</p><p className="mt-1 text-sm font-semibold">{subsidy.authority}</p><a className="mt-3 inline-flex items-center text-sm text-emerald-300" href={subsidy.url} target="_blank" rel="noreferrer">MOHW 2026 announcement <ExternalLink className="ms-1" size={14}/></a><p className="mt-2 text-xs text-slate-500">Verified {subsidy.verified}</p></div>
      </div>
    </section>

    <section>
      <h3 className="mb-3 text-xl font-black">{L.localTitle}</h3>
      <p className="mb-4 max-w-4xl text-xs leading-5 text-amber-100/90">{L.localNote}</p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
       {localPrograms.map(item=>{const src=officialSources[item.key];return <a key={item.key} href={src.url} target="_blank" rel="noreferrer" className="card p-4 transition hover:border-emerald-400/30"><div className="flex items-start justify-between gap-2"><strong>{item.city}</strong><ExternalLink size={14} className="mt-1 shrink-0 text-emerald-300"/></div><div className="mt-2 text-lg font-black text-emerald-200">{item.amount}</div><p className="mt-2 text-xs leading-5 text-slate-400">{src.summary}</p><p className="mt-2 text-xs text-slate-400"><Phone size={12} className="me-1 inline"/>{L.contact}: {item.contact}</p><p className="mt-2 text-[11px] text-slate-500">{src.authority} · {src.verified}</p></a>})}
      </div>
    </section>

    <section className="card p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-[240px] flex-1"><label className="mb-1.5 block text-sm text-slate-400">{L.city}</label><select className="input max-w-xl" value={dataset} onChange={e=>{setDataset(e.target.value);setQuery('')}}><option value="taoyuan">{L.taoyuan}</option><option value="taipei">{L.taipei}</option></select></div>
        <button className="btn-ghost" onClick={()=>load()}><RefreshCw size={15} className="me-2"/>{L.refresh}</button>
      </div>
      <div className="relative mt-4 max-w-xl"><Search size={16} className="absolute start-3 top-3 text-slate-500"/><input className="input ps-9" placeholder={L.search} value={query} onChange={e=>setQuery(e.target.value)}/></div>
      <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-xs leading-5 text-amber-100/90">{L.warning}</p>
      {meta.dataKind&&<p className="mt-3 text-xs text-slate-500">{L.dataNote}: {meta.dataKind}{meta.sourceUpdated?' · source updated '+meta.sourceUpdated:''}{meta.fetchedAt?' · fetched '+new Date(meta.fetchedAt).toLocaleString():''}</p>}
      {loading&&<p className="py-8 text-slate-400">{L.loading}</p>}
      {error&&<div className="py-6"><p className="text-amber-300">{error}</p><a className="mt-3 inline-flex text-emerald-300" href={currentSource.url} target="_blank" rel="noreferrer">{L.source} <ExternalLink className="ms-1" size={14}/></a></div>}
      {!loading&&!error&&!filtered.length&&<p className="py-8 text-slate-400">{L.empty}</p>}
      {!!filtered.length&&<div className="mt-5 overflow-x-auto"><table className="w-full min-w-[820px] text-start text-sm"><thead className="text-slate-500"><tr className="border-b border-white/10"><th className="px-2 py-3 text-start">Facility</th><th className="px-2 py-3 text-start">{L.available}</th><th className="px-2 py-3 text-start">{L.approved}</th><th className="px-2 py-3 text-start">{L.rating}</th><th className="px-2 py-3 text-start">{L.address}</th><th className="px-2 py-3 text-start">{L.phone}</th></tr></thead><tbody>{filtered.map((r,i)=><tr key={r.id||i} className="border-b border-white/5 align-top"><td className="px-2 py-3 font-semibold">{r.name}</td><td className="px-2 py-3 text-emerald-300">{r.availableBeds!==''&&r.availableBeds!=null?r.availableBeds:'—'}</td><td className="px-2 py-3">{r.approvedBeds||'—'}</td><td className="px-2 py-3">{r.rating||'—'}</td><td className="px-2 py-3"><a className="inline-flex hover:text-emerald-300" target="_blank" rel="noreferrer" href={'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(r.address||r.name)}><MapPin className="me-1 mt-0.5 shrink-0" size={14}/>{r.address||'—'}</a></td><td className="px-2 py-3">{r.phone?<a className="inline-flex hover:text-emerald-300" href={'tel:'+r.phone.replace(/[^0-9+]/g,'')}><Phone className="me-1" size={14}/>{r.phone}{r.extension?' ext. '+r.extension:''}</a>:'—'}</td></tr>)}</tbody></table></div>}
    </section>

    <section><h3 className="mb-3 text-xl font-black">{L.other}</h3><div className="grid gap-3 md:grid-cols-2">{elderCitySources.filter(x=>!x.integrated).map(item=>{const s=officialSources[item.key];return <a key={item.city} href={s.url} target="_blank" rel="noreferrer" className="card p-4 transition hover:border-emerald-400/30"><div className="flex items-center justify-between gap-3"><strong>{item.city}</strong><span className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-400">{item.live?L.live:L.notLive}</span></div><p className="mt-2 text-sm text-slate-400">{s.summary}</p><p className="mt-3 text-xs text-emerald-300">{s.authority} ↗</p></a>})}</div></section>
  </div>
}
