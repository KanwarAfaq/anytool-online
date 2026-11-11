import {useState} from 'react'
import {Link,useParams} from 'react-router-dom'
import {ArrowLeft,ExternalLink,Gamepad2,Monitor,Smartphone,Play} from 'lucide-react'
import {useI18n} from '../i18n'
import {arcadeGames,gamePage,gameURL} from '../data/arcadeGames'
import Seo from '../components/Seo'

const copy={
 en:{heading:'Free browser games',intro:'Play 13 free online games including snake, arcade shooters, puzzles, racers and 3D adventures. No downloads or account needed.',play:'Play game',all:'All games',mobile:'Touch supported',desktop:'Best on desktop',launch:'Start game',note:'The game loads only when you start playing. Your main AnyTool page remains lightweight.',back:'Back to games',external:'Open in new tab',notfound:'Game not found'},
 'zh-TW':{heading:'免費線上遊戲',intro:'免下載即可玩貪食蛇、益智、賽車、街機射擊與 3D 冒險等 13 款免費遊戲。',play:'開始遊戲',all:'全部遊戲',mobile:'支援觸控',desktop:'建議桌機',launch:'開始遊戲',note:'遊戲只會在您按下開始後載入，不影響 AnyTool 首頁速度。',back:'返回遊戲列表',external:'開新分頁',notfound:'找不到遊戲'},
 ar:{heading:'ألعاب مجانية في المتصفح',intro:'استمتع بـ 13 لعبة مجانية: ألغاز وسباقات وثعبان ومغامرات ثلاثية الأبعاد، دون تثبيت.',play:'العب الآن',all:'كل الألعاب',mobile:'يدعم اللمس',desktop:'أفضل على الكمبيوتر',launch:'ابدأ اللعبة',note:'لا يتم تحميل اللعبة إلا بعد الضغط على زر البدء.',back:'العودة إلى الألعاب',external:'فتح في علامة جديدة',notfound:'اللعبة غير موجودة'},
 ur:{heading:'مفت براؤزر گیمز',intro:'سانپ، پزل، ریسنگ اور 3D ایڈونچر سمیت 13 مفت آن لائن گیمز کھیلیں، بغیر ڈاؤن لوڈ۔',play:'گیم کھیلیں',all:'تمام گیمز',mobile:'ٹچ سپورٹ',desktop:'کمپیوٹر پر بہتر',launch:'گیم شروع کریں',note:'گیم صرف اسٹارٹ کرنے کے بعد لوڈ ہوتی ہے۔',back:'گیمز پر واپس',external:'نئے ٹیب میں کھولیں',notfound:'گیم نہیں ملی'}
}
function PageShell({children}){return <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">{children}</div>}
export default function Arcade(){
 const {slug}=useParams()
 const {lang,pathFor}=useI18n()
 const t=copy[lang]||copy.en
 const selected=slug?gamePage(slug):null
 const [runningSlug,setRunningSlug]=useState(null)
 const running=runningSlug===slug
 if(slug&&!selected)return <PageShell><h1>{t.notfound}</h1><Link to={pathFor('/games')}>{t.back}</Link></PageShell>
 if(!selected){
  return <PageShell>
   <Seo title={t.heading+' | AnyTool.online'} description={t.intro} canonical={pathFor('/games')}/>
   <header className="mb-8"><p className="text-sm font-semibold text-indigo-600">AnyTool Arcade · 13 games</p><h1 className="mt-2 text-4xl font-extrabold tracking-tight">{t.heading}</h1><p className="mt-3 max-w-3xl text-lg text-slate-600 dark:text-slate-300">{t.intro}</p></header>
   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{arcadeGames.map(g=><Link key={g.slug} to={pathFor('/games/'+g.slug)} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50"><Gamepad2 size={24}/></span>{g.mobile?<Smartphone className="text-slate-400" size={18}/>:<Monitor className="text-slate-400" size={18}/>}</div>
    <h2 className="mt-4 text-xl font-bold">{g.name}</h2><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">{g.type}</p><p className="mt-3 min-h-14 text-sm text-slate-600 dark:text-slate-300">{g.description}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">{t.play} <Play size={15}/></span>
   </Link>)}</div>
   <section className="mt-10 max-w-3xl"><h2 className="text-xl font-bold">Play online without installing software</h2><p className="mt-2 text-slate-600 dark:text-slate-300">Choose a browser game above to read the controls and launch it. Classic 2D games support touch input; some 3D titles need a desktop keyboard. Games run separately from AnyTool calculators so they do not add heavy JavaScript to the tool directory.</p></section>
  </PageShell>
 }
 const url=gameURL(selected.slug)
 return <PageShell>
  <Seo title={selected.name+' — '+selected.type+' | AnyTool'} description={selected.description+' Free browser game with no download.'} canonical={pathFor('/games/'+selected.slug)}/>
  <Link to={pathFor('/games')} className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"><ArrowLeft size={16}/>{t.back}</Link>
  <div className="mt-6 flex flex-wrap items-start justify-between gap-5"><div><p className="text-sm font-semibold text-indigo-600">{selected.type}</p><h1 className="mt-1 text-4xl font-extrabold">{selected.name}</h1><p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">{selected.description}</p><p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">{selected.mobile?<Smartphone size={16}/>:<Monitor size={16}/>} {selected.mobile?t.mobile:t.desktop}</p></div><a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold"><ExternalLink size={16}/>{t.external}</a></div>
  {!running?<div className="mt-8 flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl bg-slate-950 p-8 text-center text-white"><Gamepad2 size={50} className="text-indigo-300"/><p className="max-w-md text-slate-300">{t.note}</p><button onClick={()=>setRunningSlug(slug)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 font-bold text-white hover:bg-indigo-400"><Play size={18}/>{t.launch}</button></div>
  :<div className="mt-8 overflow-hidden rounded-2xl border bg-slate-950"><iframe title={selected.name+' — playable browser game'} src={url} loading="lazy" allow="fullscreen; gamepad" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-downloads" style={{display:'block',width:'100%',height:'min(83vh,850px)',minHeight:480,border:0}}/></div>}
  <section className="mt-8"><h2 className="text-xl font-bold">{t.all}</h2><div className="mt-3 flex flex-wrap gap-2">{arcadeGames.filter(g=>g.slug!==selected.slug).map(g=><Link key={g.slug} to={pathFor('/games/'+g.slug)} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm hover:border-indigo-500">{g.name}</Link>)}</div></section>
 </PageShell>
}
