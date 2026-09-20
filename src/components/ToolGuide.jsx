import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, LockKeyhole, Lightbulb } from 'lucide-react'
import { tools } from '../data/tools'
import { useI18n } from '../i18n'

const localSlugs=new Set(['image-resize','image-compress','png-to-jpg','jpg-to-png','dpi-calculator','qr-generator','qr-scanner','pdf-merge','pdf-split','percentage','loan-payment','annual-salary'])

const tips={
  'take-home-pay':{
    en:['Enter your gross monthly salary and NHI dependents.','The result combines labor insurance, employment insurance, NHI and a simplified monthly tax estimate.','Use the linked detailed calculators when you need to inspect one deduction separately.'],
    'zh-TW':['輸入每月稅前薪資與健保眷屬人數。','結果整合勞保、就保、健保與簡化的每月所得稅估算。','若要逐項確認扣款，可開啟下方相關計算器。']
  },
  'labor-insurance':{
    en:['Enter your actual monthly salary; the calculator maps it to the official insured-salary grade.','For a standard fixed-employer employee, it estimates the employee share of 11.5% labor insurance plus 1% employment insurance using the published allocation rules.','The labor-insurance salary table has its own ceiling, so a higher actual salary does not always mean a higher labor-insurance base.'],
    'zh-TW':['輸入實際月薪；工具會先依官方分級表找到投保薪資。','一般有固定雇主的受僱者，會依 11.5% 勞保費率與 1% 就保費率及法定負擔比例估算員工負擔。','勞保投保薪資有級距上限，因此實際月薪提高時，勞保計算基礎不一定同步增加。']
  },
  'nhi':{
    en:['Enter monthly salary and the number of chargeable NHI dependents.','The employee table uses the official contribution-salary grade, 5.17% premium rate and 30% employee share for standard fixed-employer workers.','Up to three dependents are charged under the table; verify special insured categories with NHIA.'],
    'zh-TW':['輸入月薪與需計費的健保眷屬人數。','一般有固定雇主受僱者依官方投保金額級距、5.17% 費率及員工 30% 負擔比例估算。','表格最多計收 3 名眷屬；特殊投保身分仍請向健保署確認。']
  },
  'income-tax':{
    en:['Enter annual salary income, spouse salary income if applicable, and dependents.','The estimate uses the 2026 resident progressive brackets plus standard deduction and employment-income deduction assumptions.','It is a planning estimate, not a tax filing: itemized deductions, special deductions, dividends, overseas income and basic-living-expense differences can change the final tax.'],
    'zh-TW':['輸入全年薪資所得、配偶薪資所得（如適用）與扶養親屬人數。','估算採 2026 居住者累進稅率，並套用標準扣除額與薪資所得特別扣除額的簡化假設。','此為規劃估算而非報稅結果；列舉扣除、其他特別扣除、股利、海外所得與基本生活費差額都可能改變最終稅額。']
  },
  'overtime-pay':{
    en:['Enter monthly salary plus weekday and rest-day overtime hours.','For monthly-paid employees, the tool uses monthly salary ÷ 240 as the ordinary hourly wage basis and applies the statutory overtime multipliers.','Collective agreements, shift arrangements, holidays and exceptional work-time systems can change the calculation.'],
    'zh-TW':['輸入月薪、平日加班時數與休息日加班時數。','按月計酬者以月薪 ÷ 240 作為平日每小時工資額基礎，再套用法定加班倍率。','團體協約、輪班、國定假日或特殊工時制度可能改變實際計算。']
  },
  'minimum-wage':{
    en:['Enter monthly salary and hourly wage to compare them separately.','From January 1, 2026, Taiwan minimum wage is NT$29,500 per month and NT$196 per hour.','Monthly and hourly minimums apply to different pay arrangements; do not convert one into the other without considering actual working-time terms.'],
    'zh-TW':['分別輸入月薪與時薪進行比較。','自 2026 年 1 月 1 日起，台灣最低工資為月薪 NT$29,500、時薪 NT$196。','月薪與時薪最低工資適用於不同計酬方式，不應忽略實際工時條件直接互換。']
  },
  'employer-cost':{
    en:['Enter the employee monthly salary.','The estimate adds employer labor insurance, employment insurance, NHI and the mandatory 6% labor-pension contribution using current contribution grades.','Occupational accident insurance is excluded because its rate varies by industry and experience, so actual employer cost can be higher.'],
    'zh-TW':['輸入員工月薪。','估算會依現行級距加入雇主勞保、就保、健保及至少 6% 勞退提繳。','職災保險費率會因行業與經驗費率不同，因此未納入，實際雇主成本可能更高。']
  },
  'taiwan-id-photo':{
    en:['Choose Passport, National ID or ARC/APRC first.','Upload an original, recent photo, then adjust zoom, horizontal/vertical position and rotation.','Keep the background white and verify the final face/head proportions against the official guide before submitting.'],
    'zh-TW':['先選擇護照、國民身分證或 ARC/APRC。','上傳近期原始照片後，可調整縮放、水平／垂直位置與旋轉。','背景請保持白色，送件前再依官方規格確認臉部與頭部比例。']
  },
  'taiwan-elder-care':{
    en:['Start with the 2026 central subsidy conditions, then review local programs separately.','Use the official Taoyuan or Taipei bed datasets to search facilities, addresses and phone numbers.','Bed figures change: call the institution and the responsible city authority before making a placement decision.'],
    'zh-TW':['先確認 2026 中央住宿式補助條件，再分開查看各縣市地方方案。','可用桃園或臺北官方床位資料搜尋機構、地址與電話。','床位會變動；安排入住前請直接致電機構及主管機關確認。']
  },
  'image-resize':{
    en:['Upload a JPG, PNG or WebP image.','Set width, height, format, quality and aspect-ratio behavior.','Review the output dimensions and file size before downloading.'],
    'zh-TW':['上傳 JPG、PNG 或 WebP 圖片。','設定寬度、高度、格式、品質與長寬比選項。','下載前先確認輸出尺寸與檔案大小。']
  },
  'ocr':{
    en:['Sign in and upload a readable image or PDF under the file-size limit.','The AI gateway chooses a configured OCR provider and reports which provider processed the request.','Copy or download the extracted text, then verify important names, amounts and identifiers against the original.'],
    'zh-TW':['登入後上傳清晰且符合大小限制的圖片或 PDF。','AI Gateway 會選擇已設定的 OCR 供應商，並顯示實際使用的服務。','可複製或下載辨識文字；重要姓名、金額與編號仍應與原檔核對。']
  },
  'receipt-to-json':{
    en:['Sign in and upload a clear receipt image.','The extraction service returns structured fields as JSON.','Download the JSON and verify totals, tax, dates and merchant details before importing it elsewhere.'],
    'zh-TW':['登入後上傳清晰的收據圖片。','擷取服務會將欄位整理成 JSON。','下載 JSON 前請核對總額、稅額、日期與商家資訊。']
  }
}

