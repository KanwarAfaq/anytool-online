export const officialSources = {
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
