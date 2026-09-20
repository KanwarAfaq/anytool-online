import { useState } from 'react'
import { ExternalLink, Send, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useI18n } from '../i18n'

const topicFor=slug=>slug==='taiwan-id-photo'?'photo':slug==='taiwan-elder-care'?'elderly':['take-home-pay','labor-insurance','nhi','income-tax','overtime-pay','minimum-wage','employer-cost'].includes(slug)?'salary':null

export default function OfficialAssistant({slug}){
 const {lang,pathFor}=useI18n()
 const topic=topicFor(slug)
 const [question,setQuestion]=useState(''),[status,setStatus]=useState(''),[answer,setAnswer]=useState(''),[sources,setSources]=useState([])
 if(!topic)return null
 const L={
  en:{title:'Ask the official-source assistant',desc:'Answers are grounded only in current pages from the responsible Taiwan government authorities.',placeholder:'Example: Who qualifies, what is the current amount, or what photo rule applies?',ask:'Ask',signin:'Sign in to use the source-backed assistant.',working:'Checking official sources…',note:'AI can still misunderstand text. Open the cited government links for the controlling rule.'},
  'zh-TW':{title:'詢問官方來源助理',desc:'回答僅依據台灣主管機關目前公開頁面。',placeholder:'例如：誰符合資格？目前補助多少？證件照規格是什麼？',ask:'詢問',signin:'請先登入使用官方來源助理。',working:'正在查核官方來源…',note:'AI 仍可能誤解文字；正式規定請以引用的政府頁面為準。'},
  ar:{title:'اسأل مساعد المصادر الرسمية',desc:'الإجابات مبنية فقط على صفحات الجهات الحكومية التايوانية المسؤولة.',placeholder:'مثال: من المؤهل؟ ما المبلغ الحالي؟ ما قاعدة الصورة؟',ask:'اسأل',signin:'سجّل الدخول لاستخدام مساعد المصادر.',working:'جارٍ فحص المصادر الرسمية…',note:'قد يسيء AI فهم النص؛ ارجع إلى الروابط الحكومية المذكورة للحكم النهائي.'},
  ur:{title:'سرکاری ماخذ اسسٹنٹ سے پوچھیں',desc:'جوابات صرف متعلقہ تائیوان سرکاری اداروں کے موجودہ صفحات پر مبنی ہیں۔',placeholder:'مثال: کون اہل ہے؟ موجودہ رقم کیا ہے؟ فوٹو کا کون سا اصول لاگو ہوتا ہے؟',ask:'پوچھیں',signin:'ماخذ پر مبنی اسسٹنٹ استعمال کرنے کے لیے سائن اِن کریں۔',working:'سرکاری ذرائع چیک کیے جا رہے ہیں…',note:'AI متن غلط سمجھ سکتا ہے؛ حتمی اصول کے لیے حوالہ دیے گئے سرکاری لنکس کھولیں۔'}
 }[lang]||null
 async function ask(e){
  e.preventDefault();setStatus('');setAnswer('');setSources([])
  const {data:{session}}=await supabase.auth.getSession()
  if(!session){setStatus(L.signin);return}
  setStatus(L.working)
  const r=await fetch('/api/source-assistant',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+session.access_token},body:JSON.stringify({topic,question,locale:lang})})
  const d=await r.json();setStatus('')
  if(!r.ok){setStatus(d.error||'Request failed');return}
  setAnswer(d.answer||'');setSources(d.sources||[])
 }
 return <section className="mt-7 rounded-2xl border border-sky-300/15 bg-sky-300/[0.035] p-5">
  <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-sky-300"/><h2 className="font-bold">{L.title}</h2></div>
  <p className="mt-2 text-sm leading-6 text-slate-400">{L.desc}</p>
  <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={ask}><input className="input flex-1" required maxLength="700" value={question} onChange={e=>setQuestion(e.target.value)} placeholder={L.placeholder}/><button className="btn-primary shrink-0"><Send className="me-2" size={15}/>{L.ask}</button></form>
  {status&&<p className="mt-3 text-sm text-amber-200">{status}</p>}
  {answer&&<div className="mt-4 rounded-xl bg-slate-950/50 p-4"><div dir="auto" className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{answer}</div>{!!sources.length&&<div className="mt-4 grid gap-2">{sources.map(s=><a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="text-xs text-emerald-300 hover:underline">[{s.id}] {s.title} <ExternalLink className="inline" size={11}/></a>)}</div>}<p className="mt-4 text-xs leading-5 text-slate-500">{L.note}</p></div>}
 </section>
}
