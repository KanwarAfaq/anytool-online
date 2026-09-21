import { useState } from 'react'
import Seo from '../components/Seo'
import { supabase } from '../lib/supabase'
import { useI18n } from '../i18n'

export default function Contact(){
 const {lang}=useI18n()
 const [form,setForm]=useState({name:'',email:'',subject:'General inquiry',message:'',website:''})
 const [status,setStatus]=useState('')
 const labels={
  en:{title:'Contact us',intro:'Report a calculation issue, source update, broken tool, partnership idea or accessibility problem.',name:'Name',email:'Email',subject:'Subject',message:'Message',send:'Send message',ok:'Thanks — your message was received.'},
  'zh-TW':{title:'聯絡我們',intro:'可回報計算錯誤、官方資料更新、工具故障、合作建議或無障礙問題。',name:'姓名',email:'電子郵件',subject:'主旨',message:'訊息',send:'送出',ok:'謝謝，我們已收到你的訊息。'},
  ar:{title:'اتصل بنا',intro:'أبلغ عن خطأ حسابي أو تحديث مصدر أو أداة معطلة أو فكرة شراكة أو مشكلة وصول.',name:'الاسم',email:'البريد الإلكتروني',subject:'الموضوع',message:'الرسالة',send:'إرسال',ok:'شكراً — تم استلام رسالتك.'},
  ur:{title:'رابطہ کریں',intro:'حساب کی خرابی، ماخذ اپ ڈیٹ، خراب ٹول، شراکت یا رسائی کے مسئلے کی اطلاع دیں۔',name:'نام',email:'ای میل',subject:'موضوع',message:'پیغام',send:'پیغام بھیجیں',ok:'شکریہ — آپ کا پیغام موصول ہوگیا۔'}
 }[lang]||null
 const L=labels||{}
 async function submit(e){
  e.preventDefault();setStatus('')
  if(form.website)return
  const {data:{user}}=await supabase.auth.getUser()
  const {error}=await supabase.from('contact_messages').insert({user_id:user?.id||null,name:form.name,email:form.email,subject:form.subject,message:form.message,locale:lang})
  if(error)setStatus(error.message);else{setStatus(L.ok);setForm({name:'',email:'',subject:'General inquiry',message:'',website:''})}
 }
 return <section className="mx-auto max-w-3xl px-4 py-16"><Seo title={(L.title||'Contact us')+' | AnyTool.online'} description={L.intro||''} canonical="https://anytool.online/contact"/><h1 className="text-4xl font-black">{L.title}</h1><p className="mt-4 text-slate-300">{L.intro}</p><form onSubmit={submit} className="card mt-8 space-y-4 p-6"><input tabIndex="-1" autoComplete="off" className="hidden" value={form.website} onChange={e=>setForm({...form,website:e.target.value})}/><label className="block"><span className="mb-1.5 block text-sm text-slate-400">{L.name}</span><input required className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label className="block"><span className="mb-1.5 block text-sm text-slate-400">{L.email}</span><input required type="email" className="input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label className="block"><span className="mb-1.5 block text-sm text-slate-400">{L.subject}</span><input required className="input" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/></label><label className="block"><span className="mb-1.5 block text-sm text-slate-400">{L.message}</span><textarea required minLength="5" maxLength="5000" className="input min-h-40" value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/></label><button className="btn-primary">{L.send}</button>{status&&<p role="status" aria-live="polite" className="status-message text-sm text-emerald-300">{status}</p>}</form></section>
}
