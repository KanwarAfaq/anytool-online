import Seo from '../components/Seo'
import { useI18n } from '../i18n'

export default function Accessibility(){
 const {lang}=useI18n()
 const c={
  en:{title:'Accessibility',intro:'AnyTool aims to be usable with keyboards, assistive technology and a wide range of screen sizes.',items:[
   ['What we support','Keyboard navigation, visible focus states, semantic headings and labels, responsive layouts, reduced-motion preferences, and accessible names for core controls.'],
   ['Known limitations','Some third-party widgets, browser APIs, generated charts, uploaded documents and AI-produced content may not expose every accessibility feature perfectly. We continue improving these areas.'],
   ['Need help?','If a tool is difficult to use with a keyboard, screen reader, zoom, high contrast or another assistive setup, email kmafaq2@gmail.com and include the tool name, device/browser and the problem you encountered.'],
   ['Feedback matters','Accessibility reports are treated as product bugs. We use them to prioritize fixes and regression tests.']
  ]},
  'zh-TW':{title:'無障礙使用',intro:'AnyTool 以鍵盤、輔助科技與不同螢幕尺寸都能使用為設計目標。',items:[
   ['目前支援','鍵盤導覽、清楚的焦點狀態、語意化標題與標籤、響應式版面、減少動態效果偏好，以及主要控制項的可存取名稱。'],
   ['已知限制','部分第三方元件、瀏覽器 API、產生圖表、上傳文件與 AI 內容可能無法完整提供所有無障礙功能，我們會持續改善。'],
   ['需要協助？','若使用鍵盤、螢幕閱讀器、縮放、高對比或其他輔助設定時遇到問題，請寄信至 kmafaq2@gmail.com，並附上工具名稱、裝置／瀏覽器與問題描述。'],
   ['你的回饋很重要','無障礙問題會視為產品缺陷處理，並用於安排修正與回歸測試優先順序。']
  ]},
  ar:{title:'إمكانية الوصول',intro:'يهدف AnyTool إلى العمل بشكل جيد مع لوحة المفاتيح وتقنيات المساعدة ومختلف أحجام الشاشات.',items:[
   ['ما ندعمه','التنقل بلوحة المفاتيح، حالات تركيز واضحة، عناوين وتسميات دلالية، تصميم متجاوب، تفضيل تقليل الحركة، وأسماء واضحة لعناصر التحكم الأساسية.'],
   ['قيود معروفة','قد لا توفر بعض مكونات الطرف الثالث وواجهات المتصفح والمخططات والمستندات المرفوعة ومخرجات AI كل ميزات الوصول بصورة مثالية.'],
   ['هل تحتاج مساعدة؟','إذا واجهت مشكلة مع لوحة المفاتيح أو قارئ الشاشة أو التكبير أو التباين العالي، أرسل بريداً إلى kmafaq2@gmail.com مع اسم الأداة والمتصفح ووصف المشكلة.'],
   ['الملاحظات مهمة','نتعامل مع تقارير الوصول كأخطاء منتج ونستخدمها لتحديد أولويات الإصلاح والاختبارات.']
  ]},
  ur:{title:'رسائی',intro:'AnyTool کو کی بورڈ، معاون ٹیکنالوجی اور مختلف سکرین سائز کے ساتھ قابلِ استعمال بنانے کی کوشش کی جاتی ہے۔',items:[
   ['ہم کیا سپورٹ کرتے ہیں','کی بورڈ نیویگیشن، واضح فوکس، معنوی سرخیاں اور لیبلز، ریسپانسیو لے آؤٹ، کم موشن ترجیح اور بنیادی کنٹرولز کے قابلِ رسائی نام۔'],
   ['معلوم حدود','کچھ تھرڈ پارٹی ویجٹس، براؤزر APIs، چارٹس، اپ لوڈ دستاویزات اور AI مواد ہر رسائی فیچر مکمل طور پر فراہم نہیں کر سکتے۔'],
   ['مدد چاہیے؟','کی بورڈ، سکرین ریڈر، زوم یا ہائی کنٹراسٹ میں مسئلہ ہو تو ٹول نام، ڈیوائس/براؤزر اور مسئلے کے ساتھ kmafaq2@gmail.com پر ای میل کریں۔'],
   ['فیڈبیک اہم ہے','رسائی کی رپورٹس کو پروڈکٹ بگ سمجھا جاتا ہے اور اصلاحات و ریگریشن ٹیسٹس میں ترجیح دی جاتی ہے۔']
  ]}
 }[lang]
 return <section className="mx-auto max-w-4xl px-4 py-14">
  <Seo title={c.title+' | AnyTool.online'} description={c.intro}/>
  <div className="trust-page-hero"><span>AnyTool</span><h1>{c.title}</h1><p>{c.intro}</p></div>
  <div className="mt-8 grid gap-4 sm:grid-cols-2">{c.items.map(([title,body])=><section key={title} className="card p-5 sm:p-6"><h2 className="text-lg font-black">{title}</h2><p className="mt-2 leading-7 text-slate-300">{body}</p></section>)}</div>
 </section>
}
