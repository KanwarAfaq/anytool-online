import Seo from '../components/Seo'
import { useI18n } from '../i18n'

export default function Privacy(){
 const {lang}=useI18n()
 const c={
  en:{title:'Privacy',intro:'AnyTool is designed to keep simple processing local when possible.',items:['Image resize, image conversion, QR generation/scanning and PDF merge/split run in your browser.','Account information, favorites and usage records are stored in Supabase when you use signed-in features.','AI OCR and receipt extraction send the selected file to the configured AI gateway only after you start the task.','Never upload secrets, passwords, private keys, or files you are not authorized to process.']},
  'zh-TW':{title:'隱私權',intro:'AnyTool 在可行時優先讓簡單處理留在你的裝置上。',items:['圖片尺寸調整、格式轉換、QR 產生／掃描與 PDF 合併／分割在瀏覽器本機執行。','登入後的帳戶資料、收藏與使用紀錄儲存在 Supabase。','AI OCR 與收據擷取只有在你主動執行時，才會將所選檔案送到 AI Gateway。','請勿上傳密碼、私鑰、機密資訊或未獲授權處理的檔案。']},
  ar:{title:'الخصوصية',intro:'صُمم AnyTool لإبقاء المعالجة البسيطة على جهازك كلما أمكن.',items:['تغيير حجم الصور والتحويل وQR ودمج/تقسيم PDF تعمل داخل المتصفح.','تُخزن بيانات الحساب والمفضلة وسجل الاستخدام في Supabase عند استخدام ميزات تسجيل الدخول.','ترسل أدوات OCR والإيصالات الملف المحدد إلى بوابة AI فقط بعد بدء المهمة.','لا ترفع كلمات مرور أو مفاتيح خاصة أو ملفات لا تملك حق معالجتها.']},
  ur:{title:'پرائیویسی',intro:'AnyTool سادہ پراسیسنگ کو جہاں ممکن ہو آپ کے آلے پر رکھنے کے لیے بنایا گیا ہے۔',items:['تصویر ریسائز/کنورژن، QR اور PDF merge/split آپ کے براؤزر میں چلتے ہیں۔','سائن اِن فیچرز استعمال کرنے پر اکاؤنٹ، پسندیدہ اور استعمال کا ریکارڈ Supabase میں محفوظ ہوتا ہے۔','AI OCR اور رسید ایکسٹریکشن صرف آپ کے شروع کرنے پر منتخب فائل AI gateway کو بھیجتے ہیں۔','پاس ورڈ، پرائیویٹ کی، راز یا غیر مجاز فائلیں اپ لوڈ نہ کریں۔']}
 }[lang]||null
 const x=c||{title:'Privacy',intro:'',items:[]}
 return <section className="mx-auto max-w-4xl px-4 py-16"><Seo title={x.title+' | AnyTool.online'} description={x.intro}/><h1 className="text-4xl font-black">{x.title}</h1><p className="mt-5 text-lg text-slate-300">{x.intro}</p><div className="mt-8 grid gap-4">{x.items.map((v,i)=><div key={i} className="card p-5 text-slate-300">{v}</div>)}</div></section>
}
