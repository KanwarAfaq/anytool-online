const SUPABASE_URL='https://dbetjwgrchhgqkjjrubl.supabase.co'
const SUPABASE_PUBLISHABLE_KEY='sb_publishable__75ZE-c5sP98lIUaJLvVFQ_b92fOuwp'

function json(res,status,body){
  res.status(status).setHeader('content-type','application/json').setHeader('cache-control','no-store').json(body)
}

async function getUser(token){
  const r=await fetch(SUPABASE_URL+'/auth/v1/user',{headers:{apikey:SUPABASE_PUBLISHABLE_KEY,authorization:'Bearer '+token}})
  if(!r.ok)return null
  return r.json()
}

const promptFor=(task)=>task==='receipt-to-json'
  ? 'Extract this receipt into strict JSON only. Include merchant,date,currency,subtotal,tax,total,payment_method and items with name,quantity,unit_price,total. Do not invent missing values; use null.'
  : 'Extract all visible text faithfully. Preserve reading order and line breaks. Return only the extracted text.'

async function geminiVision(task,image){
  const key=process.env.GEMINI_API_KEY
  if(!key)throw new Error('Gemini not configured')
  const model=process.env.GEMINI_MODEL||'gemini-3.8-flash'
  const body={contents:[{parts:[{text:promptFor(task)},{inline_data:{mime_type:image.mime,data:image.base64}}]}]}
  if(task==='receipt-to-json') body.generationConfig={responseMimeType:'application/json'}
  const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent?key='+encodeURIComponent(key),{
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)
  })
  if(!r.ok)throw new Error('Gemini '+r.status)
  const d=await r.json()
  return {provider:'gemini',model,output:d?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||''}
}

async function geminiText(prompt){
  const key=process.env.GEMINI_API_KEY
  if(!key)throw new Error('Gemini not configured')
  const model=process.env.GEMINI_MODEL||'gemini-3.8-flash'
  const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent?key='+encodeURIComponent(key),{
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})
  })
  if(!r.ok)throw new Error('Gemini '+r.status)
  const d=await r.json()
  return {provider:'gemini',model,output:d?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||''}
}

async function openrouter(taskOrPrompt,image=null){
  const key=process.env.OPENROUTER_API_KEY
  if(!key)throw new Error('OpenRouter not configured')
  const model=process.env.OPENROUTER_MODEL||process.env.OPENROUTER_VISION_MODEL||'google/gemini-3.8-flash'
  const content=image
    ? [{type:'text',text:promptFor(taskOrPrompt)},{type:'image_url',image_url:{url:'data:'+image.mime+';base64,'+image.base64}}]
    : taskOrPrompt
  const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{
    method:'POST',
    headers:{'content-type':'application/json',authorization:'Bearer '+key,'HTTP-Referer':'https://anytool.online','X-Title':'AnyTool.online'},
    body:JSON.stringify({model,messages:[{role:'user',content}]})
  })
  if(!r.ok)throw new Error('OpenRouter '+r.status)
  const d=await r.json()
  return {provider:'openrouter',model,output:d?.choices?.[0]?.message?.content||''}
}

async function mistralVision(task,image){
  const key=process.env.MISTRAL_API_KEY
  if(!key)throw new Error('Mistral not configured')

  if(task==='ocr'||image.mime==='application/pdf'){
    const model=process.env.MISTRAL_OCR_MODEL||'mistral-ocr-latest'
    const type=image.mime==='application/pdf'?'document_url':'image_url'
    const field=image.mime==='application/pdf'?'document_url':'image_url'
    const document={type}
    document[field]='data:'+image.mime+';base64,'+image.base64
    const r=await fetch('https://api.mistral.ai/v1/ocr',{
      method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+key},
      body:JSON.stringify({model,document,include_blocks:false})
    })
    if(!r.ok)throw new Error('Mistral OCR '+r.status)
    const d=await r.json()
    const output=(d?.pages||[]).map(p=>p.markdown||'').join('\n\n')
    return {provider:'mistral',model,output}
  }

  const model=process.env.MISTRAL_VISION_MODEL||'ministral-14b-2512'
  const r=await fetch('https://api.mistral.ai/v1/chat/completions',{
    method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+key},
    body:JSON.stringify({model,messages:[{role:'user',content:[
      {type:'text',text:promptFor(task)},
      {type:'image_url',image_url:'data:'+image.mime+';base64,'+image.base64}
    ]}]})
  })
  if(!r.ok)throw new Error('Mistral '+r.status)
  const d=await r.json()
  return {provider:'mistral',model,output:d?.choices?.[0]?.message?.content||''}
}

