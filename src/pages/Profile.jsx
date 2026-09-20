import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { supabase } from '../lib/supabase'
import { useI18n } from '../i18n'
import { signedUpload } from '../lib/cloudinary'

const fields=['full_name','display_name','phone','city','country','occupation','bio','avatar_url']
export default function Profile(){
 const {pathFor}=useI18n()
 const [user,setUser]=useState(undefined)
 const [form,setForm]=useState(Object.fromEntries(fields.map(k=>[k,''])))
 const [status,setStatus]=useState(''),[uploading,setUploading]=useState(false)
 useEffect(()=>{(async()=>{
   const {data:{user}}=await supabase.auth.getUser();setUser(user||null)
   if(user){const {data}=await supabase.from('profiles').select('*').eq('id',user.id).maybeSingle();if(data)setForm(v=>({...v,...Object.fromEntries(fields.map(k=>[k,data[k]||'']))}))}
 })()},[])
 async function save(e){e.preventDefault();setStatus('Saving…');const {error}=await supabase.from('profiles').update({...form,updated_at:new Date().toISOString()}).eq('id',user.id);setStatus(error?error.message:'Profile saved.')}
 async function uploadAvatar(file){if(!file)return;try{setUploading(true);setStatus('Uploading photo…');const data=await signedUpload(file);setForm(v=>({...v,avatar_url:data.secure_url}));setStatus('Photo uploaded. Save profile to keep it.')}catch(e){setStatus(e.message)}finally{setUploading(false)}}
 if(user===undefined)return <><Seo title="Edit Profile | AnyTool.online" description="Manage your AnyTool profile and preferences." noindex/><div className="mx-auto max-w-4xl px-4 py-20 text-slate-400">Loading…</div></>
 if(!user)return <><Seo title="Edit Profile | AnyTool.online" description="Manage your AnyTool profile and preferences." noindex/><div className="mx-auto max-w-4xl px-4 py-20"><div className="card p-6"><h1 className="text-2xl font-black">Profile</h1><p className="mt-2 text-slate-400">Sign in to edit your profile.</p><Link className="btn-primary mt-5" to={pathFor('/auth')}>Sign in</Link></div></div></>
 return <section className="mx-auto max-w-4xl px-4 py-16"><Seo title="Edit Profile | AnyTool.online" description="Manage your AnyTool profile and preferences." noindex/><h1 className="text-3xl font-black">Edit profile</h1><p className="mt-2 text-slate-400">{user.email}</p><form onSubmit={save} className="card mt-7 grid gap-4 p-6 md:grid-cols-2">
  <div className="md:col-span-2 flex flex-wrap items-center gap-4 rounded-xl bg-white/5 p-4">{form.avatar_url?<img src={form.avatar_url} alt="" className="size-20 rounded-2xl object-cover"/>:<div className="grid size-20 place-items-center rounded-2xl bg-slate-800 text-2xl font-black">{(form.display_name||form.full_name||user.email||'?').slice(0,1).toUpperCase()}</div>}<div><p className="font-semibold">Profile photo</p><p className="mt-1 text-xs text-slate-500">JPG, PNG or WebP · max 20 MB</p><label className="btn-ghost mt-2 cursor-pointer">{uploading?'Uploading…':'Choose photo'}<input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={e=>uploadAvatar(e.target.files?.[0])}/></label></div></div>
  <label><span className="mb-1 block text-sm text-slate-400">Full name</span><input className="input" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></label>
  <label><span className="mb-1 block text-sm text-slate-400">Display name</span><input className="input" value={form.display_name} onChange={e=>setForm({...form,display_name:e.target.value})}/></label>
  <label><span className="mb-1 block text-sm text-slate-400">Phone</span><input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
  <label><span className="mb-1 block text-sm text-slate-400">City</span><input className="input" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></label>
  <label><span className="mb-1 block text-sm text-slate-400">Country</span><input className="input" value={form.country} onChange={e=>setForm({...form,country:e.target.value})}/></label>
  <label><span className="mb-1 block text-sm text-slate-400">Occupation</span><input className="input" value={form.occupation} onChange={e=>setForm({...form,occupation:e.target.value})}/></label>
  <label className="md:col-span-2"><span className="mb-1 block text-sm text-slate-400">Bio</span><textarea className="input min-h-28" maxLength="1000" value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})}/></label>
  <div className="md:col-span-2 flex flex-wrap items-center gap-3"><button className="btn-primary">Save profile</button><Link className="btn-ghost" to={pathFor('/auth')+'?mode=forgot'}>Reset password</Link>{status&&<span className="text-sm text-emerald-300">{status}</span>}</div>
 </form></section>
}
