import { useMemo, useState } from 'react'
import { Plus, RotateCw, X } from 'lucide-react'

const COLORS=['#ff6b6b','#ffd166','#06d6a0','#4cc9f0','#4361ee','#9b5de5','#f15bb5','#fb8500','#2ec4b6','#8ac926','#ff595e','#6a4c93']
const parse=value=>value.split(/[\n,]+/).map(x=>x.trim()).filter(Boolean).slice(0,24)
const polar=(cx,cy,r,deg)=>{const a=(deg-90)*Math.PI/180;return [cx+r*Math.cos(a),cy+r*Math.sin(a)]}
const wedge=(i,n)=>{const a=i*360/n,b=(i+1)*360/n,[x1,y1]=polar(160,160,145,a),[x2,y2]=polar(160,160,145,b);return `M160 160 L${x1} ${y1} A145 145 0 ${b-a>180?1:0} 1 ${x2} ${y2} Z`}

export default function PickerWheel(){
 const [raw,setRaw]=useState('Ava\nNoah\nMia\nLeo\n18\n42')
 const [newItem,setNewItem]=useState('')
 const [rotation,setRotation]=useState(0)
 const [winner,setWinner]=useState('')
 const [spinning,setSpinning]=useState(false)
 const items=useMemo(()=>parse(raw),[raw])
 const shown=items.length?items:['Add items']
 function add(){
  const v=newItem.trim();if(!v)return
  setRaw(x=>(x.trim()?x.trim()+'\n':'')+v);setNewItem('')
 }
 function remove(index){setRaw(items.filter((_,i)=>i!==index).join('\n'));setWinner('')}
 function spin(){
  if(items.length<2||spinning)return
  const a=new Uint32Array(1);crypto.getRandomValues(a);const index=a[0]%items.length
  const slice=360/items.length
  setSpinning(true);setWinner('')
  setRotation(r=>r+1440+(360-((index+.5)*slice)))
  window.setTimeout(()=>{setWinner(items[index]);setSpinning(false)},1050)
 }
 return <div className="tool-work-grid picker-layout">
  <section className="tool-control-panel">
   <div className="tool-panel-title">Edit wheel entries</div>
   <label className="block"><span className="tool-label">Names or numbers · one per line</span><textarea aria-label="Wheel entries" className="input min-h-44 resize-y" value={raw} onChange={e=>setRaw(e.target.value)} /></label>
   <div className="mt-3 flex gap-2"><input aria-label="Add wheel item" className="input" value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();add()}}} placeholder="Add a name or number"/><button className="btn-primary shrink-0" onClick={add}><Plus size={17}/><span className="ms-2">Add</span></button></div>
   <div className="mt-4 flex flex-wrap gap-2">{items.map((x,i)=><button key={x+'-'+i} className="picker-chip" onClick={()=>remove(i)} title={'Remove '+x}><span>{x}</span><X size={13}/></button>)}</div>
   <p className="mt-4 text-xs text-slate-500">2–24 entries. Editing stays on this device.</p>
  </section>
  <section className="tool-result-panel picker-stage">
   <div className="wheel-wrap"><div className="wheel-pointer"/><svg aria-label="Random picker wheel" viewBox="0 0 320 320" className="picker-wheel" style={{transform:`rotate(${rotation}deg)`,transition:spinning?'transform 1s cubic-bezier(.12,.72,.18,1)':'none'}}>
    {shown.length===1?<circle cx="160" cy="160" r="145" fill={COLORS[0]}/>:shown.map((x,i)=>{const mid=(i+.5)*360/shown.length;const [tx,ty]=polar(160,160,94,mid);return <g key={x+'-'+i}><path d={wedge(i,shown.length)} fill={COLORS[i%COLORS.length]} stroke="rgba(255,255,255,.28)" strokeWidth="2"/><text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fill="#07111f" fontSize={shown.length>12?9:12} fontWeight="900" transform={`rotate(${mid} ${tx} ${ty})`}>{x.length>12?x.slice(0,10)+'…':x}</text></g>})}
    <circle cx="160" cy="160" r="28" fill="#08111b" stroke="rgba(255,255,255,.2)" strokeWidth="5"/><circle cx="160" cy="160" r="8" fill="#fff"/>
   </svg></div>
   <button className="btn-primary picker-spin" disabled={items.length<2||spinning} onClick={spin}><RotateCw className={spinning?'animate-spin':''} size={18}/>{spinning?'Spinning…':'Spin wheel'}</button>
   <div className="picker-winner" aria-live="polite"><span>{winner?'Selected':'Ready'}</span><strong>{winner||'Add at least two entries and spin'}</strong></div>
  </section>
 </div>
}
