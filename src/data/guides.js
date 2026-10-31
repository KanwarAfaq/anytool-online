// Long-form guides (English + Traditional Chinese). Shared by the React pages and the build-time prerender.
// Facts here are limited to formulas, worked examples and the ranges already used by the matching tools.
export const guideLocales=['en','zh-TW']
export const guides=[
 {slug:'ping-to-square-meters',refs:[{label:'Ping (unit) — Wikipedia',url:'https://en.wikipedia.org/wiki/Ping_(unit)'},{label:'Ministry of the Interior, Taiwan',url:'https://www.moi.gov.tw/'}],tool:'ping-converter',updated:'2026-10-28',
  en:{title:'How to Convert Ping (坪) to Square Metres and Square Feet',desc:'One ping equals 400/121 m² (about 3.3058 m²). Formulas, a worked example for a 30-ping flat, and a free converter.',
   sections:[
    {h:'The short answer',p:['One ping (坪) is 400/121 square metres, which is about 3.3058 m² or 35.58 square feet. To convert ping to m², multiply by 3.3058. To convert m² to ping, divide by 3.3058.']},
    {h:'Worked example',p:['A listing says 30 ping. 30 × 3.3058 = 99.17 m², or about 1,067 square feet. Going the other way, 100 m² ÷ 3.3058 = 30.25 ping.']},
    {h:'Why listings and floor plans disagree',p:['Taiwan listings often quote ping including shared areas such as stairwells, lifts and the pool or gym. The area you can actually use inside the unit is usually smaller. Ask for the registered area (權狀) breakdown and compare the main building area with the shared area.'],list:['Main building area (主建物): the space inside your unit.','Accessory area (附屬建物): balconies and similar.','Shared area (公設): your share of common facilities.']},
    {h:'Use the converter',p:['The AnyTool ping converter converts between ping, m² and sq ft instantly in your browser, and the renovation budget tool multiplies your ping by per-ping cost ranges.']}]},
  'zh-TW':{title:'坪數換算：坪 ↔ 平方公尺 ↔ 平方英尺',desc:'1 坪等於 400/121 平方公尺（約 3.3058 m²）。公式、30 坪換算範例與免費換算工具。',
   sections:[
    {h:'簡短答案',p:['1 坪等於 400/121 平方公尺，約 3.3058 m² 或 35.58 平方英尺。坪換平方公尺，乘以 3.3058；平方公尺換坪，除以 3.3058。']},
    {h:'換算範例',p:['物件標示 30 坪：30 × 3.3058 = 99.17 m²，約 1,067 平方英尺。反過來，100 m² ÷ 3.3058 = 30.25 坪。']},
    {h:'為什麼廣告坪數與實際使用面積不同',p:['台灣的銷售坪數常包含樓梯間、電梯與游泳池、健身房等公共設施，室內可使用面積通常較小。請向賣方索取權狀面積明細，比較主建物與公設比例。'],list:['主建物：你單位室內的空間。','附屬建物：陽台等。','公設：分攤的公共設施。']},
    {h:'使用換算工具',p:['AnyTool 的坪數換算工具可在瀏覽器即時換算坪、平方公尺與平方英尺；裝潢預算工具則會把坪數乘以每坪費用區間。']}]}},
 {slug:'renovation-cost-per-ping-taiwan',refs:[{label:'PRO360 renovation guides',url:'https://www.pro360.com.tw/'},{label:'Ministry of the Interior, Taiwan',url:'https://www.moi.gov.tw/'}],tool:'renovation-budget',updated:'2026-10-28',
  en:{title:'Renovation Cost per Ping in Taiwan: Budget Ranges by Home Age',desc:'Typical Taiwan renovation budgets per ping by building age, how the budget splits across trades, and why to keep a 10-15% contingency.',
   sections:[
    {h:'Typical ranges per ping',p:['The renovation budget tool uses ranges based on PRO360 market figures. They are planning numbers, not quotes: finish level, city and layout changes move the total.'],list:['Newer homes: about NT$30,000–50,000 per ping.','5–10 years old: about NT$50,000–70,000 per ping.','10–20 years old: about NT$60,000–80,000 per ping.','Over 20 years old: about NT$70,000–100,000 per ping, because plumbing, wiring and waterproofing often need replacing.']},
    {h:'Example',p:['A 30-ping home that is 15 years old at NT$60,000–80,000 per ping is NT$1.8–2.4 million before furniture and appliances.']},
    {h:'Where the money goes',p:['Demolition and structural work, plumbing and electrical, carpentry and cabinetry, flooring and tiles, painting, and design fees are the main lines. Older buildings put more of the budget into hidden work you cannot see afterwards.']},
    {h:'Keep a contingency',p:['Set aside 10–15% for surprises such as leaks found after demolition. The budget tool lets you add a contingency and see the total change.']},
    {h:'Next step',p:['Use the renovation budget estimator to enter your ping and building age, then collect at least three itemised quotes and compare them line by line.']}]},
  'zh-TW':{title:'台灣裝潢一坪多少錢？依屋齡的預算區間',desc:'依屋齡整理台灣裝潢每坪預算區間、各工種比例，以及為何要預留 10–15% 預備金。',
   sections:[
    {h:'每坪預算區間',p:['裝潢預算工具使用參考 PRO360 市場資料的區間，僅供規劃，並非報價；風格等級、城市與格局變動都會影響總價。'],list:['新屋：約每坪 NT$30,000–50,000。','屋齡 5–10 年：約每坪 NT$50,000–70,000。','屋齡 10–20 年：約每坪 NT$60,000–80,000。','屋齡 20 年以上：約每坪 NT$70,000–100,000，因為水電與防水常需更換。']},
    {h:'範例',p:['15 年屋齡、30 坪的房子，以每坪 NT$60,000–80,000 計算，約 NT$180–240 萬，尚未含家具與家電。']},
    {h:'錢花在哪裡',p:['主要項目包括拆除與結構、水電、木作與櫃體、地板與磁磚、油漆以及設計費。老屋有更多預算花在完工後看不見的隱蔽工程。']},
    {h:'預留預備金',p:['建議預留 10–15%，以應付拆除後才發現的漏水等意外。預算工具可加入預備金並查看總額變化。']},
    {h:'下一步',p:['用裝潢預算估算工具輸入坪數與屋齡，再取得至少三份逐項報價並逐項比較。']}]}},
 {slug:'paint-needed-for-a-room',refs:[{label:'Paint estimating — Wikipedia',url:'https://en.wikipedia.org/wiki/Paint'}],tool:'paint-calculator',updated:'2026-10-28',
  en:{title:'How Much Paint Do You Need? Room Formula With Example',desc:'Calculate paint for any room: wall area, minus doors and windows, times coats, divided by coverage. Worked 4 × 5 m example.',
   sections:[
    {h:'The formula',p:['Paint needed = (wall area − door and window area) × number of coats ÷ coverage per litre. Wall area is the room perimeter times the wall height.']},
    {h:'Worked example',p:['Room 4 m × 5 m, ceiling height 2.5 m. Perimeter = 2 × (4 + 5) = 18 m. Wall area = 18 × 2.5 = 45 m². Subtract one door (2 m²) and one window (1.5 m²) to get 41.5 m². Two coats = 83 m². If the tin says 10 m² per litre, you need 8.3 litres; add about 10% for waste and touch-ups to get roughly 9.1 litres.']},
    {h:'Tips',p:['Check the coverage printed on the tin because it varies by product and surface. Porous or very dark walls may need a primer or a third coat. Buy all paint for one wall at the same time so the colour matches.']},
    {h:'Use the calculator',p:['The paint calculator handles several walls and openings, metric or US units, and the number of coats.']}]},
  'zh-TW':{title:'油漆要買多少？房間用量公式與範例',desc:'計算房間油漆用量：牆面積扣除門窗，乘以塗刷次數，再除以覆蓋率。附 4 × 5 公尺範例。',
   sections:[
    {h:'公式',p:['油漆用量 =（牆面積 − 門窗面積）× 塗刷次數 ÷ 每公升覆蓋面積。牆面積等於房間周長乘以牆高。']},
    {h:'計算範例',p:['房間 4 m × 5 m，天花板高 2.5 m。周長 = 2 ×（4 + 5）= 18 m，牆面積 = 18 × 2.5 = 45 m²。扣除一扇門（2 m²）與一扇窗（1.5 m²）得 41.5 m²。塗兩層共 83 m²。若漆桶標示每公升 10 m²，需要 8.3 公升；再加約 10% 損耗與補漆，約 9.1 公升。']},
    {h:'小提醒',p:['請以漆桶上的覆蓋率為準，不同產品與表面差異很大。吸水或深色牆面可能需要底漆或第三層。同一面牆的油漆一次買足，色差較小。']},
    {h:'使用計算器',p:['油漆計算器支援多面牆與門窗、公制或美制單位，以及塗刷次數。']}]}},
 {slug:'loan-monthly-payment-formula',refs:[{label:'Amortization calculator — Wikipedia',url:'https://en.wikipedia.org/wiki/Amortization_calculator'},{label:'Consumer Financial Protection Bureau',url:'https://www.consumerfinance.gov/'}],tool:'loan-payment',updated:'2026-10-28',
  en:{title:'How a Monthly Loan Payment Is Calculated (With Example)',desc:'The amortisation formula behind every fixed-rate loan, with a worked NT$1,000,000 five-year example and how rate changes affect the payment.',
   sections:[
    {h:'The formula',p:['For a fixed-rate loan with equal monthly payments: payment = P × r ÷ (1 − (1 + r)^−n), where P is the amount borrowed, r is the monthly rate (annual rate ÷ 12) and n is the number of months.']},
    {h:'Worked example',p:['Borrow NT$1,000,000 at 2.5% a year for 60 months. r = 0.025 ÷ 12 = 0.002083. The payment is about NT$17,747 a month, so total repayment is about NT$1,064,842 and total interest about NT$64,842.']},
    {h:'What changes the payment',p:['At 3.5% the same loan costs about NT$18,192 a month. A longer term lowers the payment but increases total interest, because interest is charged on the balance for more months.']},
    {h:'Before you sign',p:['Lenders may add fees, insurance or a different compounding rule, so ask for the annual percentage rate and the full repayment schedule.']},
    {h:'Try it',p:['The loan payment calculator shows the monthly payment, total repayment and total interest for any amount, rate and term.']}]},
  'zh-TW':{title:'每月貸款還款額怎麼算？公式與範例',desc:'固定利率貸款的本息攤還公式，附 NT$1,000,000 五年期範例，以及利率變動對月付金的影響。',
   sections:[
    {h:'公式',p:['固定利率、每月等額還款：月付金 = P × r ÷ (1 − (1 + r)^−n)，其中 P 為貸款金額，r 為月利率（年利率 ÷ 12），n 為期數（月）。']},
    {h:'計算範例',p:['借 NT$1,000,000，年利率 2.5%，60 期。r = 0.025 ÷ 12 = 0.002083。月付金約 NT$17,747，總還款約 NT$1,064,842，總利息約 NT$64,842。']},
    {h:'什麼會改變月付金',p:['利率 3.5% 時，同樣的貸款月付金約 NT$18,192。期數拉長會降低月付金，但因為計息月數增加，總利息也會增加。']},
    {h:'簽約前',p:['金融機構可能加收手續費、保險或採用不同計息規則，請索取年百分率與完整還款明細。']},
    {h:'立即試算',p:['貸款試算工具可針對任何金額、利率與期數顯示月付金、總還款與總利息。']}]}},
 {slug:'taiwan-take-home-pay-explained',refs:[{label:'Bureau of Labor Insurance',url:'https://www.bli.gov.tw/'},{label:'National Health Insurance Administration',url:'https://www.nhi.gov.tw/'}],tool:'take-home-pay',updated:'2026-10-28',
  en:{title:'Taiwan Take-Home Pay Explained: What Is Deducted From Your Salary',desc:'How gross salary becomes net pay in Taiwan: labor insurance, National Health Insurance, voluntary pension and income tax, and how to estimate it.',
   sections:[
    {h:'Gross versus net',p:['Your net monthly pay in Taiwan is the gross salary minus the employee share of labor insurance and National Health Insurance, any voluntary pension contribution, and income-tax withholding where it applies.']},
    {h:'The main deductions',p:['Rates and insured-salary grades are updated by the authorities, so the calculator uses the current published tables and shows the sources.'],list:['Labor insurance: based on the insured-salary grade, with the employee paying a share.','National Health Insurance: based on the insured amount, with extra charges for dependents.','Voluntary labor pension: you may contribute up to 6% of salary, which lowers taxable income.','Income tax: withheld monthly or settled at annual filing.']},
    {h:'What employers pay on top',p:['Employers pay their own share of insurance and the mandatory 6% pension contribution. These are not deducted from your pay but matter when you compare total package cost, which the employer-cost tool shows.']},
    {h:'Estimate yours',p:['Enter your gross monthly salary and the number of NHI dependents in the take-home pay calculator. Treat the result as a planning estimate and confirm special cases with the official agencies linked on the page.']}]},
  'zh-TW':{title:'台灣實領薪資怎麼算？薪水會扣哪些項目',desc:'台灣薪資從稅前到實領的過程：勞保、健保、勞退自提與所得稅，以及如何估算。',
   sections:[
    {h:'稅前與實領',p:['台灣每月實領薪資 = 稅前薪資 − 勞保與健保的員工負擔 − 勞退自提（如有）− 需要時的所得稅扣繳。']},
    {h:'主要扣款項目',p:['費率與投保級距由主管機關更新，計算器使用目前公布的資料並標示來源。'],list:['勞保：依投保薪資級距，員工負擔一部分。','健保：依投保金額計算，眷屬需另外計費。','勞退自提：可自願提繳最高 6%，可降低應稅所得。','所得稅：按月扣繳或於年度申報結算。']},
    {h:'雇主額外負擔',p:['雇主負擔自己的保險費與法定 6% 勞退提繳，這些不會從你的薪水扣除，但在比較整體薪酬成本時很重要，可用雇主成本工具查看。']},
    {h:'立即估算',p:['在實領薪資計算器輸入稅前月薪與健保眷屬人數。結果僅供規劃，特殊情況請查閱頁面上的官方來源。']}]}},
 {slug:'taiwan-minimum-wage-2026',refs:[{label:'Ministry of Labor, Taiwan',url:'https://www.mol.gov.tw/1607/28162/28166/28180/28182/28188/29025/'}],tool:'minimum-wage',updated:'2026-10-31',
  en:{title:'Taiwan Minimum Wage 2026: NT$29,500 a Month and NT$196 an Hour',desc:'The 2026 Taiwan minimum wage is NT$29,500 per month and NT$196 per hour. How to check that your pay meets it, with worked examples and a free checker.',
   sections:[
    {h:'The 2026 rates',p:['Effective 1 January 2026, Taiwan\'s minimum wage is NT$29,500 per month for monthly-paid workers and NT$196 per hour for hourly-paid workers, as published by the Ministry of Labor.']},
    {h:'How to check your pay',p:['If you are paid monthly, compare your monthly wage with NT$29,500. If you are paid by the hour, compare your hourly rate with NT$196. For example, an 8-hour day at NT$196 an hour is NT$1,568 before any deductions.'],list:['Monthly-paid: monthly wage should be at least NT$29,500.','Hourly-paid: hourly rate should be at least NT$196.','Overtime is paid on top of the basic wage, not counted inside it. See the overtime guide.']},
    {h:'Minimum wage versus take-home pay',p:['The minimum wage is a gross figure. What lands in your bank account is lower after the employee share of labor insurance and National Health Insurance, so compare gross with gross.']},
    {h:'Check it now',p:['The AnyTool minimum wage checker compares your monthly or hourly pay with the current rates. The take-home pay tool shows what remains after deductions, and the employer cost tool shows the total cost of employing someone at that wage.']}]},
  'zh-TW':{title:'2026 台灣最低工資：月薪 29,500、時薪 196',desc:'2026 年台灣最低工資為月薪 NT$29,500、時薪 NT$196。如何檢查你的薪資是否達標，附範例與免費檢查工具。',
   sections:[
    {h:'2026 年基本工資',p:['依勞動部公告，自 2026 年 1 月 1 日起，月薪制基本工資為 NT$29,500，時薪制為 NT$196。']},
    {h:'如何檢查你的薪資',p:['月薪制請以月薪對照 NT$29,500；時薪制請以時薪對照 NT$196。例如時薪 NT$196 工作 8 小時，一天為 NT$1,568（未扣除任何款項）。'],list:['月薪制：每月薪資不得低於 NT$29,500。','時薪制：每小時薪資不得低於 NT$196。','加班費是在基本工資之外另計，不包含在基本工資內。']},
    {h:'基本工資與實領薪資',p:['基本工資是稅前金額。實際入帳金額會再扣除員工負擔的勞保與健保保費，因此請以稅前對稅前比較。']},
    {h:'立即檢查',p:['AnyTool 最低工資工具可比較你的月薪或時薪是否達標；實領薪資工具顯示扣款後金額；雇主總成本工具則顯示僱用此薪資的總成本。']}]}},
 {slug:'taiwan-overtime-pay-explained',refs:[{label:'Ministry of Labor, Taiwan',url:'https://www.mol.gov.tw/1607/28162/28166/28180/28182/28188/29026'}],tool:'overtime-pay',updated:'2026-10-31',
  en:{title:'Taiwan Overtime Pay Explained: Weekday and Rest-Day Rates',desc:'How overtime is calculated in Taiwan: the monthly salary ÷ 240 hourly basis, weekday and rest-day multipliers, and a worked example with a free calculator.',
   sections:[
    {h:'Step 1: find the hourly wage',p:['For monthly-paid workers the ordinary hourly wage is the monthly salary divided by 240. A monthly salary of NT$40,000 gives NT$40,000 ÷ 240 = about NT$166.67 an hour.']},
    {h:'Step 2: apply the multipliers',p:['The calculator follows the Labor Standards Act premiums as used by the Ministry of Labor guidance.'],list:['Weekday: first 2 hours at ×4/3 (about 1.34), next 2 hours at ×5/3 (about 1.67).','Rest day: first 2 hours at ×4/3, hours 3 to 8 at ×5/3, hours 9 to 12 at ×8/3.']},
    {h:'Worked example: weekday',p:['With NT$40,000 a month and 3 hours of weekday overtime: 2 × 4/3 + 1 × 5/3 = 4.33 hourly-wage units, so 4.33 × NT$166.67 = about NT$722.']},
    {h:'Worked example: rest day',p:['Working 10 hours on a rest day at the same salary: 2 × 4/3 + 6 × 5/3 + 2 × 8/3 = 18 units, so 18 × NT$166.67 = NT$3,000.']},
    {h:'Use the calculator',p:['Enter your monthly salary and overtime hours into the AnyTool overtime pay calculator for an instant estimate. Treat it as planning guidance and confirm your contract and the current rules with the Ministry of Labor.']}]},
  'zh-TW':{title:'台灣加班費怎麼算：平日與休息日倍率',desc:'台灣加班費計算方式：月薪 ÷ 240 的時薪基準、平日與休息日倍率，附計算範例與免費計算工具。',
   sections:[
    {h:'第一步：算出時薪',p:['月薪制勞工的平日每小時工資，一般為月薪除以 240。例如月薪 NT$40,000，時薪約為 40,000 ÷ 240 = NT$166.67。']},
    {h:'第二步：套用倍率',p:['計算工具依勞動基準法加班費倍率，並參考勞動部說明。'],list:['平日：前 2 小時 ×4/3（約 1.34 倍），後 2 小時 ×5/3（約 1.67 倍）。','休息日：前 2 小時 ×4/3，第 3 至第 8 小時 ×5/3，第 9 至第 12 小時 ×8/3。']},
    {h:'範例：平日加班',p:['月薪 NT$40,000、平日加班 3 小時：2 × 4/3 + 1 × 5/3 = 4.33 個時薪單位，4.33 × NT$166.67 ≈ NT$722。']},
    {h:'範例：休息日加班',p:['同樣月薪，休息日工作 10 小時：2 × 4/3 + 6 × 5/3 + 2 × 8/3 = 18 個單位，18 × NT$166.67 = NT$3,000。']},
    {h:'使用計算工具',p:['在 AnyTool 加班費計算工具輸入月薪與加班時數即可即時估算。結果僅供規劃參考，實際請以契約與勞動部最新規定為準。']}]}},
 {slug:'passport-and-id-photo-requirements',refs:[{label:'Bureau of Consular Affairs, Taiwan',url:'https://www.boca.gov.tw/'},{label:'National Immigration Agency, Taiwan',url:'https://www.immigration.gov.tw/'}],tool:'taiwan-id-photo',updated:'2026-10-28',
  en:{title:'Passport, National ID and ARC Photo Requirements in Taiwan',desc:'How to prepare a compliant photo for a Taiwan passport, National ID or ARC/APRC: background, framing, resolution and common rejections.',
   sections:[
    {h:'Check the official guide first',p:['Requirements are set by the issuing agency and can change, so always compare your final file with the current official guide before you apply.']},
    {h:'What is usually checked',p:['Photos are rejected for the same few reasons, most of which you can check before you submit.'],list:['A recent photo, taken straight on, showing the full face and shoulders.','A plain, light background with no shadows or patterns.','A neutral expression with eyes open and no glare on glasses.','Correct proportions and a sharp image, not stretched or heavily filtered.']},
    {h:'Prepare it in your browser',p:['The Taiwan ID photo tool lets you choose Passport, National ID or ARC/APRC, crop to the matching proportion and download a print or upload-ready file. The photo is processed in your browser and is not uploaded.']},
    {h:'Common mistakes',p:['Using a selfie taken at an angle, cropping too tightly, over-compressing the file or using a coloured background are the most frequent problems.']}]},
  'zh-TW':{title:'台灣護照、國民身分證與 ARC 證件照規格',desc:'如何準備符合規定的台灣護照、國民身分證或 ARC/APRC 照片：背景、構圖、解析度與常見退件原因。',
   sections:[
    {h:'先查官方規定',p:['規格由核發機關訂定且可能調整，申請前請務必對照最新官方說明確認最終檔案。']},
    {h:'通常會檢查什麼',p:['被退件的原因大多相同，多數可以在送件前自行檢查。'],list:['近期正面拍攝，露出完整臉部與肩膀。','淺色素面背景，無陰影或圖案。','表情自然、雙眼睜開，眼鏡無反光。','比例正確、影像清晰，沒有拉伸或過度濾鏡。']},
    {h:'在瀏覽器中準備',p:['台灣證件照工具可選擇護照、國民身分證或 ARC/APRC，依對應比例裁切並下載可列印或上傳的檔案。照片在你的瀏覽器處理，不會上傳。']},
    {h:'常見錯誤',p:['斜角自拍、裁切過緊、檔案過度壓縮或使用有色背景是最常見的問題。']}]}},
 {slug:'reduce-image-file-size',refs:[{label:'web.dev: learn images',url:'https://web.dev/learn/images'}],tool:'image-compress',updated:'2026-10-28',
  en:{title:'How to Reduce Image File Size Without Visible Quality Loss',desc:'Shrink JPG, PNG and WebP files for forms, email and websites: resize first, lower quality in small steps, pick the right format.',
   sections:[
    {h:'Resize first, then compress',p:['File size depends mostly on pixel dimensions. A 4000 px wide photo shown at 1200 px wastes bytes. Resize to the largest size you actually need, then lower the quality.']},
    {h:'Lower quality in small steps',p:['For JPG and WebP, reduce quality 5–10 points at a time and watch the file size. Stop when text edges or faces start to look soft.']},
    {h:'Pick the right format',list:['JPG: photos and scans.','PNG: screenshots, logos and transparency.','WebP: usually smaller than JPG or PNG for the web.']},
    {h:'Do it privately',p:['The AnyTool image compressor and resizer run in your browser, so photos of IDs or documents are never uploaded to a server.']}]},
  'zh-TW':{title:'如何縮小圖片檔案大小又不明顯失真',desc:'為表單、電子郵件與網站縮小 JPG、PNG、WebP：先縮尺寸、小幅降低品質、選對格式。',
   sections:[
    {h:'先縮尺寸，再壓縮',p:['檔案大小主要取決於像素尺寸。4000 px 寬的照片只以 1200 px 顯示會浪費空間。先縮到實際需要的最大尺寸，再降低品質。']},
    {h:'小幅降低品質',p:['JPG 與 WebP 每次降低 5–10 並觀察檔案大小，當文字邊緣或臉部開始模糊時停止。']},
    {h:'選對格式',list:['JPG：照片與掃描檔。','PNG：截圖、標誌與透明背景。','WebP：網頁用途通常比 JPG 或 PNG 更小。']},
    {h:'私密處理',p:['AnyTool 的圖片壓縮與縮放在瀏覽器執行，身分證或文件照片不會上傳到伺服器。']}]}}
]
export const guideBySlug=Object.fromEntries(guides.map(g=>[g.slug,g]))
export const guideCopy=g=>lang=>g[lang]||g.en
export const guidesHub={
 en:{title:'Guides: Calculators, Renovation, Taiwan Pay & Photo Rules | AnyTool.online',h1:'Practical guides',desc:'Short, plain-language guides with formulas and worked examples, each linked to the free tool that does the maths for you.'},
 'zh-TW':{title:'實用指南：計算、裝潢、台灣薪資與證件照規格 | AnyTool.online',h1:'實用指南',desc:'簡短易懂的指南，附公式與計算範例，並連結到可直接計算的免費工具。'}
}
