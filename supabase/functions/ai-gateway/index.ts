import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const cors={
  "Access-Control-Allow-Origin":"https://anytool.online",
  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
  "Content-Type":"application/json"
}

const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors})

async function gemini(task:string,image:any){
  const key=Deno.env.get("GEMINI_API_KEY"); if(!key) throw new Error("Gemini unavailable")
  const model=Deno.env.get("GEMINI_MODEL")||"gemini-2.5-flash"
  const prompt=task==="receipt-to-json"
    ?"Extract this receipt into strict JSON with merchant,date,currency,total,tax and items. Return JSON only."
    :"Extract all visible text faithfully. Preserve reading order."
  const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,{
    method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({contents:[{parts:[{text:prompt},{inline_data:{mime_type:image.mime,data:image.base64}}]}]})
  })
  if(!res.ok) throw new Error("Gemini request failed")
  const d=await res.json(); return {provider:"gemini",model,output:d?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text||"").join("")||""}
}

async function mistral(task:string,image:any){
  const key=Deno.env.get("MISTRAL_API_KEY"); if(!key) throw new Error("Mistral unavailable")
  const model=Deno.env.get("MISTRAL_VISION_MODEL")||"pixtral-large-latest"
  const prompt=task==="receipt-to-json"?"Return strict JSON for this receipt: merchant,date,currency,total,tax,items.":"Extract all visible text faithfully."
  const url=`data:${image.mime};base64,${image.base64}`
  const res=await fetch("https://api.mistral.ai/v1/chat/completions",{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${key}`},body:JSON.stringify({model,messages:[{role:"user",content:[{type:"text",text:prompt},{type:"image_url",image_url:url}]}]})})
  if(!res.ok) throw new Error("Mistral request failed")
  const d=await res.json();return {provider:"mistral",model,output:d?.choices?.[0]?.message?.content||""}
}

async function openrouter(task:string,image:any){
  const key=Deno.env.get("OPENROUTER_API_KEY"); if(!key) throw new Error("OpenRouter unavailable")
  const model=Deno.env.get("OPENROUTER_VISION_MODEL")||"google/gemini-2.5-flash"
  const prompt=task==="receipt-to-json"?"Return strict JSON for this receipt: merchant,date,currency,total,tax,items.":"Extract all visible text faithfully."
  const url=`data:${image.mime};base64,${image.base64}`
  const res=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${key}`,"HTTP-Referer":"https://anytool.online","X-Title":"AnyTool.online"},body:JSON.stringify({model,messages:[{role:"user",content:[{type:"text",text:prompt},{type:"image_url",image_url:{url}}]}]})})
  if(!res.ok) throw new Error("OpenRouter request failed")
  const d=await res.json();return {provider:"openrouter",model,output:d?.choices?.[0]?.message?.content||""}
}

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:cors})
  if(req.method!=="POST") return json({error:"Method not allowed"},405)
  try{
    const auth=req.headers.get("Authorization")||""
    const supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:auth}}})
    const {data:{user}}=await supabase.auth.getUser()
    if(!user) return json({error:"Sign in required"},401)
    const {task,image}=await req.json()
    if(!["ocr","receipt-to-json"].includes(task)||!image?.base64||!image?.mime) return json({error:"Invalid request"},400)
    const attempts=[gemini,mistral,openrouter];let last=""
    for(const run of attempts){
      try{
        const result=await run(task,image)
        const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)
        await admin.from("ai_usage").insert({user_id:user.id,task,provider:result.provider,model:result.model,status:"success"})
        return json(result)
      }catch(e){last=e instanceof Error?e.message:String(e)}
    }
    return json({error:"All AI providers failed",detail:last},503)
  }catch(e){return json({error:e instanceof Error?e.message:"Unexpected error"},500)}
})
