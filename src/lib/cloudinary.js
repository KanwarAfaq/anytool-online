import { supabase } from './supabase'

export async function signedUpload(file,{persist=false}={}){
  if(!file) throw new Error('Choose a file first')
  if(file.size>20*1024*1024) throw new Error('File is too large. Maximum size is 20 MB.')

  const {data:{session}}=await supabase.auth.getSession()
  if(!session) throw new Error('Sign in first')

  const sign=await fetch('/api/cloudinary-sign',{
    method:'POST',
    headers:{
      'content-type':'application/json',
      'authorization':'Bearer '+session.access_token
    },
    body:JSON.stringify({})
  })
  if(!sign.ok){
    const err=await sign.json().catch(()=>({}))
    throw new Error(err.error||'Could not create upload signature')
  }

  const cfg=await sign.json()
  const fd=new FormData()
  fd.append('file',file)
  fd.append('api_key',cfg.apiKey)
  fd.append('timestamp',String(cfg.timestamp))
  fd.append('signature',cfg.signature)
  fd.append('folder',cfg.folder)

  const res=await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/auto/upload`,{method:'POST',body:fd})
  if(!res.ok){
    const err=await res.json().catch(()=>({}))
    throw new Error(err?.error?.message||'Upload failed')
  }
  const data=await res.json()

  const {error}=await supabase.from('uploads').insert({
    user_id:session.user.id,
    public_id:data.public_id,
    secure_url:data.secure_url,
    resource_type:data.resource_type,
    bytes:data.bytes||file.size,
    delete_after:persist?null:new Date(Date.now()+24*60*60*1000).toISOString()
  })

  data.history_saved=!error
  if(error) data.history_error=error.message
  return data
}
