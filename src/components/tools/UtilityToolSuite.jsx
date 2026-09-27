import { useEffect, useMemo, useState } from 'react'
import { ArrowRightLeft, Copy, Download, RefreshCw } from 'lucide-react'

const copyText=async text=>{try{await navigator.clipboard.writeText(String(text||''))}catch{}}
const downloadText=(name,text,type='text/plain')=>{const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
const Field=({label,children})=><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-400">{label}</span>{children}</label>
const Action=({children,onClick,primary=false,disabled=false})=><button type="button" disabled={disabled} onClick={onClick} className={primary?'btn-primary':'btn-ghost'}>{children}</button>
const Output=({children})=><pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/[0.07] bg-slate-950/80 p-4 text-sm leading-6 text-slate-200">{children}</pre>
const Stat=({label,value})=><div className="result-tile"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 break-words text-lg font-black">{value}</div></div>

const utf8ToBase64=(str,urlSafe=false)=>{
 const bytes=new TextEncoder().encode(str);let binary=''
 for(const b of bytes)binary+=String.fromCharCode(b)
 let out=btoa(binary)
 return urlSafe?out.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''):out
}
const base64ToUtf8=str=>{
 let s=str.trim().replace(/-/g,'+').replace(/_/g,'/')
 while(s.length%4)s+='='
 const binary=atob(s),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0))
 return new TextDecoder().decode(bytes)
}

function JsonFormatter(){
 const sample='{"name":"AnyTool.online","privacy":"browser-first","tools":["JSON","Base64","UUID"],"active":true}'
 const [input,setInput]=useState(sample),[output,setOutput]=useState(''),[error,setError]=useState(''),[indent,setIndent]=useState(2)
 const run=minify=>{try{const parsed=JSON.parse(input);setOutput(JSON.stringify(parsed,null,minify?0:indent));setError('')}catch(e){setOutput('');setError(e.message)}}
 useEffect(()=>{run(false)},[])
 return <div className="tool-work-grid">
  <section className="tool-control-panel space-y-4"><Field label="JSON input"><textarea className="input min-h-64 font-mono" value={input} onChange={e=>setInput(e.target.value)}/></Field><div className="flex flex-wrap items-end gap-2"><Field label="Indent"><select className="input min-w-24" value={indent} onChange={e=>setIndent(Number(e.target.value))}><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="1">1 space</option></select></Field><Action primary onClick={()=>run(false)}>Format</Action><Action onClick={()=>run(true)}>Minify</Action><Action onClick={()=>{setInput(sample);setTimeout(()=>run(false),0)}}><RefreshCw size={15}/> Sample</Action></div>{error&&<p className="status-message text-rose-300">Invalid JSON: {error}</p>}</section>
  <section className="tool-result-panel space-y-3"><div className="flex items-center justify-between"><h3 className="font-bold">Output</h3><div className="flex gap-2"><Action onClick={()=>copyText(output)}><Copy size={15}/> Copy</Action><Action onClick={()=>downloadText('formatted.json',output,'application/json')}><Download size={15}/> Download</Action></div></div><Output>{output||'Format valid JSON to see the result.'}</Output></section>
 </div>
}

function Base64Tool(){
 const [mode,setMode]=useState('encode'),[input,setInput]=useState('Hello, AnyTool.online 👋'),[output,setOutput]=useState(''),[urlSafe,setUrlSafe]=useState(false),[fileInfo,setFileInfo]=useState('')
 const run=()=>{try{setOutput(mode==='encode'?utf8ToBase64(input,urlSafe):base64ToUtf8(input));setFileInfo('')}catch(e){setOutput('Error: invalid Base64 input.')}}
 const fileToData=file=>{const reader=new FileReader();reader.onload=()=>{setOutput(String(reader.result||''));setFileInfo(file.name+' · '+Math.round(file.size/1024)+' KB')};reader.readAsDataURL(file)}
 useEffect(()=>{run()},[mode,urlSafe])
 return <div className="tool-work-grid">
  <section className="tool-control-panel space-y-4"><div className="segmented-control"><button className={mode==='encode'?'active':''} onClick={()=>setMode('encode')}>Encode</button><button className={mode==='decode'?'active':''} onClick={()=>setMode('decode')}>Decode</button></div><Field label={mode==='encode'?'Text':'Base64'}><textarea className="input min-h-52 font-mono" value={input} onChange={e=>setInput(e.target.value)}/></Field>{mode==='encode'&&<label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={urlSafe} onChange={e=>setUrlSafe(e.target.checked)}/> URL-safe Base64</label>}<div className="flex flex-wrap gap-2"><Action primary onClick={run}>{mode==='encode'?'Encode':'Decode'}</Action><label className="btn-ghost cursor-pointer">File → Data URL<input type="file" className="hidden" onChange={e=>e.target.files?.[0]&&fileToData(e.target.files[0])}/></label></div>{fileInfo&&<p className="text-xs text-slate-500">{fileInfo}</p>}</section>
  <section className="tool-result-panel space-y-3"><div className="flex justify-end gap-2"><Action onClick={()=>copyText(output)}><Copy size={15}/> Copy</Action><Action onClick={()=>downloadText('base64-output.txt',output)}><Download size={15}/> Download</Action></div><Output>{output||'Result appears here.'}</Output></section>
 </div>
}

