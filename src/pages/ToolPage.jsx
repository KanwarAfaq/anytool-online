import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, Download, Copy } from 'lucide-react'
import { toolBySlug } from '../data/tools'
import Seo from '../components/Seo'
import { takeHome, laborInsurance, nhi, salaryTax, overtime, employerCost, money } from '../lib/calculators'
import { supabase, logToolEvent, saveFavorite } from '../lib/supabase'
import { useI18n } from '../i18n'
import IdPhotoTool from '../components/tools/IdPhotoTool'
import ElderCareTool from '../components/tools/ElderCareTool'
import SourceEvidence from '../components/SourceEvidence'
import ToolGuide from '../components/ToolGuide'
import OfficialAssistant from '../components/OfficialAssistant'

const Num=({label,value,onChange,min=0,step=1})=><label className="block"><span className="mb-1.5 block text-sm text-slate-400">{label}</span><input className="input" type="number" inputMode="decimal" min={min} step={step} value={Number(value)===0?'':value} placeholder="0" onFocus={e=>e.target.select()} onChange={e=>onChange(e.target.value===''?0:Number(e.target.value))}/></label>
const Result=({label,value})=><div className="rounded-xl bg-white/5 p-3"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-lg font-black">{value}</div></div>
const downloadText=(name,text,type='text/plain')=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

function MoneyTool({slug}){
 const {t}=useI18n()
 const [salary,setSalary]=useState(50000),[deps,setDeps]=useState(0),[weekday,setWeekday]=useState(2),[rest,setRest]=useState(0),[months,setMonths]=useState(13)
 const [annualIncome,setAnnualIncome]=useState(720000),[spouseAnnual,setSpouseAnnual]=useState(0),[taxDeps,setTaxDeps]=useState(0),[hourly,setHourly]=useState(200)
 let rows=[]
 if(slug==='take-home-pay'){const r=takeHome(salary,deps);rows=[[t('estimatedNet'),'NT$ '+money(r.net)],[t('laborEmployment'),'NT$ '+money(r.labor+r.employment)],['NHI','NT$ '+money(r.nhi)],[t('monthlyTax'),'NT$ '+money(r.tax)]]}
 if(slug==='labor-insurance'){const r=laborInsurance(salary);rows=[[t('insuredBracket'),'NT$ '+money(r.bracket)],[t('employeePremium'),'NT$ '+money(r.labor+r.employment)]]}
 if(slug==='nhi'){const r=nhi(salary,deps);rows=[[t('nhiBracket'),'NT$ '+money(r.bracket)],[t('employeeNhi'),'NT$ '+money(r.premium)]]}
 if(slug==='income-tax'){const r=salaryTax(annualIncome,spouseAnnual,taxDeps);rows=[[t('taxableIncome'),'NT$ '+money(r.taxable)],[t('annualTax'),'NT$ '+money(r.tax)],[t('monthlyTax'),'NT$ '+money(r.tax/12)]]}
 if(slug==='overtime-pay'){rows=[[t('overtimePay'),'NT$ '+money(overtime(salary,weekday,rest))]]}
 if(slug==='minimum-wage'){rows=[[t('monthlyMinimum'),'NT$ 29,500'],[t('hourlyMinimum'),'NT$ 196'],[t('monthlyStatus'),salary>=29500?t('aboveMinimum'):t('belowMinimum')],[t('hourlyStatus'),hourly>=196?t('aboveMinimum'):t('belowMinimum')]]}
 if(slug==='employer-cost'){const r=employerCost(salary);rows=[[t('employerMonthlyCost'),'NT$ '+money(r.total)],[t('pension'),'NT$ '+money(r.pension)],[t('pensionWage'),'NT$ '+money(r.pensionWage)],[t('employerLabor'),'NT$ '+money(r.employerLabor+r.employerEmployment)],[t('employerNhi'),'NT$ '+money(r.employerNhi)]]}
 if(slug==='annual-salary'){rows=[[t('annualPackage'),'NT$ '+money(salary*months)],[t('average12'),'NT$ '+money(salary*months/12)]]}

 return <div>
  <div className="grid gap-6 lg:grid-cols-2">
   <div className="card space-y-4 p-5">
    {slug==='income-tax'?<>
      <Num label={t('annualIncome')} value={annualIncome} onChange={setAnnualIncome}/>
      <Num label={t('spouseAnnual')} value={spouseAnnual} onChange={setSpouseAnnual}/>
      <Num label={t('taxDependents')} value={taxDeps} onChange={setTaxDeps}/>
    </>:<>
      <Num label={t('monthlySalary')} value={salary} onChange={setSalary}/>
      {['take-home-pay','nhi'].includes(slug)&&<Num label={t('nhiDependents')} value={deps} onChange={setDeps} min={0}/>}
      {slug==='overtime-pay'&&<><Num label={t('weekdayHours')} value={weekday} onChange={setWeekday}/><Num label={t('restHours')} value={rest} onChange={setRest}/></>}
      {slug==='annual-salary'&&<Num label={t('paidMonths')} value={months} onChange={setMonths} step={0.5}/>}
      {slug==='minimum-wage'&&<Num label={t('hourlyWage')} value={hourly} onChange={setHourly}/>}
    </>}
   </div>
   <div className="card p-5"><h3 className="font-bold">{t('result')}</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{rows.map(([l,v])=><Result key={l} label={l} value={v}/>)}</div></div>
  </div>
  {slug==='employer-cost'&&<p className="mt-3 text-xs leading-5 text-slate-500">{t('employerCostNote')}</p>}
 </div>
}

