import { useEffect, useRef, useState } from 'react'
import { AlarmClock, FastForward, Pause, Play, RotateCcw, Volume2 } from 'lucide-react'

const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0))
const format=secs=>{
 const h=Math.floor(secs/3600),m=Math.floor((secs%3600)/60),s=secs%60
 return h>0?[h,m,s].map(x=>String(x).padStart(2,'0')).join(':'):[m,s].map(x=>String(x).padStart(2,'0')).join(':')
}

const SOUND_LABELS={
 chime:'Bright chime',
 bell:'Classic bell',
 pulse:'Pulse',
 soft:'Soft tone',
 digital:'Digital beep',
 gong:'Gong',
 arcade:'Arcade',
 alarm:'Urgent alarm',
}

export default function TimerTool(){
 const [hours,setHours]=useState(0),[minutes,setMinutes]=useState(5),[seconds,setSeconds]=useState(0),[remaining,setRemaining]=useState(300)
 const [running,setRunning]=useState(false),[sound,setSound]=useState('chime'),[volume,setVolume]=useState(.65),[repeatAlert,setRepeatAlert]=useState(false)
 const [finished,setFinished]=useState(false)
 const endAt=useRef(0),timer=useRef(null),repeatTimer=useRef(null),audioCtx=useRef(null)
 const total=()=>clamp(hours,0,99)*3600+clamp(minutes,0,59)*60+clamp(seconds,0,59)

 function stopInterval(){if(timer.current){clearInterval(timer.current);timer.current=null}}
 function stopRepeat(){if(repeatTimer.current){clearInterval(repeatTimer.current);repeatTimer.current=null}}
 function closeAudio(){if(audioCtx.current){audioCtx.current.close().catch(()=>{});audioCtx.current=null}}

 function tone(kind=sound){
  const Ctx=window.AudioContext||window.webkitAudioContext
  if(!Ctx)return
  closeAudio()
  const ctx=new Ctx();audioCtx.current=ctx
  const now=ctx.currentTime
  const patterns={
   chime:[[523,'sine',0],[659,'sine',.16],[784,'sine',.32]],
   bell:[[880,'triangle',0],[660,'triangle',.25],[880,'triangle',.5]],
   pulse:[[440,'square',0],[440,'square',.22],[440,'square',.44]],
   soft:[[330,'sine',0],[494,'sine',.28]],
   digital:[[740,'square',0],[920,'square',.12],[740,'square',.24],[920,'square',.36]],
   gong:[[196,'sine',0],[293,'sine',.12],[392,'sine',.24]],
   arcade:[[523,'square',0],[659,'square',.1],[784,'square',.2],[1047,'square',.3]],
   alarm:[[880,'sawtooth',0],[660,'sawtooth',.16],[880,'sawtooth',.32],[660,'sawtooth',.48],[880,'sawtooth',.64]],
  }
  const pattern=patterns[kind]||patterns.chime
  pattern.forEach(([freq,type,offset])=>{
    const o=ctx.createOscillator(),g=ctx.createGain()
    o.type=type;o.frequency.value=freq
    const peak=Math.max(.03,.24*volume)
    g.gain.setValueAtTime(.0001,now+offset)
    g.gain.exponentialRampToValueAtTime(peak,now+offset+.015)
    g.gain.exponentialRampToValueAtTime(.0001,now+offset+.22)
    o.connect(g);g.connect(ctx.destination);o.start(now+offset);o.stop(now+offset+.25)
  })
  window.setTimeout(()=>{if(audioCtx.current===ctx){closeAudio()}},1800)
 }

 function triggerFinish(){
  tone()
  setFinished(true)
  if(repeatAlert){
    stopRepeat()
    repeatTimer.current=setInterval(()=>tone(),2500)
  }
 }

 function start(){
  stopRepeat();setFinished(false)
  const base=remaining>0?remaining:total()
  if(base<=0)return
  setRemaining(base);endAt.current=Date.now()+base*1000;setRunning(true)
 }
 function pause(){stopInterval();setRunning(false)}
 function reset(){stopInterval();stopRepeat();setFinished(false);setRemaining(total());setRunning(false);closeAudio()}
 function addTime(extra){
  setFinished(false);stopRepeat()
  if(running){endAt.current+=extra*1000;setRemaining(r=>r+extra)}
  else setRemaining(r=>r+extra)
 }

 useEffect(()=>{
  if(!running)return
  stopInterval()
  timer.current=setInterval(()=>{
    const next=Math.max(0,Math.ceil((endAt.current-Date.now())/1000))
    setRemaining(next)
    if(next<=0){stopInterval();setRunning(false);triggerFinish()}
  },160)
  return stopInterval
 },[running,repeatAlert,sound,volume])

 useEffect(()=>{if(!running&&!finished)setRemaining(total())},[hours,minutes,seconds])
 useEffect(()=>()=>{stopInterval();stopRepeat();closeAudio()},[])

 const totalSeconds=total()
 const pct=totalSeconds?Math.max(0,Math.min(100,(remaining/totalSeconds)*100)):0
 const critical=remaining>0&&remaining<=10
 const done=remaining===0&&finished

 return <div className="tool-work-grid timer-layout">
  <section className="tool-control-panel">
   <div className="tool-panel-title"><AlarmClock size={18}/> Countdown settings</div>
   <div className="grid grid-cols-3 gap-3">
    <label><span className="tool-label">Hours</span><input aria-label="Timer hours" className="input" type="number" min="0" max="99" value={hours} onChange={e=>setHours(clamp(e.target.value,0,99))}/></label>
    <label><span className="tool-label">Minutes</span><input aria-label="Timer minutes" className="input" type="number" min="0" max="59" value={minutes} onChange={e=>setMinutes(clamp(e.target.value,0,59))}/></label>
    <label><span className="tool-label">Seconds</span><input aria-label="Timer seconds" className="input" type="number" min="0" max="59" value={seconds} onChange={e=>setSeconds(clamp(e.target.value,0,59))}/></label>
   </div>

   <label className="mt-4 block"><span className="tool-label">Alert sound</span><select aria-label="Timer sound" className="input" value={sound} onChange={e=>setSound(e.target.value)}>{Object.entries(SOUND_LABELS).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
   <label className="mt-4 block"><span className="tool-label">Volume · {Math.round(volume*100)}%</span><input aria-label="Timer volume" className="w-full" type="range" min=".15" max="1" step=".05" value={volume} onChange={e=>setVolume(Number(e.target.value))}/></label>
   <div className="mt-3 flex flex-wrap gap-2"><button className="btn-ghost" onClick={()=>tone()}><Volume2 size={16}/><span className="ms-2">Test sound</span></button><label className="timer-toggle"><input type="checkbox" checked={repeatAlert} onChange={e=>setRepeatAlert(e.target.checked)}/><span>Repeat alert until reset</span></label></div>

   <div className="mt-5 flex flex-wrap gap-2">{[['30 sec',30],['1 min',60],['5 min',300],['10 min',600],['25 min',1500],['45 min',2700],['1 hour',3600]].map(([label,total])=><button key={label} className="timer-preset" onClick={()=>{setHours(Math.floor(total/3600));setMinutes(Math.floor((total%3600)/60));setSeconds(total%60);setRunning(false);setFinished(false);stopRepeat()}}>{label}</button>)}</div>
  </section>

  <section className={'tool-result-panel timer-stage'+(critical?' timer-critical':'')+(done?' timer-finished':'')} data-critical={critical?'true':'false'}>
   <div className="timer-atmosphere" aria-hidden="true"><i/><i/><i/></div>
   <div className="timer-ring" style={{'--timer-progress':pct+'%'}}><div><span>{done?"Time's up!":critical?'Final seconds':'Time left'}</span><strong aria-live="polite">{format(remaining)}</strong></div></div>
   <div className="timer-status-copy" aria-live="polite">{done?'Timer complete — reset or add time to continue.':critical?'Stay focused — almost there.':running?'Countdown running':'Ready when you are'}</div>
   <div className="mt-5 flex flex-wrap justify-center gap-2">
    {running?<button className="btn-primary" onClick={pause}><Pause size={17}/><span className="ms-2">Pause</span></button>:<button className="btn-primary" onClick={start}><Play size={17}/><span className="ms-2">{done?'Start again':'Start'}</span></button>}
    <button className="btn-ghost" onClick={()=>addTime(60)}><FastForward size={16}/><span className="ms-2">+1 min</span></button>
    <button className="btn-ghost" onClick={()=>addTime(300)}><FastForward size={16}/><span className="ms-2">+5 min</span></button>
    <button className="btn-ghost" onClick={reset}><RotateCcw size={17}/><span className="ms-2">Reset</span></button>
   </div>
  </section>
 </div>
}
