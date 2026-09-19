import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, Download } from 'lucide-react'
import { toolBySlug } from '../data/tools'
import Seo from '../components/Seo'
import { takeHome, laborInsurance, nhi, salaryTax, overtime, employerCost, money } from '../lib/calculators'
import { supabase, logToolEvent, saveFavorite } from '../lib/supabase'
import { signedUpload } from '../lib/cloudinary'
import { useI18n } from '../i18n'

const Num=({label,value,onChange,min=0,step=1})=><label className="block"><span className="mb-1.5 block text-sm text-slate-400">{label}</span><input className="input" type="number" min={min} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>
const Result=({label,value})=><div className="rounded-xl bg-white/5 p-3"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-lg font-black">{value}</div></div>

function MoneyTool({slug}){
 const {t}=useI18n()
 const [salary,setSalary]=useState(50000),[deps,setDeps]=useState(0),[weekday,setWeekday]=useState(2),[rest,setRest]=useState(0),[months,setMonths]=useState(13)
 let rows=[]
 if(slug==='take-home-pay'){const r=takeHome(salary,deps);rows=[[t('estimatedNet'),'NT$ '+money(r.net)],[t('laborEmployment'),'NT$ '+money(r.labor+r.employment)],['NHI','NT$ '+money(r.nhi)],[t('monthlyTax'),'NT$ '+money(r.tax)]]}
 if(slug==='labor-insurance'){const r=laborInsurance(salary);rows=[[t('insuredBracket'),'NT$ '+money(r.bracket)],[t('employeePremium'),'NT$ '+money(r.labor+r.employment)]]}
 if(slug==='nhi'){const r=nhi(salary,deps);rows=[[t('nhiBracket'),'NT$ '+money(r.bracket)],[t('employeeNhi'),'NT$ '+money(r.premium)]]}
 if(slug==='income-tax'){const r=salaryTax(salary*12);rows=[[t('taxableIncome'),'NT$ '+money(r.taxable)],[t('annualTax'),'NT$ '+money(r.tax)]]}
 if(slug==='overtime-pay'){rows=[[t('overtimePay'),'NT$ '+money(overtime(salary,weekday,rest))]]}
 if(slug==='minimum-wage'){rows=[[t('monthlyMinimum'),'NT$ 29,500'],[t('yourSalary'),salary>=29500?t('aboveMinimum'):t('belowMinimum')]]}
 if(slug==='employer-cost'){const r=employerCost(salary);rows=[[t('employerMonthlyCost'),'NT$ '+money(r.total)],[t('pension'),'NT$ '+money(r.pension)],[t('employerLabor'),'NT$ '+money(r.employerLabor+r.employerEmployment)],[t('employerNhi'),'NT$ '+money(r.employerNhi)]]}
 if(slug==='annual-salary'){rows=[[t('annualPackage'),'NT$ '+money(salary*months)],[t('average12'),'NT$ '+money(salary*months/12)]]}
 return <div className="grid gap-6 lg:grid-cols-2"><div className="card space-y-4 p-5"><Num label={t('monthlySalary')} value={salary} onChange={setSalary}/>{['take-home-pay','nhi'].includes(slug)&&<Num label={t('nhiDependents')} value={deps} onChange={setDeps} min={0}/>} {slug==='overtime-pay'&&<><Num label={t('weekdayHours')} value={weekday} onChange={setWeekday}/><Num label={t('restHours')} value={rest} onChange={setRest}/></>}{slug==='annual-salary'&&<Num label={t('paidMonths')} value={months} onChange={setMonths} step={0.5}/>}</div><div className="card p-5"><h3 className="font-bold">{t('result')}</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{rows.map(([l,v])=><Result key={l} label={l} value={v}/>)}</div></div></div>
}

function Percentage(){
 const {t}=useI18n()
 const [base,setBase]=useState(100),[value,setValue]=useState(120)
 const pct=base?((value-base)/base*100):0
 return <div className="card grid gap-4 p-5 md:grid-cols-3"><Num label={t('original')} value={base} onChange={setBase}/><Num label={t('newValue')} value={value} onChange={setValue}/><Result label={t('change')} value={pct.toFixed(2)+'%'}/></div>
}

