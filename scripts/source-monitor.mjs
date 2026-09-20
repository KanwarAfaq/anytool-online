import { writeFile } from 'node:fs/promises'

const sources=[
 {key:'mol-minimum-wage-2026',url:'https://www.mol.gov.tw/1607/28162/28166/28180/28182/28188/29025/',terms:['29,500','196']},
 {key:'mol-overtime',url:'https://www.mol.gov.tw/1607/28162/28166/28180/28182/28188/29026',terms:['240']},
 {key:'bli-premium-rates',url:'https://www.bli.gov.tw/en/0011816.html',terms:['11.5%','1%']},
 {key:'bli-insured-salary-2026',url:'https://www.bli.gov.tw/en/0013254.html',terms:['2026.01.01']},
 {key:'bli-pension-2026',url:'https://www.bli.gov.tw/en/0011273.html',terms:['2026.01.01']},
 {key:'nhi-employee-2026',url:'https://www.nhi.gov.tw/en/cp-19434-822cf-64-2.html',terms:['29,500','5.17']},
 {key:'tax-2026',url:'https://www.ntbt.gov.tw/multiplehtml/1b82b380e1a34de9afd204d39b007db2',terms:['610,000','1,380,000']},
 {key:'taoyuan-local-placement',url:'https://sab.tycg.gov.tw/News_Content.aspx?n=7467&s=1469909',terms:['10,000','24,000']},
 {key:'taipei-local-placement',url:'https://dosw.gov.taipei/News_Content.aspx?n=91F35523B74F69AC&s=89EA6FBF24B14229&sms=87415A8B9CE81B16',terms:['27,250','4,320']},
 {key:'newtaipei-local-placement',url:'https://www.sw.ntpc.gov.tw/home.jsp?act=be4f48068b2b0031&dataserno=728f53ac071858fb40660640c83c033e&id=203',terms:['低收入戶','中低收入']},
 {key:'taichung-local-placement',url:'https://www.society.taichung.gov.tw/461566/post',terms:['21,000','10,000']},
 {key:'tainan-local-placement',url:'https://people.tainan.gov.tw/News_Content.aspx?n=32047&s=7851694&sms=23729',terms:['12,000','25,400']},
 {key:'national-nursing-homes',url:'https://data.gov.tw/dataset/115950',terms:['機構電話','一般護理之家']},
 {key:'ltc-service-map',url:'https://1966.gov.tw/LTC/np-6449-207.html',terms:['長照地理資訊地圖']},
 {key:'mohw-elder-subsidy-2026',url:'https://www.mohw.gov.tw/cp-2704-87934-1.html',terms:['180','住宿式服務機構']},
 {key:'boca-passport-photo',url:'https://www.boca.gov.tw/fp-140-467-29b1d-2.html',terms:['35','45']},
 {key:'ris-id-photo',url:'https://www.ris.gov.tw/documents/html/5/3/187.html',terms:['413','531']},
 {key:'nia-arc-photo',url:'https://www.immigration.gov.tw/5475/5478/141465/141469/367160/cp_news',terms:['2-inch','National ID Card']},
 {key:'taoyuan-elder-beds',url:'https://sab.tycg.gov.tw/News_Content.aspx?n=7376&s=1615287',terms:['可收容床位']},
 {key:'taipei-vacancies',url:'https://orgvacinqusys.gov.taipei/',terms:[]},
 {key:'taipei-public-nursing-open-beds',url:'https://data.gov.tw/en/datasets/132458',terms:['Number of open beds','Address','Phone number']},
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