function UrlTool(){
 const [input,setInput]=useState('https://www.anytool.online/tools?query=hello world&lang=繁體中文'),[output,setOutput]=useState(''),[error,setError]=useState('')
 const run=mode=>{try{setOutput(mode==='encode'?encodeURIComponent(input):decodeURIComponent(input));setError('')}catch{setError('Invalid URL-encoded input.');setOutput('')}}
 useEffect(()=>{run('encode')},[])
 return <div className="card p-5 space-y-4"><Field label="Text or URL"><textarea className="input min-h-40 font-mono" value={input} onChange={e=>setInput(e.target.value)}/></Field><div className="flex flex-wrap gap-2"><Action primary onClick={()=>run('encode')}>Encode</Action><Action onClick={()=>run('decode')}>Decode</Action><Action onClick={()=>copyText(output)}><Copy size={15}/> Copy</Action></div>{error&&<p className="text-sm text-rose-300">{error}</p>}<Output>{output}</Output></div>
}

const base64UrlDecode=str=>{let s=str.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const bin=atob(s);return new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0)))}
function JwtTool(){
 const sample='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFueVRvb2wgVXNlciIsImlhdCI6MTc5MDAwMDAwMCwiZXhwIjoxODAwMDAwMDAwfQ.signature'
 const [token,setToken]=useState(sample)
 const decoded=useMemo(()=>{try{const parts=token.trim().split('.');if(parts.length<2)throw new Error('JWT must contain header.payload.signature');const header=JSON.parse(base64UrlDecode(parts[0]));const payload=JSON.parse(base64UrlDecode(parts[1]));return {header,payload,signature:parts[2]||'',error:''}}catch(e){return {error:e.message}}},[token])
 const exp=decoded.payload?.exp?new Date(decoded.payload.exp*1000):null
 return <div className="space-y-4"><div className="card p-5"><Field label="JWT"><textarea className="input min-h-32 font-mono" value={token} onChange={e=>setToken(e.target.value)}/></Field><p className="mt-3 text-xs text-slate-500">This tool decodes claims only. It does not verify the JWT signature.</p></div>{decoded.error?<div className="card p-5 text-rose-300">{decoded.error}</div>:<div className="grid gap-4 lg:grid-cols-2"><div className="card p-5"><div className="flex justify-between"><h3 className="font-bold">Header</h3><Action onClick={()=>copyText(JSON.stringify(decoded.header,null,2))}><Copy size={14}/></Action></div><Output>{JSON.stringify(decoded.header,null,2)}</Output></div><div className="card p-5"><div className="flex justify-between"><h3 className="font-bold">Payload</h3><Action onClick={()=>copyText(JSON.stringify(decoded.payload,null,2))}><Copy size={14}/></Action></div>{exp&&<p className={'mb-3 text-xs font-bold '+(exp.getTime()<Date.now()?'text-rose-300':'text-emerald-300')}>exp: {exp.toLocaleString()} · {exp.getTime()<Date.now()?'expired':'not expired'}</p>}<Output>{JSON.stringify(decoded.payload,null,2)}</Output></div></div>}</div>
}

