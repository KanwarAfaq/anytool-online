import * as XLSX from 'xlsx'

const SOURCE_PAGE='https://sab.tycg.gov.tw/News_Content.aspx?n=7376&s=1615287'

const clean=s=>String(s??'').replace(/\s+/g,' ').trim()
const pick=(row,terms)=>{
  for(const [k,v] of Object.entries(row)){
    const key=clean(k)
    if(terms.some(term=>key.includes(term))) return clean(v)
  }
  return ''
}

async function getTaoyuanRows(){
  const page=await fetch(SOURCE_PAGE,{headers:{'user-agent':'AnyTool/1.0 (+https://anytool.online)'}})
  if(!page.ok) throw new Error('Official Taoyuan source page is unavailable')
  const html=await page.text()
  const matches=[...html.matchAll(/href=["']([^"']*Download\.ashx[^"']*)["'][^>]*>(?:[^<]*<[^>]+>)*\s*xls\b/ig)]
  let href=matches[0]?.[1]
  if(!href){
    const generic=[...html.matchAll(/href=["']([^"']*Download\.ashx[^"']*)["']/ig)].map(m=>m[1])
    href=generic.find(x=>/xls/i.test(x))||generic[0]
  }
  if(!href) throw new Error('Could not locate the official Taoyuan vacancy attachment')
  href=href.replaceAll('&amp;','&')
  const fileUrl=new URL(href,SOURCE_PAGE).toString()
  const file=await fetch(fileUrl,{headers:{'user-agent':'AnyTool/1.0 (+https://anytool.online)'}})
  if(!file.ok) throw new Error('Official Taoyuan vacancy attachment is unavailable')
  const buf=Buffer.from(await file.arrayBuffer())
  const workbook=XLSX.read(buf,{type:'buffer'})
  const sheet=workbook.Sheets[workbook.SheetNames[0]]
  const raw=XLSX.utils.sheet_to_json(sheet,{defval:'',raw:false})
  const rows=raw.map((row,i)=>({
    id:i+1,
    name:pick(row,['機構名稱','名稱']),
    district:pick(row,['行政區','區域別','區']),
    address:pick(row,['地址']),
    phone:pick(row,['聯絡電話','電話']),
    approvedBeds:pick(row,['核定床位','立案床位','核定總床位']),
    availableBeds:pick(row,['可收容床位','可入住床位','空床']),
    rating:pick(row,['評鑑','等第']),
    service:pick(row,['服務對象','收容對象']),
  })).filter(x=>x.name)
  return {rows,fileUrl}
}

export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'})
  const city=String(req.query?.city||'taoyuan').toLowerCase()
  res.setHeader('cache-control','s-maxage=21600, stale-while-revalidate=86400')
  try{
    if(city!=='taoyuan') return res.status(400).json({error:'Integrated vacancy data is currently available for Taoyuan only.'})
    const data=await getTaoyuanRows()
    return res.status(200).json({
      city:'Taoyuan',
      source:SOURCE_PAGE,
      attachment:data.fileUrl,
      fetchedAt:new Date().toISOString(),
      rows:data.rows
    })
  }catch(e){
    return res.status(502).json({error:e instanceof Error?e.message:'Could not load official facility data',source:SOURCE_PAGE})
  }
}
