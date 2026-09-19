const SUPABASE_URL='https://dbetjwgrchhgqkjjrubl.supabase.co'
const SUPABASE_PUBLISHABLE_KEY='sb_publishable__75ZE-c5sP98lIUaJLvVFQ_b92fOuwp'

async function probe(url,options={},timeout=3500){
  const controller=new AbortController()
  const timer=setTimeout(()=>controller.abort(),timeout)
  try{
    const r=await fetch(url,{...options,signal:controller.signal})
    return r.ok
  }catch{return false}
  finally{clearTimeout(timer)}
}

export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'})

  const headers={apikey:SUPABASE_PUBLISHABLE_KEY}
  const [authOk,dbOk]=await Promise.all([
    probe(SUPABASE_URL+'/auth/v1/settings',{headers}),
    probe(SUPABASE_URL+'/rest/v1/profiles?select=id&limit=1',{headers})
  ])

  return res.status(200).json({
    ok:true,
    app:'anytool-online',
    timestamp:new Date().toISOString(),
    services:{
      supabase:authOk&&dbOk,
      supabase_auth:authOk,
      supabase_db:dbOk,
      cloudinary:Boolean(process.env.CLOUDINARY_CLOUD_NAME&&process.env.CLOUDINARY_API_KEY&&process.env.CLOUDINARY_API_SECRET),
      gemini:Boolean(process.env.GEMINI_API_KEY),
      groq:Boolean(process.env.GROQ_API_KEY),
      nvidia:Boolean(process.env.NVIDIA_NIM_API_KEY),
      mistral:Boolean(process.env.MISTRAL_API_KEY),
      openrouter:Boolean(process.env.OPENROUTER_API_KEY)
    }
  })
}
