// Per-tool FAQ + HowTo copy shared by the React tool page and the build-time prerender
// so visible text and FAQPage/HowTo JSON-LD stay identical.
export const faqKind=tool=>tool.category==='ai'?'ai':(tool.localProcessing||['image','document'].includes(tool.category))?'local':'calc'

const T={
 en:{
  what:n=>`What is ${n}?`,
  free:n=>`Is ${n} free to use?`,
  freeA:'Yes. It is free, needs no account for the calculation itself and has no usage limit for normal use.',
  priv:'Is my data private?',
  privA:{local:'Yes. This tool runs in your browser. Your files and numbers are not uploaded to AnyTool servers.',calc:'Yes. Calculations run in your browser and the values you type are not stored on our servers.',ai:'This tool may send your input to a configured AI service to process it. Avoid sensitive documents and check the tool page before you share anything private.'},
  acc:'How accurate are the results?',
  accA:{calc:'Results follow the formulas and published rates shown on the page. Treat them as planning estimates and confirm figures that carry legal or financial weight with the official source.',local:'Output is produced by your browser using standard image and document libraries. Always preview the result before you submit or share it.',ai:'AI output can contain mistakes. Check names, amounts and identifiers against the original before you rely on it.'},
  mobile:'Does it work on a phone?',
  mobileA:'Yes. The page is responsive and works in current mobile browsers. It is also available in English, Traditional Chinese, Arabic and Urdu.',
  howTitle:n=>`How to use ${n}`,
  faqTitle:'Frequently asked questions'
 },
 'zh-TW':{
  what:n=>`${n}是什麼？`,
  free:n=>`${n}可以免費使用嗎？`,
  freeA:'可以。完全免費，計算本身不需要註冊帳號，一般使用沒有次數限制。',
  priv:'我的資料會被保存嗎？',
  privA:{local:'不會。此工具在你的瀏覽器中執行，檔案與數字不會上傳到 AnyTool 伺服器。',calc:'不會。計算在瀏覽器中完成，你輸入的數值不會儲存在我們的伺服器。',ai:'此工具可能會把輸入內容傳送到設定的 AI 服務處理。請避免上傳敏感文件，並先閱讀工具頁面的說明。'},
  acc:'結果準確嗎？',
  accA:{calc:'結果依頁面所列公式與公布費率計算，僅供規劃參考。涉及法律或財務的數字，請以官方來源為準。',local:'輸出由你的瀏覽器使用標準圖片與文件函式庫產生。送出或分享前請先預覽確認。',ai:'AI 輸出可能有誤。使用前請對照原件確認姓名、金額與編號。'},
  mobile:'手機可以使用嗎？',
  mobileA:'可以。頁面支援手機瀏覽器，並提供英文、繁體中文、阿拉伯文與烏爾都文。',
  howTitle:n=>`如何使用${n}`,
  faqTitle:'常見問題'
 },
 ar:{
  what:n=>`ما هي أداة ${n}؟`,
  free:n=>`هل ${n} مجانية؟`,
  freeA:'نعم، مجانية ولا تحتاج إلى حساب للحساب نفسه، ولا يوجد حد للاستخدام العادي.',
  priv:'هل بياناتي خاصة؟',
  privA:{local:'نعم. تعمل هذه الأداة داخل متصفحك ولا يتم رفع ملفاتك أو أرقامك إلى خوادم AnyTool.',calc:'نعم. تتم الحسابات داخل المتصفح ولا تُحفظ القيم التي تدخلها على خوادمنا.',ai:'قد ترسل هذه الأداة مدخلاتك إلى خدمة ذكاء اصطناعي لمعالجتها. تجنب المستندات الحساسة واقرأ صفحة الأداة قبل المشاركة.'},
  acc:'ما مدى دقة النتائج؟',
  accA:{calc:'تعتمد النتائج على الصيغ والأسعار المنشورة في الصفحة وهي تقديرات للتخطيط. أكد الأرقام القانونية أو المالية من المصدر الرسمي.',local:'ينتج المتصفح المخرجات باستخدام مكتبات قياسية للصور والمستندات. عاين النتيجة دائماً قبل الإرسال أو المشاركة.',ai:'قد تحتوي مخرجات الذكاء الاصطناعي على أخطاء. راجع الأسماء والمبالغ والأرقام مع الأصل قبل الاعتماد عليها.'},
  mobile:'هل تعمل على الهاتف؟',
  mobileA:'نعم، الصفحة متجاوبة وتعمل في متصفحات الهاتف الحديثة، ومتوفرة بالإنجليزية والصينية التقليدية والعربية والأردية.',
  howTitle:n=>`كيفية استخدام ${n}`,
  faqTitle:'الأسئلة الشائعة'
 },
 ur:{
  what:n=>`${n} کیا ہے؟`,
  free:n=>`کیا ${n} مفت ہے؟`,
  freeA:'جی ہاں، یہ مفت ہے، حساب کے لیے اکاؤنٹ درکار نہیں اور عام استعمال پر کوئی حد نہیں۔',
  priv:'کیا میرا ڈیٹا نجی رہتا ہے؟',
  privA:{local:'جی ہاں۔ یہ ٹول آپ کے براؤزر میں چلتا ہے اور آپ کی فائلیں یا اعداد AnyTool سرور پر اپ لوڈ نہیں ہوتے۔',calc:'جی ہاں۔ حساب براؤزر میں ہوتا ہے اور آپ کی درج کردہ اقدار ہمارے سرور پر محفوظ نہیں ہوتیں۔',ai:'یہ ٹول آپ کا ان پٹ پراسیسنگ کے لیے AI سروس کو بھیج سکتا ہے۔ حساس دستاویزات سے گریز کریں اور شیئر کرنے سے پہلے ٹول کا صفحہ پڑھیں۔'},
  acc:'نتائج کتنے درست ہیں؟',
  accA:{calc:'نتائج صفحے پر دیے گئے فارمولوں اور شائع شدہ شرحوں پر مبنی ہیں اور منصوبہ بندی کے اندازے ہیں۔ قانونی یا مالی اعداد سرکاری ذریعے سے تصدیق کریں۔',local:'آؤٹ پٹ آپ کا براؤزر معیاری امیج اور دستاویزی لائبریریوں سے بناتا ہے۔ جمع کرانے یا شیئر کرنے سے پہلے پیش نظارہ دیکھ لیں۔',ai:'AI کے نتائج میں غلطیاں ہو سکتی ہیں۔ بھروسہ کرنے سے پہلے نام، رقوم اور شناختی نمبر اصل سے ملا لیں۔'},
  mobile:'کیا یہ فون پر کام کرتا ہے؟',
  mobileA:'جی ہاں، صفحہ موبائل براؤزرز میں کام کرتا ہے اور انگریزی، روایتی چینی، عربی اور اردو میں دستیاب ہے۔',
  howTitle:n=>`${n} کیسے استعمال کریں`,
  faqTitle:'اکثر پوچھے گئے سوالات'
 }
}