async function mistralText(prompt){
  const key=process.env.MISTRAL_API_KEY
  if(!key)throw new Error('Mistral not configured')
  const model=process.env.MISTRAL_TEXT_MODEL||'mistral-small-latest'
  const r=await fetch('https://api.mistral.ai/v1/chat/completions',{
    method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+key},
    body:JSON.stringify({model,messages:[{role:'user',content:prompt}]})
  })
  if(!r.ok)throw new Error('Mistral '+r.status)
  const d=await r.json()
  return {provider:'mistral',model,output:d?.choices?.[0]?.message?.content||''}
}

async function groqText(prompt){
  const key=process.env.GROQ_API_KEY
  if(!key)throw new Error('Groq not configured')
  const model=process.env.GROQ_MODEL||'openai/gpt-oss-20b'
  const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
    method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+key},
    body:JSON.stringify({model,messages:[{role:'user',content:prompt}]})
  })
  if(!r.ok)throw new Error('Groq '+r.status)
  const d=await r.json()
  return {provider:'groq',model,output:d?.choices?.[0]?.message?.content||''}
}

async function nvidiaText(prompt){
  const key=process.env.NVIDIA_NIM_API_KEY
  if(!key)throw new Error('NVIDIA not configured')
  const model=process.env.NVIDIA_MODEL||'nvidia/nemotron-3-super-120b-a12b'
  const r=await fetch('https://integrate.api.nvidia.com/v1/chat/completions',{
    method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+key},
    body:JSON.stringify({model,messages:[{role:'user',content:prompt}],temperature:.5,top_p:1,max_tokens:2048})
  })
  if(!r.ok)throw new Error('NVIDIA '+r.status)
  const d=await r.json()
  return {provider:'nvidia',model,output:d?.choices?.[0]?.message?.content||''}
}

async function logUsage(token,userId,result,task,status='success'){
  try{
    const r=await fetch(SUPABASE_URL+'/rest/v1/ai_usage',{
      method:'POST',
      headers:{apikey:SUPABASE_PUBLISHABLE_KEY,authorization:'Bearer '+token,'content-type':'application/json',prefer:'return=minimal'},
      body:JSON.stringify({user_id:userId,task,provider:result?.provider||'none',model:result?.model||null,status})
    })
    return r.ok
  }catch{return false}
}

export default async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'})
  const auth=req.headers.authorization||''
  const token=auth.startsWith('Bearer ')?auth.slice(7):''
  if(!token)return json(res,401,{error:'Sign in required'})
  const user=await getUser(token)
  if(!user?.id)return json(res,401,{error:'Invalid session'})

  const {task,image,prompt}=req.body||{}
  if(task==='text'){
    const text=String(prompt||'').trim()
    if(!text)return json(res,400,{error:'Prompt required'})
    const runners=[
      ()=>groqText(text),
      ()=>nvidiaText(text),
      ()=>geminiText(text),
      ()=>mistralText(text),
      ()=>openrouter(text)
    ]
    let last=''
    for(const run of runners){
      try{
        const result=await run()
        result.usage_logged=await logUsage(token,user.id,result,task)
        return json(res,200,result)
      }catch(e){last=e instanceof Error?e.message:String(e)}
    }
    await logUsage(token,user.id,null,task,'failed')
    return json(res,503,{error:'All text AI providers failed',detail:last})
  }

  if(!['ocr','receipt-to-json'].includes(task)||!image?.base64||!image?.mime)return json(res,400,{error:'Invalid request'})
  if(image.base64.length>5_000_000)return json(res,413,{error:'File is too large. Please compress it first.'})

  const runners=[
    ()=>geminiVision(task,image),
    ()=>mistralVision(task,image),
    ()=>openrouter(task,image)
  ]
  let last=''
  for(const run of runners){
    try{
      const result=await run()
      result.usage_logged=await logUsage(token,user.id,result,task)
      return json(res,200,result)
    }catch(e){last=e instanceof Error?e.message:String(e)}
  }
  await logUsage(token,user.id,null,task,'failed')
  return json(res,503,{error:'All vision AI providers failed',detail:last})
}
