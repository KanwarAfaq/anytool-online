import { writeFile } from 'node:fs/promises'
import { officialSources, toolSourceKeys } from '../src/data/officialSources.js'

const sources=[
 {key:'mol-minimum-wage-2026',urls:['https://www.mol.gov.tw/1607/28162/28166/28180/28182/28188/29025/'],terms:['29,500','196'],severity:'critical'},
 {key:'mol-overtime',urls:['https://www.mol.gov.tw/1607/28162/28166/28180/28182/28188/29026'],terms:['240'],severity:'critical'},
 {key:'bli-premium-rates',urls:['https://www.bli.gov.tw/en/0011816.html'],terms:['11.5%','1%'],severity:'critical'},
 {key:'bli-insured-salary-2026',urls:['https://www.bli.gov.tw/en/0013254.html'],terms:['2026.01.01'],severity:'critical'},
 {key:'bli-pension-2026',urls:['https://www.bli.gov.tw/en/0011273.html'],terms:['2026.01.01'],severity:'critical'},
 {key:'nhi-employee-2026',urls:['https://www.nhi.gov.tw/en/cp-19434-822cf-64-2.html','https://www.nhi.gov.tw/ch/cp-19416-685c7-2572-1.html'],terms:['29,500','5.17'],severity:'critical'},
 {key:'tax-2026',urls:['https://www.ntbt.gov.tw/multiplehtml/1b82b380e1a34de9afd204d39b007db2'],terms:['610,000','1,380,000'],severity:'critical'},
 {key:'taoyuan-local-placement',urls:['https://sab.tycg.gov.tw/News_Content.aspx?n=7467&s=1469909'],terms:['10,000','24,000'],severity:'critical'},
 {key:'taipei-local-placement',urls:['https://dosw.gov.taipei/News_Content.aspx?n=91F35523B74F69AC&s=89EA6FBF24B14229&sms=87415A8B9CE81B16'],terms:['27,250','4,320'],severity:'critical'},
 {key:'newtaipei-local-placement',urls:['https://www.sw.ntpc.gov.tw/home.jsp?act=be4f48068b2b0031&dataserno=728f53ac071858fb40660640c83c033e&id=bd3ac04bd17eafde'],terms:['低收入戶','中低收入'],severity:'critical'},
 {key:'taichung-local-placement',urls:['https://www.society.taichung.gov.tw/461566/post'],terms:['21,000','10,000'],severity:'critical'},
 {key:'tainan-local-placement',urls:['https://people.tainan.gov.tw/News_Content.aspx?n=32047&s=7851694&sms=23729'],terms:['12,000','25,400'],severity:'critical'},
 {key:'national-nursing-homes',urls:['https://data.gov.tw/dataset/115950'],terms:['機構電話','一般護理之家'],severity:'advisory'},
 {key:'ltc-service-map',urls:['https://1966.gov.tw/LTC/np-6449-207.html'],terms:['長照地理資訊地圖'],severity:'advisory'},
 {key:'mohw-elder-subsidy-2026',urls:['https://www.mohw.gov.tw/cp-16-87895-1.html'],terms:['18萬元','1萬5,000元'],severity:'critical'},
 {key:'mohw-elder-subsidy-application-2026',urls:['https://www.mohw.gov.tw/cp-2704-87934-1.html'],terms:['9月14日','18萬元'],severity:'critical'},
 {key:'boca-passport-photo',urls:['https://www.boca.gov.tw/cp-25-4123-c2932-1.html'],terms:['35','45'],severity:'critical'},
 {key:'boca-digital-photo',urls:['https://epass.boca.gov.tw/cp-13-244-3fec5-1.html'],terms:['413','531','5MB'],severity:'critical'},
 {key:'ris-id-photo',urls:['https://www.ris.gov.tw/apply-idCardChange/app/aw0726/main?retrievalPath=%2Faw0726%2F'],terms:['413','531','5MB'],severity:'critical'},
 {key:'nia-arc-photo',urls:['https://www.immigration.gov.tw/5475/5478/141465/141469/367160/cp_news'],terms:['2-inch','National ID Card'],severity:'critical'},
 {key:'taoyuan-elder-beds',urls:['https://sab.tycg.gov.tw/News_Content.aspx?n=7376&s=1615287'],terms:['可收容床位'],severity:'advisory'},
 {key:'taipei-vacancies',urls:['https://orgvacinqusys.gov.taipei/'],terms:[],severity:'advisory'},
 {key:'taipei-public-nursing-open-beds',urls:['https://data.gov.tw/en/datasets/132458'],terms:['Number of open beds','Address','Phone number'],severity:'advisory'},
 {key:'taichung-beds',urls:['https://societymap.taichung.gov.tw/SocietyMap/SocietyShelter/QuyShelter.aspx'],terms:['床'],severity:'advisory'},
 {key:'yilan-beds',urls:['https://ltc.ilshb.gov.tw/'],terms:['床位'],severity:'advisory'}
]