function Percentage(){
 const {t}=useI18n()
 const [base,setBase]=useState(100),[value,setValue]=useState(120),[pctValue,setPctValue]=useState(15),[amount,setAmount]=useState(250)
 const pct=base?((value-base)/base*100):0
 return <div className="space-y-4">
  <div className="card grid gap-4 p-5 md:grid-cols-3"><Num label={t('original')} value={base} onChange={setBase}/><Num label={t('newValue')} value={value} onChange={setValue}/><Result label={t('change')} value={pct.toFixed(2)+'%'}/></div>
  <div className="card grid gap-4 p-5 md:grid-cols-3"><Num label={t('percentage')} value={pctValue} onChange={setPctValue} step={0.1}/><Num label={t('amount')} value={amount} onChange={setAmount} step={0.1}/><Result label={t('percentageOf')} value={(amount*pctValue/100).toFixed(2)}/></div>
 </div>
}

function LoanPayment(){
 const {t}=useI18n()
 const [principal,setPrincipal]=useState(1000000),[apr,setApr]=useState(2.5),[months,setMonths]=useState(60)
 const monthlyRate=apr/100/12
 const payment=months>0?(monthlyRate===0?principal/months:principal*monthlyRate/(1-Math.pow(1+monthlyRate,-months))):0
 const total=payment*months
 return <div className="grid gap-6 lg:grid-cols-2">
  <div className="card space-y-4 p-5"><Num label={t('loanAmount')} value={principal} onChange={setPrincipal}/><Num label={t('apr')} value={apr} onChange={setApr} step={0.01}/><Num label={t('loanMonths')} value={months} onChange={setMonths}/></div>
  <div className="card p-5"><h3 className="font-bold">{t('result')}</h3><div className="mt-4 grid gap-3"><Result label={t('monthlyPayment')} value={money(payment)}/><Result label={t('totalRepayment')} value={money(total)}/><Result label={t('totalInterest')} value={money(Math.max(0,total-principal))}/></div></div>
 </div>
}

