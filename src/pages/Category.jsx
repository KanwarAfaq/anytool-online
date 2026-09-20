import { Link, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Seo from '../components/Seo'
import { categories, tools } from '../data/tools'
import { useI18n } from '../i18n'

const descriptions={
  money:{
    en:'Source-backed Taiwan salary, tax, insurance, overtime, employer-cost and elderly-care tools.',
    'zh-TW':'有官方來源依據的台灣薪資、稅務、保險、加班費、雇主成本與老人照護工具。',
    ar:'أدوات تايوان للرواتب والضرائب والتأمين والعمل الإضافي وتكلفة صاحب العمل ورعاية المسنين، مع مصادر رسمية.',
    ur:'سرکاری ذرائع پر مبنی تائیوان تنخواہ، ٹیکس، انشورنس، اوور ٹائم، آجر لاگت اور بزرگ نگہداشت ٹولز۔'
  },
  image:{
    en:'Browser-based image resize, compression, conversion, DPI, QR and Taiwan passport / ARC photo tools.',
    'zh-TW':'瀏覽器本機圖片調整、壓縮、轉檔、DPI、QR 與台灣護照／ARC 證件照工具。',
    ar:'أدوات صور داخل المتصفح لتغيير الحجم والضغط والتحويل وDPI وQR وصور جواز/ARC تايوان.',
    ur:'براؤزر میں تصویر ریسائز، کمپریس، کنورژن، DPI، QR اور تائیوان پاسپورٹ / ARC فوٹو ٹولز۔'
  },
  document:{
    en:'Privacy-conscious PDF utilities that process files locally in your browser where possible.',
    'zh-TW':'重視隱私的 PDF 工具；可在瀏覽器本機完成的工作就不需上傳檔案。',
    ar:'أدوات PDF تراعي الخصوصية وتعالج الملفات محلياً في المتصفح متى أمكن.',
    ur:'پرائیویسی پر مبنی PDF ٹولز جو جہاں ممکن ہو فائلیں براؤزر میں مقامی طور پر پراسیس کرتے ہیں۔'
  },
  ai:{
    en:'AI-assisted OCR and structured extraction with authenticated access, provider fallback and visible provider reporting.',
    'zh-TW':'AI OCR 與結構化擷取，採登入保護、多供應商備援並顯示實際使用的模型服務。',
    ar:'OCR واستخراج منظم بمساعدة AI مع تسجيل دخول وبدائل مزودين وإظهار المزود المستخدم.',
    ur:'AI OCR اور ساختی extraction، سائن اِن، provider fallback اور استعمال شدہ provider کی واضح معلومات کے ساتھ۔'
  },
  general:{
    en:'Everyday calculators for percentages, loans and other practical tasks.',
    'zh-TW':'百分比、貸款等日常實用計算器。',
    ar:'حاسبات يومية للنسب والقروض والمهام العملية.',
    ur:'فیصد، قرض اور دیگر روزمرہ عملی کیلکولیٹر۔'
  }
}

export default function Category(){
 const {category}=useParams()
 const {lang,t,toolName,toolDescription,pathFor}=useI18n()
 const def=categories.find(c=>c.id===category)
 if(!def)return <div className="mx-auto max-w-5xl px-4 py-20">Category not found.</div>
 const list=tools.filter(tool=>tool.category===category)
 const title=t('categories.'+category)
 const desc=descriptions[category]?.[lang]||descriptions[category]?.en||''
 const pageUrl='https://www.anytool.online'+pathFor('/categories/'+category)
 const schemas=[
  {'@context':'https://schema.org','@type':'CollectionPage',name:title,description:desc,url:pageUrl,inLanguage:lang,isPartOf:{'@type':'WebSite',name:'AnyTool.online',url:'https://www.anytool.online/'}},
  {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'AnyTool',item:'https://www.anytool.online/'},{'@type':'ListItem',position:2,name:title,item:pageUrl}]}
 ]
 return <section className="mx-auto max-w-7xl px-4 py-16"><Seo title={title+' Tools | AnyTool.online'} description={desc} jsonLd={schemas}/><nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-400"><Link className="hover:text-emerald-300" to={pathFor('/')}>AnyTool</Link><span className="mx-2">/</span><span className="text-emerald-300">{title}</span></nav><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">AnyTool collection</p><h1 className="mt-2 text-4xl font-black">{title}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{desc}</p><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(tool=><Link to={pathFor('/tools/'+tool.slug)} key={tool.slug} className="card group p-5 transition hover:-translate-y-0.5 hover:border-emerald-400/30"><h2 className="font-bold group-hover:text-emerald-300">{toolName(tool)}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{toolDescription(tool)}</p><span className="mt-4 inline-flex items-center text-sm text-emerald-300">{t('open')} <ArrowRight className="ms-1" size={15}/></span></Link>)}</div></section>
}
