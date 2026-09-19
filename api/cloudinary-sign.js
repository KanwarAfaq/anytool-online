import crypto from 'node:crypto'

const SUPABASE_URL='https://dbetjwgrchhgqkjjrubl.supabase.co'
const SUPABASE_PUBLISHABLE_KEY='sb_publishable__75ZE-c5sP98lIUaJLvVFQ_b92fOuwp'

async function getUser(token){
  const r=await fetch(SUPABASE_URL+'/auth/v1/user',{headers:{apikey:SUPABASE_PUBLISHABLE_KEY,authorization:'Bearer '+token}})
  if(!r.ok)return null
  return r.json()
}

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'})
  const auth=req.headers.authorization||''
  const token=auth.startsWith('Bearer ')?auth.slice(7):''
  if(!token) return res.status(401).json({error:'Sign in required'})
  const user=await getUser(token)
  if(!user?.id) return res.status(401).json({error:'Invalid session'})

  const cloudName=process.env.CLOUDINARY_CLOUD_NAME
  const apiKey=process.env.CLOUDINARY_API_KEY
  const secret=process.env.CLOUDINARY_API_SECRET
  if(!cloudName||!apiKey||!secret) return res.status(503).json({error:'Cloudinary is not configured'})

  const timestamp=Math.floor(Date.now()/1000)
  const folder=`anytool-uploads/${user.id}`
  const toSign=`folder=${folder}&timestamp=${timestamp}${secret}`
  const signature=crypto.createHash('sha1').update(toSign).digest('hex')
  return res.status(200).json({cloudName,apiKey,timestamp,folder,signature})
}
