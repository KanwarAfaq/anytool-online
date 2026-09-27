import Seo from '../components/Seo'
import { useI18n } from '../i18n'

export default function Terms(){
 const {lang}=useI18n()
 const c={
  en:{title:'Terms of Use & Limitations',intro:'Use AnyTool as a practical aid, not as a substitute for professional or official advice.',sections:[
   ['Use of the tools','You may use the public tools for lawful personal, educational and business purposes. Do not use the service to process content you do not have permission to use, disrupt the service, bypass security controls, or abuse automated endpoints.'],
   ['Calculators and regulated information','Financial, tax, salary, insurance, overtime, welfare and other regulated results are estimates based on the formulas and sources shown on the site. Rules can change and individual cases can differ. Confirm important decisions with the relevant authority or a qualified professional.'],
   ['AI and extracted content','OCR, receipt extraction and other AI-assisted outputs may be incomplete or wrong. Review important names, numbers, dates and totals against the original document before relying on them.'],
   ['Files and privacy','Many tools process files locally in your browser. When a feature explicitly uses an AI or upload service, only the file you choose is sent for that task. Do not upload passwords, private keys, secrets, unlawful material or highly sensitive data unless you understand the processing path.'],
   ['Availability and changes','We may improve, replace or remove tools and data sources. We aim for reliable operation but do not guarantee uninterrupted availability or error-free results.'],
   ['Contact','For corrections, rights concerns or questions about these terms, contact kmafaq2@gmail.com.']
  ]},
  'zh-TW':{title:'使用條款與限制',intro:'AnyTool 是實用輔助工具，不取代專業意見或政府官方判定。',sections:[
   ['工具使用','公開工具可用於合法的個人、教育與商業用途。請勿處理未獲授權的內容、破壞服務、繞過安全機制或濫用自動化端點。'],
   ['計算器與法規資訊','財務、稅務、薪資、保險、加班、福利等結果均為依網站所列公式與來源產生的估算。規則可能更新，個案也可能不同；重要決策請向主管機關或合格專業人士確認。'],
   ['AI 與擷取內容','OCR、收據擷取及其他 AI 輔助結果可能不完整或有誤。使用前請將重要姓名、數字、日期與總額和原始文件核對。'],
   ['檔案與隱私','許多工具直接在瀏覽器本機處理檔案。若功能明確使用 AI 或上傳服務，只有你主動選擇的檔案會送出。請勿上傳密碼、私鑰、機密或未獲授權內容。'],
   ['服務與變更','工具和資料來源可能隨時間改進、替換或移除。我們努力維持可靠運作，但不保證完全不中斷或零錯誤。'],
   ['聯絡','若要回報更正、權利問題或條款疑問，請寄信至 kmafaq2@gmail.com。']
  ]},
  ar:{title:'شروط الاستخدام والقيود',intro:'استخدم AnyTool كأداة مساعدة عملية وليس بديلاً عن المشورة المهنية أو القرار الرسمي.',sections:[
   ['استخدام الأدوات','يمكن استخدام الأدوات العامة لأغراض قانونية شخصية وتعليمية وتجارية. لا تعالج محتوى لا تملك إذناً لاستخدامه ولا تحاول تعطيل الخدمة أو تجاوز وسائل الحماية.'],
   ['الحاسبات والمعلومات المنظمة','نتائج الضرائب والرواتب والتأمين والعمل الإضافي والرعاية وغيرها تقديرات مبنية على الصيغ والمصادر المعروضة. قد تتغير القواعد وتختلف الحالات الفردية؛ تحقق من القرارات المهمة لدى الجهة المختصة.'],
   ['الذكاء الاصطناعي والاستخراج','قد تكون نتائج OCR والاستخراج بمساعدة AI غير كاملة أو خاطئة. راجع الأسماء والأرقام والتواريخ والمجاميع المهمة مع المستند الأصلي.'],
   ['الملفات والخصوصية','تُعالج أدوات كثيرة الملفات محلياً في المتصفح. عندما تستخدم ميزة خدمة AI أو رفع ملفات، يُرسل فقط الملف الذي تختاره لتلك المهمة.'],
   ['التوفر والتغييرات','قد نحسن الأدوات أو نستبدلها أو نزيلها ومصادر بياناتها. لا نضمن عملاً متواصلاً أو نتائج خالية تماماً من الأخطاء.'],
   ['التواصل','للتصحيحات أو مسائل الحقوق أو الأسئلة: kmafaq2@gmail.com.']
  ]},
  ur:{title:'استعمال کی شرائط اور حدود',intro:'AnyTool کو عملی مدد کے طور پر استعمال کریں، پیشہ ورانہ یا سرکاری مشورے کے متبادل کے طور پر نہیں۔',sections:[
   ['ٹولز کا استعمال','عوامی ٹولز قانونی ذاتی، تعلیمی اور کاروباری مقاصد کے لیے استعمال کیے جا سکتے ہیں۔ غیر مجاز مواد پراسیس نہ کریں، سروس میں خلل نہ ڈالیں اور حفاظتی کنٹرولز کو بائی پاس نہ کریں۔'],
   ['کیلکولیٹر اور ضابطہ جاتی معلومات','مالیاتی، ٹیکس، تنخواہ، انشورنس، اوور ٹائم اور فلاحی نتائج دکھائے گئے فارمولوں اور ذرائع کی بنیاد پر تخمینے ہیں۔ قواعد بدل سکتے ہیں اور انفرادی حالات مختلف ہو سکتے ہیں۔'],
   ['AI اور اخذ شدہ مواد','OCR اور AI مدد سے نکالی گئی معلومات نامکمل یا غلط ہو سکتی ہیں۔ اہم نام، نمبرز، تاریخیں اور ٹوٹلز اصل دستاویز سے چیک کریں۔'],
   ['فائلیں اور پرائیویسی','بہت سے ٹولز فائلیں براؤزر میں مقامی طور پر پراسیس کرتے ہیں۔ AI یا اپ لوڈ فیچر استعمال ہونے پر صرف آپ کی منتخب فائل اس کام کے لیے بھیجی جاتی ہے۔'],
   ['دستیابی اور تبدیلیاں','ہم ٹولز اور ڈیٹا ذرائع کو بہتر، تبدیل یا ہٹا سکتے ہیں۔ مسلسل دستیابی یا مکمل غلطی سے پاک نتائج کی ضمانت نہیں دی جاتی۔'],
   ['رابطہ','اصلاح، حقوق یا شرائط سے متعلق سوال کے لیے kmafaq2@gmail.com پر رابطہ کریں۔']
  ]}
 }[lang]
 return <section className="mx-auto max-w-4xl px-4 py-14">
  <Seo title={c.title+' | AnyTool.online'} description={c.intro}/>
  <div className="trust-page-hero"><span>AnyTool</span><h1>{c.title}</h1><p>{c.intro}</p></div>
  <div className="mt-8 grid gap-4">{c.sections.map(([title,body])=><section key={title} className="card p-5 sm:p-6"><h2 className="text-lg font-black">{title}</h2><p className="mt-2 leading-7 text-slate-300">{body}</p></section>)}</div>
 </section>
}