function ImageTool({slug}){
 const {t}=useI18n()
 const [url,setUrl]=useState(''),[w,setW]=useState(1200),[q,setQ]=useState(.82)
 async function run(file){
  const img=new Image(),src=URL.createObjectURL(file);await new Promise((ok,err)=>{img.onload=ok;img.onerror=err;img.src=src})
  const canvas=document.createElement('canvas');const ratio=slug==='image-resize'?Math.min(1,w/img.width):1;canvas.width=Math.round(img.width*ratio);canvas.height=Math.round(img.height*ratio)
  canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height)
  const type=slug==='png-to-jpg'?'image/jpeg':slug==='jpg-to-png'?'image/png':file.type==='image/png'?'image/png':'image/jpeg'
  const blob=await new Promise(r=>canvas.toBlob(r,type,slug==='image-compress'?q:.92));setUrl(URL.createObjectURL(blob));URL.revokeObjectURL(src)
 }
 return <div className="card p-5"><div className="grid gap-4 md:grid-cols-2">{slug==='image-resize'&&<Num label={t('maxWidth')} value={w} onChange={setW}/>} {slug==='image-compress'&&<label><span className="mb-1.5 block text-sm text-slate-400">{t('quality')} {Math.round(q*100)}%</span><input type="range" min=".1" max="1" step=".05" value={q} onChange={e=>setQ(Number(e.target.value))} className="w-full"/></label>}</div><input className="mt-5 block w-full text-sm" type="file" accept="image/*" onChange={e=>e.target.files[0]&&run(e.target.files[0])}/>{url&&<a className="btn-primary mt-5" href={url} download="anytool-output"><Download className="me-2" size={17}/>{t('downloadResult')}</a>}</div>
}

function Dpi(){
 const {t}=useI18n()
 const [px,setPx]=useState(3000),[inch,setInch]=useState(10)
 return <div className="card grid gap-4 p-5 md:grid-cols-3"><Num label={t('pixels')} value={px} onChange={setPx}/><Num label={t('printWidth')} value={inch} onChange={setInch} step={0.1}/><Result label={t('dpi')} value={(inch?px/inch:0).toFixed(1)}/></div>
}

function QRGenerator(){
 const {t}=useI18n()
 const [text,setText]=useState('https://anytool.online'),[url,setUrl]=useState('')
 async function make(){const {default:QRCode}=await import('qrcode');setUrl(await QRCode.toDataURL(text,{width:768,margin:2}))}
 return <div className="card p-5"><input className="input" value={text} onChange={e=>setText(e.target.value)}/><button className="btn-primary mt-4" onClick={make}>{t('generate')}</button>{url&&<div className="mt-5"><img alt="QR code" className="max-w-xs rounded-xl bg-white p-3" src={url}/><a className="btn-ghost mt-3" href={url} download="qr.png">{t('download')}</a></div>}</div>
}

function QRScanner(){
 const {t}=useI18n()
 const [result,setResult]=useState('')
 async function scan(file){const {default:jsQR}=await import('jsqr');const img=new Image();img.src=URL.createObjectURL(file);await new Promise(r=>img.onload=r);const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,c.width,c.height);const code=jsQR(d.data,c.width,c.height);setResult(code?.data||t('noQr'))}
 return <div className="card p-5"><input type="file" accept="image/*" onChange={e=>e.target.files[0]&&scan(e.target.files[0])}/>{result&&<p className="mt-4 break-all rounded-xl bg-white/5 p-3">{result}</p>}</div>
}

