const SITE='https://www.anytool.online'
const KEY='a7f0d3e9b2c14f688e5a91c3d7b4f260'
const KEY_URL=SITE+'/'+KEY+'.txt'
const sleep=ms=>new Promise(r=>setTimeout(r,ms))

async function waitForDeployment(){
 for(let attempt=1;attempt<=30;attempt++){
  try{
   const [keyRes,mapRes]=await Promise.all([
    fetch(KEY_URL,{cache:'no-store',headers:{'cache-control':'no-cache'}}),
    fetch(SITE+'/sitemap.xml',{cache:'no-store',headers:{'cache-control':'no-cache'}})
   ])
   const keyText=keyRes.ok?(await keyRes.text()).trim():''
   const mapText=mapRes.ok?await mapRes.text():''
   if(keyText===KEY&&mapText.includes('<urlset'))return mapText
  }catch{}
  if(attempt<30)await sleep(10000)
 }
 throw new Error('Final deployment did not expose the IndexNow key and sitemap in time')
}

const sitemap=await waitForDeployment()
const urls=[...new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1].replaceAll('&amp;','&')))]
if(!urls.length)throw new Error('No URLs found in sitemap')
if(urls.length>10000)throw new Error('IndexNow batch exceeds 10,000 URLs')
const response=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'content-type':'application/json; charset=utf-8','user-agent':'AnyTool-IndexNow/1.0'},body:JSON.stringify({host:new URL(SITE).host,key:KEY,keyLocation:KEY_URL,urlList:urls})})
if(![200,202].includes(response.status))throw new Error('IndexNow submission failed: '+response.status+' '+(await response.text()).slice(0,1000))
console.log('IndexNow accepted '+urls.length+' sitemap URLs with HTTP '+response.status)
