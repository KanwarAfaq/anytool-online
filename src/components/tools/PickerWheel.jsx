import { useMemo, useState } from 'react'
import { Check, PartyPopper, Plus, RotateCw, Sparkles, Trash2, X } from 'lucide-react'

const COLORS=['#ff6b6b','#ffd166','#06d6a0','#4cc9f0','#4361ee','#9b5de5','#f15bb5','#fb8500','#2ec4b6','#8ac926','#ff595e','#6a4c93']
const CONFETTI=Array.from({length:42},(_,i)=>({
 left:(i*37)%100,
 delay:(i%7)*.055,
 duration:1.25+(i%5)*.12,
 color:COLORS[i%COLORS.length],
 rotate:(i*53)%360,
}))
const parse=value=>value.split(/[\n,]+/).map(x=>x.trim()).filter(Boolean).slice(0,24)
const polar=(cx,cy,r,deg)=>{const a=(deg-90)*Math.PI/180;return [cx+r*Math.cos(a),cy+r*Math.sin(a)]}
const wedge=(i,n)=>{const a=i*360/n,b=(i+1)*360/n,[x1,y1]=polar(160,160,145,a),[x2,y2]=polar(160,160,145,b);return `M160 160 L${x1} ${y1} A145 145 0 ${b-a>180?1:0} 1 ${x2} ${y2} Z`}
const mod360=n=>((n%360)+360)%360

export default function PickerWheel(){
 const [raw,setRaw]=useState('Ava\nNoah\nMia\nLeo\n18\n42')
 const [newItem,setNewItem]=useState('')
 const [rotation,setRotation]=useState(0)
 const [winner,setWinner]=useState(null)
 const [spinning,setSpinning]=useState(false)
 const [celebrating,setCelebrating]=useState(false)
 const items=useMemo(()=>parse(raw),[raw])
 const shown=items.length?items:['Add items']

 function add(){
  const v=newItem.trim()
  if(!v)return
  setRaw(x=>(x.trim()?x.trim()+'\n':'')+v)
  setNewItem('')
 }
 function remove(index){
  setRaw(items.filter((_,i)=>i!==index).join('\n'))
  if(winner?.index===index)setWinner(null)
 }
 function spin(){
  if(items.length<2||spinning)return
  const random=new Uint32Array(1)
  crypto.getRandomValues(random)
  const index=random[0]%items.length
  const slice=360/items.length
  const desired=mod360(-((index+.5)*slice))
  const current=mod360(rotation)
  const delta=1440+mod360(desired-current)

  setSpinning(true)
  setCelebrating(false)
  setWinner(null)
  setRotation(rotation+delta)
  window.setTimeout(()=>{
    setWinner({label:items[index],index,color:COLORS[index%COLORS.length]})
    setSpinning(false)
    setCelebrating(true)
  },1120)
 }
 function keepWinner(){setCelebrating(false)}
 function removeWinner(){
  if(!winner)return
  setRaw(items.filter((_,i)=>i!==winner.index).join('\n'))
  setCelebrating(false)
  setWinner(null)
 }

 return <div className="tool-work-grid picker-layout">
  <section className="tool-control-panel">
   <div className="tool-panel-title">Edit wheel entries</div>
   <label className="block"><span className="tool-label">Names or numbers · one per line</span><textarea aria-label="Wheel entries" className="input min-h-44 resize-y" value={raw} onChange={e=>{setRaw(e.target.value);setCelebrating(false)}} /></label>
   <div className="mt-3 flex gap-2"><input aria-label="Add wheel item" className="input" value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();add()}}} placeholder="Add a name or number"/><button className="btn-primary shrink-0" onClick={add}><Plus size={17}/><span className="ms-2">Add</span></button></div>
   <div className="mt-4 flex flex-wrap gap-2">{items.map((x,i)=><button key={x+'-'+i} className="picker-chip" onClick={()=>remove(i)} title={'Remove '+x}><span>{x}</span><X size={13}/></button>)}</div>
   <p className="mt-4 text-xs text-slate-500">2–24 entries. Names and numbers can be mixed. Everything stays on this device.</p>
  </section>

  <section className="tool-result-panel picker-stage">
   <div className="wheel-wrap"><div className="wheel-pointer"/><svg aria-label="Random picker wheel" viewBox="0 0 320 320" className="picker-wheel" style={{transform:`rotate(${rotation}deg)`,transition:spinning?'transform 1.1s cubic-bezier(.12,.72,.18,1)':'none'}}>
    {shown.length===1?<circle cx="160" cy="160" r="145" fill={COLORS[0]}/>:shown.map((x,i)=>{const mid=(i+.5)*360/shown.length;const [tx,ty]=polar(160,160,94,mid);return <g key={x+'-'+i}><path d={wedge(i,shown.length)} fill={COLORS[i%COLORS.length]} stroke="rgba(255,255,255,.28)" strokeWidth="2"/><text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fill="#07111f" fontSize={shown.length>12?9:12} fontWeight="900" transform={`rotate(${mid} ${tx} ${ty})`}>{x.length>12?x.slice(0,10)+'…':x}</text></g>})}
    <circle cx="160" cy="160" r="28" fill="#08111b" stroke="rgba(255,255,255,.2)" strokeWidth="5"/><circle cx="160" cy="160" r="8" fill="#fff"/>
   </svg></div>
   <button className="btn-primary picker-spin" disabled={items.length<2||spinning} onClick={spin}><RotateCw className={spinning?'animate-spin':''} size={18}/>{spinning?'Spinning…':'Spin wheel'}</button>
   <div className="picker-winner" aria-live="polite"><span>{winner?'Last result':'Ready'}</span><strong>{winner?.label||'Add at least two entries and spin'}</strong></div>

   {celebrating&&winner&&<div className="winner-celebration" role="dialog" aria-modal="true" aria-label={'Selected '+winner.label}>
     <div className="confetti-field" aria-hidden="true">{CONFETTI.map((c,i)=><i key={i} style={{left:c.left+'%',background:c.color,animationDelay:c.delay+'s',animationDuration:c.duration+'s',transform:`rotate(${c.rotate}deg)`}}/>)}</div>
     <div className="winner-burst" style={{'--winner-color':winner.color}} aria-hidden="true"><Sparkles/><PartyPopper/></div>
     <div className="winner-card">
       <span className="winner-eyebrow">Selected</span>
       <strong>{winner.label}</strong>
       <p>Keep it on the wheel for another round, or remove it so it cannot be picked again.</p>
       <div className="winner-actions">
        <button className="btn-primary" onClick={keepWinner}><Check size={17}/><span className="ms-2">Keep on wheel</span></button>
        <button className="btn-danger" onClick={removeWinner}><Trash2 size={17}/><span className="ms-2">Remove from wheel</span></button>
       </div>
     </div>
   </div>}
  </section>
 </div>
}