const bytesToUuid=bytes=>{const h=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20)}
const uuidV4=()=>crypto.randomUUID?crypto.randomUUID():(()=>{const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;return bytesToUuid(b)})()
const uuidV7=()=>{const b=crypto.getRandomValues(new Uint8Array(16)),t=Date.now();b[0]=Math.floor(t/2**40)&255;b[1]=Math.floor(t/2**32)&255;b[2]=Math.floor(t/2**24)&255;b[3]=Math.floor(t/2**16)&255;b[4]=Math.floor(t/2**8)&255;b[5]=t&255;b[6]=(b[6]&15)|112;b[8]=(b[8]&63)|128;return bytesToUuid(b)}
function UuidTool(){
 const [version,setVersion]=useState('v4'),[count,setCount]=useState(5),[upper,setUpper]=useState(false),[hyphens,setHyphens]=useState(true),[out,setOut]=useState('')
 const generate=()=>{const n=Math.min(100,Math.max(1,count));const xs=Array.from({length:n},()=>version==='v7'?uuidV7():uuidV4()).map(x=>{let v=upper?x.toUpperCase():x;return hyphens?v:v.replaceAll('-','')});setOut(xs.join('\n'))}
 useEffect(generate,[version])
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><Field label="Version"><select className="input" value={version} onChange={e=>setVersion(e.target.value)}><option value="v4">UUID v4 · random</option><option value="v7">UUID v7 · time-sortable</option></select></Field><Field label="Quantity (1–100)"><input className="input" type="number" min="1" max="100" value={count} onChange={e=>setCount(Number(e.target.value))}/></Field><label className="flex gap-2 text-sm"><input type="checkbox" checked={upper} onChange={e=>setUpper(e.target.checked)}/> Uppercase</label><label className="flex gap-2 text-sm"><input type="checkbox" checked={hyphens} onChange={e=>setHyphens(e.target.checked)}/> Keep hyphens</label><Action primary onClick={generate}>Generate UUIDs</Action></section><section className="tool-result-panel space-y-3"><div className="flex gap-2 justify-end"><Action onClick={()=>copyText(out)}><Copy size={15}/> Copy all</Action><Action onClick={()=>downloadText('uuids.txt',out)}><Download size={15}/> Download</Action></div><Output>{out}</Output></section></div>
}

const hexOf=buf=>Array.from(new Uint8Array(buf),b=>b.toString(16).padStart(2,'0')).join('')
function HashTool(){
 const [input,setInput]=useState('Hello, AnyTool.online!'),[algo,setAlgo]=useState('SHA-256'),[out,setOut]=useState(''),[name,setName]=useState('')
 const digest=async data=>setOut(hexOf(await crypto.subtle.digest(algo,data)))
 const hashText=()=>digest(new TextEncoder().encode(input))
 const hashFile=async file=>{setName(file.name);await digest(await file.arrayBuffer())}
 useEffect(()=>{hashText()},[algo])
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><Field label="Algorithm"><select className="input" value={algo} onChange={e=>setAlgo(e.target.value)}><option>SHA-256</option><option>SHA-384</option><option>SHA-512</option><option>SHA-1</option></select></Field><Field label="Text"><textarea className="input min-h-40 font-mono" value={input} onChange={e=>setInput(e.target.value)}/></Field><div className="flex flex-wrap gap-2"><Action primary onClick={hashText}>Hash text</Action><label className="btn-ghost cursor-pointer">Hash file<input type="file" className="hidden" onChange={e=>e.target.files?.[0]&&hashFile(e.target.files[0])}/></label></div>{name&&<p className="text-xs text-slate-500">File: {name}</p>}</section><section className="tool-result-panel space-y-3"><div className="flex justify-between"><h3 className="font-bold">{algo}</h3><Action onClick={()=>copyText(out)}><Copy size={15}/> Copy</Action></div><Output>{out}</Output><p className="text-xs text-slate-500">SHA-1 is included for compatibility checks, not for new security designs.</p></section></div>
}

