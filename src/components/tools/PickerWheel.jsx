import { useMemo, useState } from 'react'
import { Check, PartyPopper, Plus, RotateCw, Sparkles, Trash2, Volume2, X } from 'lucide-react'

const COLORS=['#ff4d6d','#ff8a00','#ffd60a','#80ed99','#00d4ff','#4361ee','#8338ec','#ff4fd8','#ff6b6b','#2ec4b6','#b7f34a','#f72585']
const SPEEDS={quick:1.6,normal:2.8,smooth:4.2,dramatic:5.8}
const CONFETTI=Array.from({length:58},(_,i)=>({left:(i*37)%100,delay:(i%8)*.045,duration:1.25+(i%6)*.12,color:COLORS[i%COLORS.length],rotate:(i*53)%360}))
const parse=value=>value.split(/[\n,]+/).map(x=>x.trim()).filter(Boolean).slice(0,36)
const polar=(cx,cy,r,deg)=>{const a=(deg-90)*Math.PI/180;return [cx+r*Math.cos(a),cy+r*Math.sin(a)]}
const wedge=(i,n)=>{const a=i*360/n,b=(i+1)*360/n,[x1,y1]=polar(160,160,145,a),[x2,y2]=polar(160,160,145,b);return `M160 160 L${x1} ${y1} A145 145 0 ${b-a>180?1:0} 1 ${x2} ${y2} Z`}
const mod360=n=>((n%360)+360)%360

function playSpinSound(kind,duration){
 if(kind==='silent')return
 try{
  const Ctx=window.AudioContext||window.webkitAudioContext
  if(!Ctx)return
  const ctx=new Ctx(),count=Math.max(14,Math.round(duration*11))
  for(let i=0;i<count;i++){
   const progress=i/Math.max(1,count-1)
   const when=ctx.currentTime+duration*Math.pow(progress,1.32)
   const o=ctx.createOscillator(),g=ctx.createGain()
   const freq=kind==='arcade'?(i%2?780:520):kind==='wood'?300+((i%3)*35):kind==='soft'?420:690
   o.type=kind==='click'?'square':kind==='arcade'?'square':kind==='wood'?'triangle':'sine'
   o.frequency.setValueAtTime(freq,when)
   g.gain.setValueAtTime(.0001,when)
   g.gain.exponentialRampToValueAtTime(kind==='soft'?.045:.09,when+.006)
   g.gain.exponentialRampToValueAtTime(.0001,when+.055)
   o.connect(g);g.connect(ctx.destination);o.start(when);o.stop(when+.065)
  }
  window.setTimeout(()=>ctx.close().catch(()=>{}),(duration+.8)*1000)
 }catch{}
}

