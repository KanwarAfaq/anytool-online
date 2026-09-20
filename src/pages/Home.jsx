import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react'
import { categories, tools } from '../data/tools'
import Seo from '../components/Seo'
import { useI18n } from '../i18n'

export default function Home(){
 const {lang,t,toolName,toolDescription,pathFor}=useI18n()
 const banner={
  en:{eyebrow:'2026 Taiwan updates',title:'Salary, ID photo and elderly-care tools grounded in official sources.',body:'Current Taiwan wage, insurance, tax, passport / ARC photo and residential-care information is linked back to the responsible authority and reviewed by automated source checks.',cta:'Explore Taiwan tools',sources:'See official sources'},
  'zh-TW':{eyebrow:'2026 台灣最新資訊',title:'薪資、證件照與老人照護工具，以官方資料為依據。',body:'台灣工資、保險、稅務、護照／ARC 照片與住宿式照護資訊皆連結主管機關，並由自動來源監控定期檢查。',cta:'查看台灣工具',sources:'查看官方來源'},
  ar:{eyebrow:'تحديثات تايوان 2026',title:'أدوات الرواتب والصور الرسمية ورعاية المسنين مبنية على مصادر حكومية.',body:'نربط معلومات الأجور والتأمين والضرائب وصور الجواز/ARC والرعاية السكنية بالجهات الرسمية ونراقب تغير المصادر دورياً.',cta:'استكشف أدوات تايوان',sources:'المصادر الرسمية'},
  ur:{eyebrow:'2026 تائیوان اپ ڈیٹس',title:'تنخواہ، شناختی فوٹو اور بزرگ نگہداشت کے ٹولز سرکاری ذرائع پر مبنی ہیں۔',body:'اجرت، انشورنس، ٹیکس، پاسپورٹ/ARC فوٹو اور رہائشی نگہداشت کی معلومات متعلقہ سرکاری اداروں سے منسلک اور باقاعدگی سے مانیٹر کی جاتی ہیں۔',cta:'تائیوان ٹولز دیکھیں',sources:'سرکاری ذرائع'}
 }[lang]||null
 const B=banner||{}
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
  <section className="mx-auto max-w-7xl px-4 py-4">
   <div className="overflow-hidden rounded-3xl border border-emerald-300/20 bg-gradient-to-br from-emerald-300/10 via-white/[0.035] to-blue-400/10 p-6 md:p-8">
    <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
      <div><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">{B.eyebrow}</p><h2 className="mt-2 max-w-3xl text-2xl font-black sm:text-3xl">{B.title}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{B.body}</p></div>
      <div className="flex flex-wrap gap-3 lg:justify-end"><Link className="btn-primary" to={pathFor('/categories/money')}>{B.cta}</Link><Link className="btn-ghost" to={pathFor('/sources')}>{B.sources}</Link></div>
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      <Link to={pathFor('/tools/take-home-pay')} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 hover:border-emerald-300/30"><div className="text-sm font-bold">{toolName(tools.find(x=>x.slug==='take-home-pay'))}</div><p className="mt-1 text-xs text-slate-500">{toolDescription(tools.find(x=>x.slug==='take-home-pay'))}</p></Link>
      <Link to={pathFor('/tools/taiwan-id-photo')} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 hover:border-emerald-300/30"><div className="text-sm font-bold">{toolName(tools.find(x=>x.slug==='taiwan-id-photo'))}</div><p className="mt-1 text-xs text-slate-500">{toolDescription(tools.find(x=>x.slug==='taiwan-id-photo'))}</p></Link>
      <Link to={pathFor('/tools/taiwan-elder-care')} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 hover:border-emerald-300/30"><div className="text-sm font-bold">{toolName(tools.find(x=>x.slug==='taiwan-elder-care'))}</div><p className="mt-1 text-xs text-slate-500">{toolDescription(tools.find(x=>x.slug==='taiwan-elder-care'))}</p></Link>
    </div>
   </div>
  </section>
  <section id="tools" className="mx-auto max-w-7xl px-4 py-10">
   {categories.map(c=>{const list=tools.filter(tool=>tool.category===c.id);return <div key={c.id} className="mb-12"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">{c.id}</p><h2 className="text-2xl font-black"><Link className="hover:text-emerald-300" to={pathFor('/categories/'+c.id)}>{t('categories.'+c.id)}</Link></h2></div><span className="text-sm text-slate-500">{list.length} {t('tools')}</span></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(tool=><Link to={pathFor('/tools/'+tool.slug)} key={tool.slug} className="card group p-5 transition hover:-translate-y-0.5 hover:border-emerald-400/30"><h3 className="font-bold group-hover:text-emerald-300">{toolName(tool)}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{toolDescription(tool)}</p><span className="mt-4 inline-flex items-center text-sm text-emerald-300">{t('open')} <ArrowRight className="ms-1" size={15}/></span></Link>)}</div></div>})}
  </section>
 </>
}
