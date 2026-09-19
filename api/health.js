const SUPABASE_URL='https://dbetjwgrchhgqkjjrubl.supabase.co'

export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'})
  let supabase=false
  try{
    const r=await fetch(SUPABASE_URL+'/auth/v1/health',{method:'GET'})
    supabase=r.ok
  }catch{}

  return res.status(200).json({
    ok:true,
    app:'anytool-online',
    timestamp:new Date().toISOString(),
    services:{
      supabase,
      cloudinary:Boolean(process.env.CLOUDINARY_CLOUD_NAME&&process.env.CLOUDINARY_API_KEY&&process.env.CLOUDINARY_API_SECRET),
      gemini:Boolean(process.env.GEMINI_API_KEY),
      groq:Boolean(process.env.GROQ_API_KEY),
      nvidia:Boolean(process.env.NVIDIA_NIM_API_KEY),
      mistral:Boolean(process.env.MISTRAL_API_KEY),
      openrouter:Boolean(process.env.OPENROUTER_API_KEY)
    }
  })
}
