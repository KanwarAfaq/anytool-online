import Seo from '../components/Seo'
import { useI18n } from '../i18n'

const OWNER_NAME='Kanwar Afaq'
const OWNER_EMAIL='kmafaq2@gmail.com'
const OWNER_IMAGE='https://res.cloudinary.com/dfmi4udfs/image/upload/v1782224423/gallery/general/IMG_2017_dflq3u.jpg'

export default function About(){
 const {lang,pathFor}=useI18n()
 const c={
  en:{title:'About AnyTool',p1:'AnyTool.online is a practical utility platform for calculators, image and document tasks, and source-backed Taiwan tools.',p2:'We keep deterministic calculations in code, process files in the browser when practical, and link regulated calculations to official sources. AI is used only where it adds value, such as OCR and structured extraction.',owner:'Owner & maintainer',ownerText:'AnyTool.online is built and maintained by Kanwar Afaq, with a focus on practical web utilities, Taiwan workflows and privacy-conscious AI features. For corrections, partnerships, accessibility issues, or product feedback, you can contact me directly.',email:'Direct email',github:'GitHub'},
  'zh-TW':{title:'關於 AnyTool',p1:'AnyTool.online 是實用工具平台，提供計算器、圖片與文件處理，以及有官方來源依據的台灣工具。',p2:'可確定的計算以程式公式執行；能在瀏覽器本機完成的檔案處理優先留在本機；涉及法規的計算會連結官方來源。AI 僅用於 OCR、結構化擷取等真正需要的工作。',owner:'網站擁有者與維護者',ownerText:'AnyTool.online 由 Kanwar Afaq 建置與維護。如需回報錯誤、合作、無障礙問題或產品建議，可直接透過電子郵件聯絡。',email:'直接聯絡信箱'},
  ar:{title:'حول AnyTool',p1:'AnyTool.online منصة أدوات عملية للحسابات والصور والمستندات وأدوات تايوان المبنية على مصادر رسمية.',p2:'نُبقي الحسابات الحتمية في الشيفرة، ونعالج الملفات داخل المتصفح عندما يكون ذلك عملياً، ونربط الحسابات التنظيمية بالمصادر الرسمية. نستخدم الذكاء الاصطناعي فقط عندما يضيف فائدة مثل OCR والاستخراج المنظم.',owner:'المالك والمشرف',ownerText:'تم إنشاء AnyTool.online ويجري صيانته بواسطة Kanwar Afaq. للتصحيحات أو الشراكات أو مشكلات إمكانية الوصول أو ملاحظات المنتج، يمكنك التواصل مباشرة عبر البريد الإلكتروني.',email:'البريد الإلكتروني المباشر'},
  ur:{title:'AnyTool کے بارے میں',p1:'AnyTool.online عملی کیلکولیٹر، تصویر و دستاویز ٹولز اور سرکاری ذرائع پر مبنی تائیوان ٹولز کا پلیٹ فارم ہے۔',p2:'یقینی حسابات کوڈ میں کیے جاتے ہیں، جہاں ممکن ہو فائلیں براؤزر میں پراسیس ہوتی ہیں، اور قانونی حسابات کے ساتھ سرکاری ذرائع دیے جاتے ہیں۔ AI صرف OCR اور ساختی ڈیٹا نکالنے جیسے کاموں میں استعمال ہوتا ہے۔',owner:'مالک اور مینٹینر',ownerText:'AnyTool.online کو Kanwar Afaq بناتے اور برقرار رکھتے ہیں۔ اصلاحات، شراکت، رسائی کے مسائل یا پروڈکٹ فیڈبیک کے لیے براہِ راست ای میل کریں۔',email:'براہِ راست ای میل'}
 }[lang]||null
 const L=c||{title:'About AnyTool',p1:'',p2:'',owner:'Owner & maintainer',ownerText:'',email:'Direct email'}
 const jsonLd=[
  {'@context':'https://schema.org','@type':'WebPage',name:L.title+' | AnyTool.online',description:L.p1,url:'https://www.anytool.online'+pathFor('/about'),about:{'@type':'Organization',name:'AnyTool.online',url:'https://www.anytool.online/'}},
  {'@context':'https://schema.org','@type':'Person',name:OWNER_NAME,url:'https://www.anytool.online'+pathFor('/about'),image:OWNER_IMAGE,email:OWNER_EMAIL,jobTitle:'Creator and maintainer of AnyTool.online',worksFor:{'@type':'Organization',name:'AnyTool.online',url:'https://www.anytool.online/'}}
 ]
 return <section className="mx-auto max-w-4xl px-4 py-16">
  <Seo title={L.title+' | AnyTool.online'} description={L.p1} jsonLd={jsonLd}/>
  <h1 className="text-4xl font-black">{L.title}</h1>
  <div className="mt-7 space-y-5 text-lg leading-8 text-slate-300"><p>{L.p1}</p><p>{L.p2}</p></div>
  <section className="card mt-10 overflow-hidden p-5 sm:p-7" aria-labelledby="owner-heading">
   <div className="grid gap-6 sm:grid-cols-[150px_1fr] sm:items-center">
    <img src={OWNER_IMAGE} alt="Kanwar Afaq, owner and maintainer of AnyTool.online" className="mx-auto aspect-square w-36 rounded-3xl border border-white/[0.1] object-cover shadow-lg sm:mx-0" loading="lazy" referrerPolicy="no-referrer"/>
    <div>
     <div className="text-xs font-black uppercase tracking-[.16em] text-lime-300">{L.owner}</div>
     <h2 id="owner-heading" className="mt-2 text-2xl font-black">{OWNER_NAME}</h2>
     <p className="mt-3 leading-7 text-slate-300">{L.ownerText}</p>
     <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3"><div><span className="block text-xs font-bold uppercase tracking-[.12em] text-slate-500">{L.email}</span><a className="mt-1 inline-flex font-bold text-lime-300 hover:text-lime-200" href={'mailto:'+OWNER_EMAIL}>{OWNER_EMAIL}</a></div><div><span className="block text-xs font-bold uppercase tracking-[.12em] text-slate-500">{L.github||'GitHub'}</span><a className="mt-1 inline-flex font-bold text-sky-300 hover:text-sky-200" href="https://github.com/KanwarAfaq" target="_blank" rel="noreferrer">github.com/KanwarAfaq</a></div></div>
    </div>
   </div>
  </section>
 </section>
}
