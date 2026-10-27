import { ExternalLink } from 'lucide-react'
import Seo from '../components/Seo'
import { platforms } from '../data/platforms'
import { useI18n } from '../i18n'

const copy = {
  en: { title: 'More platforms', desc: 'Sister platforms by AnyTool: landlord tools, Taoyuan day-care finder and care-facility directory.', intro: 'Beyond single-purpose tools, these full web apps solve bigger Taiwan tasks. Each opens in a new tab.', open: 'Open platform' },
  'zh-TW': { title: '更多平台', desc: 'AnyTool 姊妹平台：智慧房東、桃園日照中心查詢與長照機構名錄。', intro: '除了單一用途的工具，這些完整的網頁應用可處理更大的台灣生活需求，點擊會在新分頁開啟。', open: '前往平台' },
  ar: { title: 'منصات أخرى', desc: 'منصات شقيقة لـ AnyTool: أدوات المؤجرين ودليل الرعاية النهارية في تاوييوان.', intro: 'تفتح كل منصة في علامة تبويب جديدة.', open: 'افتح المنصة' },
  ur: { title: 'مزید پلیٹ فارمز', desc: 'AnyTool کے ساتھی پلیٹ فارمز: مالک مکان ٹولز اور تاؤیوان ڈے کیئر تلاش۔', intro: 'ہر پلیٹ فارم نئے ٹیب میں کھلتا ہے۔', open: 'پلیٹ فارم کھولیں' },
}

export default function Platforms(){
 const {lang}=useI18n()
 const c=copy[lang]||copy.en
 return <section className="mx-auto max-w-5xl px-4 py-16"><Seo title={c.title+' | AnyTool.online'} description={c.desc}/><h1 className="text-4xl font-black">{c.title}</h1><p className="mt-4 max-w-3xl text-slate-300">{c.intro}</p><div className="mt-8 grid gap-4 md:grid-cols-3">{platforms.map(p=><a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="card p-5 transition hover:border-emerald-400/30"><h2 className="font-bold">{p.name[lang]||p.name.en}</h2><p className="mt-2 text-sm leading-6 text-slate-300">{p.desc[lang]||p.desc.en}</p><span className="mt-4 inline-flex items-center gap-1 text-sm text-emerald-300">{c.open} <ExternalLink size={14}/></span></a>)}</div></section>
}
