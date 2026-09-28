import { useEffect, useMemo, useRef, useState } from 'react'
import { Copy, Download } from 'lucide-react'

const Field=({label,children})=><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-400">{label}</span>{children}</label>
const Action=({children,onClick,primary=false,disabled=false})=><button type="button" disabled={disabled} onClick={onClick} className={primary?'btn-primary':'btn-ghost'}>{children}</button>
const copyText=async text=>{try{await navigator.clipboard.writeText(String(text??''))}catch{}}
const downloadText=(name,text,type='text/plain')=>{const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
const escapeHtml=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
const markdownCells=line=>{
 const s=line.trim().replace(/^\|/,'').replace(/\|$/,'')
 const out=[];let cur='',escaped=false
 for(const ch of s){if(escaped){cur+=ch;escaped=false}else if(ch==='\\'){escaped=true;cur+=ch}else if(ch==='|'){out.push(cur.trim());cur=''}else cur+=ch}
 out.push(cur.trim())
 return out.map(x=>x.replace(/\\\|/g,'|').replace(/<br\s*\/?\s*>/gi,'\n'))
}
const isMarkdownSeparator=row=>row.length>0&&row.every(x=>/^:?-{3,}:?$/.test(x.trim()))

async function parseTable(text,format){
 if(format==='html'){
  const doc=new DOMParser().parseFromString(text,'text/html'),table=doc.querySelector('table')
  if(!table)throw new Error('No HTML <table> element found.')
  return [...table.querySelectorAll('tr')].map(tr=>[...tr.querySelectorAll('th,td')].map(cell=>cell.textContent.trim())).filter(row=>row.length)
 }
 if(format==='markdown'){
  const rows=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(markdownCells)
  return rows.filter(row=>!isMarkdownSeparator(row))
 }
 const Papa=(await import('papaparse')).default
 const delimiter=format==='tsv'?'\t':','
 const parsed=Papa.parse(text,{delimiter,skipEmptyLines:'greedy'})
 if(parsed.errors?.length)throw new Error(parsed.errors[0].message)
 return parsed.data
}

function detectFormat(text){
 const s=text.trim()
 if(/<table[\s>]/i.test(s))return 'html'
 const lines=s.split(/\r?\n/).filter(Boolean)
 if(lines.length>1&&lines[0].includes('|')&&isMarkdownSeparator(markdownCells(lines[1])))return 'markdown'
 if(s.includes('\t'))return 'tsv'
 return 'csv'
}
async function formatRows(rows,format){
 const clean=rows.map(row=>row.map(v=>String(v??'')))
 if(format==='markdown'){
  const width=Math.max(1,...clean.map(r=>r.length)),pad=row=>Array.from({length:width},(_,i)=>(row[i]||'').replace(/\|/g,'\\|').replace(/\r?\n/g,'<br>'))
  const header=pad(clean[0]||[]),body=clean.slice(1).map(pad)
  const line=row=>'| '+row.join(' | ')+' |'
  return [line(header),line(header.map(()=> '---')),...body.map(line)].join('\n')
 }
 if(format==='html'){
  const [head=[],...body]=clean
  return '<table>\n  <thead>\n    <tr>'+head.map(x=>'<th>'+escapeHtml(x)+'</th>').join('')+'</tr>\n  </thead>\n  <tbody>\n'+body.map(row=>'    <tr>'+row.map(x=>'<td>'+escapeHtml(x)+'</td>').join('')+'</tr>').join('\n')+'\n  </tbody>\n</table>'
 }
 const Papa=(await import('papaparse')).default
 return Papa.unparse(clean,{delimiter:format==='tsv'?'\t':',',newline:'\n'})
}

export function TableConverter(){
 const sample='Name,Role,City\nAvery,Engineer,Taipei\nMina,Designer,Kaohsiung'
 const [input,setInput]=useState(sample),[inputFormat,setInputFormat]=useState('auto'),[outputFormat,setOutputFormat]=useState('markdown'),[output,setOutput]=useState(''),[error,setError]=useState(''),[stats,setStats]=useState(null)
 const convert=async()=>{
  try{
   const format=inputFormat==='auto'?detectFormat(input):inputFormat
   const rows=await parseTable(input,format)
   if(!rows.length)throw new Error('No table rows found.')
   const width=Math.max(...rows.map(r=>r.length));if(!width)throw new Error('No table columns found.')
   const normalized=rows.map(r=>Array.from({length:width},(_,i)=>r[i]??''))
   setOutput(await formatRows(normalized,outputFormat));setStats({rows:normalized.length,columns:width,detected:format});setError('')
  }catch(e){setOutput('');setStats(null);setError(e.message)}
 }
 useEffect(()=>{convert()},[inputFormat,outputFormat])
 const ext={csv:'csv',tsv:'tsv',markdown:'md',html:'html'}[outputFormat],mime={csv:'text/csv',tsv:'text/tab-separated-values',markdown:'text/markdown',html:'text/html'}[outputFormat]
 return <div className="tool-work-grid">
  <section className="tool-control-panel space-y-4">
   <div className="grid gap-3 sm:grid-cols-2"><Field label="Input format"><select aria-label="Table input format" className="input" value={inputFormat} onChange={e=>setInputFormat(e.target.value)}><option value="auto">Auto detect</option><option value="csv">CSV</option><option value="tsv">TSV</option><option value="markdown">Markdown table</option><option value="html">HTML table</option></select></Field><Field label="Output format"><select aria-label="Table output format" className="input" value={outputFormat} onChange={e=>setOutputFormat(e.target.value)}><option value="markdown">Markdown table</option><option value="csv">CSV</option><option value="tsv">TSV</option><option value="html">HTML table</option></select></Field></div>
   <Field label="Table input"><textarea aria-label="Table input" className="input min-h-72 font-mono" value={input} onChange={e=>setInput(e.target.value)}/></Field>
   <div className="flex flex-wrap gap-2"><Action primary onClick={convert}>Convert table</Action><Action onClick={()=>setInput(sample)}>Load sample</Action></div>
   <p className="text-xs text-slate-500">Your table stays in this browser. Nothing is uploaded.</p>
   {error&&<p role="alert" className="text-sm text-rose-300">{error}</p>}
  </section>
  <section className="tool-result-panel space-y-3">
   {stats&&<div className="flex flex-wrap gap-2 text-xs text-slate-400"><span className="tool-trust-chip">{stats.rows} rows</span><span className="tool-trust-chip">{stats.columns} columns</span><span className="tool-trust-chip">Detected: {stats.detected.toUpperCase()}</span></div>}
   <div className="flex justify-end gap-2"><Action disabled={!output} onClick={()=>copyText(output)}><Copy size={15}/> Copy</Action><Action disabled={!output} onClick={()=>downloadText('anytool-table.'+ext,output,mime)}><Download size={15}/> Download</Action></div>
   <pre aria-label="Converted table output" className="max-h-[34rem] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/[0.07] bg-slate-950/80 p-4 text-sm leading-6 text-slate-200">{output||'Converted table appears here.'}</pre>
  </section>
 </div>
}

function roundedRect(ctx,x,y,w,h,r){
 const radius=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+radius,y);ctx.arcTo(x+w,y,x+w,y+h,radius);ctx.arcTo(x+w,y+h,x,y+h,radius);ctx.arcTo(x,y+h,x,y,radius);ctx.arcTo(x,y,x+w,y,radius);ctx.closePath()
}
export function ScreenshotBeautifier(){
 const canvasRef=useRef(null),[src,setSrc]=useState(''),[filename,setFilename]=useState('screenshot'),[padding,setPadding]=useState(90),[radius,setRadius]=useState(18),[shadow,setShadow]=useState(32),[c1,setC1]=useState('#0f172a'),[c2,setC2]=useState('#7c3aed'),[angle,setAngle]=useState(135),[frame,setFrame]=useState(true),[info,setInfo]=useState(null)
 useEffect(()=>{
  if(!src||!canvasRef.current)return
  const img=new Image()
  img.onload=()=>{
   const maxImageWidth=1800,scale=Math.min(1,maxImageWidth/img.width),iw=Math.max(1,Math.round(img.width*scale)),ih=Math.max(1,Math.round(img.height*scale)),bar=frame?38:0,pad=Math.max(20,padding)
   const c=canvasRef.current;c.width=iw+pad*2;c.height=ih+pad*2+bar
   const x=c.getContext('2d'),rad=angle*Math.PI/180,dx=Math.cos(rad),dy=Math.sin(rad),cx=c.width/2,cy=c.height/2,len=Math.abs(c.width*dx)+Math.abs(c.height*dy),g=x.createLinearGradient(cx-dx*len/2,cy-dy*len/2,cx+dx*len/2,cy+dy*len/2)
   g.addColorStop(0,c1);g.addColorStop(1,c2);x.fillStyle=g;x.fillRect(0,0,c.width,c.height)
   const px=pad,py=pad+bar,pw=iw,ph=ih
   x.save();x.shadowColor='rgba(2,6,23,.55)';x.shadowBlur=shadow;x.shadowOffsetY=Math.round(shadow*.35);roundedRect(x,px,py,pw,ph,radius);x.fillStyle='#111827';x.fill();x.restore()
   x.save();roundedRect(x,px,py,pw,ph,radius);x.clip();x.drawImage(img,px,py,pw,ph);x.restore()
   if(frame){
    x.save();x.fillStyle='rgba(15,23,42,.94)';roundedRect(x,px,pad,pw,bar+radius,radius);x.fill();x.fillRect(px,pad+radius,pw,bar-radius)
    ;['#fb7185','#fbbf24','#4ade80'].forEach((color,i)=>{x.beginPath();x.fillStyle=color;x.arc(px+18+i*20,pad+19,5,0,Math.PI*2);x.fill()});x.restore()
   }
   setInfo({sourceWidth:img.width,sourceHeight:img.height,width:c.width,height:c.height})
  }
  img.src=src
 },[src,padding,radius,shadow,c1,c2,angle,frame])
 const load=file=>{if(!file.type.startsWith('image/'))return;setFilename(file.name.replace(/\.[^.]+$/,'')||'screenshot');const r=new FileReader();r.onload=()=>setSrc(String(r.result));r.readAsDataURL(file)}
 const download=()=>{if(!canvasRef.current)return;const a=document.createElement('a');a.href=canvasRef.current.toDataURL('image/png');a.download='beautified-'+filename+'.png';a.click()}
 const presets=[['Midnight','#0f172a','#7c3aed'],['Ocean','#082f49','#06b6d4'],['Sunset','#7c2d12','#fb7185'],['Forest','#052e16','#22c55e']]
 return <div className="tool-work-grid">
  <section className="tool-control-panel space-y-4">
   <label className="upload-field"><span className="font-semibold">Choose screenshot or image</span><input aria-label="Choose screenshot to beautify" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>e.target.files?.[0]&&load(e.target.files[0])}/></label>
   <div className="flex flex-wrap gap-2">{presets.map(([name,a,b])=><button type="button" key={name} className="btn-ghost" onClick={()=>{setC1(a);setC2(b)}}>{name}</button>)}</div>
   <div className="grid gap-3 sm:grid-cols-2"><Field label="Background start"><input aria-label="Background start color" className="input h-12" type="color" value={c1} onChange={e=>setC1(e.target.value)}/></Field><Field label="Background end"><input aria-label="Background end color" className="input h-12" type="color" value={c2} onChange={e=>setC2(e.target.value)}/></Field></div>
   <Field label={'Gradient angle: '+angle+'°'}><input aria-label="Gradient angle" className="w-full" type="range" min="0" max="360" value={angle} onChange={e=>setAngle(Number(e.target.value))}/></Field>
   <Field label={'Padding: '+padding+' px'}><input aria-label="Screenshot padding" className="w-full" type="range" min="24" max="220" value={padding} onChange={e=>setPadding(Number(e.target.value))}/></Field>
   <Field label={'Corner radius: '+radius+' px'}><input aria-label="Screenshot corner radius" className="w-full" type="range" min="0" max="60" value={radius} onChange={e=>setRadius(Number(e.target.value))}/></Field>
   <Field label={'Shadow: '+shadow}><input aria-label="Screenshot shadow" className="w-full" type="range" min="0" max="80" value={shadow} onChange={e=>setShadow(Number(e.target.value))}/></Field>
   <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={frame} onChange={e=>setFrame(e.target.checked)}/> Add browser-style top bar</label>
   <Action primary disabled={!src} onClick={download}><Download size={15}/> Download PNG</Action>
   <p className="text-xs text-slate-500">Rendering is local in your browser. The image is not uploaded.</p>
  </section>
  <section className="tool-result-panel space-y-3">
   {info&&<p className="text-xs text-slate-500">Source {info.sourceWidth}×{info.sourceHeight} · Export {info.width}×{info.height}px</p>}
   <div className="grid min-h-80 place-items-center overflow-auto rounded-2xl border border-white/[0.06] bg-slate-950/70 p-3">{src?<canvas ref={canvasRef} aria-label="Beautified screenshot preview" className="max-h-[38rem] max-w-full"/>:<span className="text-slate-500">Upload an image to start designing.</span>}</div>
  </section>
 </div>
}

const components={'table-converter':TableConverter,'screenshot-beautifier':ScreenshotBeautifier}
export const wave4ToolSlugs=new Set(Object.keys(components))
export default function Wave4ToolSuite({slug}){const Component=components[slug];return Component?<Component/>:null}
