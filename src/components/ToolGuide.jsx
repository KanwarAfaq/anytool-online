import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, LockKeyhole } from 'lucide-react'
import { tools } from '../data/tools'
import { useI18n } from '../i18n'

const localSlugs=new Set(['image-resize','image-compress','png-to-jpg','jpg-to-png','dpi-calculator','qr-generator','qr-scanner','pdf-merge','pdf-split','percentage','loan-payment','annual-salary','random-picker','timer','image-to-sketch'])
const tips={
 'take-home-pay':{en:['Enter gross monthly salary and NHI dependents.','Review the combined insurance, NHI and tax estimate.','Open a related calculator when you need one deduction in detail.'],'zh-TW':['輸入每月稅前薪資與健保眷屬。','查看勞保、就保、健保與所得稅的整合估算。','若要確認單一扣款，可開啟相關計算器。']},
 'labor-insurance':{en:['Enter actual monthly salary.','The tool maps it to the official insured-salary grade.','Check the official source below for special categories.'],'zh-TW':['輸入實際月薪。','工具會依官方級距找到投保薪資。','特殊投保身分請查看下方官方來源。']},
 'nhi':{en:['Enter monthly salary and chargeable dependents.','The tool applies the official contribution grade and standard employee share.','Verify special insured categories with NHIA.'],'zh-TW':['輸入月薪與需計費的健保眷屬。','工具依官方級距與一般受僱者負擔比例估算。','特殊投保身分請向健保署確認。']},
 'income-tax':{en:['Enter annual salary, spouse salary if applicable and dependents.','Review taxable income and the progressive-rate estimate.','Use it for planning, not as a tax filing.'],'zh-TW':['輸入全年薪資、配偶薪資（如適用）與扶養人數。','查看課稅所得與累進稅率估算。','此工具適合規劃，不等同正式報稅。']},
 'taiwan-id-photo':{en:['Choose Passport, National ID or ARC/APRC.','Upload a recent original photo and adjust the crop.','Compare the final result with the official guide before submitting.'],'zh-TW':['先選擇護照、國民身分證或 ARC/APRC。','上傳近期原始照片並調整裁切。','送件前再對照官方規格。']},
 'taiwan-elder-care':{en:['Review central subsidy conditions first.','Search official local facility/bed data.','Call the institution before making a placement decision because availability changes.'],'zh-TW':['先確認中央補助條件。','搜尋地方政府公開的機構與床位資料。','床位會變動，入住前請直接致電機構確認。']},
 'image-resize':{en:['Upload a JPG, PNG or WebP.','Set size, format and quality.','Review output dimensions and file size, then download.'],'zh-TW':['上傳 JPG、PNG 或 WebP。','設定尺寸、格式與品質。','確認輸出尺寸與檔案大小後下載。']},
 'ocr':{en:['Sign in and upload a readable image or PDF.','Run OCR and review the extracted text.','Verify important names, amounts and identifiers against the original.'],'zh-TW':['登入後上傳清晰圖片或 PDF。','執行 OCR 並檢查辨識文字。','重要姓名、金額與編號請與原檔核對。']}
}
const generic={
 en:{title:'How to use · privacy · related tools',privacy:'Privacy',related:'Related',calc:['Enter the values for your situation.','Review the result as inputs change.','Check official sources for regulated calculations.'],file:['Choose a file.','Adjust the available settings.','Review and download the result.'],ai:['Sign in and choose a file.','Run the AI task.','Verify important output against the original.'],local:'Main processing stays in your browser when possible.',server:'The selected file is sent only when you start the AI task.'},
 'zh-TW':{title:'使用方式 · 隱私 · 相關工具',privacy:'隱私',related:'相關工具',calc:['輸入符合你情況的數值。','修改欄位時立即查看結果。','法規相關計算請核對官方來源。'],file:['選擇檔案。','調整設定。','檢查並下載結果。'],ai:['登入並選擇檔案。','執行 AI 任務。','重要結果請與原檔核對。'],local:'可行時主要處理會留在瀏覽器中。',server:'只有在你啟動 AI 任務時才會傳送所選檔案。'},
 ar:{title:'الاستخدام · الخصوصية · أدوات ذات صلة',privacy:'الخصوصية',related:'ذات صلة',calc:['أدخل القيم المناسبة.','راجع النتيجة فوراً.','تحقق من المصادر الرسمية للحسابات المنظمة.'],file:['اختر الملف.','اضبط الإعدادات.','راجع النتيجة ونزّلها.'],ai:['سجّل الدخول واختر الملف.','شغّل مهمة AI.','تحقق من المعلومات المهمة.'],local:'تبقى المعالجة الأساسية في المتصفح متى أمكن.',server:'يتم إرسال الملف فقط عند بدء مهمة AI.'},
 ur:{title:'استعمال · پرائیویسی · متعلقہ ٹولز',privacy:'پرائیویسی',related:'متعلقہ',calc:['اپنی صورتحال کے مطابق اقدار درج کریں۔','فوراً نتیجہ دیکھیں۔','قانونی حسابات کے لیے سرکاری ذرائع دیکھیں۔'],file:['فائل منتخب کریں۔','سیٹنگز بدلیں۔','نتیجہ چیک کر کے ڈاؤن لوڈ کریں۔'],ai:['سائن اِن کر کے فائل منتخب کریں۔','AI کام چلائیں۔','اہم نتیجہ اصل فائل سے چیک کریں۔'],local:'جہاں ممکن ہو بنیادی پراسیسنگ براؤزر میں رہتی ہے۔',server:'فائل صرف AI کام شروع کرنے پر بھیجی جاتی ہے۔'}
}
export default function ToolGuide({tool}){
 const {lang,pathFor,toolName}=useI18n()
 const L=generic[lang]||generic.en
 const isAI=tool.category==='ai',isFile=['image','document'].includes(tool.category)
 const steps=tips[tool.slug]?.[lang]||(lang==='en'?tips[tool.slug]?.en:null)||(isAI?L.ai:isFile?L.file:L.calc)
 const privacy=isAI?L.server:localSlugs.has(tool.slug)||isFile?L.local:L.calc[2]
 const related=tools.filter(x=>x.slug!==tool.slug&&(x.category===tool.category||(['take-home-pay','labor-insurance','nhi','income-tax','employer-cost'].includes(tool.slug)&&x.category==='money'))).slice(0,4)
 return <details className="compact-details">
  <summary><span className="flex items-center gap-2"><CheckCircle2 size={17} className="text-lime-300"/>{L.title}</span></summary>
  <div className="grid gap-5 border-t border-white/[0.06] p-4 lg:grid-cols-[1fr_280px]">
   <div><ol className="grid gap-2">{steps.map((s,i)=><li key={s} className="flex gap-3 text-sm leading-6 text-slate-400"><span className="text-lime-300">{i+1}.</span><span>{s}</span></li>)}</ol><p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500"><LockKeyhole size={14} className="mt-0.5 shrink-0 text-lime-300"/>{privacy}</p></div>
   <div><p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">{L.related}</p><div className="mt-2 grid gap-1">{related.map(x=><Link key={x.slug} to={pathFor('/tools/'+x.slug)} className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm text-slate-400 hover:bg-white/[0.04] hover:text-white"><span>{toolName(x)}</span><ArrowRight size={13}/></Link>)}</div></div>
  </div>
 </details>
}