function ImageTool({slug}){
 const {t}=useI18n()
 const [url,setUrl]=useState(''),[targetW,setTargetW]=useState(1200),[targetH,setTargetH]=useState(800),[q,setQ]=useState(.86)
 const [lockAspect,setLockAspect]=useState(true),[allowUpscale,setAllowUpscale]=useState(false),[outType,setOutType]=useState('image/jpeg'),[background,setBackground]=useState('#ffffff'),[info,setInfo]=useState(null)
 async function run(file){
  const img=new Image(),src=URL.createObjectURL(file)
  await new Promise((ok,err)=>{img.onload=ok;img.onerror=err;img.src=src})
  let width=img.width,height=img.height
  if(slug==='image-resize'){
    if(lockAspect){
      const ratio=Math.min(targetW/img.width,targetH/img.height)
      const safeRatio=allowUpscale?ratio:Math.min(1,ratio)
      width=Math.max(1,Math.round(img.width*safeRatio));height=Math.max(1,Math.round(img.height*safeRatio))
    }else{
      width=Math.max(1,Math.round(allowUpscale?targetW:Math.min(targetW,img.width)))
      height=Math.max(1,Math.round(allowUpscale?targetH:Math.min(targetH,img.height)))
    }
  }
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height
  const ctx=canvas.getContext('2d')
  let type=outType
  if(slug==='png-to-jpg')type='image/jpeg'
  if(slug==='jpg-to-png')type='image/png'
  if(slug==='image-compress'&&outType==='image/png')type=file.type==='image/png'?'image/png':'image/jpeg'
  if(type==='image/jpeg'){ctx.fillStyle=background;ctx.fillRect(0,0,width,height)}
  ctx.drawImage(img,0,0,width,height)
  const quality=(type==='image/jpeg'||type==='image/webp')?q:undefined
  const blob=await new Promise(r=>canvas.toBlob(r,type,quality))
  if(!blob){URL.revokeObjectURL(src);throw new Error('This browser could not encode the selected format.')}
  if(url)URL.revokeObjectURL(url)
  const next=URL.createObjectURL(blob);setUrl(next)
  setInfo({before:file.size,after:blob.size,width,height,originalWidth:img.width,originalHeight:img.height,type})
  URL.revokeObjectURL(src)
  logToolEvent(slug,'calculation_completed',{bytes_before:file.size,bytes_after:blob.size,width,height,type}).catch(()=>{})
 }
 const ext=info?.type==='image/png'?'png':info?.type==='image/webp'?'webp':'jpg'
 const showAdvanced=['image-resize','image-compress'].includes(slug)
 return <div className="card p-5">
  {showAdvanced&&<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {slug==='image-resize'&&<><Num label={t('targetWidth')} value={targetW} onChange={setTargetW} min={1}/><Num label={t('targetHeight')} value={targetH} onChange={setTargetH} min={1}/></>}
    <label><span className="mb-1.5 block text-sm text-slate-400">{t('outputFormat')}</span><select className="input" value={outType} onChange={e=>setOutType(e.target.value)}><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label>
    <label><span className="mb-1.5 block text-sm text-slate-400">{t('quality')} {Math.round(q*100)}%</span><input type="range" min=".2" max="1" step=".02" value={q} onChange={e=>setQ(Number(e.target.value))} className="w-full"/></label>
    <label><span className="mb-1.5 block text-sm text-slate-400">{t('background')}</span><input className="input h-11 p-1" type="color" value={background} onChange={e=>setBackground(e.target.value)}/></label>
    {slug==='image-resize'&&<div className="flex flex-col justify-end gap-2 pb-1"><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={lockAspect} onChange={e=>setLockAspect(e.target.checked)}/>{t('lockAspect')}</label><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={allowUpscale} onChange={e=>setAllowUpscale(e.target.checked)}/>{t('allowUpscale')}</label></div>}
  </div>}
  <input className="mt-5 block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>e.target.files[0]&&run(e.target.files[0])}/>
  {info&&<div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Result label={t('originalDimensions')} value={info.originalWidth+' × '+info.originalHeight}/><Result label={t('outputDimensions')} value={info.width+' × '+info.height}/><Result label={t('outputSize')} value={(info.after/1024).toFixed(1)+' KB'}/><Result label={t('sizeChange')} value={((1-info.after/info.before)*100).toFixed(1)+'%'}/></div>}
  {url&&<a className="btn-primary mt-5" href={url} download={'anytool-output.'+ext}><Download className="me-2" size={17}/>{t('downloadResult')}</a>}
 </div>
}

function Dpi(){
 const {t}=useI18n()
 const [px,setPx]=useState(3000),[inch,setInch]=useState(10)
 const dpi=inch?px/inch:0
 return <div className="card grid gap-4 p-5 md:grid-cols-4"><Num label={t('pixels')} value={px} onChange={setPx}/><Num label={t('printWidth')} value={inch} onChange={setInch} step={0.1}/><Result label={t('dpi')} value={dpi.toFixed(1)}/><Result label={t('pixelsAt300')} value={Math.round(inch*300).toLocaleString()}/></div>
}

function QRGenerator(){
 const {t}=useI18n()
 const [text,setText]=useState('https://anytool.online'),[url,setUrl]=useState(''),[size,setSize]=useState(768)
 async function make(){const {default:QRCode}=await import('qrcode');setUrl(await QRCode.toDataURL(text,{width:size,margin:2,errorCorrectionLevel:'M'}));logToolEvent('qr-generator','calculation_completed').catch(()=>{})}
 return <div className="card p-5"><div className="grid gap-4 md:grid-cols-[1fr_180px]"><input className="input" value={text} onChange={e=>setText(e.target.value)}/><Num label={t('qrSize')} value={size} onChange={setSize} min={128}/></div><button className="btn-primary mt-4" onClick={make}>{t('generate')}</button>{url&&<div className="mt-5"><img alt="QR code" className="max-w-xs rounded-xl bg-white p-3" src={url}/><a className="btn-ghost mt-3" href={url} download="qr.png">{t('download')}</a></div>}</div>
}