function RegexTool(){
 const [pattern,setPattern]=useState('([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})'),[flags,setFlags]=useState('gi'),[text,setText]=useState('Email alice@example.com or support@anytool.online for help.')
 const result=useMemo(()=>{try{const safeFlags=[...new Set((flags.replace(/[^dgimsuvy]/g,'')+'g').split(''))].join('');const re=new RegExp(pattern,safeFlags);const matches=[...text.matchAll(re)].slice(0,500).map((m,i)=>({i:i+1,text:m[0],index:m.index,groups:m.slice(1)}));return {matches,error:''}}catch(e){return {matches:[],error:e.message}}},[pattern,flags,text])
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><div className="grid gap-3 sm:grid-cols-[1fr_120px]"><Field label="Pattern"><input className="input font-mono" value={pattern} onChange={e=>setPattern(e.target.value)}/></Field><Field label="Flags"><input className="input font-mono" value={flags} onChange={e=>setFlags(e.target.value)}/></Field></div><Field label="Test text"><textarea className="input min-h-56 font-mono" value={text} onChange={e=>setText(e.target.value)}/></Field>{result.error&&<p className="text-sm text-rose-300">{result.error}</p>}</section><section className="tool-result-panel"><h3 className="font-bold">{result.matches.length} matches</h3><div className="mt-4 grid gap-2">{result.matches.map(m=><div key={m.i+'-'+m.index} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-sm"><div className="flex justify-between gap-3"><code className="break-all text-emerald-300">{m.text}</code><span className="shrink-0 text-slate-500">@ {m.index}</span></div>{m.groups.length>0&&<div className="mt-2 text-xs text-slate-500">Groups: {m.groups.map(x=>x??'∅').join(' · ')}</div>}</div>)}</div></section></div>
}

function TimestampTool(){
 const [now,setNow]=useState(Date.now()),[timestamp,setTimestamp]=useState(()=>String(Math.floor(Date.now()/1000))),[dateInput,setDateInput]=useState(()=>new Date().toISOString().slice(0,16))
 useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(id)},[])
 const parsed=useMemo(()=>{const n=Number(timestamp);if(!Number.isFinite(n))return null;const d=new Date(String(Math.trunc(Math.abs(n))).length<=10?n*1000:n);return Number.isNaN(d.getTime())?null:d},[timestamp])
 const fromDate=()=>{const d=new Date(dateInput);if(!Number.isNaN(d.getTime()))setTimestamp(String(Math.floor(d.getTime()/1000)))}
 return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-3"><Stat label="Unix seconds now" value={Math.floor(now/1000)}/><Stat label="Unix ms now" value={now}/><Stat label="UTC now" value={new Date(now).toISOString()}/></div><div className="tool-work-grid"><section className="tool-control-panel space-y-4"><Field label="Unix timestamp (seconds or milliseconds)"><input className="input font-mono" value={timestamp} onChange={e=>setTimestamp(e.target.value)}/></Field><Action onClick={()=>setTimestamp(String(Math.floor(Date.now()/1000)))}>Use current time</Action><Field label="Date/time → Unix"><input className="input" type="datetime-local" value={dateInput} onChange={e=>setDateInput(e.target.value)}/></Field><Action primary onClick={fromDate}>Convert to Unix</Action></section><section className="tool-result-panel"><div className="grid gap-3">{parsed?<><Stat label="Local time" value={parsed.toLocaleString()}/><Stat label="UTC" value={parsed.toUTCString()}/><Stat label="ISO 8601" value={parsed.toISOString()}/></>:<p className="text-rose-300">Enter a valid timestamp.</p>}</div></section></div></div>
}

function WordCounter(){
 const [text,setText]=useState('')
 const s=useMemo(()=>{const t=text.trim(),words=t?t.split(/\s+/).length:0;return {words,chars:text.length,noSpaces:text.replace(/\s/g,'').length,lines:text?text.split(/\r?\n/).length:0,sentences:t?(t.match(/[.!?]+(?=\s|$)/g)||[]).length:0,minutes:words?Math.max(1,Math.ceil(words/200)):0}},[text])
 return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6"><Stat label="Words" value={s.words}/><Stat label="Characters" value={s.chars}/><Stat label="No spaces" value={s.noSpaces}/><Stat label="Lines" value={s.lines}/><Stat label="Sentences" value={s.sentences}/><Stat label="Reading time" value={s.minutes?s.minutes+' min':'0 min'}/></div><div className="card p-5"><textarea autoFocus className="input min-h-80" placeholder="Type or paste text here…" value={text} onChange={e=>setText(e.target.value)}/></div></div>
}

const titleCase=s=>s.toLowerCase().replace(/\b\p{L}/gu,c=>c.toUpperCase())
const words=s=>s.trim().split(/[^\p{L}\p{N}]+/u).filter(Boolean)
function TextCaseTool(){
 const [input,setInput]=useState('AnyTool online makes everyday utilities easier.')
 const transforms={UPPERCASE:s=>s.toUpperCase(),lowercase:s=>s.toLowerCase(),'Title Case':titleCase,'Sentence case':s=>s.toLowerCase().replace(/(^|[.!?]\s+)\p{L}/gu,c=>c.toUpperCase()),camelCase:s=>{const w=words(s).map(x=>x.toLowerCase());return (w[0]||'')+w.slice(1).map(x=>x[0]?.toUpperCase()+x.slice(1)).join('')},snake_case:s=>words(s).map(x=>x.toLowerCase()).join('_'),'kebab-case':s=>words(s).map(x=>x.toLowerCase()).join('-'),CONSTANT_CASE:s=>words(s).map(x=>x.toUpperCase()).join('_')}
 return <div className="card p-5 space-y-4"><Field label="Text"><textarea className="input min-h-56" value={input} onChange={e=>setInput(e.target.value)}/></Field><div className="flex flex-wrap gap-2">{Object.entries(transforms).map(([name,fn])=><Action key={name} onClick={()=>setInput(fn(input))}>{name}</Action>)}</div><Action primary onClick={()=>copyText(input)}><Copy size={15}/> Copy result</Action></div>
}

