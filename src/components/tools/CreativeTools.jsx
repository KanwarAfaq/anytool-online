import { useEffect, useMemo, useRef, useState } from 'react'
import { AlarmClock, Download, Pause, Play, Plus, RotateCcw, Sparkles, Trash2, Volume2 } from 'lucide-react'
import { useI18n } from '../../i18n'

const wheelColors=['#ff6b6b','#ffb84d','#ffd93d','#6bcb77','#4d96ff','#6f7bf7','#9b5de5','#f15bb5','#00bbf9','#00d4a8','#ff8fab','#8ac926']
const randomIndex=n=>{
  if(n<=1)return 0
  if(globalThis.crypto?.getRandomValues){const x=new Uint32Array(1);crypto.getRandomValues(x);return x[0]%n}
  return Math.floor(Math.random()*n)
}

export function RandomPickerTool(){
 const {lang}=useI18n()
 const L={
  en:{items:'Names or numbers',hint:'One item per line',add:'Add item',placeholder:'Type a name or number',spin:'Spin the wheel',clear:'Clear',reset:'Example list',winner:'Selected',need:'Add at least one item to spin.'},
  'zh-TW':{items:'姓名或數字',hint:'每行一個項目',add:'新增',placeholder:'輸入姓名或數字',spin:'轉動轉盤',clear:'清除',reset:'範例清單',winner:'抽中',need:'請至少加入一個項目。'},
  ar:{items:'الأسماء أو الأرقام',hint:'عنصر واحد في كل سطر',add:'إضافة',placeholder:'اكتب اسماً أو رقماً',spin:'أدر العجلة',clear:'مسح',reset:'قائمة مثال',winner:'تم الاختيار',need:'أضف عنصراً واحداً على الأقل.'},
  ur:{items:'نام یا نمبر',hint:'ہر لائن میں ایک آئٹم',add:'شامل کریں',placeholder:'نام یا نمبر لکھیں',spin:'وہیل گھمائیں',clear:'صاف کریں',reset:'مثالی فہرست',winner:'منتخب',need:'کم از کم ایک آئٹم شامل کریں۔'}
 }[lang]||null
 const C=L||{}
 const example='Ava\nNoah\nMia\nLeo\n42\n88'
 const [raw,setRaw]=useState(example),[draft,setDraft]=useState(''),[rotation,setRotation]=useState(0),[winner,setWinner]=useState(''),[status,setStatus]=useState('')
 const items=useMemo(()=>raw.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,60),[raw])
 const bg=items.length?'conic-gradient('+items.map((_,i)=>wheelColors[i%wheelColors.length]+' '+(i/items.length*100)+'% '+((i+1)/items.length*100)+'%').join(',')+')':'#182438'
 function add(){const v=draft.trim();if(!v)return;setRaw(r=>r.trim()?r.replace(/\s+$/,'')+'\n'+v:v);setDraft('')}
 function spin(){
  if(!items.length){setStatus(C.need);setWinner('');return}
  setStatus('');const index=randomIndex(items.length),slice=360/items.length
  setRotation(r=>r+1080+(360-(index*slice+slice/2)));setTimeout(()=>setWinner(items[index]),920)
 }
 return <div className="picker-layout">
   <section className="tool-pane">
    <div className="pane-heading"><div><h2>{C.items}</h2><p>{C.hint}</p></div><span className="pane-count">{items.length}</span></div>
    <textarea aria-label={C.items} className="input picker-textarea" value={raw} onChange={e=>setRaw(e.target.value)} spellCheck="false"/>
    <div className="picker-add-row"><input aria-label={C.placeholder} className="input" value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();add()}}} placeholder={C.placeholder}/><button className="btn-primary" onClick={add}><Plus size={16}/>{C.add}</button></div>
    <div className="picker-actions"><button className="btn-ghost" onClick={()=>{setRaw('');setWinner('')}}><Trash2 size={15}/>{C.clear}</button><button className="btn-ghost" onClick={()=>{setRaw(example);setWinner('')}}><RotateCcw size={15}/>{C.reset}</button></div>
   </section>
   <section className="tool-pane picker-stage">
    <div className="wheel-wrap"><div className="wheel-pointer"/><div className="picker-wheel" style={{background:bg,transform:'rotate('+rotation+'deg)'}}>{items.slice(0,12).map((item,i)=>{const angle=(i+.5)*(360/items.length);return <span key={item+i} style={{transform:'rotate('+angle+'deg) translateY(-41%) rotate('+(-angle)+'deg)'}}>{item}</span>})}<div className="wheel-hub"><Sparkles size={24}/></div></div></div>
    <button className="btn-primary picker-spin" onClick={spin}>{C.spin}</button>
    {status&&<p role="alert" className="tool-alert">{status}</p>}
    {winner&&<div className="picker-winner" aria-live="polite"><span>{C.winner}</span><strong>{winner}</strong></div>}
   </section>
 </div>
}

