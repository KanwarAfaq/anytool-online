export async function signedUpload(file){
 const sign=await fetch('/api/cloudinary-sign',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({folder:'anytool-uploads'})})
 if(!sign.ok) throw new Error('Could not create upload signature')
 const cfg=await sign.json()
 const fd=new FormData()
 fd.append('file',file)
 fd.append('api_key',cfg.apiKey)
 fd.append('timestamp',String(cfg.timestamp))
 fd.append('signature',cfg.signature)
 fd.append('folder',cfg.folder)
 const res=await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/auto/upload`,{method:'POST',body:fd})
 if(!res.ok) throw new Error('Upload failed')
 return res.json()
}