const securePassword=(length,sets)=>{
 const chars=sets.join('');if(!chars)return ''
 const max=256-(256%chars.length),out=[]
 while(out.length<length){const a=crypto.getRandomValues(new Uint8Array(Math.max(32,length)));for(const n of a){if(n<max){out.push(chars[n%chars.length]);if(out.length===length)break}}}
 return out.join('')
}
const passwordMetrics=p=>{
 let pool=0;if(/[a-z]/.test(p))pool+=26;if(/[A-Z]/.test(p))pool+=26;if(/[0-9]/.test(p))pool+=10;if(/[^A-Za-z0-9]/.test(p))pool+=33
 let entropy=pool?Math.round(p.length*Math.log2(pool)):0
 if(/(.)\1{2,}/.test(p))entropy=Math.round(entropy*.72)
 if(/password|qwerty|12345|letmein|admin/i.test(p))entropy=Math.min(entropy,25)
 const level=entropy<35?'Weak':entropy<55?'Fair':entropy<75?'Strong':'Very strong'
 return {entropy,level,pool}
}
function PasswordGenerator(){
 const [length,setLength]=useState(20),[upper,setUpper]=useState(true),[lower,setLower]=useState(true),[nums,setNums]=useState(true),[symbols,setSymbols]=useState(true),[amb,setAmb]=useState(false),[pwd,setPwd]=useState('')
 const generate=()=>{let sets=[];if(lower)sets.push('abcdefghijkmnopqrstuvwxyz'+(amb?'l':''));if(upper)sets.push('ABCDEFGHJKLMNPQRSTUVWXYZ'+(amb?'IO':''));if(nums)sets.push('23456789'+(amb?'01':''));if(symbols)sets.push('!@#$%^&*()-_=+[]{};:,.?');setPwd(securePassword(Math.max(6,Math.min(128,length)),sets))}
 useEffect(generate,[length,upper,lower,nums,symbols,amb])
 const m=passwordMetrics(pwd)
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><Field label={'Length: '+length}><input className="w-full" type="range" min="6" max="64" value={length} onChange={e=>setLength(Number(e.target.value))}/></Field><div className="grid gap-2 sm:grid-cols-2">{[['Uppercase',upper,setUpper],['Lowercase',lower,setLower],['Numbers',nums,setNums],['Symbols',symbols,setSymbols],['Include ambiguous 0/O/1/I/l',amb,setAmb]].map(([l,v,s])=><label key={l} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v} onChange={e=>s(e.target.checked)}/>{l}</label>)}</div><Action primary onClick={generate}>Generate</Action></section><section className="tool-result-panel space-y-4"><Output>{pwd}</Output><div className="grid gap-3 sm:grid-cols-2"><Stat label="Estimated entropy" value={m.entropy+' bits'}/><Stat label="Strength" value={m.level}/></div><Action onClick={()=>copyText(pwd)}><Copy size={15}/> Copy password</Action></section></div>
}

function PasswordStrength(){
 const [pwd,setPwd]=useState('Correct-Horse-Battery-2026!'),[show,setShow]=useState(false)
 const m=passwordMetrics(pwd),seconds=m.entropy?2**Math.min(m.entropy,60)/1e10:0
 const crack=seconds<1?'< 1 second':seconds<60?Math.round(seconds)+' seconds':seconds<86400?Math.round(seconds/3600)+' hours':seconds<31557600?Math.round(seconds/86400)+' days':(seconds/31557600).toFixed(seconds/31557600<100?1:0)+' years'
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><Field label="Password"><div className="flex gap-2"><input className="input" type={show?'text':'password'} value={pwd} onChange={e=>setPwd(e.target.value)}/><Action onClick={()=>setShow(v=>!v)}>{show?'Hide':'Show'}</Action></div></Field><p className="text-xs leading-5 text-slate-500">Checked entirely in your browser. The crack-time estimate is illustrative and depends heavily on attacker hardware and hashing method.</p></section><section className="tool-result-panel"><div className="grid gap-3 sm:grid-cols-2"><Stat label="Strength" value={m.level}/><Stat label="Estimated entropy" value={m.entropy+' bits'}/><Stat label="Character pool" value={m.pool}/><Stat label="Rough offline-guess time" value={crack}/></div></section></div>
}