function playAlarm(kind){
 try{
  const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return
  const ctx=new AudioCtx(),now=ctx.currentTime
  const patterns=kind==='digital'?[[0,880,.12],[.16,880,.12],[.32,880,.18]]:kind==='chime'?[[0,523,.35],[.12,659,.4],[.24,784,.5]]:[[0,740,.22],[.28,988,.3]]
  patterns.forEach(([offset,freq,duration])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=kind==='digital'?'square':'sine';o.frequency.value=freq;g.gain.setValueAtTime(.001,now+offset);g.gain.exponentialRampToValueAtTime(.14,now+offset+.02);g.gain.exponentialRampToValueAtTime(.001,now+offset+duration);o.connect(g);g.connect(ctx.destination);o.start(now+offset);o.stop(now+offset+duration+.03)})
  setTimeout(()=>ctx.close().catch(()=>{}),1200)
 }catch{}
}
const two=n=>String(Math.max(0,n)).padStart(2,'0')

export function TimerTool(){
 const {lang}=useI18n()
 const L={
  en:{minutes:'Minutes',seconds:'Seconds',start:'Start',pause:'Pause',reset:'Reset',sound:'Alarm sound',preview:'Preview sound',bell:'Bell',digital:'Digital',chime:'Chime',ready:'Ready',running:'Running',paused:'Paused',done:"Time's up!"},
  'zh-TW':{minutes:'分鐘',seconds:'秒',start:'開始',pause:'暫停',reset:'重設',sound:'鬧鈴聲',preview:'試聽',bell:'鈴聲',digital:'電子音',chime:'和弦',ready:'就緒',running:'計時中',paused:'已暫停',done:'時間到！'},
  ar:{minutes:'دقائق',seconds:'ثوانٍ',start:'بدء',pause:'إيقاف مؤقت',reset:'إعادة',sound:'صوت المنبه',preview:'معاينة الصوت',bell:'جرس',digital:'رقمي',chime:'نغمة',ready:'جاهز',running:'يعمل',paused:'متوقف مؤقتاً',done:'انتهى الوقت!'},
  ur:{minutes:'منٹ',seconds:'سیکنڈ',start:'شروع',pause:'روکیں',reset:'ری سیٹ',sound:'الارم آواز',preview:'آواز سنیں',bell:'بیل',digital:'ڈیجیٹل',chime:'چائم',ready:'تیار',running:'چل رہا ہے',paused:'روکا ہوا',done:'وقت ختم!'}
 }[lang]||null
 const C=L||{}
 const [minutes,setMinutes]=useState(5),[seconds,setSeconds]=useState(0),[remaining,setRemaining]=useState(300),[running,setRunning]=useState(false),[sound,setSound]=useState('bell'),[done,setDone]=useState(false)
 const configured=Math.max(0,Math.min(24*3600,(Number(minutes)||0)*60+(Number(seconds)||0)))
 useEffect(()=>{if(!running)return;const id=setInterval(()=>setRemaining(r=>Math.max(0,r-1)),1000);return()=>clearInterval(id)},[running])
 useEffect(()=>{if(running&&remaining===0){setRunning(false);setDone(true);playAlarm(sound)}},[remaining,running,sound])
 const total=Math.max(1,configured),progress=Math.min(1,Math.max(0,remaining/total)),displayM=Math.floor(remaining/60),displayS=remaining%60
 const setPreset=n=>{setMinutes(Math.floor(n/60));setSeconds(n%60);setRemaining(n);setRunning(false);setDone(false)}
 const sync=(m,s)=>{const safeM=Math.max(0,Math.min(1440,Math.floor(Number(m)||0))),safeS=Math.max(0,Math.min(59,Math.floor(Number(s)||0)));setMinutes(safeM);setSeconds(safeS);setRemaining(safeM*60+safeS);setRunning(false);setDone(false)}
 const start=()=>{let next=remaining;if(next<=0)next=configured;if(next<=0)return;setRemaining(next);setDone(false);setRunning(true)}
 return <div className="timer-layout">
  <section className="tool-pane timer-stage">
   <div className="timer-ring" style={{'--timer-progress':(progress*360)+'deg'}}><div><strong>{two(displayM)}:{two(displayS)}</strong><span aria-live="polite">{done?C.done:running?C.running:remaining!==configured?C.paused:C.ready}</span></div></div>
   <div className="timer-main-actions">{running?<button className="btn-primary" onClick={()=>setRunning(false)}><Pause size={17}/>{C.pause}</button>:<button className="btn-primary" onClick={start}><Play size={17}/>{C.start}</button>}<button className="btn-ghost" onClick={()=>{setRemaining(configured);setRunning(false);setDone(false)}}><RotateCcw size={16}/>{C.reset}</button></div>
  </section>
  <section className="tool-pane">
   <div className="timer-inputs"><label><span>{C.minutes}</span><input aria-label={C.minutes} className="input" type="number" min="0" max="1440" value={minutes} onChange={e=>sync(e.target.value,seconds)}/></label><label><span>{C.seconds}</span><input aria-label={C.seconds} className="input" type="number" min="0" max="59" value={seconds} onChange={e=>sync(minutes,e.target.value)}/></label></div>
   <div className="timer-presets">{[60,300,600,1500].map(n=><button key={n} className="timer-preset" onClick={()=>setPreset(n)}>{n<60?n+'s':n/60+'m'}</button>)}</div>
   <label className="block"><span className="tool-label">{C.sound}</span><select aria-label={C.sound} className="input" value={sound} onChange={e=>setSound(e.target.value)}><option value="bell">{C.bell}</option><option value="digital">{C.digital}</option><option value="chime">{C.chime}</option></select></label>
   <button className="btn-ghost mt-3" onClick={()=>playAlarm(sound)}><Volume2 size={16}/>{C.preview}</button>
   {done&&<div className="timer-done" role="status"><AlarmClock size={18}/>{C.done}</div>}
  </section>
 </div>
}