const headers={
 'user-agent':'Mozilla/5.0 (compatible; AnyTool-SourceMonitor/2.0; +https://www.anytool.online/sources)',
 'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
 'accept-language':'zh-TW,zh;q=0.9,en;q=0.8'
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms))

async function fetchAttempt(url){
 let last
 for(let attempt=1;attempt<=2;attempt++){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000)
  try{
   const r=await fetch(url,{signal:controller.signal,headers,redirect:'follow'})
   const body=await r.text()
   clearTimeout(timeout)
   return {url,status:r.status,ok:r.ok,body,lastModified:r.headers.get('last-modified')||null,attempt}
  }catch(e){
   clearTimeout(timeout)
   last={url,status:0,ok:false,body:'',error:e instanceof Error?e.message:String(e),attempt}
   if(attempt<2)await sleep(900)
  }
 }
 return last
}

async function checkSource(source){
 const attempts=[]
 let mismatch=null
 for(const url of source.urls){
  const a=await fetchAttempt(url)
  attempts.push({url:a.url,status:a.status,error:a.error||null,attempt:a.attempt})
  if(!a.ok)continue
  const missing=source.terms.filter(t=>!a.body.includes(t))
  if(!missing.length)return {key:source.key,url:a.url,severity:source.severity,outcome:'pass',status:a.status,ok:true,missing:[],lastModified:a.lastModified,attempts,checkedAt:new Date().toISOString()}
  mismatch={key:source.key,url:a.url,severity:source.severity,outcome:source.severity==='critical'?'failure':'warning',status:a.status,ok:false,missing,lastModified:a.lastModified,attempts,checkedAt:new Date().toISOString(),reason:'expected content marker missing'}
 }
 if(mismatch)return mismatch
 return {key:source.key,url:source.urls[0],severity:source.severity,outcome:'warning',status:attempts.at(-1)?.status||0,ok:false,missing:source.terms,attempts,checkedAt:new Date().toISOString(),reason:'source blocked or unavailable to automated monitoring'}
}

const results=[]
for(const source of sources)results.push(await checkSource(source))

const now=Date.now()
const stale=Object.entries(officialSources).map(([key,value])=>{
 const stamp=Date.parse(value.verified||'')
 const ageDays=Number.isFinite(stamp)?Math.floor((now-stamp)/86400000):9999
 return {key,verified:value.verified||null,ageDays,title:value.title}
}).filter(x=>x.ageDays>45)
const brokenMappings=Object.entries(toolSourceKeys).flatMap(([slug,keys])=>keys.filter(key=>!officialSources[key]).map(key=>({slug,key})))
const failures=results.filter(x=>x.outcome==='failure')
const warnings=results.filter(x=>x.outcome==='warning')
const report={generatedAt:new Date().toISOString(),summary:{passed:results.length-failures.length-warnings.length,warnings:warnings.length,failures:failures.length},results,registryFreshness:{maxAgeDays:45,stale,brokenMappings}}
await writeFile('source-monitor-report.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))

if(failures.length||stale.length||brokenMappings.length){
 const reasons=[
  failures.length?'confirmed content changes: '+failures.map(x=>x.key).join(', '):'',
  stale.length?'verification older than 45 days: '+stale.map(x=>x.key).join(', '):'',
  brokenMappings.length?'broken source mappings: '+brokenMappings.map(x=>x.slug+':'+x.key).join(', '):''
 ].filter(Boolean)
 console.error('Source monitor needs review: '+reasons.join(' | '))
 process.exitCode=2
}else{
 if(warnings.length)console.warn('Advisory monitor warnings (no formula/content change confirmed): '+warnings.map(x=>x.key).join(', '))
 console.log('All critical official-source content checks and registry checks passed.')
}
