import { writeFile } from 'node:fs/promises'

const sources=[
 {key:'mohw-elder-subsidy-2026',url:'https://www.mohw.gov.tw/cp-16-87934-1.html',terms:['180','住宿式服務機構']},
 {key:'boca-passport-photo',url:'https://www.boca.gov.tw/fp-140-467-29b1d-2.html',terms:['35','45']},
 {key:'ris-id-photo',url:'https://www.ris.gov.tw/documents/html/5/3/187.html',terms:['413','531']},
 {key:'nia-arc-photo',url:'https://www.immigration.gov.tw/5382/5385/7244/7250/7317/%E5%B1%85%E7%95%99/362168/',terms:['512KB']},
 {key:'taoyuan-elder-beds',url:'https://sab.tycg.gov.tw/News_Content.aspx?n=7376&s=1615287',terms:['可收容床位']},
 {key:'taipei-vacancies',url:'https://orgvacinqusys.gov.taipei/',terms:[]},
 {key:'taichung-beds',url:'https://societymap.taichung.gov.tw/SocietyMap/SocietyShelter/QuyShelter.aspx',terms:['床']},
 {key:'yilan-beds',url:'https://ltc.ilshb.gov.tw/',terms:['床位']}
]

const results=[]
for(const source of sources){
 const controller=new AbortController()
 const timeout=setTimeout(()=>controller.abort(),12000)
 try{
  const r=await fetch(source.url,{signal:controller.signal,headers:{'user-agent':'AnyTool-SourceMonitor/1.0 (+https://anytool.online)'}})
  const body=await r.text()
  const missing=source.terms.filter(t=>!body.includes(t))
  results.push({key:source.key,url:source.url,status:r.status,ok:r.ok&&!missing.length,missing,lastModified:r.headers.get('last-modified')||null,checkedAt:new Date().toISOString()})
 }catch(e){
  results.push({key:source.key,url:source.url,status:0,ok:false,missing:source.terms,error:e instanceof Error?e.message:String(e),checkedAt:new Date().toISOString()})
 }finally{clearTimeout(timeout)}
}
await writeFile('source-monitor-report.json',JSON.stringify({generatedAt:new Date().toISOString(),results},null,2))
const failed=results.filter(x=>!x.ok)
console.log(JSON.stringify(results,null,2))
if(failed.length){
 console.error('Source monitor needs review: '+failed.map(x=>x.key).join(', '))
 process.exitCode=2
}else console.log('All official source checks passed.')
