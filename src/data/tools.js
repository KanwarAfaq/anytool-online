export const categories = [
  { id: 'money', label: 'Money & Taiwan' },
  { id: 'image', label: 'Image & ID Photo' },
  { id: 'document', label: 'PDF & Document' },
  { id: 'ai', label: 'AI & OCR' },
  { id: 'general', label: 'General Calculators' },
]

export const tools = [
  ['take-home-pay','Taiwan Take-home Pay','money','Estimate monthly net salary after labor/employment insurance, NHI and tax.'],
  ['labor-insurance','Taiwan Labor Insurance','money','Estimate employee labor and employment insurance premiums.'],
  ['nhi','Taiwan NHI Premium','money','Estimate employee National Health Insurance premium.'],
  ['income-tax','Taiwan Income Tax','money','Simple annual salary-income tax estimate for resident individuals.'],
  ['overtime-pay','Taiwan Overtime Pay','money','Estimate weekday/rest-day overtime pay.'],
  ['minimum-wage','Taiwan Minimum Wage','money','Compare pay against the 2026 Taiwan minimum wage.'],
  ['employer-cost','Taiwan Employer Cost','money','Estimate standard full-time salary plus employer labor/employment insurance, NHI and 6% pension. Occupational accident insurance is excluded because its rate varies.'],
  ['annual-salary','Annual ↔ Monthly Salary','money','Convert monthly salary, bonus months and annual package.'],
  ['percentage','Percentage Calculator','general','Percentage increase, decrease and share calculator.'],
  ['image-resize','Resize Image','image','Resize JPG/PNG/WebP in your browser.'],
  ['image-compress','Compress Image','image','Compress an image locally with adjustable quality.'],
  ['png-to-jpg','PNG to JPG','image','Convert PNG to JPEG locally.'],
  ['jpg-to-png','JPG to PNG','image','Convert JPEG to PNG locally.'],
  ['dpi-calculator','DPI Calculator','image','Convert pixels and print dimensions to DPI.'],
  ['qr-generator','QR Code Generator','image','Generate a QR code locally.'],
  ['qr-scanner','QR Code Scanner','image','Read a QR code from an uploaded image.'],
  ['pdf-merge','Merge PDF','document','Merge multiple PDF files locally in your browser.'],
  ['pdf-split','Split PDF','document','Extract selected pages from a PDF locally.'],
  ['loan-payment','Loan Payment Calculator','general','Calculate monthly loan payments, total repayment and total interest.'],
  ['taiwan-id-photo','Taiwan Passport / ARC Photo Maker','image','Crop and export Taiwan passport, National ID and ARC photo files using official size guidance.'],
  ['taiwan-elder-care','Taiwan Elderly Care Subsidy & Bed Finder','money','Check the 2026 residential-care subsidy and official facility bed or vacancy sources.'],
  ['ocr','AI OCR','ai','Extract text from an image using the configured AI gateway.'],
  ['receipt-to-json','Receipt → JSON','ai','Extract structured receipt data using AI.'],
].map(([slug,name,category,description]) => ({ slug,name,category,description }))

export const toolBySlug = Object.fromEntries(tools.map(t => [t.slug, t]))
