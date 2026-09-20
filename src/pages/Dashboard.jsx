import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserRound, Heart, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { toolBySlug } from '../data/tools'
import { useI18n } from '../i18n'
import Seo from '../components/Seo'

export default function Dashboard(){
 const {t,toolName,pathFor}=useI18n()
 const [user,setUser]=useState(undefined),[favorites,setFavorites]=useState([]),[profile,setProfile]=useState(null)
 useEffect(()=>{supabase.auth.getUser().then(async({data})=>{
   setUser(data.user||null)
   if(data.user){
     const [{data:f},{data:p}]=await Promise.all([
       supabase.from('favorites').select('tool_slug').eq('user_id',data.user.id),
       supabase.from('profiles').select('display_name,full_name,city,country,occupation').eq('id',data.user.id).maybeSingle()
     ])
     setFavorites(f||[]);setProfile(p||null)
   }
 })},[])
 if(user===undefined)return <div className="mx-auto max-w-5xl px-4 py-20">{t('loading')}</div>
 if(!user)return <div className="mx-auto max-w-4xl px-4 py-20"><div className="card p-6"><h1 className="text-2xl font-black">{t('dashboard')}</h1><p className="mt-2 text-slate-400">{t('dashboardDesc')}</p><Link to={pathFor('/auth')} className="btn-primary mt-5">{t('signIn')}</Link></div></div>
 const name=profile?.display_name||profile?.full_name||user.email?.split('@')[0]||'User'
 return <section className="mx-auto max-w-5xl px-4 py-16"><Seo title="Account Dashboard | AnyTool.online" description="Manage your AnyTool profile, favorites and account access."/><div className="grid gap-5 md:grid-cols-[1fr_280px]">
  <div className="card p-6"><p className="text-sm text-emerald-300">Signed in</p><h1 className="mt-2 text-3xl font-black">{name}</h1><p className="mt-2 text-slate-400">{user.email}</p>{profile?.occupation&&<p className="mt-1 text-sm text-slate-500">{profile.occupation}{profile.city?' · '+profile.city:''}{profile.country?' · '+profile.country:''}</p>}<div className="mt-6 flex flex-wrap gap-3"><Link className="btn-primary" to={pathFor('/profile')}><UserRound className="me-2" size={16}/>Edit profile</Link><Link className="btn-ghost" to={pathFor('/auth')+'?mode=forgot'}><ShieldCheck className="me-2" size={16}/>Password & access</Link></div></div>
  <aside className="card p-6"><p className="text-sm text-slate-500">Saved tools</p><div className="mt-2 text-3xl font-black">{favorites.length}</div><button className="btn-ghost mt-5 w-full" onClick={()=>supabase.auth.signOut().then(()=>location.reload())}>{t('signOut')}</button></aside>
 </div>
 <div className="mt-6 card p-6"><div className="flex items-center gap-2"><Heart size={18} className="text-emerald-300"/><h2 className="font-bold">{t('favorites')}</h2></div><div className="mt-4 flex flex-wrap gap-2">{favorites.length?favorites.map(f=>{const tool=toolBySlug[f.tool_slug];return <Link className="btn-ghost" key={f.tool_slug} to={pathFor('/tools/'+f.tool_slug)}>{tool?toolName(tool):f.tool_slug}</Link>}):<p className="text-sm text-slate-500">{t('noFavorites')}</p>}</div></div>
 </section>
}