export function SketchTool(){
 const {lang}=useI18n()
 const L={
  en:{input:'Original image',output:'Hand-drawn sketch',choose:'Choose image',style:'Sketch style',strength:'Edge strength',pencil:'Pencil',ink:'Ink',soft:'Soft graphite',make:'Create sketch',download:'Download PNG',empty:'Load an image to start',error:'Could not process this image.'},
  'zh-TW':{input:'原始圖片',output:'手繪素描',choose:'選擇圖片',style:'素描風格',strength:'線條強度',pencil:'鉛筆',ink:'墨線',soft:'柔和石墨',make:'製作素描',download:'下載 PNG',empty:'請先載入圖片',error:'無法處理這張圖片。'},
  ar:{input:'الصورة الأصلية',output:'رسم يدوي',choose:'اختر صورة',style:'نمط الرسم',strength:'قوة الحواف',pencil:'قلم رصاص',ink:'حبر',soft:'جرافيت ناعم',make:'إنشاء الرسم',download:'تنزيل PNG',empty:'حمّل صورة للبدء',error:'تعذر معالجة الصورة.'},
  ur:{input:'اصل تصویر',output:'ہاتھ سے بنا اسکیچ',choose:'تصویر منتخب کریں',style:'اسکیچ انداز',strength:'لائن طاقت',pencil:'پنسل',ink:'انک',soft:'سافٹ گریفائٹ',make:'اسکیچ بنائیں',download:'PNG ڈاؤن لوڈ',empty:'شروع کرنے کے لیے تصویر لوڈ کریں',error:'تصویر پراسیس نہیں ہو سکی۔'}
 }[lang]||null
 const C=L||{}
 const [file,setFile]=useState(null),[sourceUrl,setSourceUrl]=useState(''),[resultUrl,setResultUrl]=useState(''),[style,setStyle]=useState('pencil'),[strength,setStrength]=useState(1.8),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 const cleanup=useRef([])
 useEffect(()=>()=>cleanup.current.forEach(u=>URL.revokeObjectURL(u)),[])
 function choose(next){if(!next)return;setFile(next);setError('');setResultUrl('');const u=URL.createObjectURL(next);cleanup.current.push(u);setSourceUrl(u)}
 async function make(){
  if(!file){setError(C.empty);return}
  setBusy(true);setError('')
  try{
   const img=new Image(),src=URL.createObjectURL(file);cleanup.current.push(src);await new Promise((ok,fail)=>{img.onload=ok;img.onerror=fail;img.src=src})
   const max=1800,scale=Math.min(1,max/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale))
   const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,w,h)
   const frame=x.getImageData(0,0,w,h),d=frame.data,g=new Uint8ClampedArray(w*h)
   for(let i=0,p=0;i<d.length;i+=4,p++)g[p]=Math.round(.299*d[i]+.587*d[i+1]+.114*d[i+2])
   const out=x.createImageData(w,h),o=out.data
   for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){const p=y*w+xx,left=g[y*w+Math.max(0,xx-1)],up=g[Math.max(0,y-1)*w+xx],edge=Math.min(255,(Math.abs(g[p]-left)+Math.abs(g[p]-up))*strength*2.1);let v=255-edge;if(style==='ink')v=edge>28?18:255;else if(style==='soft')v=Math.min(255,225-edge*.68+g[p]*.12);const q=p*4;o[q]=o[q+1]=o[q+2]=v;o[q+3]=255}
   x.putImageData(out,0,0);const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob)throw new Error('encode');const u=URL.createObjectURL(blob);cleanup.current.push(u);setResultUrl(u)
  }catch{setError(C.error)}finally{setBusy(false)}
 }
 return <div>
  <div className="sketch-toolbar"><label><span className="tool-label">{C.style}</span><select aria-label={C.style} className="input" value={style} onChange={e=>setStyle(e.target.value)}><option value="pencil">{C.pencil}</option><option value="ink">{C.ink}</option><option value="soft">{C.soft}</option></select></label><label><span className="tool-label">{C.strength}: {strength.toFixed(1)}</span><input aria-label={C.strength} type="range" min=".6" max="3.2" step=".1" value={strength} onChange={e=>setStrength(Number(e.target.value))}/></label></div>
  <div className="sketch-grid"><section className="sketch-pane"><h2>{C.input}</h2><div className="sketch-canvas">{sourceUrl?<img src={sourceUrl} alt={C.input}/>:<span>{C.empty}</span>}</div><label className="sketch-file-button">{C.choose}<input aria-label={C.choose} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>choose(e.target.files?.[0])}/></label></section><section className="sketch-pane"><h2>{C.output}</h2><div className="sketch-canvas sketch-paper">{resultUrl?<img src={resultUrl} alt={C.output}/>:<span>{C.output}</span>}</div>{resultUrl&&<a className="sketch-download" href={resultUrl} download="anytool-hand-drawn-sketch.png"><Download size={16}/>{C.download}</a>}</section></div>
  <div className="sketch-actions"><button className="btn-primary" disabled={busy} onClick={make}><Sparkles size={16}/>{busy?'…':C.make}</button></div>
  {error&&<p role="alert" className="tool-alert">{error}</p>}
 </div>
}
