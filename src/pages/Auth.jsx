import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useI18n } from '../i18n'

export default function AuthPage(){
 const {t}=useI18n()
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[mode,setMode]=useState('signin'),[msg,setMsg]=useState('')
 const [done,setDone]=useState(false)
 async function submit(e){e.preventDefault();setMsg('')
  const fn=mode==='signin'?supabase.auth.signInWithPassword({email,password}):supabase.auth.signUp({email,password})
  const {error}=await fn
  if(error)setMsg(error.message);else if(mode==='signin')setDone(true);else setMsg(t('checkEmail'))
 }
 if(done)return <Navigate to="/dashboard" replace/>
 return <section className="mx-auto max-w-md px-4 py-20"><div className="card p-6"><h1 className="text-2xl font-black">{mode==='signin'?t('signIn'):t('createAccount')}</h1><form onSubmit={submit} className="mt-6 space-y-4"><input className="input" type="email" required placeholder={t('email')} value={email} onChange={e=>setEmail(e.target.value)}/><input className="input" type="password" required minLength={8} placeholder={t('password')} value={password} onChange={e=>setPassword(e.target.value)}/><button className="btn-primary w-full">{mode==='signin'?t('signIn'):t('signUp')}</button></form>{msg&&<p className="mt-4 text-sm text-amber-300">{msg}</p>}<button className="mt-4 text-sm text-emerald-300" onClick={()=>setMode(mode==='signin'?'signup':'signin')}>{mode==='signin'?t('needAccount'):t('haveAccount')}</button></div></section>
}
