import { useEffect, useState } from 'react'

const OPS={'+':(a,b)=>a+b,'−':(a,b)=>a-b,'×':(a,b)=>a*b,'÷':(a,b)=>b===0?NaN:a/b}
const clean=n=>{
 if(!Number.isFinite(n))return 'Error'
 const abs=Math.abs(n)
 if((abs!==0&&abs<1e-8)||abs>=1e12)return n.toExponential(6)
 return String(Number(n.toPrecision(12)))
}

export default function SimpleCalculator(){
 const [display,setDisplay]=useState('0'),[stored,setStored]=useState(null),[op,setOp]=useState(null),[waiting,setWaiting]=useState(false),[history,setHistory]=useState('')
 function clear(){setDisplay('0');setStored(null);setOp(null);setWaiting(false);setHistory('')}
 function digit(d){if(display==='Error'||waiting){setDisplay(d);setWaiting(false)}else setDisplay(display==='0'?d:(display.length<14?display+d:display))}
 function decimal(){if(display==='Error'||waiting){setDisplay('0.');setWaiting(false)}else if(!display.includes('.'))setDisplay(display+'.')}
 function sign(){if(display!=='0'&&display!=='Error')setDisplay(clean(-Number(display)))}
 function percent(){if(display!=='Error')setDisplay(clean(Number(display)/100))}
 function choose(next){
  const value=Number(display)
  if(display==='Error'){clear();return}
  if(op&&stored!=null&&!waiting){const result=OPS[op](stored,value);setStored(result);setDisplay(clean(result));setHistory(clean(result)+' '+next)}
  else {setStored(value);setHistory(clean(value)+' '+next)}
  setOp(next);setWaiting(true)
 }
 function equals(){
  if(op==null||stored==null||display==='Error')return
  const value=Number(display),result=OPS[op](stored,value)
  setHistory(clean(stored)+' '+op+' '+clean(value)+' =');setDisplay(clean(result));setStored(null);setOp(null);setWaiting(true)
 }
 function press(key){
  if(/^\d$/.test(key))digit(key)
  else if(key==='.')decimal()
  else if(key==='Escape'||key==='c'||key==='C')clear()
  else if(key==='%')percent()
  else if(key==='Enter'||key==='=')equals()
  else if(key==='+')choose('+')
  else if(key==='-')choose('−')
  else if(key==='*')choose('×')
  else if(key==='/')choose('÷')
  else if(key==='Backspace'&&!waiting&&display!=='Error')setDisplay(display.length>1?display.slice(0,-1):'0')
 }
 useEffect(()=>{const h=e=>{if(/^[0-9.+\-*/%=]$/.test(e.key)||['Enter','Escape','Backspace'].includes(e.key)){e.preventDefault();press(e.key)}};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h)})
 const keys=[['AC','util',clear],['±','util',sign],['%','util',percent],['÷','op',()=>choose('÷')],['7','digit',()=>digit('7')],['8','digit',()=>digit('8')],['9','digit',()=>digit('9')],['×','op',()=>choose('×')],['4','digit',()=>digit('4')],['5','digit',()=>digit('5')],['6','digit',()=>digit('6')],['−','op',()=>choose('−')],['1','digit',()=>digit('1')],['2','digit',()=>digit('2')],['3','digit',()=>digit('3')],['+','op',()=>choose('+')],['0','digit wide',()=>digit('0')],['.','digit',decimal],['=','op',equals]]
 return <div className="calculator-stage">
  <div className="iphone-calculator" aria-label="Simple calculator">
   <div className="calculator-display"><small>{history||' '}</small><output data-testid="calculator-display" aria-live="polite">{display}</output></div>
   <div className="calculator-keypad">{keys.map(([label,type,fn])=><button key={label} aria-label={label==='±'?'plus minus':label} className={'calc-key '+type+(op===label?' active':'')} onClick={fn}>{label}</button>)}</div>
   <p className="calculator-hint">Keyboard supported · Esc clears · Enter equals</p>
  </div>
 </div>
}
