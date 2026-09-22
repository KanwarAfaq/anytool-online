import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Volume2 } from 'lucide-react'

const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0))
const format=secs=>String(Math.floor(secs/60)).padStart(2,'0')+':'+String(secs%60).padStart(2,'0')

export default function TimerTool(){
 const [minutes,setMinutes]=useState(5),[seconds,setSeconds]=useState(0),[remaining,setRemaining]=useState(300)
 const [running,setRunning]=useState(false),[sound,setSound]=useState('chime')
 const endAt=useRef(0),timer=useRef(null)
 const total=()=>clamp(minutes,0,999)*60+clamp(seconds,0,59)
 function tone(kind=sound){
  const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return
  const ctx=new Ctx(),now=ctx.currentTime
  const map={chime:[523,659,784],bell:[880,660],pulse:[440,440,440],soft:[330,494]}
  ;(map[kind]||map.chime).forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=kind==='soft'?'sine':'triangle';o.frequency.value=freq;g.gain.setValueAtTime(.0001,now+i*.18);g.gain.exponentialRampToValueAtTime(.16,now+i*.18+.02);g.gain.exponentialRampToValueAtTime(.0001,now+i*.18+.22);o.connect(g);g.connect(ctx.destination);o.start(now+i*.18);o.stop(now+i*.18+.25)})
  window.setTimeout(()=>ctx.close().catch(()=>{}),1200)
 }
 function stopInterval(){if(timer.current){clearInterval(timer.current);timer.current=null}}
 function start(){
  const base=remaining>0?remaining:total();if(base<=0)return
  setRemaining(base);endAt.current=Date.now()+base*1000;setRunning(true)
 }
 function pause(){stopInterval();setRunning(false)}
 function reset(){stopInterval();const t=total();setRemaining(t);setRunning(false)}
 useEffect(()=>{if(!running)return;stopInterval();timer.current=setInterval(()=>{const next=Math.max(0,Math.ceil((endAt.current-Date.now())/1000));setRemaining(next);if(next<=0){stopInterval();setRunning(false);tone()}},200);return stopInterval},[running])
 useEffect(()=>{if(!running)setRemaining(total())},[minutes,seconds])
 const pct=total()?Math.max(0,Math.min(100,(remaining/total())*100)):0
 return <div className="tool-work-grid timer-layout">
  <section className="tool-control-panel">
   <div className="tool-panel-title">Countdown settings</div>
   <div className="grid grid-cols-2 gap-3"><label><span className="tool-label">Minutes</span><input aria-label="Timer minutes" className="input" type="number" min="0" max="999" value={minutes} onChange={e=>setMinutes(clamp(e.target.value,0,999))}/></label><label><span className="tool-label">Seconds</span><input aria-label="Timer seconds" className="input" type="number" min="0" max="59" value={seconds} onChange={e=>setSeconds(clamp(e.target.value,0,59))}/></label></div>
   <label className="mt-4 block"><span className="tool-label">Alert sound</span><select aria-label="Timer sound" className="input" value={sound} onChange={e=>setSound(e.target.value)}><option value="chime">Bright chime</option><option value="bell">Bell</option><option value="pulse">Pulse</option><option value="soft">Soft tone</option></select></label>
   <button className="btn-ghost mt-3" onClick={()=>tone()}><Volume2 size={16}/><span className="ms-2">Test sound</span></button>
   <div className="mt-5 flex flex-wrap gap-2">{[1,5,10,25].map(m=><button key={m} className="timer-preset" onClick={()=>{setMinutes(m);setSeconds(0);setRunning(false)}}>{m} min</button>)}</div>
  </section>
  <section className="tool-result-panel timer-stage">
   <div className="timer-ring" style={{'--timer-progress':pct+'%'}}><div><span>Time left</span><strong aria-live="polite">{format(remaining)}</strong></div></div>
   <div className="mt-6 flex justify-center gap-3">{running?<button className="btn-primary" onClick={pause}><Pause size={17}/><span className="ms-2">Pause</span></button>:<button className="btn-primary" onClick={start}><Play size={17}/><span className="ms-2">Start</span></button>}<button className="btn-ghost" onClick={reset}><RotateCcw size={17}/><span className="ms-2">Reset</span></button></div>
  </section>
 </div>
}
