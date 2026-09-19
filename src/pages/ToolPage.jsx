import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import { PDFDocument } from 'pdf-lib'
import { Heart, Upload, Download } from 'lucide-react'
import { toolBySlug } from '../data/tools'
import Seo from '../components/Seo'
import { takeHome, laborInsurance, nhi, salaryTax, overtime, employerCost, money } from '../lib/calculators'
import { supabase, logToolEvent, saveFavorite } from '../lib/supabase'
import { signedUpload } from '../lib/cloudinary'

const Num=({label,value,onChange,min=0,step=1})=><label className="block"><span className="mb-1.5 block text-sm text-slate-400">{label}</span><input className="input" type="number" min={min} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>
const Result=({label,value})=><div className="rounded-xl bg-white/5 p-3"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-lg font-black">{value}</div></div>

function MoneyTool({slug}){
 const [salary,setSalary]=useState(50000),[deps,setDeps]=useState(0),[weekday,setWeekday]=useState(2),[rest,setRest]=useState(0),[months,setMonths]=useState(13)
 let rows=[]
 if(slug==='take-home-pay'){const r=takeHome(salary,deps);rows=[['Estimated net','NT$ '+money(r.net)],['Labor + employment','NT$ '+money(r.labor+r.employment)],['NHI','NT$ '+money(r.nhi)],['Monthly tax estimate','NT$ '+money(r.tax)]]}
 if(slug==='labor-insurance'){const r=laborInsurance(salary);rows=[['Insured salary bracket','NT$ '+money(r.bracket)],['Employee premium','NT$ '+money(r.labor+r.employment)]]}
 if(slug==='nhi'){const r=nhi(salary,deps);rows=[['NHI salary bracket','NT$ '+money(r.bracket)],['Employee NHI','NT$ '+money(r.premium)]]}
 if(slug==='income-tax'){const r=salaryTax(salary*12);rows=[['Taxable income','NT$ '+money(r.taxable)],['Estimated annual tax','NT$ '+money(r.tax)]]}
 if(slug==='overtime-pay'){rows=[['Estimated overtime pay','NT$ '+money(overtime(salary,weekday,rest))]]}
 if(slug==='minimum-wage'){rows=[['2026 monthly minimum','NT$ 29,500'],['Your salary',salary>=29500?'At or above minimum':'Below monthly minimum']]}
 if(slug==='employer-cost'){const r=employerCost(salary);rows=[['Estimated monthly employer cost','NT$ '+money(r.total)],['6% pension','NT$ '+money(r.pension)],['Employer labor + employment','NT$ '+money(r.employerLabor+r.employerEmployment)],['Employer NHI','NT$ '+money(r.employerNhi)]]}
 if(slug==='annual-salary'){rows=[['Annual package','NT$ '+money(salary*months)],['Average per 12 months','NT$ '+money(salary*months/12)]]}
 return <div className="grid gap-6 lg:grid-cols-2"><div className="card space-y-4 p-5"><Num label="Monthly salary (NT$)" value={salary} onChange={setSalary}/>{['take-home-pay','nhi'].includes(slug)&&<Num label="NHI dependents" value={deps} onChange={setDeps} min={0}/>} {slug==='overtime-pay'&&<><Num label="Weekday overtime hours" value={weekday} onChange={setWeekday}/><Num label="Rest-day overtime hours" value={rest} onChange={setRest}/></>}{slug==='annual-salary'&&<Num label="Paid salary months" value={months} onChange={setMonths} step={0.5}/>}</div><div className="card p-5"><h3 className="font-bold">Result</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{rows.map(([l,v])=><Result key={l} label={l} value={v}/>)}</div></div></div>
}

function Percentage(){
 const [base,setBase]=useState(100),[value,setValue]=useState(120)
 const pct=base?((value-base)/base*100):0
 return <div className="card grid gap-4 p-5 md:grid-cols-3"><Num label="Original" value={base} onChange={setBase}/><Num label="New value" value={value} onChange={setValue}/><Result label="Change" value={pct.toFixed(2)+'%'}/></div>
}

