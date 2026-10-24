// Home-page FAQ copy, shared by the React page and the build-time prerender so visible text and FAQPage JSON-LD stay identical.
export const homeFaq={
 en:[
  ['What can I do with AnyTool?','AnyTool offers online calculators, PDF merging and splitting, image resizing and compression, QR code generation, OCR and productivity utilities. Choose a tool to see its supported features.'],
  ['Can I merge or split PDFs for free?','Yes. Open Merge PDF to combine PDF files, or Split PDF to extract selected pages. These tools work locally in your browser.'],
  ['Does every tool process files privately?','No. Many utilities process data directly in your browser, while AI-assisted tools may send input to a configured service. Check each tool page before sharing sensitive information.'],
  ['Do I need to install software?','Most tools work directly in a modern web browser without installing a desktop application.']
 ],
 'zh-TW':[
  ['AnyTool 提供哪些工具？','AnyTool 提供計算器、PDF 合併與分割、圖片調整與壓縮、QR Code、OCR 及生產力工具。'],
  ['可以免費合併或分割 PDF 嗎？','可以。PDF 合併與分割工具可以直接在瀏覽器本機處理檔案。'],
  ['所有工具都在本機處理資料嗎？','不是。許多工具在瀏覽器本機運作，但 AI 工具可能將資料傳送至設定的服務。請先確認工具說明。'],
  ['需要安裝軟體嗎？','多數工具可以在現代瀏覽器直接使用，不需要安裝桌面程式。']
 ],
 ar:[
  ['ما الأدوات التي يقدمها AnyTool؟','يوفر AnyTool حاسبات وأدوات لدمج ملفات PDF وتقسيمها والصور ورموز QR واستخراج النصوص.'],
  ['هل يمكن دمج PDF وتقسيمه مجاناً؟','نعم، تعمل أداتا دمج PDF وتقسيم PDF محلياً داخل المتصفح.'],
  ['هل تعالج جميع الأدوات البيانات محلياً؟','لا. تعمل أدوات كثيرة داخل المتصفح، لكن أدوات الذكاء الاصطناعي قد ترسل البيانات إلى خدمة خارجية.'],
  ['هل أحتاج إلى تثبيت برنامج؟','تعمل معظم الأدوات مباشرة في متصفح حديث دون تثبيت برامج.']
 ],
 ur:[
  ['AnyTool پر کون سے ٹولز دستیاب ہیں؟','AnyTool میں کیلکولیٹر، PDF ضم اور تقسیم کرنے، تصاویر، QR کوڈ اور OCR کے ٹولز موجود ہیں۔'],
  ['کیا PDF مفت میں ضم یا تقسیم ہو سکتی ہے؟','جی ہاں، یہ دونوں PDF ٹولز براہ راست براؤزر میں کام کرتے ہیں۔'],
  ['کیا تمام ٹولز ڈیٹا مقامی طور پر پراسیس کرتے ہیں؟','نہیں۔ کئی ٹولز براؤزر میں کام کرتے ہیں مگر AI ٹولز ڈیٹا بیرونی سروس کو بھیج سکتے ہیں۔'],
  ['کیا سافٹ ویئر انسٹال کرنا پڑتا ہے؟','زیادہ تر ٹولز جدید ویب براؤزر میں بغیر انسٹالیشن چلتے ہیں۔']
 ]
}
export const faqFor=lang=>homeFaq[lang]||homeFaq.en
