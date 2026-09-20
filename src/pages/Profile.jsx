import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { supabase } from '../lib/supabase'
import { useI18n } from '../i18n'
import { signedUpload } from '../lib/cloudinary'

const fields=['full_name','display_name','phone','city','country','occupation','bio','avatar_url']

export default function Profile(){
 const {lang,pathFor}=useI18n()
 const copy={
  en:{title:'Edit profile',manage:'Manage your AnyTool profile and preferences.',loading:'Loading…',signin:'Sign in to edit your profile.',signinBtn:'Sign in',photo:'Profile photo',photoHint:'JPG, PNG or WebP · max 20 MB',choose:'Choose photo',uploading:'Uploading…',uploadingPhoto:'Uploading photo…',photoDone:'Photo uploaded. Save profile to keep it.',saving:'Saving…',saved:'Profile saved.',full:'Full name',display:'Display name',phone:'Phone',city:'City',country:'Country',occupation:'Occupation',bio:'Bio',save:'Save profile',reset:'Reset password',language:'Saved language'},
  'zh-TW':{title:'編輯個人資料',manage:'管理 AnyTool 個人資料與偏好設定。',loading:'載入中…',signin:'請登入後編輯個人資料。',signinBtn:'登入',photo:'個人照片',photoHint:'JPG、PNG 或 WebP · 最大 20 MB',choose:'選擇照片',uploading:'上傳中…',uploadingPhoto:'正在上傳照片…',photoDone:'照片已上傳，請儲存個人資料。',saving:'儲存中…',saved:'個人資料已儲存。',full:'姓名',display:'顯示名稱',phone:'電話',city:'城市',country:'國家／地區',occupation:'職業',bio:'簡介',save:'儲存個人資料',reset:'重設密碼',language:'儲存語言'},
  ar:{title:'تعديل الملف الشخصي',manage:'إدارة ملف AnyTool وتفضيلاتك.',loading:'جارٍ التحميل…',signin:'سجّل الدخول لتعديل ملفك.',signinBtn:'تسجيل الدخول',photo:'صورة الملف',photoHint:'JPG أو PNG أو WebP · بحد أقصى 20 MB',choose:'اختر صورة',uploading:'جارٍ الرفع…',uploadingPhoto:'جارٍ رفع الصورة…',photoDone:'تم رفع الصورة. احفظ الملف للاحتفاظ بها.',saving:'جارٍ الحفظ…',saved:'تم حفظ الملف الشخصي.',full:'الاسم الكامل',display:'اسم العرض',phone:'الهاتف',city:'المدينة',country:'الدولة',occupation:'المهنة',bio:'نبذة',save:'حفظ الملف',reset:'إعادة تعيين كلمة المرور',language:'اللغة المحفوظة'},
  ur:{title:'پروفائل ایڈٹ کریں',manage:'اپنا AnyTool پروفائل اور ترجیحات منظم کریں۔',loading:'لوڈ ہو رہا ہے…',signin:'پروفائل ایڈٹ کرنے کے لیے سائن اِن کریں۔',signinBtn:'سائن اِن',photo:'پروفائل تصویر',photoHint:'JPG، PNG یا WebP · زیادہ سے زیادہ 20 MB',choose:'تصویر منتخب کریں',uploading:'اپ لوڈ ہو رہا ہے…',uploadingPhoto:'تصویر اپ لوڈ ہو رہی ہے…',photoDone:'تصویر اپ لوڈ ہوگئی۔ محفوظ رکھنے کے لیے پروفائل سیو کریں۔',saving:'محفوظ ہو رہا ہے…',saved:'پروفائل محفوظ ہوگیا۔',full:'پورا نام',display:'ڈسپلے نام',phone:'فون',city:'شہر',country:'ملک',occupation:'پیشہ',bio:'تعارف',save:'پروفائل محفوظ کریں',reset:'پاس ورڈ ری سیٹ کریں',language:'محفوظ زبان'}
 }[lang]||null
 const L=copy||{}
 const [user,setUser]=useState(undefined)
 const [form,setForm]=useState(Object.fromEntries(fields.map(k=>[k,''])))
 const [status,setStatus]=useState(''),[uploading,setUploading]=useState(false)
 useEffect(()=>{(async()=>{
   const {data:{user}}=await supabase.auth.getUser();setUser(user||null)
   if(user){const {data}=await supabase.from('profiles').select('*').eq('id',user.id).maybeSingle();if(data)setForm(v=>({...v,...Object.fromEntries(fields.map(k=>[k,data[k]||'']))}))}
 })()},[])
 async function save(e){
   e.preventDefault();setStatus(L.saving)
   const {error}=await supabase.from('profiles').update({...form,locale:lang,updated_at:new Date().toISOString()}).eq('id',user.id)
   setStatus(error?error.message:L.saved)
 }
 async function uploadAvatar(file){
   if(!file)return
   try{setUploading(true);setStatus(L.uploadingPhoto);const data=await signedUpload(file);setForm(v=>({...v,avatar_url:data.secure_url}));setStatus(L.photoDone)}
   catch(e){setStatus(e.message)}finally{setUploading(false)}
 }
 if(user===undefined)return <><Seo title={L.title+' | AnyTool.online'} description={L.manage} noindex/><div className="mx-auto max-w-4xl px-4 py-20 text-slate-400">{L.loading}</div></>
 if(!user)return <><Seo title={L.title+' | AnyTool.online'} description={L.manage} noindex/><div className="mx-auto max-w-4xl px-4 py-20"><div className="card p-6"><h1 className="text-2xl font-black">{L.title}</h1><p className="mt-2 text-slate-400">{L.signin}</p><Link className="btn-primary mt-5" to={pathFor('/auth')}>{L.signinBtn}</Link></div></div></>
 return <section className="mx-auto max-w-4xl px-4 py-16"><Seo title={L.title+' | AnyTool.online'} description={L.manage} noindex/><h1 className="text-3xl font-black">{L.title}</h1><p className="mt-2 text-slate-400">{user.email}</p><form onSubmit={save} className="card mt-7 grid gap-4 p-6 md:grid-cols-2">
  <div className="md:col-span-2 flex flex-wrap items-center gap-4 rounded-xl bg-white/5 p-4">{form.avatar_url?<img src={form.avatar_url} alt="" className="size-20 rounded-2xl object-cover"/>:<div className="grid size-20 place-items-center rounded-2xl bg-slate-800 text-2xl font-black">{(form.display_name||form.full_name||user.email||'?').slice(0,1).toUpperCase()}</div>}<div><p className="font-semibold">{L.photo}</p><p className="mt-1 text-xs text-slate-500">{L.photoHint}</p><label className="btn-ghost mt-2 cursor-pointer">{uploading?L.uploading:L.choose}<input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={e=>uploadAvatar(e.target.files?.[0])}/></label></div></div>
  <label><span className="mb-1 block text-sm text-slate-400">{L.full}</span><input className="input" autoComplete="name" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></label>
  <label><span className="mb-1 block text-sm text-slate-400">{L.display}</span><input className="input" value={form.display_name} onChange={e=>setForm({...form,display_name:e.target.value})}/></label>
  <label><span className="mb-1 block text-sm text-slate-400">{L.phone}</span><input className="input" autoComplete="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
  <label><span className="mb-1 block text-sm text-slate-400">{L.city}</span><input className="input" autoComplete="address-level2" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></label>
  <label><span className="mb-1 block text-sm text-slate-400">{L.country}</span><input className="input" autoComplete="country-name" value={form.country} onChange={e=>setForm({...form,country:e.target.value})}/></label>
  <label><span className="mb-1 block text-sm text-slate-400">{L.occupation}</span><input className="input" value={form.occupation} onChange={e=>setForm({...form,occupation:e.target.value})}/></label>
  <label className="md:col-span-2"><span className="mb-1 block text-sm text-slate-400">{L.bio}</span><textarea className="input min-h-28" maxLength="1000" value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})}/></label>
  <div className="md:col-span-2 flex flex-wrap items-center gap-3"><button className="btn-primary">{L.save}</button><Link className="btn-ghost" to={pathFor('/auth')+'?mode=forgot'}>{L.reset}</Link><span className="rounded-full bg-white/5 px-3 py-2 text-xs text-slate-400">{L.language}: {lang}</span>{status&&<span className="text-sm text-emerald-300">{status}</span>}</div>
 </form></section>
}