function PdfTool({slug}){
 const {t}=useI18n()
 const [msg,setMsg]=useState('')
 async function run(files){
  if(!files.length)return
  const {PDFDocument}=await import('pdf-lib')
  const out=await PDFDocument.create()
  if(slug==='pdf-merge'){for(const f of files){const src=await PDFDocument.load(await f.arrayBuffer());const pages=await out.copyPages(src,src.getPageIndices());pages.forEach(p=>out.addPage(p))}}
  else {const src=await PDFDocument.load(await files[0].arrayBuffer());const pages=await out.copyPages(src,[0]);pages.forEach(p=>out.addPage(p))}
  const bytes=await out.save();const blob=new Blob([bytes],{type:'application/pdf'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=slug==='pdf-merge'?'merged.pdf':'page-1.pdf';a.click();setMsg(t('doneDownload'))
 }
 return <div className="card p-5"><input type="file" accept="application/pdf" multiple={slug==='pdf-merge'} onChange={e=>run([...e.target.files])}/><p className="mt-3 text-sm text-slate-400">{slug==='pdf-split'?t('pdfSplitNote'):t('pdfLocal')}</p>{msg&&<p className="mt-3 text-emerald-300">{msg}</p>}</div>
}

function CloudUpload(){
 const {t}=useI18n()
 const [status,setStatus]=useState('')
 async function go(file){try{setStatus(t('uploading'));const r=await signedUpload(file);setStatus(r.secure_url)}catch(e){setStatus(e.message)}}
 return <div className="card p-5"><input type="file" onChange={e=>e.target.files[0]&&go(e.target.files[0])}/><p className="mt-4 break-all text-sm text-slate-400">{status||t('uploadHint')}</p></div>
}

function AITool({slug}){
 const {t}=useI18n()
 const [status,setStatus]=useState(''),[output,setOutput]=useState('')
 async function go(file){
  const endpoint=import.meta.env.VITE_AI_GATEWAY_URL || '/api/ai-gateway'
  if(file.size>3*1024*1024){setStatus(t('aiTooLarge'));return}
  if(!endpoint){setStatus(t('aiNotConfigured'));return}
  const {data:{session}}=await supabase.auth.getSession()
  if(!session){setStatus(t('signInAI'));return}
  setStatus(t('processing'))
  const b64=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result.split(',')[1]);fr.readAsDataURL(file)})
  const res=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify({task:slug,image:{base64:b64,mime:file.type}})})
  const data=await res.json()
  setOutput(data.output||data.error||JSON.stringify(data,null,2));setStatus('')
 }
 return <div className="card p-5"><input type="file" accept="image/*,application/pdf" onChange={e=>e.target.files[0]&&go(e.target.files[0])}/>{status&&<p className="mt-4 text-amber-300">{status}</p>}{output&&<pre dir="auto" className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm">{output}</pre>}</div>
}

export default function ToolPage(){
 const {t,toolName,toolDescription}=useI18n()
 const {slug}=useParams(),tool=toolBySlug[slug]
 const canonical='https://anytool.online/tools/'+slug
 useEffect(()=>{ if(slug) logToolEvent(slug,'tool_open').catch(()=>{}) },[slug])
 if(!tool)return <div className="mx-auto max-w-5xl px-4 py-20"><h1 className="text-3xl font-black">{t('toolNotFound')}</h1><Link className="btn-primary mt-6" to="/">{t('backHome')}</Link></div>
 const view=useMemo(()=>{if(['take-home-pay','labor-insurance','nhi','income-tax','overtime-pay','minimum-wage','employer-cost','annual-salary'].includes(slug))return <MoneyTool slug={slug}/>;if(slug==='percentage')return <Percentage/>;if(['image-resize','image-compress','png-to-jpg','jpg-to-png'].includes(slug))return <ImageTool slug={slug}/>;if(slug==='dpi-calculator')return <Dpi/>;if(slug==='qr-generator')return <QRGenerator/>;if(slug==='qr-scanner')return <QRScanner/>;if(['pdf-merge','pdf-split'].includes(slug))return <PdfTool slug={slug}/>;if(slug==='cloud-upload')return <CloudUpload/>;return <AITool slug={slug}/>},[slug])
 return <section className="mx-auto max-w-5xl px-4 py-12"><Seo title={toolName(tool)+' | AnyTool.online'} description={toolDescription(tool)} canonical={canonical}/><div className="mb-7"><Link className="text-sm text-emerald-300" to="/">← {t('allTools')}</Link><div className="mt-3 flex items-start justify-between gap-4"><div><h1 className="text-3xl font-black sm:text-4xl">{toolName(tool)}</h1><p className="mt-3 max-w-2xl text-slate-400">{toolDescription(tool)}</p></div><button aria-label={t('favorites')} className="btn-ghost shrink-0" onClick={()=>saveFavorite(slug).then(()=>alert(t('saved'))).catch(()=>alert(t('signInFirst')))}><Heart size={17}/></button></div></div>{view}<p className="mt-6 text-xs text-slate-500">{t('planningOnly')}</p></section>
}
