import {useState} from 'react'
import {Link,useParams} from 'react-router-dom'
import {ArrowLeft,ExternalLink,Gamepad2,Monitor,Smartphone,Play} from 'lucide-react'
import {useI18n} from '../i18n'
import {arcadeGames,gamePage,gameURL,gamePreviewURL} from '../data/arcadeGames'
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
 if(slug&&!selected)return <PageShell><h1>{t.notfound}</h1><Link to={'/games'}>{t.back}</Link></PageShell>
 if(!selected){
  return <PageShell>
   <Seo title={t.heading+' | AnyTool.online'} description={t.intro} canonical={'/games'}/>
   <header className="mb-8"><p className="text-sm font-semibold text-indigo-600">AnyTool Arcade · 13 games</p><h1 className="mt-2 text-4xl font-extrabold tracking-tight">{t.heading}</h1><p className="mt-3 max-w-3xl text-lg text-slate-600 dark:text-slate-300">{t.intro}</p></header>
   <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {arcadeGames.map(g=>(
     <Link key={g.slug} to={'/games/'+g.slug} className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900">
      <div className="relative aspect-[8/5] overflow-hidden bg-slate-900">
       <img src={gamePreviewURL(g)} alt={`Gameplay preview artwork for ${g.name}, a ${g.type} browser game`} loading="lazy" decoding="async" fetchPriority="low" width={640} height={400} className="block h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"/>
       <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" aria-hidden="true"/>
       <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold text-slate-900 shadow-sm transition group-hover:bg-indigo-500 group-hover:text-white"><Play size={15} fill="currentColor"/>{t.play}</span>
       <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-slate-950/75 text-white" title={g.mobile?t.mobile:t.desktop}>{g.mobile?<Smartphone size={18}/>:<Monitor size={18}/>}</span>
      </div>
      <div className="p-5">
       <h2 className="text-xl font-bold text-slate-900 dark:text-white">{g.name}</h2>
       <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{g.type}</p>
       <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{g.description}</p>
      </div>
     </Link>
    ))}
   </div>
   <section className="mt-10 max-w-3xl"><h2 className="text-xl font-bold">Play online without installing software</h2><p className="mt-2 text-slate-600 dark:text-slate-300">Choose a browser game above to read the controls and launch it. Classic 2D games support touch input; some 3D titles need a desktop keyboard. Games run separately from AnyTool calculators so they do not add heavy JavaScript to the tool directory.</p></section>
  </PageShell>
 }
 const url=gameURL(selected.slug)
 return <PageShell>
  <Seo title={selected.name+' — '+selected.type+' | AnyTool'} description={selected.description+' Free browser game with no download.'} canonical={'/games/'+selected.slug}/>
  <Link to={'/games'} className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"><ArrowLeft size={16}/>{t.back}</Link>
  <div className="mt-6 flex flex-wrap items-start justify-between gap-5"><div><p className="text-sm font-semibold text-indigo-600">{selected.type}</p><h1 className="mt-1 text-4xl font-extrabold">{selected.name}</h1><p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">{selected.description}</p><p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">{selected.mobile?<Smartphone size={16}/>:<Monitor size={16}/>} {selected.mobile?t.mobile:t.desktop}</p></div><a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold"><ExternalLink size={16}/>{t.external}</a></div>
  <section className="mt-6 grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><h2 className="text-lg font-bold">How to play {selected.name}</h2><p className="mt-2 text-slate-600 dark:text-slate-300">{selected.howToPlay}</p></div><div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><h2 className="text-lg font-bold">Gameplay tips</h2><p className="mt-2 text-slate-600 dark:text-slate-300">{selected.tip}</p></div></section>
  {!running?<div className="relative mt-8 aspect-[8/5] min-h-64 overflow-hidden rounded-2xl bg-slate-950">
   <img src={gamePreviewURL(selected)} alt={`Preview artwork of ${selected.name} gameplay`} loading="lazy" decoding="async" width={640} height={400} className="absolute inset-0 h-full w-full object-cover opacity-65"/>
   <div className="absolute inset-0 bg-slate-950/50" aria-hidden="true"/>
   <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center text-white">
    <Gamepad2 size={46} className="text-indigo-200"/>
    <p className="max-w-md text-sm text-white/90">{t.note}</p>
    <button onClick={()=>setRunningSlug(slug)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><Play size={18} fill="currentColor"/>{t.launch}</button>
   </div>
  </div>
  :<div className="mt-8 overflow-hidden rounded-2xl border bg-slate-950"><iframe title={selected.name+' — playable browser game'} src={url} loading="lazy" allow="fullscreen; gamepad" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-downloads" style={{display:'block',width:'100%',height:'min(83vh,850px)',minHeight:480,border:0}}/></div>}
  <section className="mt-8"><h2 className="text-xl font-bold">{t.all}</h2><div className="mt-3 flex flex-wrap gap-2">{arcadeGames.filter(g=>g.slug!==selected.slug).map(g=><Link key={g.slug} to={'/games/'+g.slug} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm hover:border-indigo-500">{g.name}</Link>)}</div></section>
 </PageShell>
}