const generic={
 en:{
  heading:'How to use this tool',privacy:'Processing & privacy',related:'Related tools',tip:'Practical tip',
  calc:['Enter or adjust the values that match your situation.','Review the result immediately as you change inputs.','For regulated Taiwan calculations, open the official-source cards below and verify special cases.'],
  file:['Choose the file you want to work with.','Adjust the available settings and run the tool.','Review the generated result before downloading or using it elsewhere.'],
  ai:['Sign in and choose the file you want processed.','Run the tool and wait for the provider response.','Verify important extracted information against the original document.'],
  local:'This tool performs its main processing in your browser when possible, so the selected file does not need to be uploaded for the core operation.',
  server:'This tool sends the selected file only when you start the AI task. Do not upload secrets or files you are not authorized to process.',
  sourceTip:'Rules, rates and public data can change. The source cards below identify the authority and the last verification date.'
 },
 'zh-TW':{
  heading:'如何使用',privacy:'處理方式與隱私',related:'相關工具',tip:'實用提醒',
  calc:['輸入或調整符合你情況的數值。','修改欄位時可立即查看結果。','涉及台灣法規的計算，請打開下方官方來源並確認特殊情況。'],
  file:['選擇要處理的檔案。','調整可用設定並執行工具。','下載或使用前先檢查輸出結果。'],
  ai:['登入後選擇要處理的檔案。','執行工具並等待供應商回應。','重要擷取資料請與原始文件再次核對。'],
  local:'此工具的主要處理會在可行時直接於瀏覽器完成，因此核心操作不需要上傳所選檔案。',
  server:'只有在你主動啟動 AI 任務時才會傳送所選檔案。請勿上傳密碼、機密或未獲授權處理的文件。',
  sourceTip:'法規、費率與政府公開資料可能更新；下方來源卡會標示主管機關與最後查核日期。'
 },
 ar:{
  heading:'كيفية استخدام الأداة',privacy:'المعالجة والخصوصية',related:'أدوات ذات صلة',tip:'نصيحة عملية',
  calc:['أدخل القيم التي تنطبق على حالتك.','راجع النتيجة فور تغيير المدخلات.','في حسابات تايوان المنظمة، افتح بطاقات المصادر الرسمية وتحقق من الحالات الخاصة.'],
  file:['اختر الملف الذي تريد معالجته.','اضبط الإعدادات المتاحة وشغّل الأداة.','راجع النتيجة قبل التنزيل أو الاستخدام.'],
  ai:['سجّل الدخول واختر الملف.','شغّل الأداة وانتظر استجابة المزود.','تحقق من المعلومات المهمة مقابل المستند الأصلي.'],
  local:'تتم المعالجة الأساسية داخل المتصفح متى أمكن، لذلك لا يلزم رفع الملف للعملية الأساسية.',
  server:'يتم إرسال الملف فقط عندما تبدأ مهمة AI. لا ترفع أسراراً أو ملفات غير مصرح لك بمعالجتها.',
  sourceTip:'قد تتغير القواعد والمعدلات والبيانات العامة. بطاقات المصادر أدناه تعرض الجهة وتاريخ التحقق.'
 },
 ur:{
  heading:'یہ ٹول کیسے استعمال کریں',privacy:'پراسیسنگ اور پرائیویسی',related:'متعلقہ ٹولز',tip:'عملی مشورہ',
  calc:['اپنی صورتحال کے مطابق اقدار درج کریں۔','ان پٹ بدلتے ہی نتیجہ دیکھیں۔','تائیوان کے قانونی حسابات کے لیے نیچے سرکاری ماخذ ضرور دیکھیں۔'],
  file:['جس فائل پر کام کرنا ہے اسے منتخب کریں۔','دستیاب سیٹنگز بدلیں اور ٹول چلائیں۔','ڈاؤن لوڈ یا استعمال سے پہلے نتیجہ چیک کریں۔'],
  ai:['سائن اِن کریں اور فائل منتخب کریں۔','ٹول چلائیں اور provider کے جواب کا انتظار کریں۔','اہم نکالی گئی معلومات کو اصل دستاویز سے چیک کریں۔'],
  local:'جہاں ممکن ہو بنیادی پراسیسنگ براؤزر میں ہوتی ہے، اس لیے اصل کام کے لیے فائل اپ لوڈ کرنے کی ضرورت نہیں۔',
  server:'فائل صرف تب بھیجی جاتی ہے جب آپ AI کام شروع کرتے ہیں۔ راز یا غیر مجاز فائلیں اپ لوڈ نہ کریں۔',
  sourceTip:'قواعد، شرحیں اور سرکاری ڈیٹا بدل سکتا ہے۔ نیچے ماخذ کارڈ ادارہ اور آخری تصدیق دکھاتے ہیں۔'
 }
}