function QRScanner(){
 const {t}=useI18n()
 const [result,setResult]=useState('')
 async function scan(file){const {default:jsQR}=await import('jsqr');const img=new Image();img.src=URL.createObjectURL(file);await new Promise(r=>img.onload=r);const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,c.width,c.height);const code=jsQR(d.data,c.width,c.height);setResult(code?.data||t('noQr'));URL.revokeObjectURL(img.src);if(code?.data)logToolEvent('qr-scanner','calculation_completed').catch(()=>{})}
 return <div className="card p-5"><input type="file" accept="image/*" onChange={e=>e.target.files[0]&&scan(e.target.files[0])}/>{result&&<div className="mt-4"><p className="break-all rounded-xl bg-white/5 p-3">{result}</p><button className="btn-ghost mt-3" onClick={()=>navigator.clipboard.writeText(result)}><Copy className="me-2" size={16}/>{t('copy')}</button></div>}</div>
}

function PdfTool({slug}){
 const {t}=useI18n()
 const [msg,setMsg]=useState(''),[start,setStart]=useState(1),[end,setEnd]=useState(1)
 async function run(files){
  if(!files.length)return
  const {PDFDocument}=await import('pdf-lib')
  const out=await PDFDocument.create()
  if(slug==='pdf-merge'){for(const f of files){const src=await PDFDocument.load(await f.arrayBuffer());const pages=await out.copyPages(src,src.getPageIndices());pages.forEach(p=>out.addPage(p))}}
  else {const src=await PDFDocument.load(await files[0].arrayBuffer());const count=src.getPageCount();const first=Math.max(1,Math.floor(start)),last=Math.min(count,Math.floor(end));if(first>last||first>count){setMsg(t('invalidPageRange'));return}const indices=Array.from({length:last-first+1},(_,i)=>first-1+i);const pages=await out.copyPages(src,indices);pages.forEach(p=>out.addPage(p))}
  const bytes=await out.save();const blob=new Blob([bytes],{type:'application/pdf'});const objectUrl=URL.createObjectURL(blob);const a=document.createElement('a');a.href=objectUrl;a.download=slug==='pdf-merge'?'merged.pdf':`pages-${start}-${end}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);setMsg(t('doneDownload'));logToolEvent(slug,'calculation_completed',{files:files.length}).catch(()=>{})
 }
 return <div className="card p-5">{slug==='pdf-split'&&<div className="mb-4 grid gap-3 sm:grid-cols-2"><Num label={t('splitStart')} value={start} onChange={setStart} min={1}/><Num label={t('splitEnd')} value={end} onChange={setEnd} min={1}/></div>}<input type="file" accept="application/pdf" multiple={slug==='pdf-merge'} onChange={e=>run([...e.target.files])}/><p className="mt-3 text-sm text-slate-400">{slug==='pdf-split'?t('pdfSplitNote'):t('pdfLocal')}</p>{msg&&<p className="mt-3 text-emerald-300">{msg}</p>}</div>
}

function AITool({slug}){
 const {t}=useI18n()
 const [status,setStatus]=useState(''),[result,setResult]=useState(null)
 async function go(file){
  const endpoint=import.meta.env.VITE_AI_GATEWAY_URL || '/api/ai-gateway'
  if(file.size>3*1024*1024){setStatus(t('aiTooLarge'));return}
  const {data:{session}}=await supabase.auth.getSession()
  if(!session){setStatus(t('signInAI'));return}
  setStatus(t('processing'));setResult(null)
  const b64=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result.split(',')[1]);fr.readAsDataURL(file)})
  const res=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify({task:slug,image:{base64:b64,mime:file.type}})})
  const data=await res.json();setStatus('')
  if(!res.ok){setResult({text:data.error||t('aiFailed'),provider:''});return}
  setResult({text:data.output||'',provider:data.provider||'',model:data.model||''});logToolEvent(slug,'calculation_completed',{provider:data.provider||'unknown'}).catch(()=>{})
 }
 const text=result?.text||''
 let pretty=text
 if(slug==='receipt-to-json'&&text){try{pretty=JSON.stringify(JSON.parse(text.replace(/^\`\`\`json\s*|\`\`\`$/g,'')),null,2)}catch{}}
 return <div className="card p-5">
  <input type="file" accept="image/*,application/pdf" onChange={e=>e.target.files[0]&&go(e.target.files[0])}/>
  {status&&<p className="mt-4 text-amber-300">{status}</p>}
  {result&&<div className="mt-4">
    {result.provider&&<p className="mb-2 text-xs text-slate-500">{t('processedBy')}: {result.provider}{result.model?' · '+result.model:''}</p>}
    <pre dir="auto" className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm">{pretty}</pre>
    <div className="mt-3 flex flex-wrap gap-2">
      <button className="btn-ghost" onClick={()=>navigator.clipboard.writeText(pretty)}><Copy className="me-2" size={16}/>{t('copy')}</button>
      <button className="btn-ghost" onClick={()=>downloadText(slug==='receipt-to-json'?'receipt.json':'ocr.txt',pretty,slug==='receipt-to-json'?'application/json':'text/plain')}><Download className="me-2" size={16}/>{t('download')}</button>
    </div>
  </div>}
 </div>
}

export default function ToolPage(){
 const {t,toolName,toolDescription,pathFor}=useI18n()
 const {slug}=useParams(),tool=toolBySlug[slug]
 const regulated2026=new Set(['take-home-pay','labor-insurance','nhi','income-tax','overtime-pay','minimum-wage','employer-cost','taiwan-elder-care'])
 useEffect(()=>{ if(slug) logToolEvent(slug,'tool_open').catch(()=>{}) },[slug])
 if(!tool)return <div className="mx-auto max-w-5xl px-4 py-20"><h1 className="text-3xl font-black">{t('toolNotFound')}</h1><Link className="btn-primary mt-6" to={pathFor('/')}>{t('backHome')}</Link></div>
 const view=useMemo(()=>{
  if(['take-home-pay','labor-insurance','nhi','income-tax','overtime-pay','minimum-wage','employer-cost','annual-salary'].includes(slug))return <MoneyTool slug={slug}/>
  if(slug==='percentage')return <Percentage/>
  if(slug==='loan-payment')return <LoanPayment/>
  if(slug==='taiwan-id-photo')return <IdPhotoTool/>
  if(slug==='taiwan-elder-care')return <ElderCareTool/>
  if(['image-resize','image-compress','png-to-jpg','jpg-to-png'].includes(slug))return <ImageTool slug={slug}/>
  if(slug==='dpi-calculator')return <Dpi/>
  if(slug==='qr-generator')return <QRGenerator/>
  if(slug==='qr-scanner')return <QRScanner/>
  if(['pdf-merge','pdf-split'].includes(slug))return <PdfTool slug={slug}/>
  return <AITool slug={slug}/>
 },[slug])
 const toolPath=pathFor('/tools/'+slug)
 const toolUrl='https://anytool.online'+toolPath
 const seoTitle=toolName(tool)+(regulated2026.has(slug)?' 2026':'')+' | AnyTool.online'
 return <section className="mx-auto max-w-5xl px-4 py-12"><Seo title={seoTitle} description={toolDescription(tool)} jsonLd={[{'@context':'https://schema.org','@type':'SoftwareApplication',name:toolName(tool),description:toolDescription(tool),applicationCategory:'UtilitiesApplication',operatingSystem:'Web',url:toolUrl,isAccessibleForFree:true,offers:{'@type':'Offer',price:'0',priceCurrency:'USD'}},{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'AnyTool',item:'https://anytool.online/'},{'@type':'ListItem',position:2,name:toolName(tool),item:toolUrl}]}]}/><div className="mb-7"><Link className="text-sm text-emerald-300" to={pathFor('/')}>← {t('allTools')}</Link><div className="mt-3 flex items-start justify-between gap-4"><div><h1 className="text-3xl font-black sm:text-4xl">{toolName(tool)}</h1><p className="mt-3 max-w-2xl text-slate-400">{toolDescription(tool)}</p></div><button aria-label={t('favorites')} className="btn-ghost shrink-0" onClick={()=>saveFavorite(slug).then(()=>alert(t('saved'))).catch(()=>alert(t('signInFirst')))}><Heart size={17}/></button></div></div>{view}<ToolGuide tool={tool}/><SourceEvidence slug={slug}/><OfficialAssistant slug={slug}/><p className="mt-6 text-xs text-slate-500">{t('planningOnly')}</p></section>
}