function ImageTool({slug}){
 const [url,setUrl]=useState(''),[w,setW]=useState(1200),[q,setQ]=useState(.82)
 async function run(file){
  const img=new Image(),src=URL.createObjectURL(file);await new Promise((ok,err)=>{img.onload=ok;img.onerror=err;img.src=src})
  const canvas=document.createElement('canvas');const ratio=slug==='image-resize'?Math.min(1,w/img.width):1;canvas.width=Math.round(img.width*ratio);canvas.height=Math.round(img.height*ratio)
  canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height)
  const type=slug==='png-to-jpg'?'image/jpeg':slug==='jpg-to-png'?'image/png':file.type==='image/png'?'image/png':'image/jpeg'
  const blob=await new Promise(r=>canvas.toBlob(r,type,slug==='image-compress'?q:.92));setUrl(URL.createObjectURL(blob));URL.revokeObjectURL(src)
 }
 return <div className="card p-5"><div className="grid gap-4 md:grid-cols-2">{slug==='image-resize'&&<Num label="Max width (px)" value={w} onChange={setW}/>} {slug==='image-compress'&&<label><span className="mb-1.5 block text-sm text-slate-400">Quality {Math.round(q*100)}%</span><input type="range" min=".1" max="1" step=".05" value={q} onChange={e=>setQ(Number(e.target.value))} className="w-full"/></label>}</div><input className="mt-5 block w-full text-sm" type="file" accept="image/*" onChange={e=>e.target.files[0]&&run(e.target.files[0])}/>{url&&<a className="btn-primary mt-5" href={url} download="anytool-output"><Download className="mr-2" size={17}/>Download result</a>}</div>
}

function Dpi(){
 const [px,setPx]=useState(3000),[inch,setInch]=useState(10)
 return <div className="card grid gap-4 p-5 md:grid-cols-3"><Num label="Pixels" value={px} onChange={setPx}/><Num label="Print width (inches)" value={inch} onChange={setInch} step={0.1}/><Result label="DPI" value={(inch?px/inch:0).toFixed(1)}/></div>
}

function QRGenerator(){
 const [text,setText]=useState('https://anytool.online'),[url,setUrl]=useState('')
 async function make(){setUrl(await QRCode.toDataURL(text,{width:768,margin:2}))}
 return <div className="card p-5"><input className="input" value={text} onChange={e=>setText(e.target.value)}/><button className="btn-primary mt-4" onClick={make}>Generate</button>{url&&<div className="mt-5"><img alt="QR code" className="max-w-xs rounded-xl bg-white p-3" src={url}/><a className="btn-ghost mt-3" href={url} download="qr.png">Download</a></div>}</div>
}

function QRScanner(){
 const [result,setResult]=useState('')
 async function scan(file){const img=new Image();img.src=URL.createObjectURL(file);await new Promise(r=>img.onload=r);const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,c.width,c.height);const code=jsQR(d.data,c.width,c.height);setResult(code?.data||'No QR code detected.')}
 return <div className="card p-5"><input type="file" accept="image/*" onChange={e=>e.target.files[0]&&scan(e.target.files[0])}/>{result&&<p className="mt-4 break-all rounded-xl bg-white/5 p-3">{result}</p>}</div>
}

