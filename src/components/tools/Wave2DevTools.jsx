import { useEffect, useMemo, useState } from 'react'
import { Copy, Download } from 'lucide-react'

const copyText=async text=>{try{await navigator.clipboard.writeText(String(text??''))}catch{}}
const downloadText=(name,text,type='text/plain')=>{const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
const Field=({label,children})=><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-400">{label}</span>{children}</label>
const Action=({children,onClick,primary=false})=><button type="button" onClick={onClick} className={primary?'btn-primary':'btn-ghost'}>{children}</button>
const Output=({children})=><pre className="max-h-[30rem] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/[0.07] bg-slate-950/80 p-4 text-sm leading-6 text-slate-200">{children}</pre>

export function CsvConverter(){
 const [mode,setMode]=useState('csv2json'),[input,setInput]=useState('name,email,role\nAvery,avery@example.com,Engineer\nMina,mina@example.com,Designer'),[output,setOutput]=useState(''),[error,setError]=useState('')
 const convert=async()=>{
  try{
   const Papa=(await import('papaparse')).default
   if(mode==='csv2json'){
    const r=Papa.parse(input,{header:true,skipEmptyLines:true})
    if(r.errors?.length)throw new Error(r.errors[0].message)
    setOutput(JSON.stringify(r.data,null,2))
   }else{
    const data=JSON.parse(input)
    if(!Array.isArray(data))throw new Error('JSON input must be an array of objects.')
    setOutput(Papa.unparse(data))
   }
   setError('')
  }catch(e){setOutput('');setError(e.message)}
 }
 useEffect(()=>{convert()},[mode])
 return <div className="tool-work-grid">
  <section className="tool-control-panel space-y-4">
   <div className="segmented-control"><button className={mode==='csv2json'?'active':''} onClick={()=>setMode('csv2json')}>CSV → JSON</button><button className={mode==='json2csv'?'active':''} onClick={()=>setMode('json2csv')}>JSON → CSV</button></div>
   <Field label={mode==='csv2json'?'CSV input':'JSON array input'}><textarea aria-label={mode==='csv2json'?'CSV input':'JSON array input'} className="input min-h-64 font-mono" value={input} onChange={e=>setInput(e.target.value)}/></Field>
   <Action primary onClick={convert}>Convert</Action>
   {error&&<p className="text-sm text-rose-300">{error}</p>}
  </section>
  <section className="tool-result-panel space-y-3"><div className="flex justify-end gap-2"><Action onClick={()=>copyText(output)}><Copy size={15}/> Copy</Action><Action onClick={()=>downloadText(mode==='csv2json'?'converted.json':'converted.csv',output,mode==='csv2json'?'application/json':'text/csv')}><Download size={15}/> Download</Action></div><Output>{output||'Converted output appears here.'}</Output></section>
 </div>
}

export function YamlJsonTool(){
 const sampleYaml='app: anytool\nversion: 2\nfeatures:\n  - fast\n  - browser-local\nenabled: true'
 const sampleJson='{"app":"anytool","version":2,"features":["fast","browser-local"],"enabled":true}'
 const [mode,setMode]=useState('yaml2json'),[input,setInput]=useState(sampleYaml),[output,setOutput]=useState(''),[error,setError]=useState(''),[indent,setIndent]=useState(2)
 const convert=async()=>{
  try{
   const yamlModule=await import('js-yaml'),yaml=yamlModule.default||yamlModule
   if(mode==='yaml2json')setOutput(JSON.stringify(yaml.load(input),null,indent))
   else setOutput(yaml.dump(JSON.parse(input),{indent,lineWidth:100,noRefs:true}))
   setError('')
  }catch(e){setOutput('');setError(e.message)}
 }
 useEffect(()=>{convert()},[mode,indent])
 const switchMode=m=>{setMode(m);setInput(m==='yaml2json'?sampleYaml:sampleJson)}
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><div className="segmented-control"><button className={mode==='yaml2json'?'active':''} onClick={()=>switchMode('yaml2json')}>YAML → JSON</button><button className={mode==='json2yaml'?'active':''} onClick={()=>switchMode('json2yaml')}>JSON → YAML</button></div><Field label={mode==='yaml2json'?'YAML input':'JSON input'}><textarea aria-label={mode==='yaml2json'?'YAML input':'JSON input'} className="input min-h-64 font-mono" value={input} onChange={e=>setInput(e.target.value)}/></Field><div className="flex items-end gap-2"><Field label="JSON indent"><select className="input" value={indent} onChange={e=>setIndent(Number(e.target.value))}><option value="2">2</option><option value="4">4</option></select></Field><Action primary onClick={convert}>Convert</Action></div>{error&&<p className="text-sm text-rose-300">{error}</p>}</section><section className="tool-result-panel space-y-3"><div className="flex justify-end gap-2"><Action onClick={()=>copyText(output)}><Copy size={15}/> Copy</Action><Action onClick={()=>downloadText(mode==='yaml2json'?'converted.json':'converted.yaml',output,mode==='yaml2json'?'application/json':'text/yaml')}><Download size={15}/> Download</Action></div><Output>{output}</Output></section></div>
}

const pascal=s=>String(s||'Type').replace(/[^A-Za-z0-9]+(.)/g,(_,c)=>c.toUpperCase()).replace(/^./,c=>c.toUpperCase()).replace(/[^A-Za-z0-9]/g,'')||'Type'
function makeTsTypes(value,root='Root',optional=false,readonly=false){
 const defs=[],seen=new Set(),prefix=readonly?'readonly ':'',q=optional?'?':''
 const typeFor=(v,name)=>{
  if(v===null)return 'null'
  if(Array.isArray(v)){if(!v.length)return 'unknown[]';const ts=[...new Set(v.slice(0,20).map((x,i)=>typeFor(x,name+'Item'+(i?i:''))))];return '('+ts.join(' | ')+')[]'}
  if(typeof v==='object'){const n=pascal(name);build(v,n);return n}
  if(typeof v==='number')return 'number'
  if(typeof v==='boolean')return 'boolean'
  return 'string'
 }
 const build=(obj,name)=>{if(seen.has(name))return;seen.add(name);const lines=Object.entries(obj||{}).map(([k,v])=>'  '+prefix+k+q+': '+typeFor(v,pascal(k))+';');defs.unshift('export interface '+name+' {\n'+lines.join('\n')+'\n}')}
 if(Array.isArray(value)){const item=value[0]??{};if(item&&typeof item==='object'&&!Array.isArray(item)){build(item,pascal(root)+'Item');defs.push('export type '+pascal(root)+' = '+pascal(root)+'Item[]')}else defs.push('export type '+pascal(root)+' = '+typeFor(value,pascal(root)+'Item'))}
 else if(value&&typeof value==='object')build(value,pascal(root))
 else defs.push('export type '+pascal(root)+' = '+typeFor(value,pascal(root)))
 return defs.join('\n\n')
}
export function JsonToTypes(){
 const sample=JSON.stringify({id:101,name:'Alex',active:true,roles:['admin','developer'],profile:{age:28,city:'Taipei'},tags:[{id:1,label:'React'}]},null,2)
 const [input,setInput]=useState(sample),[root,setRoot]=useState('RootObject'),[optional,setOptional]=useState(false),[readonly,setReadonly]=useState(false)
 const result=useMemo(()=>{try{return {text:makeTsTypes(JSON.parse(input),root,optional,readonly),error:''}}catch(e){return {text:'',error:e.message}}},[input,root,optional,readonly])
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><Field label="JSON input"><textarea aria-label="JSON input" className="input min-h-64 font-mono" value={input} onChange={e=>setInput(e.target.value)}/></Field><Field label="Root type name"><input aria-label="Root type name" className="input" value={root} onChange={e=>setRoot(e.target.value)}/></Field><div className="flex flex-wrap gap-5 text-sm text-slate-300"><label className="flex gap-2"><input type="checkbox" checked={optional} onChange={e=>setOptional(e.target.checked)}/> Optional properties</label><label className="flex gap-2"><input type="checkbox" checked={readonly} onChange={e=>setReadonly(e.target.checked)}/> Readonly properties</label></div>{result.error&&<p className="text-rose-300">{result.error}</p>}</section><section className="tool-result-panel space-y-3"><div className="flex justify-end gap-2"><Action onClick={()=>copyText(result.text)}><Copy size={15}/> Copy</Action><Action onClick={()=>downloadText('types.ts',result.text,'text/typescript')}><Download size={15}/> Download</Action></div><Output>{result.text||'Valid JSON generates TypeScript here.'}</Output></section></div>
}

export function SqlFormatterTool(){
 const sample="select u.id,u.name,count(o.id) as orders from users u left join orders o on o.user_id=u.id where u.active=true group by u.id,u.name order by orders desc limit 10;"
 const [input,setInput]=useState(sample),[output,setOutput]=useState(''),[dialect,setDialect]=useState('sql'),[keywordCase,setKeywordCase]=useState('upper'),[indent,setIndent]=useState(2),[error,setError]=useState('')
 const formatSql=async()=>{try{const mod=await import('sql-formatter');setOutput(mod.format(input,{language:dialect,keywordCase,tabWidth:indent,useTabs:false}));setError('')}catch(e){setOutput('');setError(e.message)}}
 useEffect(()=>{formatSql()},[dialect,keywordCase,indent])
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><div className="grid gap-3 sm:grid-cols-3"><Field label="SQL dialect"><select aria-label="SQL dialect" className="input" value={dialect} onChange={e=>setDialect(e.target.value)}><option value="sql">Standard SQL</option><option value="postgresql">PostgreSQL</option><option value="mysql">MySQL</option><option value="sqlite">SQLite</option><option value="transactsql">SQL Server</option><option value="plsql">Oracle PL/SQL</option></select></Field><Field label="Keyword case"><select className="input" value={keywordCase} onChange={e=>setKeywordCase(e.target.value)}><option value="upper">UPPER</option><option value="lower">lower</option><option value="preserve">Preserve</option></select></Field><Field label="Indent"><select className="input" value={indent} onChange={e=>setIndent(Number(e.target.value))}><option value="2">2 spaces</option><option value="4">4 spaces</option></select></Field></div><Field label="Raw SQL"><textarea aria-label="Raw SQL" className="input min-h-64 font-mono" value={input} onChange={e=>setInput(e.target.value)}/></Field><div className="flex gap-2"><Action primary onClick={formatSql}>Format SQL</Action><Action onClick={()=>setInput(input.replace(/--.*$/gm,'').replace(/\s+/g,' ').trim())}>Minify input</Action></div>{error&&<p className="text-rose-300">{error}</p>}</section><section className="tool-result-panel space-y-3"><div className="flex justify-end gap-2"><Action onClick={()=>copyText(output)}><Copy size={15}/> Copy</Action><Action onClick={()=>downloadText('query.sql',output,'text/sql')}><Download size={15}/> Download</Action></div><Output>{output}</Output></section></div>
}

function cronFieldMatch(v,p,min,max){
 if(p==='*')return true
 return p.split(',').some(part=>{const [base,stepRaw]=part.split('/'),step=stepRaw?Number(stepRaw):1;if(!Number.isFinite(step)||step<=0)return false;if(base==='*')return (v-min)%step===0;if(base.includes('-')){const [a,b]=base.split('-').map(Number);return v>=a&&v<=b&&(v-a)%step===0}const n=Number(base);return Number.isFinite(n)&&n>=min&&n<=max&&v===n})
}
function cronMatches(d,expr){
 const p=expr.trim().split(/\s+/);if(p.length!==5)return false
 return cronFieldMatch(d.getMinutes(),p[0],0,59)&&cronFieldMatch(d.getHours(),p[1],0,23)&&cronFieldMatch(d.getDate(),p[2],1,31)&&cronFieldMatch(d.getMonth()+1,p[3],1,12)&&cronFieldMatch(d.getDay(),p[4],0,6)
}
function nextCronRuns(expr,count=5){
 if(expr.trim().split(/\s+/).length!==5)return []
 const out=[],d=new Date();d.setSeconds(0,0);d.setMinutes(d.getMinutes()+1)
 for(let i=0;i<527040&&out.length<count;i++){if(cronMatches(d,expr))out.push(new Date(d));d.setMinutes(d.getMinutes()+1)}
 return out
}
export function CronGenerator(){
 const [expr,setExpr]=useState('0 9 * * 1-5')
 const runs=useMemo(()=>nextCronRuns(expr),[expr]),valid=runs.length>0
 const presets=[['Every minute','* * * * *'],['Every 5 minutes','*/5 * * * *'],['Hourly','0 * * * *'],['Daily midnight','0 0 * * *'],['Weekdays 09:00','0 9 * * 1-5']]
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><Field label="Cron expression"><input aria-label="Cron expression" className="input font-mono text-lg" value={expr} onChange={e=>setExpr(e.target.value)}/></Field><p className="text-xs text-slate-500">minute · hour · day-of-month · month · day-of-week</p><div className="flex flex-wrap gap-2">{presets.map(([name,v])=><Action key={v} onClick={()=>setExpr(v)}>{name}</Action>)}</div><div className={valid?'status-message text-emerald-300':'status-message text-rose-300'}>{valid?'Valid cron schedule':'Invalid or unsupported cron expression.'}</div><Action onClick={()=>copyText(expr)}><Copy size={15}/> Copy cron</Action></section><section className="tool-result-panel"><h3 className="font-bold">Next runs (local time)</h3><div className="mt-4 grid gap-2">{runs.map((d,i)=><div key={i} className="rounded-xl border border-white/[0.06] p-3"><span className="text-xs text-slate-500">#{i+1}</span><div className="font-mono">{d.toLocaleString()}</div></div>)}</div></section></div>
}
