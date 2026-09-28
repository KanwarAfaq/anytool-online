export const priorityToolContent={
 'take-home-pay':{
  useCases:['Compare job offers in Taiwan using estimated monthly take-home pay.','Estimate how NHI dependents change payroll deductions.','Break a gross monthly salary into insurance, NHI and simplified income-tax components.'],
  example:{title:'NT$60,000 monthly salary example',body:'Enter NT$60,000 as gross monthly salary and your chargeable NHI dependents. The calculator maps salary to the applicable 2026 insurance/NHI grades and shows each estimated deduction separately.'},
  questions:[
   ['Is this the same as an employer payroll slip?','No. It is a planning estimate. Payroll can differ because of tax withholding choices, bonuses, special insured status and employer-specific payroll timing.'],
   ['Does it use 2026 Taiwan rates?','Yes. The regulated inputs used by this calculator are tied to the official 2026 source registry shown on the page.']
  ]
 },
 'labor-insurance':{
  useCases:['Estimate the employee share of labor and employment insurance.','Check which insured-salary grade a monthly salary maps to.','Compare insurance deductions across salary offers.'],
  example:{title:'Insured-salary grade example',body:'If actual salary falls between two published grades, the tool maps it using the 2026 official grade table rather than applying the premium directly to raw salary.'},
  questions:[
   ['Why can the insured salary differ from my actual salary?','Taiwan labor insurance uses published insured-salary grades. The calculator maps your salary to that official schedule.'],
   ['Are occupational accident premiums included?','No. Occupational accident insurance can vary by business and experience and is handled separately where relevant.']
  ]
 },
 'nhi':{
  useCases:['Estimate the standard employee NHI contribution.','See the effect of zero to three chargeable dependents.','Check the 2026 NHI contribution-salary bracket used for an employee.'],
  example:{title:'Dependent contribution example',body:'Choose your monthly salary and number of chargeable dependents. The tool uses the 2026 employee contribution table and caps the displayed dependent count at the standard three-dependent charging limit.'},
  questions:[
   ['What NHI category does this calculator model?','It models the standard employee case with a fixed employer. Other insured categories can have different contribution shares.'],
   ['Why should I check the official table?','Special employment or insured status can change the applicable category even when salary is the same.']
  ]
 },
 'income-tax':{
  useCases:['Estimate annual Taiwan resident salary income tax for planning.','Compare household scenarios with spouse salary and dependents.','See how progressive brackets affect taxable salary income.'],
  example:{title:'Annual planning example',body:'Enter annual salary and household inputs. The calculator applies its documented deduction assumptions and the official progressive bracket structure to produce a planning estimate.'},
  questions:[
   ['Can I file my tax return using this result?','No. This is a simplified planning calculator and does not model every deduction, credit, income type or filing situation.'],
   ['Does monthly withholding equal final annual tax?','Not necessarily. Payroll withholding and final annual liability are different calculations.']
  ]
 },
 'taiwan-id-photo':{
  useCases:['Prepare a 35×45 mm Taiwan passport photo crop.','Prepare a National ID digital image with the official minimum pixel dimensions.','Create an ARC/APRC-style photo crop and compare it with official guidance.'],
  example:{title:'Digital National ID example',body:'Choose National ID, upload the original image, position the crop, then verify the exported photo against the official 35×45 mm composition and at least 413×531 px digital-file guidance.'},
  questions:[
   ['Does AnyTool approve my photo?','No. The tool helps with sizing and crop guidance; the issuing authority makes the final acceptance decision.'],
   ['Is the photo uploaded to AnyTool?','The core crop/export workflow runs in your browser.']
  ]
 },
 'taiwan-elder-care':{
  useCases:['Estimate the central 2026 residential-care subsidy under general conditions.','Search government-published Taoyuan or Taipei public nursing-home data.','Open verified local placement-program sources for major cities.'],
  example:{title:'Central subsidy planning example',body:'For a person meeting the general level-4-or-higher condition, choose the recognized months to estimate support at up to NT$15,000 per recognized month, subject to official eligibility and non-duplication rules.'},
  questions:[
   ['Are displayed bed numbers guaranteed live vacancies?','No. AnyTool reads government-published datasets when available, shows source/fetch context, and tells users to call the institution because availability changes.'],
   ['Can local and central subsidies always be added together?','No. Programs have separate eligibility and non-duplication rules.']
  ]
 },
 'image-resize':{
  useCases:['Resize a large photo for a website or form.','Change output dimensions while preserving aspect ratio.','Export JPG, PNG or WebP with browser-local processing.'],
  example:{title:'Web image example',body:'Upload a 4000×3000 photo, keep aspect ratio enabled, set width to 1600 px, choose the output format/quality and compare the resulting dimensions and file size before downloading.'},
  questions:[
   ['Is my image uploaded?','No. This resize workflow runs locally in your browser.'],
   ['Can I prevent accidental enlargement?','Yes. Keep enlargement disabled when you only want to reduce image dimensions.']
  ]
 },
 'image-compress':{
  useCases:['Reduce image file size before uploading to forms.','Compare JPG/WebP quality settings.','Compress locally without sending the image to a server.'],
  example:{title:'Compression example',body:'Upload an image, select JPG or WebP and lower quality gradually until file size is acceptable while the preview still meets your visual needs.'},
  questions:[
   ['Does lower quality always mean a smaller file?','Usually, but the exact result depends on image content and output format.'],
   ['Is PNG quality controlled the same way?','No. PNG is lossless in this workflow, so the quality slider applies to lossy output formats.']
  ]
 },
 'pdf-merge':{
  useCases:['Combine application documents into one PDF.','Merge scanned pages or reports in a chosen order.','Process PDFs locally without uploading the files.'],
  example:{title:'Application packet example',body:'Select multiple PDFs in the order you want them combined. The browser copies their pages into one new PDF and downloads the merged file.'},
  questions:[
   ['Are PDFs sent to a server?','No. PDF merge runs locally in the browser.'],
   ['Does merging edit the content on each page?','No. It combines existing pages into a new PDF in sequence.']
  ]
 },
 'qr-generator':{
  useCases:['Create a QR code for a URL, Wi-Fi instruction page or plain text.','Choose a larger export size for print use.','Generate and download a QR code locally.'],
  example:{title:'Website QR example',body:'Paste a complete HTTPS URL, generate the QR code, then test the exported image with a phone before printing or publishing it.'},
  questions:[
   ['Does AnyTool shorten or track the URL?','No. The encoded content is the text you provide; the generator itself does not create a tracking redirect.'],
   ['Should I test a QR code before printing?','Yes. Always scan the final exported/printed version at the intended physical size.']
  ]
 },
 'ocr':{
  useCases:['Extract text from a readable image or PDF.','Turn scanned text into copyable content.','Use AI-assisted extraction when local OCR is not sufficient.'],
  example:{title:'Document extraction example',body:'Sign in, upload a readable document under the file-size limit, run OCR, then compare names, dates, amounts and identifiers against the original before reusing the text.'},
  questions:[
   ['Can OCR make mistakes?','Yes. Image quality, layout, handwriting and language can cause extraction errors. Important fields should always be verified.'],
   ['Is this tool browser-local?','No. The selected file is sent to the configured authenticated AI gateway only after you start the task.']
  ]
 },
 'table-converter':{
  useCases:['Convert spreadsheet-style CSV into a Markdown table for documentation.','Turn TSV clipboard data into CSV.','Convert a simple HTML table into editable CSV/Markdown text.'],
  example:{title:'CSV to Markdown example',body:'Paste a header row plus CSV records, leave input on auto-detect, choose Markdown table, and copy the generated pipe-table directly into documentation.'},
  questions:[
   ['Does the table leave my browser?','No. Conversion runs in the browser.'],
   ['Does auto-detect handle every possible table format?','It targets CSV, TSV, Markdown tables and HTML tables; unusual or malformed input may require selecting the format manually.']
  ]
 },
 'screenshot-beautifier':{
  useCases:['Create a polished screenshot for documentation or social sharing.','Add consistent padding, gradient background and rounded corners.','Export a presentation-ready PNG without uploading the source image.'],
  example:{title:'Documentation screenshot example',body:'Upload a screenshot, choose a background preset, adjust padding and shadow, optionally add the browser-style top bar, then export the final PNG.'},
  questions:[
   ['Is the screenshot uploaded?','No. Rendering and export happen locally in the browser.'],
   ['Does the tool change the source file?','No. It renders a new composition and leaves the original file unchanged.']
  ]
 }
}

export const priorityToolSlugs=new Set(Object.keys(priorityToolContent))