export default function PickerWheel(){
 const [raw,setRaw]=useState('Ava\nNoah\nMia\nLeo\n18\n42')
 const [newItem,setNewItem]=useState('')
 const [rotation,setRotation]=useState(0)
 const [winner,setWinner]=useState(null)
 const [spinning,setSpinning]=useState(false)
 const [celebrating,setCelebrating]=useState(false)
 const [speed,setSpeed]=useState('normal')
 const [sound,setSound]=useState('click')
 const items=useMemo(()=>parse(raw),[raw])
 const shown=items.length?items:['Add items']
 const duration=SPEEDS[speed]

 function add(){const v=newItem.trim();if(!v)return;setRaw(x=>(x.trim()?x.trim()+'\n':'')+v);setNewItem('')}
 function remove(index){setRaw(items.filter((_,i)=>i!==index).join('\n'));if(winner?.index===index)setWinner(null)}
 function spin(){
  if(items.length<2||spinning)return
  const random=new Uint32Array(1);crypto.getRandomValues(random)
  const index=random[0]%items.length,slice=360/items.length
  const desired=mod360(-((index+.5)*slice)),current=mod360(rotation)
  const turns=5+Math.round(duration*1.4),delta=turns*360+mod360(desired-current)
  setSpinning(true);setCelebrating(false);setWinner(null)
  playSpinSound(sound,duration)
  setRotation(rotation+delta)
  window.setTimeout(()=>{setWinner({label:items[index],index,color:COLORS[index%COLORS.length]});setSpinning(false);setCelebrating(true)},duration*1000+50)
 }
 function keepWinner(){setCelebrating(false)}
 function removeWinner(){if(!winner)return;setRaw(items.filter((_,i)=>i!==winner.index).join('\n'));setCelebrating(false);setWinner(null)}

 return <div className="tool-work-grid picker-layout picker-large">
  <section className="tool-control-panel picker-controls">
   <div className="tool-panel-title">Build your wheel</div>
   <label className="block"><span className="tool-label">Names or numbers · one per line</span><textarea aria-label="Wheel entries" className="input min-h-52 resize-y" value={raw} onChange={e=>{setRaw(e.target.value);setCelebrating(false)}} /></label>
   <div className="mt-3 flex gap-2"><input aria-label="Add wheel item" className="input" value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();add()}}} placeholder="Add a name or number"/><button className="btn-primary shrink-0" onClick={add}><Plus size={17}/><span className="ms-2">Add</span></button></div>
   <div className="picker-settings">
    <label><span className="tool-label">Spin speed</span><select aria-label="Spin speed" className="input" value={speed} onChange={e=>setSpeed(e.target.value)}><option value="quick">Quick · 1.6s</option><option value="normal">Normal · 2.8s</option><option value="smooth">Smooth · 4.2s</option><option value="dramatic">Dramatic · 5.8s</option></select></label>
    <label><span className="tool-label">Spinner sound</span><select aria-label="Spinner sound" className="input" value={sound} onChange={e=>setSound(e.target.value)}><option value="click">Classic clicks</option><option value="wood">Wood ticks</option><option value="arcade">Arcade ticks</option><option value="soft">Soft ticks</option><option value="silent">Silent</option></select></label>
   </div>
   <div className="mt-4 flex flex-wrap gap-2">{items.map((x,i)=><button key={x+'-'+i} className="picker-chip" onClick={()=>remove(i)} title={'Remove '+x}><span>{x}</span><X size={13}/></button>)}</div>
   <p className="mt-4 text-xs text-slate-500">2–36 entries. Click the wheel itself or the Spin button. Everything stays on this device.</p>
  </section>

  <section className="tool-result-panel picker-stage picker-stage-xl">
   <div className="picker-color-orbit" aria-hidden="true"/>
   <button type="button" className="wheel-wrap wheel-wrap-xl" aria-label="Spin wheel by clicking wheel" disabled={items.length<2||spinning} onClick={spin}>
    <div className="wheel-pointer"/>
    <svg aria-label="Random picker wheel" viewBox="0 0 320 320" className="picker-wheel" style={{transform:`rotate(${rotation}deg)`,transition:spinning?`transform ${duration}s cubic-bezier(.1,.66,.12,1)`:'none'}}>
     {shown.length===1?<circle cx="160" cy="160" r="145" fill={COLORS[0]}/>:shown.map((x,i)=>{const mid=(i+.5)*360/shown.length,[tx,ty]=polar(160,160,96,mid);return <g key={x+'-'+i}><path d={wedge(i,shown.length)} fill={COLORS[i%COLORS.length]} stroke="rgba(255,255,255,.55)" strokeWidth="1.6"/><text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fill="#07111f" fontSize={shown.length>20?7.5:shown.length>12?9:12.5} fontWeight="950" transform={`rotate(${mid} ${tx} ${ty})`}>{x.length>13?x.slice(0,11)+'…':x}</text></g>})}
     <circle cx="160" cy="160" r="30" fill="#08111b" stroke="#fff" strokeOpacity=".25" strokeWidth="5"/><circle cx="160" cy="160" r="10" fill="#fff"/>
    </svg>
   </button>
   <button className="btn-primary picker-spin picker-spin-xl" disabled={items.length<2||spinning} onClick={spin}><RotateCw className={spinning?'animate-spin':''} size={20}/>{spinning?'Spinning…':'Spin the wheel'}</button>
   <div className="picker-sound-note"><Volume2 size={14}/><span>{sound==='silent'?'Sound off':sound==='click'?'Classic clicks':sound==='wood'?'Wood ticks':sound==='arcade'?'Arcade ticks':'Soft ticks'} · {speed} speed</span></div>
   <div className="picker-winner" aria-live="polite"><span>{winner?'Last result':'Ready'}</span><strong>{winner?.label||'Add at least two entries and spin'}</strong></div>

   {celebrating&&winner&&<div className="winner-celebration" role="dialog" aria-modal="true" aria-label={'Selected '+winner.label}>
     <div className="confetti-field" aria-hidden="true">{CONFETTI.map((c,i)=><i key={i} style={{left:c.left+'%',background:c.color,animationDelay:c.delay+'s',animationDuration:c.duration+'s',transform:`rotate(${c.rotate}deg)`}}/>)}</div>
     <div className="winner-burst" style={{'--winner-color':winner.color}} aria-hidden="true"><Sparkles/><PartyPopper/></div>
     <div className="winner-card"><span className="winner-eyebrow">Winner</span><strong>{winner.label}</strong><p>Keep it for another round, or remove it so it cannot be picked again.</p><div className="winner-actions"><button className="btn-primary" onClick={keepWinner}><Check size={17}/><span className="ms-2">Keep on wheel</span></button><button className="btn-danger" onClick={removeWinner}><Trash2 size={17}/><span className="ms-2">Remove from wheel</span></button></div></div>
   </div>}
  </section>
 </div>
}
