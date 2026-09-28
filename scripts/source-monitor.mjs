import { writeFile } from 'node:fs/promises'
import { officialSources, toolSourceKeys } from '../src/data/officialSources.js'

const sources=[
 {key:'mol-minimum-wage-2026',urls:['https://www.mol.gov.tw/1607/28162/28166/28180/28182/28188/29025/'],terms:['29,500','196']},
 {key:'mol-overtime',urls:['https://www.mol.gov.tw/1607/28162/28166/28180/28182/28188/29026'],terms:['240']},
 {key:'bli-premium-rates',urls:['https://www.bli.gov.tw/en/0011816.html'],terms:['11.5%','1%']},
 {key:'bli-insured-salary-2026',urls:['https://www.bli.gov.tw/en/0013254.html'],terms:['2026.01.01']},
 {key:'bli-pension-2026',urls:['https://www.bli.gov.tw/en/0011273.html'],terms:['2026.01.01']},
 {key:'nhi-employee-2026',urls:['https://www.nhi.gov.tw/en/cp-19434-822cf-64-2.html','https://www.nhi.gov.tw/ch/cp-19418-9eefb-2576-1.html'],terms:['29,500','5.17'],tolerateUnavailable:true},
 {key:'tax-2026',urls:['https://www.ntbt.gov.tw/multiplehtml/1b82b380e1a34de9afd204d39b007db2'],terms:['610,000','1,380,000']},
 {key:'taoyuan-local-placement',urls:['https://sab.tycg.gov.tw/News_Content.aspx?n=7467&s=1469909'],terms:['10,000','24,000']},
 {key:'taipei-local-placement',urls:['https://dosw.gov.taipei/News_Content.aspx?n=91F35523B74F69AC&s=89EA6FBF24B14229&sms=87415A8B9CE81B16'],terms:['27,250','4,320']},
 {key:'newtaipei-local-placement',urls:['https://www.sw.ntpc.gov.tw/home.jsp?act=be4f48068b2b0031&dataserno=728f53ac071858fb40660640c83c033e&id=bd3ac04bd17eafde'],terms:['低收入戶','中低收入']},
 {key:'taichung-local-placement',urls:['https://www.society.taichung.gov.tw/461566/post'],terms:['21,000','10,000'],tolerateUnavailable:true},
 {key:'tainan-local-placement',urls:['https://people.tainan.gov.tw/News_Content.aspx?n=32047&s=7851694&sms=23729'],terms:['12,000','25,400']},
 {key:'national-nursing-homes',urls:['https://data.gov.tw/dataset/115950'],terms:['機構電話','一般護理之家']},
 {key:'ltc-service-map',urls:['https://1966.gov.tw/LTC/np-6449-207.html'],terms:['長照地理資訊地圖']},
 {key:'mohw-elder-subsidy-2026',urls:['https://www.mohw.gov.tw/cp-16-87895-1.html'],terms:['18萬元','1萬5,000元']},
 {key:'mohw-elder-subsidy-application-2026',urls:['https://www.mohw.gov.tw/cp-2704-87934-1.html'],terms:['9月14日','18萬元']},
 {key:'boca-passport-photo',urls:['https://www.boca.gov.tw/cp-25-4123-c2932-1.html'],terms:['35','45']},
 {key:'boca-digital-photo',urls:['https://epass.boca.gov.tw/cp-13-244-3fec5-1.html'],terms:['413','531','5MB']},
 {key:'ris-id-photo',urls:['https://www.ris.gov.tw/apply-idCardChange/app/aw0726/main?retrievalPath=%2Faw0726%2F','https://www.ris.gov.tw/documents/html/5/3/187.html'],terms:['413','531','5MB']},
 {key:'nia-arc-photo',urls:['https://www.immigration.gov.tw/5475/5478/141465/141469/367160/cp_news'],terms:['2-inch','National ID Card']},
 {key:'taoyuan-elder-beds',urls:['https://sab.tycg.gov.tw/News_Content.aspx?n=7376&s=1615287'],terms:['可收容床位']},
 {key:'taipei-vacancies',urls:['https://orgvacinqusys.gov.taipei/'],terms:['可申請床位'],tolerateUnavailable:true},
 {key:'taipei-public-nursing-open-beds',urls:['https://data.gov.tw/en/datasets/132458'],terms:['Number of open beds','Address','Phone number']},
 {key:'taichung-beds',urls:['https://societymap.taichung.gov.tw/SocietyMap/SocietyShelter/QuyShelter.aspx'],terms:['床'],tolerateUnavailable:true},
 {key:'yilan-beds',urls:['https://ltc.ilshb.gov.tw/'],terms:['長期照護'],tolerateUnavailable:true}
]

