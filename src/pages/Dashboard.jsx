import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { toolBySlug } from '../data/tools'
import { useI18n } from '../i18n'

export default function Dashboard(){
 const {t,toolName}=useI18n()
 const [user,setUser]=useState(undefined),[favorites,setFavorites]=useState([])
 useEffect(()=>{supabase.auth.getUser().then(async({data})=>{setUser(data.user||null);if(data.user){const {data:f}=await supabase.from('favorites').select('tool_slug').eq('user_id',data.user.id);setFavorites(f||[])}})},[])
 if(user===undefined)return <div className="mx-auto max-w-4xl px-4 py-20">{t('loading')}</div>
 if(!user)return <div className="mx-auto max-w-4xl px-4 py-20"><div className="card p-6"><h1 className="text-2xl font-black">{t('dashboard')}</h1><p className="mt-2 text-slate-400">{t('dashboardDesc')}</p><Link to="/auth" className="btn-primary mt-5">{t('signIn')}</Link></div></div>
 return <div className="mx-auto max-w-4xl px-4 py-20"><div className="card p-6"><h1 className="text-2xl font-black">{t('dashboard')}</h1><p className="mt-2 text-slate-400">{user.email}</p><h2 className="mt-8 font-bold">{t('favorites')}</h2><div className="mt-3 flex flex-wrap gap-2">{favorites.length?favorites.map(f=>{const tool=toolBySlug[f.tool_slug];return <Link className="btn-ghost" key={f.tool_slug} to={'/tools/'+f.tool_slug}>{tool?toolName(tool):f.tool_slug}</Link>}):<p className="text-sm text-slate-500">{t('noFavorites')}</p>}</div><button className="btn-ghost mt-8" onClick={()=>supabase.auth.signOut().then(()=>location.reload())}>{t('signOut')}</button></div></div>
}