const hexToRgb=hex=>{let h=hex.replace('#','').trim();if(h.length===3)h=h.split('').map(x=>x+x).join('');if(!/^[0-9a-f]{6}$/i.test(h))return null;const n=parseInt(h,16);return {r:n>>16,g:(n>>8)&255,b:n&255}}
const rgbToHsl=({r,g,b})=>{r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0,s=0,l=(max+min)/2;if(d){s=d/(1-Math.abs(2*l-1));if(max===r)h=60*(((g-b)/d)%6);else if(max===g)h=60*((b-r)/d+2);else h=60*((r-g)/d+4);if(h<0)h+=360}return {h:Math.round(h),s:Math.round(s*100),l:Math.round(l*100)}}
const luminance=rgb=>{const f=v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4};return .2126*f(rgb.r)+.7152*f(rgb.g)+.0722*f(rgb.b)}
const contrast=(a,b)=>{const l1=luminance(a),l2=luminance(b);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)}
function ColorTool(){
 const [hex,setHex]=useState('#3B82F6');const rgb=hexToRgb(hex),hsl=rgb?rgbToHsl(rgb):null,white={r:255,g:255,b:255},black={r:0,g:0,b:0}
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><Field label="Color"><div className="flex gap-3"><input type="color" className="h-12 w-20 rounded-lg bg-transparent" value={rgb?hex:'#000000'} onChange={e=>setHex(e.target.value.toUpperCase())}/><input className="input font-mono" value={hex} onChange={e=>setHex(e.target.value)}/></div></Field><div className="h-40 rounded-2xl border border-white/[0.08]" style={{background:rgb?hex:'#111827'}}/></section><section className="tool-result-panel space-y-3">{rgb?<><Stat label="HEX" value={hex.toUpperCase()}/><Stat label="RGB" value={'rgb('+rgb.r+', '+rgb.g+', '+rgb.b+')'}/><Stat label="HSL" value={'hsl('+hsl.h+' '+hsl.s+'% '+hsl.l+'%)'}/><div className="grid gap-3 sm:grid-cols-2"><Stat label="Contrast vs white" value={contrast(rgb,white).toFixed(2)+':1'}/><Stat label="Contrast vs black" value={contrast(rgb,black).toFixed(2)+':1'}/></div><Action onClick={()=>copyText(hex.toUpperCase())}><Copy size={15}/> Copy HEX</Action></>:<p className="text-rose-300">Enter a valid 3- or 6-digit HEX color.</p>}</section></div>
}

const gcd=(a,b)=>{a=Math.abs(Math.round(a));b=Math.abs(Math.round(b));while(b)[a,b]=[b,a%b];return a||1}
function AspectRatioTool(){
 const [w,setW]=useState(1920),[h,setH]=useState(1080),[targetW,setTargetW]=useState(1280)
 const g=gcd(w,h),rw=w/g,rh=h/g,targetH=w?Math.round(targetW*h/w):0
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="Original width"><input className="input" type="number" min="1" value={w} onChange={e=>setW(Number(e.target.value))}/></Field><Field label="Original height"><input className="input" type="number" min="1" value={h} onChange={e=>setH(Number(e.target.value))}/></Field></div><Field label="New width"><input className="input" type="number" min="1" value={targetW} onChange={e=>setTargetW(Number(e.target.value))}/></Field><div className="flex flex-wrap gap-2">{[[1920,1080],[1080,1920],[1200,1200],[1600,900],[1024,768]].map(([a,b])=><Action key={a+'x'+b} onClick={()=>{setW(a);setH(b);setTargetW(a)}}>{a}×{b}</Action>)}</div></section><section className="tool-result-panel"><div className="grid gap-3 sm:grid-cols-2"><Stat label="Simplified ratio" value={rw+':'+rh}/><Stat label="Decimal ratio" value={h?(w/h).toFixed(4):'—'}/><Stat label="Matching height" value={targetH+' px'}/><Stat label="Megapixels" value={((w*h)/1e6).toFixed(2)+' MP'}/></div></section></div>
}

