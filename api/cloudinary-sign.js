import crypto from 'node:crypto'

export default function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'})
  const cloudName=process.env.CLOUDINARY_CLOUD_NAME
  const apiKey=process.env.CLOUDINARY_API_KEY
  const secret=process.env.CLOUDINARY_API_SECRET
  if(!cloudName||!apiKey||!secret) return res.status(503).json({error:'Cloudinary is not configured'})
  const timestamp=Math.floor(Date.now()/1000)
  const folder='anytool-uploads'
  const toSign=`folder=${folder}&timestamp=${timestamp}${secret}`
  const signature=crypto.createHash('sha1').update(toSign).digest('hex')
  res.json({cloudName,apiKey,timestamp,folder,signature})
}