function PdfTool({slug}){
 const [msg,setMsg]=useState('')
 async function run(files){
  if(!files.length)return
  const out=await PDFDocument.create()
  if(slug==='pdf-merge'){for(const f of files){const src=await PDFDocument.load(await f.arrayBuffer());const pages=await out.copyPages(src,src.getPageIndices());pages.forEach(p=>out.addPage(p))}}
  else {const src=await PDFDocument.load(await files[0].arrayBuffer());const pages=await out.copyPages(src,[0]);pages.forEach(p=>out.addPage(p))}
  const bytes=await out.save();const blob=new Blob([bytes],{type:'application/pdf'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=slug==='pdf-merge'?'merged.pdf':'page-1.pdf';a.click();setMsg('Done — download started.')
 }
 return <div className="card p-5"><input type="file" accept="application/pdf" multiple={slug==='pdf-merge'} onChange={e=>run([...e.target.files])}/><p className="mt-3 text-sm text-slate-400">{slug==='pdf-split'?'Current version extracts page 1; page-range UI is next.':'Files are processed locally in your browser.'}</p>{msg&&<p className="mt-3 text-emerald-300">{msg}</p>}</div>
}

function CloudUpload(){
 const [status,setStatus]=useState('')
 async function go(file){try{setStatus('Uploading…');const r=await signedUpload(file);setStatus('Uploaded: '+r.secure_url)}catch(e){setStatus(e.message)}}
 return <div className="card p-5"><input type="file" onChange={e=>e.target.files[0]&&go(e.target.files[0])}/><p className="mt-4 break-all text-sm text-slate-400">{status||'Uploads require Cloudinary server environment variables.'}</p></div>
}

function AITool({slug}){
 const [status,setStatus]=useState(''),[output,setOutput]=useState('')
 async function go(file){
  const endpoint=import.meta.env.VITE_AI_GATEWAY_URL
  if(!endpoint){setStatus('AI gateway is not configured yet.');return}
  if(!supabase){setStatus('Supabase is not configured yet.');return}
  const {data:{session}}=await supabase.auth.getSession()
  if(!session){setStatus('Please sign in before using AI tools.');return}
  setStatus('Processing…')
  const b64=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result.split(',')[1]);fr.readAsDataURL(file)})
  const res=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify({task:slug,image:{base64:b64,mime:file.type}})})
  const data=await res.json()
  setOutput(data.output||data.error||JSON.stringify(data,null,2));setStatus('')
}
 return <div className="card p-5"><input type="file" accept="image/*,application/pdf" onChange={e=>e.target.files[0]&&go(e.target.files[0])}/>{status&&<p className="mt-4 text-amber-300">{status}</p>}{output&&<pre className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm">{output}</pre>}</div>
}

export default function ToolPage(){
 const {slug}=useParams(),tool=toolBySlug[slug]
 const canonical='https://anytool.online/tools/'+slug
 if(!tool)return <div className="mx-auto max-w-5xl px-4 py-20"><h1 className="text-3xl font-black">Tool not found</h1><Link className="btn-primary mt-6" to="/">Back home</Link></div>
 const view=useMemo(()=>{if(['take-home-pay','labor-insurance','nhi','income-tax','overtime-pay','minimum-wage','employer-cost','annual-salary'].includes(slug))return <MoneyTool slug={slug}/>;if(slug==='percentage')return <Percentage/>;if(['image-resize','image-compress','png-to-jpg','jpg-to-png'].includes(slug))return <ImageTool slug={slug}/>;if(slug==='dpi-calculator')return <Dpi/>;if(slug==='qr-generator')return <QRGenerator/>;if(slug==='qr-scanner')return <QRScanner/>;if(['pdf-merge','pdf-split'].includes(slug))return <PdfTool slug={slug}/>;if(slug==='cloud-upload')return <CloudUpload/>;return <AITool slug={slug}/>},[slug])
 return <section className="mx-auto max-w-5xl px-4 py-12"><Seo title={tool.name+' | AnyTool.online'} description={tool.description} canonical={canonical}/><div className="mb-7"><Link className="text-sm text-emerald-300" to="/">← All tools</Link><div className="mt-3 flex items-start justify-between gap-4"><div><h1 className="text-3xl font-black sm:text-4xl">{tool.name}</h1><p className="mt-3 max-w-2xl text-slate-400">{tool.description}</p></div><button className="btn-ghost shrink-0" onClick={()=>saveFavorite(slug).then(()=>alert('Saved')).catch(e=>alert(e.message))}><Heart size={17}/></button></div></div>{view}<p className="mt-6 text-xs text-slate-500">AnyTool estimates are for planning only. Regulated calculations should be verified against the latest official rules.</p></section>
}