const localDate=s=>new Date(s+'T00:00:00')
const isoLocal=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')
const businessDays=(a,b)=>{let start=new Date(Math.min(a,b)),end=new Date(Math.max(a,b)),n=0;for(let d=new Date(start);d<end;d.setDate(d.getDate()+1)){const day=d.getDay();if(day!==0&&day!==6)n++}return n}
function DateTool(){
 const today=isoLocal(new Date()),[mode,setMode]=useState('between'),[start,setStart]=useState(today),[end,setEnd]=useState(()=>{const d=new Date();d.setDate(d.getDate()+30);return isoLocal(d)}),[base,setBase]=useState(today),[days,setDays]=useState(30),[months,setMonths]=useState(0),[years,setYears]=useState(0),[birth,setBirth]=useState('2000-01-01')
 const a=localDate(start),b=localDate(end),diff=Math.round(Math.abs(b-a)/864e5),business=businessDays(a,b)
 const shifted=useMemo(()=>{const d=localDate(base);d.setFullYear(d.getFullYear()+years);d.setMonth(d.getMonth()+months);d.setDate(d.getDate()+days);return d},[base,days,months,years])
 const age=useMemo(()=>{const dob=localDate(birth),now=localDate(today);if(Number.isNaN(dob.getTime())||dob>now)return null;let y=now.getFullYear()-dob.getFullYear(),m=now.getMonth()-dob.getMonth(),d=now.getDate()-dob.getDate();if(d<0){m--;d+=new Date(now.getFullYear(),now.getMonth(),0).getDate()}if(m<0){y--;m+=12}return {y,m,d}},[birth,today])
 return <div className="space-y-4"><div className="segmented-control"><button className={mode==='between'?'active':''} onClick={()=>setMode('between')}>Between dates</button><button className={mode==='add'?'active':''} onClick={()=>setMode('add')}>Add / subtract</button><button className={mode==='age'?'active':''} onClick={()=>setMode('age')}>Age</button></div>{mode==='between'&&<div className="tool-work-grid"><section className="tool-control-panel grid gap-4 sm:grid-cols-2"><Field label="Start"><input className="input" type="date" value={start} onChange={e=>setStart(e.target.value)}/></Field><Field label="End"><input className="input" type="date" value={end} onChange={e=>setEnd(e.target.value)}/></Field></section><section className="tool-result-panel grid gap-3 sm:grid-cols-2"><Stat label="Calendar days" value={diff}/><Stat label="Weekdays (Mon–Fri)" value={business}/><Stat label="Weeks" value={(diff/7).toFixed(2)}/><Stat label="Approx. months" value={(diff/30.4375).toFixed(2)}/></section></div>}{mode==='add'&&<div className="tool-work-grid"><section className="tool-control-panel space-y-4"><Field label="Base date"><input className="input" type="date" value={base} onChange={e=>setBase(e.target.value)}/></Field><div className="grid gap-3 sm:grid-cols-3"><Field label="Years"><input className="input" type="number" value={years} onChange={e=>setYears(Number(e.target.value))}/></Field><Field label="Months"><input className="input" type="number" value={months} onChange={e=>setMonths(Number(e.target.value))}/></Field><Field label="Days"><input className="input" type="number" value={days} onChange={e=>setDays(Number(e.target.value))}/></Field></div></section><section className="tool-result-panel"><Stat label="Result date" value={shifted.toLocaleDateString(undefined,{dateStyle:'full'})}/></section></div>}{mode==='age'&&<div className="tool-work-grid"><section className="tool-control-panel"><Field label="Date of birth"><input className="input" type="date" value={birth} onChange={e=>setBirth(e.target.value)}/></Field></section><section className="tool-result-panel">{age?<div className="grid gap-3 sm:grid-cols-3"><Stat label="Years" value={age.y}/><Stat label="Months" value={age.m}/><Stat label="Days" value={age.d}/></div>:<p className="text-rose-300">Enter a valid date of birth.</p>}</section></div>}</div>
}

