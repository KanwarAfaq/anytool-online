import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useI18n } from '../i18n'
import Seo from '../components/Seo'

export default function AuthPage(){
 const {t,lang,pathFor}=useI18n()
 const [params]=useSearchParams()
 const initial=params.get('mode')||'signin'
 const [mode,setMode]=useState(initial),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[otp,setOtp]=useState(''),[msg,setMsg]=useState(''),[done,setDone]=useState(false)
 const extra={
  en:{otp:'Email OTP',sendOtp:'Send one-time code',verifyOtp:'Verify code',forgot:'Forgot password?',reset:'Reset password',newPassword:'New password',back:'Back to sign in',otpNote:'We will email a 6-digit one-time code. Enter it below to sign in.',forgotNote:'We will email a secure password-reset link.'},
  'zh-TW':{otp:'電子郵件 OTP',sendOtp:'寄送一次性驗證碼',verifyOtp:'驗證代碼',forgot:'忘記密碼？',reset:'重設密碼',newPassword:'新密碼',back:'返回登入',otpNote:'系統會寄送 6 位數一次性驗證碼，請在下方輸入即可登入。',forgotNote:'系統會寄送安全的密碼重設連結。'},
  ar:{otp:'رمز بريد لمرة واحدة',sendOtp:'إرسال رمز لمرة واحدة',verifyOtp:'تحقق من الرمز',forgot:'نسيت كلمة المرور؟',reset:'إعادة تعيين كلمة المرور',newPassword:'كلمة مرور جديدة',back:'العودة لتسجيل الدخول',otpNote:'سنرسل رمز تسجيل دخول من 6 أرقام إلى بريدك. أدخله أدناه لتسجيل الدخول.',forgotNote:'سنرسل رابطاً آمناً لإعادة تعيين كلمة المرور.'},
  ur:{otp:'ای میل OTP',sendOtp:'ایک بار استعمال ہونے والا کوڈ بھیجیں',verifyOtp:'کوڈ کی تصدیق',forgot:'پاس ورڈ بھول گئے؟',reset:'پاس ورڈ ری سیٹ',newPassword:'نیا پاس ورڈ',back:'سائن اِن پر واپس',otpNote:'ہم آپ کے ای میل پر 6 ہندسوں کا ایک بار استعمال ہونے والا کوڈ بھیجیں گے۔ سائن اِن کے لیے اسے نیچے درج کریں۔',forgotNote:'ہم محفوظ پاس ورڈ ری سیٹ لنک ای میل کریں گے۔'}
 }[lang]||null
 const L=extra||{}
 useEffect(()=>{setMode(params.get('mode')||'signin')},[params.toString()])

 async function passwordSubmit(e){
  e.preventDefault();setMsg('')
  if(mode==='reset'){
    const {error}=await supabase.auth.updateUser({password})
    setMsg(error?error.message:'Password updated.');if(!error)setMode('signin');return
  }
  const result=mode==='signin'
    ? await supabase.auth.signInWithPassword({email,password})
    : await supabase.auth.signUp({email,password,options:{emailRedirectTo:location.origin+pathFor('/dashboard')}})
  if(result.error)setMsg(result.error.message)
  else if(mode==='signin')setDone(true)
  else setMsg(t('checkEmail'))
 }

 async function sendOtp(e){
  e.preventDefault();setMsg('')
  const {error}=await supabase.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:location.origin+pathFor('/dashboard')}})
  setMsg(error?error.message:'A 6-digit sign-in code was sent to your email.')
 }
 async function verifyOtp(e){
  e.preventDefault();setMsg('')
  const {error}=await supabase.auth.verifyOtp({email,token:otp,type:'email'})
  if(error)setMsg(error.message);else setDone(true)
 }
 async function forgot(e){
  e.preventDefault();setMsg('')
  const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:location.origin+pathFor('/auth')+'?mode=reset'})
  setMsg(error?error.message:'Password reset email sent.')
 }

 if(done)return <Navigate to={pathFor('/dashboard')} replace/>
 const title=mode==='signin'?t('signIn'):mode==='signup'?t('createAccount'):mode==='otp'?L.otp:L.reset
 return <section className="mx-auto max-w-md px-4 py-16"><Seo title={title+' | AnyTool.online'} description="Secure AnyTool account access with password, email OTP and password recovery." noindex/><div className="card p-6"><h1 className="text-2xl font-black">{title}</h1>
  {(mode==='signin'||mode==='signup'||mode==='reset')&&<form onSubmit={passwordSubmit} className="mt-6 space-y-4">
    {mode!=='reset'&&<input className="input" type="email" required placeholder={t('email')} value={email} onChange={e=>setEmail(e.target.value)}/>}
    <input className="input" type="password" required minLength={8} placeholder={mode==='reset'?L.newPassword:t('password')} value={password} onChange={e=>setPassword(e.target.value)}/>
    <button className="btn-primary w-full">{mode==='signin'?t('signIn'):mode==='signup'?t('signUp'):L.reset}</button>
  </form>}
  {mode==='otp'&&<><p className="mt-3 text-sm leading-6 text-slate-400">{L.otpNote}</p><form onSubmit={sendOtp} className="mt-4 flex gap-2"><input className="input" type="email" required placeholder={t('email')} value={email} onChange={e=>setEmail(e.target.value)}/><button className="btn-primary shrink-0">{L.sendOtp}</button></form><form onSubmit={verifyOtp} className="mt-3 flex gap-2"><input className="input" inputMode="numeric" pattern="[0-9]{6}" placeholder="123456" minLength={6} maxLength={6} required autoComplete="one-time-code" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}/><button className="btn-ghost shrink-0" disabled={otp.length!==6}>{L.verifyOtp}</button></form></>}
  {mode==='forgot'&&<><p className="mt-3 text-sm text-slate-400">{L.forgotNote}</p><form onSubmit={forgot} className="mt-4 space-y-4"><input className="input" type="email" required placeholder={t('email')} value={email} onChange={e=>setEmail(e.target.value)}/><button className="btn-primary w-full">{L.reset}</button></form></>}
  {msg&&<p className="mt-4 rounded-xl bg-white/5 p-3 text-sm text-amber-200">{msg}</p>}
  <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-emerald-300">
   {mode==='signin'&&<><button onClick={()=>setMode('signup')}>{t('needAccount')}</button><button onClick={()=>setMode('otp')}>{L.otp}</button><button onClick={()=>setMode('forgot')}>{L.forgot}</button></>}
   {mode!=='signin'&&<button onClick={()=>setMode('signin')}>{L.back}</button>}
  </div>
 </div></section>
}