async function inspect(source){
 const attempts=[]
 for(const url of source.urls){
  const controller=new AbortController()
  const timeout=setTimeout(()=>controller.abort(),15000)
  try{
   const r=await fetch(url,{signal:controller.signal,headers:{
    'user-agent':'Mozilla/5.0 (compatible; AnyToolSourceMonitor/2.0; +https://www.anytool.online/sources)',
    'accept':'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
    'accept-language':'zh-TW,zh;q=0.9,en;q=0.8'
   }})
   const body=await r.text()
   const missing=source.terms.filter(t=>!body.includes(t))
   const attempt={url,status:r.status,missing,lastModified:r.headers.get('last-modified')||null}
   attempts.push(attempt)
   if(r.ok){
    if(!missing.length)return {key:source.key,url,status:r.status,ok:true,severity:'ok',missing:[],lastModified:attempt.lastModified,checkedAt:new Date().toISOString(),attempts}
    return {key:source.key,url,status:r.status,ok:false,severity:'error',missing,lastModified:attempt.lastModified,checkedAt:new Date().toISOString(),attempts,error:'Expected official markers changed or disappeared'}
   }
  }catch(e){
   attempts.push({url,status:0,error:e instanceof Error?e.message:String(e)})
  }finally{clearTimeout(timeout)}
 }
 const last=attempts.at(-1)||{}
 return {
  key:source.key,url:source.urls[0],status:last.status||0,ok:false,
  severity:source.tolerateUnavailable?'warning':'error',
  missing:source.terms,error:last.error||('HTTP '+(last.status||0)),
  checkedAt:new Date().toISOString(),attempts,
  note:source.tolerateUnavailable?'Official source is known to block or time out automated runners; keep manual freshness review active.':undefined
 }
}

const results=[]
for(const source of sources)results.push(await inspect(source))

const now=Date.now()
const stale=Object.entries(officialSources).map(([key,value])=>{
 const stamp=Date.parse(value.verified||'')
 const ageDays=Number.isFinite(stamp)?Math.floor((now-stamp)/86400000):9999
 return {key,verified:value.verified||null,ageDays,title:value.title}
}).filter(x=>x.ageDays>45)
const brokenMappings=Object.entries(toolSourceKeys).flatMap(([slug,keys])=>keys.filter(key=>!officialSources[key]).map(key=>({slug,key})))
const hardFailures=results.filter(x=>x.severity==='error')
const warnings=results.filter(x=>x.severity==='warning')
const report={
 generatedAt:new Date().toISOString(),
 summary:{passed:results.filter(x=>x.severity==='ok').length,warnings:warnings.length,hardFailures:hardFailures.length},
 results,
 registryFreshness:{maxAgeDays:45,stale,brokenMappings}
}
await writeFile('source-monitor-report.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
if(hardFailures.length||stale.length||brokenMappings.length){
 const reasons=[
  hardFailures.length?'authoritative source changed/unavailable: '+hardFailures.map(x=>x.key).join(', '):'',
  stale.length?'verification older than 45 days: '+stale.map(x=>x.key).join(', '):'',
  brokenMappings.length?'broken source mappings: '+brokenMappings.map(x=>x.slug+':'+x.key).join(', '):''
 ].filter(Boolean)
 console.error('Source monitor needs review: '+reasons.join(' | '))
 process.exitCode=2
}else{
 if(warnings.length)console.warn('Source monitor warnings (no evidence of rule changes): '+warnings.map(x=>x.key).join(', '))
 console.log('All authoritative source checks and freshness checks passed.')
}
