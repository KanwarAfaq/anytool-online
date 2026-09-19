import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthPage(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[mode,setMode]=useState('signin'),[msg,setMsg]=useState('')
 const [done,setDone]=useState(false)
 async function submit(e){e.preventDefault();setMsg('')
  if(!supabase){setMsg('Supabase is not configured yet.');return}
  const fn=mode==='signin'?supabase.auth.signInWithPassword({email,password}):supabase.auth.signUp({email,password})
  const {error}=await fn
  if(error)setMsg(error.message);else if(mode==='signin')setDone(true);else setMsg('Check your email to confirm your account.')
 }
 if(done)return <Navigate to="/dashboard" replace/>
 return <section className="mx-auto max-w-md px-4 py-20"><div className="card p-6"><h1 className="text-2xl font-black">{mode==='signin'?'Sign in':'Create account'}</h1><form onSubmit={submit} className="mt-6 space-y-4"><input className="input" type="email" required placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input className="input" type="password" required minLength={8} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/><button className="btn-primary w-full">{mode==='signin'?'Sign in':'Sign up'}</button></form>{msg&&<p className="mt-4 text-sm text-amber-300">{msg}</p>}<button className="mt-4 text-sm text-emerald-300" onClick={()=>setMode(mode==='signin'?'signup':'signin')}>{mode==='signin'?'Need an account? Sign up':'Already have an account? Sign in'}</button></div></section>
}
