import * as XLSX from 'xlsx'

const SOURCES={
  taoyuan:{
    page:'https://sab.tycg.gov.tw/News_Content.aspx?n=7376&s=1615287',
    label:'Taoyuan elderly welfare institution vacancies',
    kind:'Government-published vacancy attachment'
  },
  taipei:{
    page:'https://data.gov.tw/en/datasets/132458',
    file:'https://data.taipei/api/dataset/b20c5ea7-dcae-446b-8d85-574a2bb2c907/resource/ed438da1-9e3c-4ccd-86be-6eeb4b275259/download',
    label:'Taipei public nursing homes — open beds',
    kind:'Government open-bed dataset',
    sourceUpdated:'2026-07-14'
  }
}

const clean=s=>String(s??'').replace(/\s+/g,' ').trim()
const pick=(row,terms)=>{
  for(const [k,v] of Object.entries(row)){
    const key=clean(k).toLowerCase()
    if(terms.some(term=>key.includes(String(term).toLowerCase()))) return clean(v)
  }
  return ''
}
const numberOrText=v=>{
  const s=clean(v)
  if(!s)return ''
  const n=Number(s.replace(/,/g,'').match(/-?\d+(?:\.\d+)?/)?.[0])
  return Number.isFinite(n)?n:s
}
const rowsFromBuffer=buf=>{
  const workbook=XLSX.read(buf,{type:'buffer'})
  const sheet=workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet,{defval:'',raw:false})
}

async function getTaoyuanRows(){
  const source=SOURCES.taoyuan
  const page=await fetch(source.page,{headers:{'user-agent':'AnyTool/1.0 (+https://anytool.online)'}})
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
  const fileUrl=new URL(href,source.page).toString()
  const file=await fetch(fileUrl,{headers:{'user-agent':'AnyTool/1.0 (+https://anytool.online)'}})
  if(!file.ok) throw new Error('Official Taoyuan vacancy attachment is unavailable')
  const raw=rowsFromBuffer(Buffer.from(await file.arrayBuffer()))
  const rows=raw.map((row,i)=>({
    id:'ty-'+(i+1),
    name:pick(row,['機構名稱','名稱']),
    district:pick(row,['行政區','區域別','區']),
    address:pick(row,['地址']),
    phone:pick(row,['聯絡電話','電話']),
    extension:'',
    approvedBeds:numberOrText(pick(row,['核定床位','立案床位','核定總床位'])),
    availableBeds:numberOrText(pick(row,['可收容床位','可入住床位','空床'])),
    rating:pick(row,['評鑑','等第']),
    service:pick(row,['服務對象','收容對象']),
  })).filter(x=>x.name)
  return {rows,fileUrl,source}
}

async function getTaipeiRows(){
  const source=SOURCES.taipei
  const file=await fetch(source.file,{headers:{'user-agent':'AnyTool/1.0 (+https://anytool.online)'}})
  if(!file.ok) throw new Error('Official Taipei open-bed dataset is unavailable')
  const raw=rowsFromBuffer(Buffer.from(await file.arrayBuffer()))
  const rows=raw.map((row,i)=>({
    id:'tp-'+(i+1),
    name:pick(row,['機構名稱','organization name','organization']),
    district:pick(row,['行政區','區域別','region']),
    address:pick(row,['地址','address']),
    phone:pick(row,['電話','phone']),
    extension:pick(row,['分機','extension']),
    approvedBeds:'',
    availableBeds:numberOrText(pick(row,['開放床數','空床','open beds','number of open beds'])),
    rating:'',
    service:'Public nursing home',
  })).filter(x=>x.name)
  return {rows,fileUrl:source.file,source}
}

export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'})
  const city=String(req.query?.city||'taoyuan').toLowerCase()
  res.setHeader('cache-control','s-maxage=21600, stale-while-revalidate=86400')
  try{
    const data=city==='taoyuan'
      ? await getTaoyuanRows()
      : city==='taipei'
        ? await getTaipeiRows()
        : null
    if(!data) return res.status(400).json({error:'Integrated official bed data is currently available for Taoyuan and Taipei public nursing homes.'})
    return res.status(200).json({
      city:city==='taoyuan'?'Taoyuan':'Taipei',
      source:data.source.page,
      attachment:data.fileUrl,
      sourceLabel:data.source.label,
      dataKind:data.source.kind,
      sourceUpdated:data.source.sourceUpdated||null,
      fetchedAt:new Date().toISOString(),
      rows:data.rows
    })
  }catch(e){
    const source=SOURCES[city]?.page||SOURCES.taoyuan.page
    return res.status(502).json({error:e instanceof Error?e.message:'Could not load official facility data',source})
  }
}
