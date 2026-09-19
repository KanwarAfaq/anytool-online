import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard(){
 const [user,setUser]=useState(undefined),[favorites,setFavorites]=useState([])
 useEffect(()=>{if(!supabase){setUser(null);return}supabase.auth.getUser().then(async({data})=>{setUser(data.user||null);if(data.user){const {data:f}=await supabase.from('favorites').select('tool_slug').eq('user_id',data.user.id);setFavorites(f||[])}})},[])
 if(user===undefined)return <div className="mx-auto max-w-4xl px-4 py-20">Loading…</div>
 if(!user)return <div className="mx-auto max-w-4xl px-4 py-20"><div className="card p-6"><h1 className="text-2xl font-black">Your dashboard</h1><p className="mt-2 text-slate-400">Sign in to sync favorites and usage history.</p><Link to="/auth" className="btn-primary mt-5">Sign in</Link></div></div>
 return <div className="mx-auto max-w-4xl px-4 py-20"><div className="card p-6"><h1 className="text-2xl font-black">Your dashboard</h1><p className="mt-2 text-slate-400">{user.email}</p><h2 className="mt-8 font-bold">Favorites</h2><div className="mt-3 flex flex-wrap gap-2">{favorites.length?favorites.map(f=><Link className="btn-ghost" key={f.tool_slug} to={'/tools/'+f.tool_slug}>{f.tool_slug}</Link>):<p className="text-sm text-slate-500">No favorites yet.</p>}</div><button className="btn-ghost mt-8" onClick={()=>supabase.auth.signOut().then(()=>location.reload())}>Sign out</button></div></div>
}