// Hand-written extras for the highest-demand tools (English and Traditional Chinese).
const extra={
 'take-home-pay':{en:[['Which deductions are included?','Labor insurance, National Health Insurance (with dependents), the 6% voluntary pension option and an income-tax estimate. Employer-side costs are not deducted from your pay.']],'zh-TW':[['會扣除哪些項目？','勞保、健保（含眷屬）、可選的勞退自提 6% 與所得稅估算。雇主負擔的部分不會從你的薪水扣除。']]},
 'taiwan-id-photo':{en:[['What size is a Taiwan passport photo?','The official guide asks for a recent colour photo with a plain light background and the head centred. Pick Passport, National ID or ARC/APRC in the tool and it crops to the matching proportion; verify against the official guide before you submit.']],'zh-TW':[['台灣護照照片尺寸是多少？','官方規定為近期彩色、淺色素面背景且頭部置中的照片。在工具中選擇護照、國民身分證或 ARC/APRC，會依對應比例裁切；送件前請再對照官方說明。']]},
 'ping-converter':{en:[['How many square metres is one ping (坪)?','One ping is 400/121 m², about 3.3058 m². Multiply ping by 3.3058 for m², or divide m² by 3.3058 for ping.']],'zh-TW':[['一坪等於幾平方公尺？','一坪等於 400/121 平方公尺，約 3.3058 m²。坪數乘以 3.3058 得平方公尺，平方公尺除以 3.3058 得坪數。']]},
 'renovation-budget':{en:[['What does renovation cost per ping in Taiwan?','Ranges used here follow PRO360 market figures: roughly NT$30,000–50,000 per ping for a new home, rising to NT$70,000–100,000 for homes over 20 years old. Quotes vary by city and finish level.']],'zh-TW':[['台灣裝潢一坪多少錢？','這裡的區間參考 PRO360 市場資料：新屋約每坪 NT$30,000–50,000，屋齡 20 年以上約 NT$70,000–100,000。實際報價依城市與等級而異。']]},
 'paint-calculator':{en:[['How much paint do I need for a room?','Add the wall areas, subtract doors and windows, multiply by the number of coats and divide by the coverage on the tin (often 9–12 m² per litre). Buy about 10% extra.']],'zh-TW':[['一個房間需要多少油漆？','把牆面積相加、扣除門窗，乘以塗刷次數，再除以油漆標示的覆蓋率（通常每公升 9–12 m²），並多買約 10%。']]},
 'flooring-calculator':{en:[['How many tiles or planks do I need?','Divide the floor area by the area of one piece and round up, then add 5–10% for cuts and breakage.']],'zh-TW':[['需要多少地磚或木地板？','用地面積除以單片面積並無條件進位，再加 5–10% 作為裁切與損耗。']]},
 'image-compress':{en:[['How do I reduce a JPG to under 200 KB?','Lower the quality in steps of 5–10 and check the file size shown, or reduce the pixel dimensions first. Preview the image so text and faces stay clear.']],'zh-TW':[['如何把 JPG 壓到 200 KB 以下？','每次把品質降低 5–10 並觀察檔案大小，或先縮小像素尺寸，再預覽確認文字與臉部仍清晰。']]},
 'pdf-merge':{en:[['Can I merge PDFs without uploading them?','Yes. Files are combined inside your browser, so they never leave your device.'],['In what order are the PDFs combined?','Pages follow the order of the files in the list, so arrange the files first and check the result before you share it.'],['Why is my merged PDF large?','The merged file is roughly the sum of the originals. If it is too big to email, compress the large source files or scanned images first, then merge again.']],'zh-TW':[['合併 PDF 需要上傳嗎？','不需要。檔案在你的瀏覽器中合併，不會離開你的裝置。']]},
 'pdf-split':{en:[['How do I extract certain pages from a PDF?','Enter the page numbers or ranges you want, for example 1-3 or 5, and download the new file. The original PDF is not changed.'],['Does splitting a PDF upload it anywhere?','No. The split runs in your browser, so the file stays on your device.'],['Can I split a password-protected PDF?','Protected files may not open. Remove the password in the app that created the file, then split the unlocked copy.']],'zh-TW':[['如何從 PDF 擷取指定頁面？','輸入想要的頁碼或範圍（例如 1-3 或 5），再下載新檔案。原始 PDF 不會被修改。'],['分割 PDF 會上傳檔案嗎？','不會。分割在你的瀏覽器中進行，檔案不會離開你的裝置。'],['可以分割有密碼的 PDF 嗎？','受保護的檔案可能無法開啟。請先在原建立程式移除密碼，再分割解鎖後的副本。']]},
 'receipt-to-json':{en:[['What data does the receipt extractor return?','It returns structured JSON with the date, merchant, line items and totals found on the receipt photo.'],['Why do I need to sign in?','The extraction uses an AI service, so it needs a signed-in account. The photo is sent only after you start the task.'],['How accurate is the result?','AI can misread blurry or crumpled receipts. Review every field, especially amounts and dates, before you use the data for expenses or accounting.']],'zh-TW':[['收據擷取會回傳哪些資料？','會回傳結構化 JSON，包含收據照片上的日期、商家、品項與總額。'],['為什麼需要登入？','擷取使用 AI 服務，因此需要登入帳號。只有在你開始任務後才會傳送照片。'],['結果準確嗎？','AI 可能誤讀模糊或皺摺的收據。用於報銷或記帳前，請逐項檢查，尤其是金額與日期。']]},
 'loan-payment':{en:[['How is each repayment worked out?','It uses the standard amortisation formula with your principal, annual rate and number of months, so each payment covers interest first and then principal.']],'zh-TW':[['每月還款額如何計算？','依本金、年利率與期數使用標準本息攤還公式，每期先支付利息，其餘償還本金。']]},
 'qr-generator':{en:[['What size should a printed QR code be?','Use at least 2 × 2 cm and keep a clear margin around it. Scan the printed result once before you publish it.']],'zh-TW':[['列印的 QR Code 要多大？','至少 2 × 2 公分並保留四周留白，發布前請實際掃描一次確認。']]}
}

export const faqForTool=(tool,lang,name,description)=>{
 const L=T[lang]||T.en,k=faqKind(tool)
 const out=[[L.what(name),description],[L.free(name),L.freeA],[L.priv,L.privA[k]],[L.acc,L.accA[k]]]
 const e=extra[tool.slug]?.[lang];if(e)out.push(...e)
 out.push([L.mobile,L.mobileA])
 return out
}
export const faqTitleFor=lang=>(T[lang]||T.en).faqTitle
export const howToTitleFor=(lang,name)=>(T[lang]||T.en).howTitle(name)
