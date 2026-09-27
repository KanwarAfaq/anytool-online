import { Link, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Seo from '../components/Seo'
import ToolArt from '../components/ToolArt'
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
    en:'Everyday calculators for percentages, loans, dates, units and other practical tasks.',
    'zh-TW':'百分比、貸款、日期、單位換算等日常實用計算器。',
    ar:'حاسبات يومية للنسب والقروض والتواريخ والوحدات والمهام العملية.',
    ur:'فیصد، قرض، تاریخ، یونٹ اور دیگر روزمرہ عملی کیلکولیٹر۔'
  },
  developer:{
    en:'Fast browser-local developer utilities for JSON, Base64, URLs, JWTs, UUIDs, hashes, regex and Unix timestamps.',
    'zh-TW':'在瀏覽器本機執行的開發者工具：JSON、Base64、URL、JWT、UUID、雜湊、正規表示式與 Unix 時間戳。',
    ar:'أدوات مطور محلية في المتصفح لـ JSON وBase64 والروابط وJWT وUUID والتجزئة والتعبيرات النمطية والطوابع الزمنية.',
    ur:'براؤزر میں مقامی طور پر چلنے والے JSON، Base64، URL، JWT، UUID، ہیش، ریجیکس اور Unix ٹائم اسٹیمپ ٹولز۔'
  },
  text:{
    en:'Privacy-friendly writing utilities for word counts, character counts and text-case conversion.',
    'zh-TW':'重視隱私的文字工具，可統計字數、字元、行數並轉換大小寫與命名格式。',
    ar:'أدوات نصية تراعي الخصوصية لعد الكلمات والأحرف وتحويل حالة النص.',
    ur:'پرائیویسی پر مبنی ورڈ، کریکٹر کاؤنٹ اور ٹیکسٹ کیس کنورژن ٹولز۔'
  },
  security:{
    en:'Browser-local password generation and strength checking using secure Web Crypto randomness where applicable.',
    'zh-TW':'密碼產生與強度檢查均在瀏覽器本機執行，產生器使用 Web Crypto 安全亂數。',
    ar:'إنشاء كلمات مرور وفحص قوتها محلياً في المتصفح مع استخدام Web Crypto للعشوائية الآمنة.',
    ur:'پاس ورڈ جنریشن اور طاقت چیکنگ براؤزر میں مقامی طور پر، محفوظ Web Crypto رینڈم نس کے ساتھ۔'
  },
  design:{
    en:'Practical browser-based design helpers for color conversion, contrast and aspect-ratio calculations.',
    'zh-TW':'瀏覽器設計輔助工具，包含色彩轉換、對比度與長寬比計算。',
    ar:'أدوات تصميم عملية داخل المتصفح لتحويل الألوان والتباين وحساب نسب الأبعاد.',
    ur:'رنگ کنورژن، کانٹراسٹ اور اسپیکٹ ریشو کے لیے عملی براؤزر بیسڈ ڈیزائن ٹولز۔'
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
  {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'AnyTool',item:'https://www.anytool.online/'},{'@type':'ListItem',position:2,name:title,item:pageUrl}]},
  {'@context':'https://schema.org','@type':'ItemList',name:title,itemListElement:list.map((tool,i)=>({'@type':'ListItem',position:i+1,name:toolName(tool),url:'https://www.anytool.online'+pathFor('/tools/'+tool.slug),image:'https://www.anytool.online/tool-art/'+tool.slug+'.svg'}))}
 ]
 return <section className="mx-auto max-w-7xl px-4 py-16"><Seo title={title+' Tools | AnyTool.online'} description={desc} jsonLd={schemas}/><nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-400"><Link className="hover:text-emerald-300" to={pathFor('/')}>AnyTool</Link><span className="mx-2">/</span><span className="text-emerald-300">{title}</span></nav><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">AnyTool collection</p><h1 className="mt-2 text-4xl font-black">{title}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{desc}</p><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(tool=><Link to={pathFor('/tools/'+tool.slug)} key={tool.slug} className="card tool-card tool-card-visual group overflow-hidden"><ToolArt tool={tool} name={toolName(tool)}/><div className="p-5"><h2 className="font-bold group-hover:text-emerald-300">{toolName(tool)}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{toolDescription(tool)}</p><span className="mt-4 inline-flex items-center text-sm text-emerald-300">{t('open')} <ArrowRight className="ms-1" size={15}/></span></div></Link>)}</div></section>
}