const unitCategories={
 length:{label:'Length',units:{mm:['mm',v=>v/1000,v=>v*1000],cm:['cm',v=>v/100,v=>v*100],m:['m',v=>v,v=>v],km:['km',v=>v*1000,v=>v/1000],in:['in',v=>v*.0254,v=>v/.0254],ft:['ft',v=>v*.3048,v=>v/.3048],mi:['mi',v=>v*1609.344,v=>v/1609.344]}},
 mass:{label:'Mass',units:{mg:['mg',v=>v/1e6,v=>v*1e6],g:['g',v=>v/1000,v=>v*1000],kg:['kg',v=>v,v=>v],oz:['oz',v=>v*.028349523125,v=>v/.028349523125],lb:['lb',v=>v*.45359237,v=>v/.45359237]}},
 temperature:{label:'Temperature',units:{c:['°C',v=>v,v=>v],f:['°F',v=>(v-32)*5/9,v=>v*9/5+32],k:['K',v=>v-273.15,v=>v+273.15]}},
 area:{label:'Area',units:{sqm:['m²',v=>v,v=>v],sqkm:['km²',v=>v*1e6,v=>v/1e6],sqft:['ft²',v=>v*.09290304,v=>v/.09290304],acre:['acre',v=>v*4046.8564224,v=>v/4046.8564224],hectare:['ha',v=>v*10000,v=>v/10000]}},
 volume:{label:'Volume',units:{ml:['mL',v=>v/1000,v=>v*1000],l:['L',v=>v,v=>v],cup:['cup',v=>v*.2365882365,v=>v/.2365882365],gal:['US gal',v=>v*3.785411784,v=>v/3.785411784]}},
 speed:{label:'Speed',units:{mps:['m/s',v=>v,v=>v],kmh:['km/h',v=>v/3.6,v=>v*3.6],mph:['mph',v=>v*.44704,v=>v/.44704],knot:['kn',v=>v*.514444,v=>v/.514444]}},
 data:{label:'Digital storage',units:{b:['B',v=>v,v=>v],kb:['KB',v=>v*1e3,v=>v/1e3],mb:['MB',v=>v*1e6,v=>v/1e6],gb:['GB',v=>v*1e9,v=>v/1e9],kib:['KiB',v=>v*1024,v=>v/1024],mib:['MiB',v=>v*1048576,v=>v/1048576],gib:['GiB',v=>v*1073741824,v=>v/1073741824]}}
}
function UnitTool(){
 const [cat,setCat]=useState('length'),[value,setValue]=useState(1),[from,setFrom]=useState('m'),[to,setTo]=useState('ft'),[precision,setPrecision]=useState(6)
 const def=unitCategories[cat],fromDef=def.units[from]||Object.values(def.units)[0],toDef=def.units[to]||Object.values(def.units)[1]||fromDef,result=toDef[2](fromDef[1](Number(value)||0))
 const changeCat=id=>{const ks=Object.keys(unitCategories[id].units);setCat(id);setFrom(ks[0]);setTo(ks[1]||ks[0])}
 const formatted=Number.isFinite(result)?Number(result.toPrecision(Math.max(1,precision))).toLocaleString(undefined,{maximumSignificantDigits:precision}):'—'
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><Field label="Category"><select className="input" value={cat} onChange={e=>changeCat(e.target.value)}>{Object.entries(unitCategories).map(([id,c])=><option value={id} key={id}>{c.label}</option>)}</select></Field><Field label="Value"><input className="input" type="number" step="any" value={value} onChange={e=>setValue(e.target.value)}/></Field><div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2"><Field label="From"><select className="input" value={from} onChange={e=>setFrom(e.target.value)}>{Object.entries(def.units).map(([id,u])=><option key={id} value={id}>{u[0]}</option>)}</select></Field><Action onClick={()=>{setFrom(to);setTo(from)}}><ArrowRightLeft size={16}/></Action><Field label="To"><select className="input" value={to} onChange={e=>setTo(e.target.value)}>{Object.entries(def.units).map(([id,u])=><option key={id} value={id}>{u[0]}</option>)}</select></Field></div><Field label={'Precision: '+precision+' significant digits'}><input className="w-full" type="range" min="2" max="12" value={precision} onChange={e=>setPrecision(Number(e.target.value))}/></Field></section><section className="tool-result-panel space-y-4"><Stat label={fromDef[0]+' → '+toDef[0]} value={formatted+' '+toDef[0]}/><Action onClick={()=>copyText(String(result))}><Copy size={15}/> Copy exact value</Action><div className="grid gap-2">{Object.entries(def.units).map(([id,u])=><div key={id} className="flex justify-between rounded-lg border border-white/[0.06] px-3 py-2 text-sm"><span className="text-slate-400">{u[0]}</span><span className="font-mono">{Number(u[2](fromDef[1](Number(value)||0)).toPrecision(7))}</span></div>)}</div></section></div>
}

const components={
 'json-formatter':JsonFormatter,'base64':Base64Tool,'url-encoder':UrlTool,'jwt-decoder':JwtTool,'uuid-generator':UuidTool,'hash-generator':HashTool,'regex-tester':RegexTool,'timestamp-converter':TimestampTool,
 'word-counter':WordCounter,'text-case':TextCaseTool,'password-generator':PasswordGenerator,'password-strength-checker':PasswordStrength,'color-converter':ColorTool,'aspect-ratio-calculator':AspectRatioTool,'date-calculator':DateTool,'unit-converter':UnitTool
}

export const utilityToolSlugs=new Set(Object.keys(components))
export default function UtilityToolSuite({slug}){const Component=components[slug];return Component?<Component/>:null}
