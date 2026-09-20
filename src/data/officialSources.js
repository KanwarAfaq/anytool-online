export const officialSources = {

  laborInsurance2026: {
    title: '2026 Labor / Employment Insurance Premium Rules',
    authority: 'Bureau of Labor Insurance, Ministry of Labor',
    url: 'https://www.bli.gov.tw/en/0011816.html',
    verified: '2026-09-20',
    summary: 'Labor insurance premium rate is 11.5% from 2025; employment insurance is 1%. Premiums are based on the applicable insured-salary grade and allocation ratio.'
  },
  laborInsuranceGrades2026: {
    title: '2026 Table of Grades of Labor Insurance Salary',
    authority: 'Bureau of Labor Insurance, Ministry of Labor',
    url: 'https://www.bli.gov.tw/en/0013254.html',
    verified: '2026-09-20',
    summary: 'Official 2026 insured-salary grade table; full-time labor/employment insurance starts at NT$29,500 and labor insurance tops out at NT$45,800.'
  },
  laborPension2026: {
    title: '2026 Monthly Contribution Classification of Labor Pension',
    authority: 'Bureau of Labor Insurance, Ministry of Labor',
    url: 'https://www.bli.gov.tw/en/0011273.html',
    verified: '2026-09-20',
    summary: 'Official 2026 contribution-wage classification. Employer mandatory labor-pension contributions are at least 6% of the monthly contribution wage.'
  },
  nhi2026: {
    title: '2026 NHI Premium Co-payment Chart — Employees',
    authority: 'National Health Insurance Administration, Ministry of Health and Welfare',
    url: 'https://www.nhi.gov.tw/en/cp-19434-822cf-64-2.html',
    verified: '2026-09-20',
    summary: 'For employees with a fixed employer: 5.17% premium rate, 30% employee share and up to three charged dependents; the employer column includes the published average dependent factor.'
  },
  minimumWage2026: {
    title: '2026 Taiwan Minimum Wage',
    authority: 'Ministry of Labor',
    url: 'https://www.mol.gov.tw/1607/28162/28166/28180/28182/28188/29025/',
    verified: '2026-09-20',
    summary: 'Effective January 1, 2026: NT$29,500 monthly and NT$196 hourly.'
  },
  overtimeRules: {
    title: 'Taiwan Overtime Pay Rules',
    authority: 'Ministry of Labor',
    url: 'https://www.mol.gov.tw/1607/28162/28166/28180/28182/28188/29026',
    verified: '2026-09-20',
    summary: 'For monthly-paid workers, the ordinary hourly wage is generally monthly wage divided by 240; overtime premiums follow the Labor Standards Act.'
  },
  incomeTax2026: {
    title: '2026 Individual Income Tax Brackets',
    authority: 'National Taxation Bureau, Ministry of Finance',
    url: 'https://www.ntbt.gov.tw/multiplehtml/1b82b380e1a34de9afd204d39b007db2',
    verified: '2026-09-20',
    summary: '2026 resident individual progressive tax brackets and quick-deduction amounts. AnyTool uses a simplified salary-income planning model and does not replace a tax return.'
  },
  taiwanPassport: {
    title: 'Taiwan Passport Photo Specifications — BOCA',
    authority: 'Bureau of Consular Affairs, Ministry of Foreign Affairs',
    url: 'https://www.boca.gov.tw/fp-140-467-29b1d-2.html',
    verified: '2026-09-20',
    summary: '35×45 mm, plain white background, recent color photo; head height 32–36 mm.'
  },
  taiwanIdPhoto: {
    title: 'National ID Photo Specifications — Household Registration',
    authority: 'Department of Household Registration, Ministry of the Interior',
    url: 'https://www.ris.gov.tw/documents/html/5/3/187.html',
    verified: '2026-09-20',
    summary: '35×45 mm, white background, head height 32–36 mm; digital JPG at least 413×531 px and no larger than 5 MB.'
  },
  arcPhoto: {
    title: 'ARC application photo guidance — National Immigration Agency',
    authority: 'National Immigration Agency',
    url: 'https://www.immigration.gov.tw/5382/5385/7244/7250/7317/%E5%B1%85%E7%95%99/362168/',
    verified: '2026-09-20',
    summary: 'Online ARC applications require a clear color photo cropped to the person, with the face about two thirds of the image; supporting upload limits vary by application flow.'
  },
  elderSubsidy2026: {
    title: '2026 Residential Care Institution User Subsidy',
    authority: 'Ministry of Health and Welfare',
    url: 'https://www.mohw.gov.tw/cp-16-87934-1.html',
    verified: '2026-09-20',
    summary: 'For eligible moderate/severe long-term-care residents, the 2026 central subsidy is up to NT$15,000 per month, up to NT$180,000 per year, retroactive to January 1, 2026.'
  },
  taoyuanBeds: {
    title: 'Taoyuan Elderly Welfare Institution Vacancies',
    authority: 'Department of Social Welfare, Taoyuan City Government',
    url: 'https://sab.tycg.gov.tw/News_Content.aspx?n=7376&s=1615287',
    verified: '2026-09-20',
    summary: 'Official monthly vacancy attachment for registered elderly welfare institutions in Taoyuan.'
  },
  taipeiBeds: {
    title: 'Taipei Social Welfare Institution Vacancy Inquiry',
    authority: 'Department of Social Welfare, Taipei City Government',
    url: 'https://orgvacinqusys.gov.taipei/',
    verified: '2026-09-20',
    summary: 'Official Taipei real-time welfare institution vacancy inquiry.'
  },
  taichungBeds: {
    title: 'Taichung Elderly and Disability Institution Bed Inquiry',
    authority: 'Social Affairs Bureau, Taichung City Government',
    url: 'https://societymap.taichung.gov.tw/SocietyMap/SocietyShelter/QuyShelter.aspx',
    verified: '2026-09-20',
    summary: 'Official facility directory with approved capacity and occupancy information.'
  },
  yilanBeds: {
    title: 'Yilan Long-term Care Bed Inquiry',
    authority: 'Yilan County Long-term Care Management Office',
    url: 'https://ltc.ilshb.gov.tw/',
    verified: '2026-09-20',
    summary: 'Official residential institution bed inquiry system.'
  },
  newTaipeiFacilities: {
    title: 'New Taipei Elderly Welfare Institutions Open Data',
    authority: 'Social Welfare Department, New Taipei City Government',
    url: 'https://data.gov.tw/dataset/123848',
    verified: '2026-09-20',
    summary: 'Official facility directory with address, phone and approved bed counts by service type.'
  }
}

export const elderCitySources = [
  { city:'Taoyuan', key:'taoyuanBeds', live:true, integrated:true },
  { city:'Taipei', key:'taipeiBeds', live:true, integrated:false },
  { city:'Taichung', key:'taichungBeds', live:true, integrated:false },
  { city:'Yilan', key:'yilanBeds', live:true, integrated:false },
  { city:'New Taipei', key:'newTaipeiFacilities', live:false, integrated:false },
]


export const toolSourceKeys = {
  'take-home-pay': ['laborInsurance2026','laborInsuranceGrades2026','nhi2026','incomeTax2026'],
  'labor-insurance': ['laborInsurance2026','laborInsuranceGrades2026'],
  'nhi': ['nhi2026'],
  'income-tax': ['incomeTax2026'],
  'overtime-pay': ['overtimeRules'],
  'minimum-wage': ['minimumWage2026'],
  'employer-cost': ['laborInsurance2026','laborInsuranceGrades2026','nhi2026','laborPension2026'],
  'taiwan-id-photo': ['taiwanPassport','taiwanIdPhoto','arcPhoto'],
  'taiwan-elder-care': ['elderSubsidy2026','taoyuanBeds','taipeiBeds','taichungBeds','yilanBeds','newTaipeiFacilities'],
}
