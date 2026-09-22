import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, Download, Copy, Search, ArrowRight } from 'lucide-react'
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
import ToolArt from '../components/ToolArt'
import { officialSources, toolSourceKeys } from '../data/officialSources'
import { RandomPickerTool, TimerTool, SketchTool } from '../components/tools/CreativeTools'

const Num=({label,value,onChange,min=0,step=1})=><label className="block"><span className="mb-1.5 block text-sm text-slate-400">{label}</span><input className="input" type="number" inputMode="decimal" min={min} step={step} value={Number(value)===0?'':value} placeholder="0" onFocus={e=>e.target.select()} onChange={e=>onChange(e.target.value===''?0:Number(e.target.value))}/></label>
const Result=({label,value})=><div className="result-tile"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-lg font-black">{value}</div></div>
const downloadText=(name,text,type='text/plain')=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

const fieldLabels={
 en:{qrText:'Text or URL',imageFile:'Choose image file',qrFile:'Choose QR code image',pdfFile:'Choose PDF file',pdfFiles:'Choose PDF files',aiFile:'Choose image or PDF file'},
 'zh-TW':{qrText:'文字或網址',imageFile:'選擇圖片檔案',qrFile:'選擇 QR Code 圖片',pdfFile:'選擇 PDF 檔案',pdfFiles:'選擇 PDF 檔案',aiFile:'選擇圖片或 PDF 檔案'},
 ar:{qrText:'نص أو رابط',imageFile:'اختر ملف صورة',qrFile:'اختر صورة رمز QR',pdfFile:'اختر ملف PDF',pdfFiles:'اختر ملفات PDF',aiFile:'اختر صورة أو ملف PDF'},
 ur:{qrText:'متن یا URL',imageFile:'تصویری فائل منتخب کریں',qrFile:'QR کوڈ تصویر منتخب کریں',pdfFile:'PDF فائل منتخب کریں',pdfFiles:'PDF فائلیں منتخب کریں',aiFile:'تصویر یا PDF فائل منتخب کریں'}
}
const labelFor=(lang,key)=>fieldLabels[lang]?.[key]||fieldLabels.en[key]

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
 const pct=base?((value-base)/base*100):null
 return <div className="space-y-4">
  <div className="card grid gap-4 p-5 md:grid-cols-3"><Num label={t('original')} value={base} onChange={setBase}/><Num label={t('newValue')} value={value} onChange={setValue}/><Result label={t('change')} value={pct==null?'—':pct.toFixed(2)+'%'}/></div>
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
 const {t,lang}=useI18n()
 const [url,setUrl]=useState(''),[targetW,setTargetW]=useState(1200),[targetH,setTargetH]=useState(800),[q,setQ]=useState(.86)
 const [lockAspect,setLockAspect]=useState(true),[allowUpscale,setAllowUpscale]=useState(false),[outType,setOutType]=useState('auto'),[background,setBackground]=useState('#ffffff'),[info,setInfo]=useState(null),[error,setError]=useState('')
 async function run(file){
  setError('');setInfo(null)
  try{
   const img=new Image(),src=URL.createObjectURL(file)
   try{await new Promise((ok,err)=>{img.onload=ok;img.onerror=err;img.src=src})}catch{URL.revokeObjectURL(src);throw new Error('Could not read this image.')}
   let width=img.width,height=img.height
   if(slug==='image-resize'){
    if(lockAspect){const ratio=Math.min(targetW/img.width,targetH/img.height),safeRatio=allowUpscale?ratio:Math.min(1,ratio);width=Math.max(1,Math.round(img.width*safeRatio));height=Math.max(1,Math.round(img.height*safeRatio))}
    else{width=Math.max(1,Math.round(allowUpscale?targetW:Math.min(targetW,img.width)));height=Math.max(1,Math.round(allowUpscale?targetH:Math.min(targetH,img.height)))}
   }
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height
   const ctx=canvas.getContext('2d');if(!ctx){URL.revokeObjectURL(src);throw new Error('Canvas is unavailable in this browser.')}
   let type=outType==='auto'&&['image/jpeg','image/png','image/webp'].includes(file.type)?file.type:(outType==='auto'?'image/png':outType)
   if(slug==='png-to-jpg')type='image/jpeg'
   if(slug==='jpg-to-png')type='image/png'
   if(type==='image/jpeg'){ctx.fillStyle=background;ctx.fillRect(0,0,width,height)}
   ctx.drawImage(img,0,0,width,height)
   const quality=(type==='image/jpeg'||type==='image/webp')?q:undefined
   const blob=await new Promise(r=>canvas.toBlob(r,type,quality));URL.revokeObjectURL(src)
   if(!blob)throw new Error('This browser could not encode the selected format.')
   if(url)URL.revokeObjectURL(url)
   const next=URL.createObjectURL(blob);setUrl(next);setInfo({before:file.size,after:blob.size,width,height,originalWidth:img.width,originalHeight:img.height,type})
   logToolEvent(slug,'calculation_completed',{bytes_before:file.size,bytes_after:blob.size,width,height,type}).catch(()=>{})
  }catch(e){setUrl('');setError(e instanceof Error?e.message:'Could not process this image.')}
 }
 const ext=info?.type==='image/png'?'png':info?.type==='image/webp'?'webp':'jpg'
 const showAdvanced=['image-resize','image-compress'].includes(slug)
 const accept=slug==='png-to-jpg'?'image/png':slug==='jpg-to-png'?'image/jpeg':'image/jpeg,image/png,image/webp'
 const sizeDelta=info?Math.abs((1-info.after/info.before)*100):0
 return <div className="tool-pane">
  {showAdvanced&&<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {slug==='image-resize'&&<><Num label={t('targetWidth')} value={targetW} onChange={setTargetW} min={1}/><Num label={t('targetHeight')} value={targetH} onChange={setTargetH} min={1}/></>}
    <label><span className="tool-label">{t('outputFormat')}</span><select aria-label={t('outputFormat')} className="input" value={outType} onChange={e=>setOutType(e.target.value)}><option value="auto">Auto · keep original</option><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label>
    {outType!=='image/png'&&<label><span className="tool-label">{t('quality')} {Math.round(q*100)}%</span><input type="range" min=".2" max="1" step=".02" value={q} onChange={e=>setQ(Number(e.target.value))} className="w-full"/></label>}
    <label><span className="tool-label">{t('background')}</span><input className="input h-11 p-1" type="color" value={background} onChange={e=>setBackground(e.target.value)}/></label>
    {slug==='image-resize'&&<div className="flex flex-col justify-end gap-2 pb-1"><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={lockAspect} onChange={e=>setLockAspect(e.target.checked)}/>{t('lockAspect')}</label><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={allowUpscale} onChange={e=>setAllowUpscale(e.target.checked)}/>{t('allowUpscale')}</label></div>}
  </div>}
  <label className="upload-field mt-5"><span className="font-semibold">{labelFor(lang,'imageFile')}</span><input aria-label={labelFor(lang,'imageFile')} type="file" accept={accept} onChange={e=>e.target.files[0]&&run(e.target.files[0])}/></label>
  {error&&<p role="alert" className="tool-alert mt-4">{error}</p>}
  {info&&<div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Result label={t('originalDimensions')} value={info.originalWidth+' × '+info.originalHeight}/><Result label={t('outputDimensions')} value={info.width+' × '+info.height}/><Result label={t('outputSize')} value={(info.after/1024).toFixed(1)+' KB'}/><Result label={t('sizeChange')} value={sizeDelta.toFixed(1)+'% '+(info.after<=info.before?'smaller':'larger')}/></div>}
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
 const {t,lang}=useI18n()
 const [text,setText]=useState('https://www.anytool.online'),[url,setUrl]=useState(''),[size,setSize]=useState(768),[error,setError]=useState('')
 async function make(){
  const value=text.trim();if(!value){setError('Enter text or a URL first.');setUrl('');return}
  setError('')
  try{const {default:QRCode}=await import('qrcode');const safe=Math.max(128,Math.min(2048,Math.floor(Number(size)||768)));setSize(safe);setUrl(await QRCode.toDataURL(value,{width:safe,margin:2,errorCorrectionLevel:'M'}));logToolEvent('qr-generator','calculation_completed').catch(()=>{})}
  catch{setError('Could not generate this QR code.')}
 }
 return <div className="tool-pane"><div className="grid gap-4 md:grid-cols-[1fr_180px]"><label><span className="tool-label">{labelFor(lang,'qrText')}</span><input aria-label={labelFor(lang,'qrText')} className="input" value={text} onChange={e=>setText(e.target.value)}/></label><Num label={t('qrSize')} value={size} onChange={setSize} min={128}/></div><button className="btn-primary mt-4" onClick={make}>{t('generate')}</button>{error&&<p role="alert" className="tool-alert mt-4">{error}</p>}{url&&<div className="qr-output"><img alt="QR code" src={url}/><a className="btn-ghost" href={url} download="qr.png">{t('download')}</a></div>}</div>
}
function QRScanner(){
 const {t,lang}=useI18n()
 const [result,setResult]=useState(''),[error,setError]=useState('')
 async function scan(file){
  setResult('');setError('')
  try{const {default:jsQR}=await import('jsqr');const img=new Image(),src=URL.createObjectURL(file);try{await new Promise((ok,fail)=>{img.onload=ok;img.onerror=fail;img.src=src})}catch{URL.revokeObjectURL(src);throw new Error('image')}const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,c.width,c.height);const code=jsQR(d.data,c.width,c.height);URL.revokeObjectURL(src);setResult(code?.data||t('noQr'));if(code?.data)logToolEvent('qr-scanner','calculation_completed').catch(()=>{})}
  catch{setError('Could not read this image.')}
 }
 return <div className="tool-pane"><label className="upload-field"><span className="font-semibold">{labelFor(lang,'qrFile')}</span><input aria-label={labelFor(lang,'qrFile')} type="file" accept="image/*" onChange={e=>e.target.files[0]&&scan(e.target.files[0])}/></label>{error&&<p role="alert" className="tool-alert mt-4">{error}</p>}{result&&<div className="mt-4" aria-live="polite"><p className="break-all rounded-xl bg-black/[.05] p-3 text-slate-800">{result}</p><button className="btn-ghost mt-3" onClick={()=>navigator.clipboard.writeText(result)}><Copy className="me-2" size={16}/>{t('copy')}</button></div>}</div>
}
function PdfTool({slug}){
 const {t,lang}=useI18n()
 const [msg,setMsg]=useState(''),[start,setStart]=useState(1),[end,setEnd]=useState(1),[error,setError]=useState('')
 async function run(files){
  if(!files.length)return;setMsg('');setError('')
  try{
   const {PDFDocument}=await import('pdf-lib'),out=await PDFDocument.create()
   if(slug==='pdf-merge'){for(const f of files){const src=await PDFDocument.load(await f.arrayBuffer());const pages=await out.copyPages(src,src.getPageIndices());pages.forEach(p=>out.addPage(p))}}
   else{const src=await PDFDocument.load(await files[0].arrayBuffer()),count=src.getPageCount(),first=Math.max(1,Math.floor(start)),last=Math.min(count,Math.floor(end));if(first>last||first>count){setError(t('invalidPageRange'));return}const indices=Array.from({length:last-first+1},(_,i)=>first-1+i),pages=await out.copyPages(src,indices);pages.forEach(p=>out.addPage(p))}
   const bytes=await out.save(),blob=new Blob([bytes],{type:'application/pdf'}),objectUrl=URL.createObjectURL(blob),link=document.createElement('a');link.href=objectUrl;link.download=slug==='pdf-merge'?'merged.pdf':'pages-'+start+'-'+end+'.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);setMsg(t('doneDownload'));logToolEvent(slug,'calculation_completed',{files:files.length}).catch(()=>{})
  }catch{setError('Could not process this PDF. Make sure the file is a valid, unlocked PDF.')}
 }
 return <div className="tool-pane">{slug==='pdf-split'&&<div className="mb-4 grid gap-3 sm:grid-cols-2"><Num label={t('splitStart')} value={start} onChange={setStart} min={1}/><Num label={t('splitEnd')} value={end} onChange={setEnd} min={1}/></div>}<label className="upload-field"><span className="font-semibold">{labelFor(lang,slug==='pdf-merge'?'pdfFiles':'pdfFile')}</span><input aria-label={labelFor(lang,slug==='pdf-merge'?'pdfFiles':'pdfFile')} type="file" accept="application/pdf" multiple={slug==='pdf-merge'} onChange={e=>run([...e.target.files])}/></label><p className="mt-3 text-sm text-slate-500">{slug==='pdf-split'?t('pdfSplitNote'):t('pdfLocal')}</p>{error&&<p role="alert" className="tool-alert mt-3">{error}</p>}{msg&&<p role="status" aria-live="polite" className="status-message mt-3 text-emerald-700">{msg}</p>}</div>
}
function AITool({slug}){
 const {t,lang}=useI18n()
 const [status,setStatus]=useState(''),[result,setResult]=useState(null)
 async function go(file){
  const endpoint=import.meta.env.VITE_AI_GATEWAY_URL || '/api/ai-gateway'
  if(file.size>3*1024*1024){setStatus(t('aiTooLarge'));return}
  const {data:{session}}=await supabase.auth.getSession()
  if(!session){setStatus(t('signInAI'));return}
  setStatus(t('processing'));setResult(null)
  const b64=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result.split(',')[1]);fr.readAsDataURL(file)})
  try{const res=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify({task:slug,image:{base64:b64,mime:file.type}})});const data=await res.json();setStatus('');if(!res.ok){setResult({text:data.error||t('aiFailed'),provider:''});return}setResult({text:data.output||'',provider:data.provider||'',model:data.model||''});logToolEvent(slug,'calculation_completed',{provider:data.provider||'unknown'}).catch(()=>{})}catch{setStatus('');setResult({text:t('aiFailed'),provider:''})}
 }
 const text=result?.text||''
 let pretty=text
 if(slug==='receipt-to-json'&&text){try{pretty=JSON.stringify(JSON.parse(text.replace(/^\`\`\`json\s*|\`\`\`$/g,'')),null,2)}catch{}}
 return <div className="card p-5">
  <label className="upload-field"><span className="font-semibold">{labelFor(lang,'aiFile')}</span><input aria-label={labelFor(lang,'aiFile')} type="file" accept="image/*,application/pdf" onChange={e=>e.target.files[0]&&go(e.target.files[0])}/></label>
  {status&&<p role="status" aria-live="polite" className="status-message mt-4 text-amber-200">{status}</p>}
  {result&&<div className="mt-4">
    {result.provider&&<p className="mb-2 text-xs text-slate-500">{t('processedBy')}: {result.provider}{result.model?' · '+result.model:''}</p>}
    <pre dir="auto" aria-live="polite" className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm">{pretty}</pre>
    <div className="mt-3 flex flex-wrap gap-2">
      <button className="btn-ghost" onClick={()=>navigator.clipboard.writeText(pretty)}><Copy className="me-2" size={16}/>{t('copy')}</button>
      <button className="btn-ghost" onClick={()=>downloadText(slug==='receipt-to-json'?'receipt.json':'ocr.txt',pretty,slug==='receipt-to-json'?'application/json':'text/plain')}><Download className="me-2" size={16}/>{t('download')}</button>
    </div>
  </div>}
 </div>
}

function ToolSearchDock(){
 const {lang,toolName,toolDescription,pathFor}=useI18n()
 const [query,setQuery]=useState('')
 const copy={en:{title:'Search all tools',placeholder:'Search by task, format or calculator'},'zh-TW':{title:'搜尋所有工具',placeholder:'依任務、格式或計算器搜尋'},ar:{title:'ابحث في كل الأدوات',placeholder:'ابحث بالمهمة أو الصيغة أو الحاسبة'},ur:{title:'تمام ٹولز تلاش کریں',placeholder:'کام، فارمیٹ یا کیلکولیٹر سے تلاش کریں'}}[lang]||null
 const C=copy||{}
 const list=tools.filter(x=>!query.trim()||(toolName(x)+' '+toolDescription(x)).toLowerCase().includes(query.toLowerCase())).slice(0,9)
 return <section className="tool-search-dock"><h2>{C.title}</h2><label><Search size={21}/><span className="sr-only">{C.placeholder}</span><input aria-label={C.title} value={query} onChange={e=>setQuery(e.target.value)} placeholder={C.placeholder}/></label><div>{list.map(x=><Link key={x.slug} to={pathFor('/tools/'+x.slug)}><span>{toolName(x)}</span><ArrowRight size={15}/></Link>)}</div></section>
}

export default function ToolPage(){
 const {lang,t,toolName,toolDescription,pathFor}=useI18n()
 const {slug}=useParams(),tool=toolBySlug[slug]
 const regulated2026=new Set(['take-home-pay','labor-insurance','nhi','income-tax','overtime-pay','minimum-wage','employer-cost','taiwan-elder-care'])
 useEffect(()=>{
  if(!slug)return
  logToolEvent(slug,'tool_open').catch(()=>{})
  try{
    const current=JSON.parse(localStorage.getItem('anytool_recent')||'[]')
    const next=[slug,...current.filter(x=>x!==slug)].slice(0,8)
    localStorage.setItem('anytool_recent',JSON.stringify(next))
  }catch{}
 },[slug])
 if(!tool)return <div className="mx-auto max-w-5xl px-4 py-20"><h1 className="text-3xl font-black">{t('toolNotFound')}</h1><Link className="btn-primary mt-6" to={pathFor('/')}>{t('backHome')}</Link></div>
 const view=useMemo(()=>{
  if(['take-home-pay','labor-insurance','nhi','income-tax','overtime-pay','minimum-wage','employer-cost','annual-salary'].includes(slug))return <MoneyTool slug={slug}/>
  if(slug==='percentage')return <Percentage/>
  if(slug==='loan-payment')return <LoanPayment/>
  if(slug==='random-picker')return <RandomPickerTool/>
  if(slug==='timer')return <TimerTool/>
  if(slug==='taiwan-id-photo')return <IdPhotoTool/>
  if(slug==='image-to-sketch')return <SketchTool/>
  if(slug==='taiwan-elder-care')return <ElderCareTool/>
  if(['image-resize','image-compress','png-to-jpg','jpg-to-png'].includes(slug))return <ImageTool slug={slug}/>
  if(slug==='dpi-calculator')return <Dpi/>
  if(slug==='qr-generator')return <QRGenerator/>
  if(slug==='qr-scanner')return <QRScanner/>
  if(['pdf-merge','pdf-split'].includes(slug))return <PdfTool slug={slug}/>
  return <AITool slug={slug}/>
 },[slug])
 const toolPath=pathFor('/tools/'+slug)
 const categoryPath=pathFor('/categories/'+tool.category)
 const toolUrl='https://www.anytool.online'+toolPath
 const categoryUrl='https://www.anytool.online'+categoryPath
 const categoryName=t('categories.'+tool.category)
 const sourceKeys=toolSourceKeys[slug]||[]
 const reviewed=sourceKeys.map(k=>officialSources[k]?.verified).filter(Boolean).sort().at(-1)||'2026-09-20'
 const reviewedLabel={en:'Reviewed against official sources','zh-TW':'已依官方來源查核',ar:'تمت المراجعة وفق المصادر الرسمية',ur:'سرکاری ذرائع کے مطابق جائزہ لیا گیا'}[lang]||'Reviewed against official sources'
 const seoTitle=toolName(tool)+(regulated2026.has(slug)?' 2026':'')+' | AnyTool.online'
 const imageUrl='https://www.anytool.online/tool-art/'+slug+'.svg'
 const schemas=[
  {'@context':'https://schema.org','@type':'WebPage',name:seoTitle,description:toolDescription(tool),url:toolUrl,inLanguage:lang,dateModified:reviewed,primaryImageOfPage:imageUrl,isPartOf:{'@type':'WebSite',name:'AnyTool.online',url:'https://www.anytool.online/'}},
  {'@context':'https://schema.org','@type':'SoftwareApplication',name:toolName(tool),description:toolDescription(tool),image:imageUrl,applicationCategory:'UtilitiesApplication',operatingSystem:'Web',url:toolUrl,isAccessibleForFree:true,offers:{'@type':'Offer',price:'0',priceCurrency:'USD'}},
  {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'AnyTool',item:'https://www.anytool.online/'},{'@type':'ListItem',position:2,name:categoryName,item:categoryUrl},{'@type':'ListItem',position:3,name:toolName(tool),item:toolUrl}]}
 ]
 const theme={
  'random-picker':['#f15bb5','#ffb84d'],'timer':['#ff9f43','#ffd166'],'image-to-sketch':['#4cc9ff','#8ca7ff'],
  money:['#68c75d','#b7f34a'],image:['#3488e5','#75d7ff'],document:['#6b63df','#9a8cff'],ai:['#a251d8','#e6a8ff'],general:['#ef8b2c','#ffd166']
 }[slug]||({money:['#68c75d','#b7f34a'],image:['#3488e5','#75d7ff'],document:['#6b63df','#9a8cff'],ai:['#a251d8','#e6a8ff'],general:['#ef8b2c','#ffd166']}[tool.category])
 const isRegulated=regulated2026.has(slug)
 return <section className="tool-page-shell" style={{'--tool-accent':theme[0],'--tool-accent-2':theme[1]}}>
  <Seo title={seoTitle} description={toolDescription(tool)} image={'/tool-art/'+slug+'.svg'} jsonLd={schemas}/>
  <div className="tool-page-intro">
   <nav aria-label="Breadcrumb"><Link to={pathFor('/')}>AnyTool</Link><span>/</span><Link to={categoryPath}>{categoryName}</Link></nav>
   <div className="tool-page-title-row"><div><p className="tool-page-kicker">{categoryName}</p><h1>{toolName(tool)}</h1><p>{toolDescription(tool)}</p>{sourceKeys.length>0&&<span className="tool-reviewed">{reviewedLabel}: <time dateTime={reviewed}>{reviewed}</time></span>}</div><button aria-label={t('favorites')} className="tool-favorite-button" onClick={()=>saveFavorite(slug).then(()=>alert(t('saved'))).catch(()=>alert(t('signInFirst')))}><Heart size={18}/></button></div>
  </div>
  <main className="tool-workspace">{view}</main>
  <div className="tool-meta-stack"><ToolGuide tool={tool}/><SourceEvidence slug={slug}/></div>
  <OfficialAssistant slug={slug}/>
  {isRegulated&&<p className="tool-planning-note">{t('planningOnly')}</p>}
  <ToolSearchDock/>
 </section>
}
}