export default function ToolGuide({tool}){
 const {lang,pathFor,toolName}=useI18n()
 const L=generic[lang]||generic.en
 const isAI=tool.category==='ai'
 const isFile=['image','document'].includes(tool.category)
 const steps=tips[tool.slug]?.[lang]||(lang==='en'?tips[tool.slug]?.en:null)||(isAI?L.ai:isFile?L.file:L.calc)
 const privacy=isAI?L.server:localSlugs.has(tool.slug)||isFile?L.local:L.sourceTip
 const related=tools.filter(x=>x.slug!==tool.slug&&(x.category===tool.category||(['take-home-pay','labor-insurance','nhi','income-tax','employer-cost'].includes(tool.slug)&&x.category==='money'))).slice(0,4)
 return <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">
   <div className="card p-5">
    <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-300"/><h2 className="text-xl font-black">{L.heading}</h2></div>
    <ol className="mt-4 grid gap-3">{steps.map((s,i)=><li key={s} className="flex gap-3 text-sm leading-6 text-slate-300"><span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-emerald-300/10 text-xs font-black text-emerald-300">{i+1}</span><span>{s}</span></li>)}</ol>
    <div className="mt-5 rounded-xl bg-white/[0.035] p-4"><div className="flex items-center gap-2 text-sm font-semibold"><LockKeyhole size={16} className="text-emerald-300"/>{L.privacy}</div><p className="mt-2 text-xs leading-5 text-slate-400">{privacy}</p></div>
   </div>
   <aside className="card p-5">
    <div className="flex items-center gap-2"><Lightbulb size={17} className="text-amber-300"/><h2 className="font-bold">{L.related}</h2></div>
    <div className="mt-3 grid gap-2">{related.map(x=><Link key={x.slug} to={pathFor('/tools/'+x.slug)} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-sm hover:border-emerald-300/30 hover:text-emerald-200"><span>{toolName(x)}</span><ArrowRight size={14}/></Link>)}</div>
   </aside>
 </section>
}
