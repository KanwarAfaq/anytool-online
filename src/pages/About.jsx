import Seo from '../components/Seo'
import { useI18n } from '../i18n'

export default function About(){
 const {lang}=useI18n()
 const c={
  en:['About AnyTool','AnyTool.online is a practical utility platform for calculators, image and document tasks, and source-backed Taiwan tools.','We keep deterministic calculations in code, process files in the browser when practical, and link regulated calculations to official sources. AI is used only where it adds value, such as OCR and structured extraction.'],
  'zh-TW':['關於 AnyTool','AnyTool.online 是實用工具平台，提供計算器、圖片與文件處理，以及有官方來源依據的台灣工具。','可確定的計算以程式公式執行；能在瀏覽器本機完成的檔案處理優先留在本機；涉及法規的計算會連結官方來源。AI 僅用於 OCR、結構化擷取等真正需要的工作。'],
  ar:['حول AnyTool','AnyTool.online منصة أدوات عملية للحسابات والصور والمستندات وأدوات تايوان المبنية على مصادر رسمية.','نُبقي الحسابات الحتمية في الشيفرة، ونعالج الملفات داخل المتصفح عندما يكون ذلك عملياً، ونربط الحسابات التنظيمية بالمصادر الرسمية. نستخدم الذكاء الاصطناعي فقط عندما يضيف فائدة مثل OCR والاستخراج المنظم.'],
  ur:['AnyTool کے بارے میں','AnyTool.online عملی کیلکولیٹر، تصویر و دستاویز ٹولز اور سرکاری ذرائع پر مبنی تائیوان ٹولز کا پلیٹ فارم ہے۔','یقینی حسابات کوڈ میں کیے جاتے ہیں، جہاں ممکن ہو فائلیں براؤزر میں پراسیس ہوتی ہیں، اور قانونی حسابات کے ساتھ سرکاری ذرائع دیے جاتے ہیں۔ AI صرف OCR اور ساختی ڈیٹا نکالنے جیسے کاموں میں استعمال ہوتا ہے۔']
 }[lang]||null
 const [title,p1,p2]=c||['About AnyTool','','']
 return <section className="mx-auto max-w-4xl px-4 py-16"><Seo title={title+' | AnyTool.online'} description={p1} canonical="https://anytool.online/about"/><h1 className="text-4xl font-black">{title}</h1><div className="mt-7 space-y-5 text-lg leading-8 text-slate-300"><p>{p1}</p><p>{p2}</p></div></section>
}
