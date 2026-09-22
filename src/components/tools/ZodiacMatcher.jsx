import { useState } from 'react'
import { ArrowLeftRight, Sparkles } from 'lucide-react'

const SIGNS=[
 ['Aries','♈','Fire'],['Taurus','♉','Earth'],['Gemini','♊','Air'],['Cancer','♋','Water'],
 ['Leo','♌','Fire'],['Virgo','♍','Earth'],['Libra','♎','Air'],['Scorpio','♏','Water'],
 ['Sagittarius','♐','Fire'],['Capricorn','♑','Earth'],['Aquarius','♒','Air'],['Pisces','♓','Water'],
]
const base=(a,b)=>{
 if(a===b)return 90
 const pair=[a,b].sort().join('-')
 return {'Air-Fire':92,'Earth-Water':91,'Earth-Fire':72,'Fire-Water':61,'Air-Earth':64,'Air-Water':70}[pair]||76
}
const score=(a,b)=>{
 const ia=SIGNS.findIndex(x=>x[0]===a),ib=SIGNS.findIndex(x=>x[0]===b),ea=SIGNS[ia][2],eb=SIGNS[ib][2]
 return Math.max(45,Math.min(98,base(ea,eb)+(((ia+1)*7+(ib+1)*11)%9)-4))
}
const vibe=n=>n>=90?'Cosmic power match':n>=80?'Naturally magnetic':n>=68?'Strong potential':n>=55?'Interesting contrast':'A growth-oriented mix'

export default function ZodiacMatcher(){
 const [a,setA]=useState('Aries'),[b,setB]=useState('Libra')
 const A=SIGNS.find(x=>x[0]===a),B=SIGNS.find(x=>x[0]===b),value=score(a,b)
 function swap(){setA(b);setB(a)}
 return <div className="zodiac-shell">
  <section className="zodiac-picker">
   <div className="zodiac-heading"><Sparkles/><div><span>Astrology for fun</span><h2>Zodiac Matcher</h2></div></div>
   <div className="zodiac-select-grid">
    <label><span>First sign</span><select aria-label="First zodiac sign" className="input" value={a} onChange={e=>setA(e.target.value)}>{SIGNS.map(([name,symbol,element])=><option key={name} value={name}>{symbol} {name} · {element}</option>)}</select></label>
    <button className="zodiac-swap" aria-label="Swap zodiac signs" onClick={swap}><ArrowLeftRight size={20}/></button>
    <label><span>Second sign</span><select aria-label="Second zodiac sign" className="input" value={b} onChange={e=>setB(e.target.value)}>{SIGNS.map(([name,symbol,element])=><option key={name} value={name}>{symbol} {name} · {element}</option>)}</select></label>
   </div>
   <p>Element chemistry + sign spacing are combined into a playful compatibility score. This is entertainment, not relationship advice.</p>
  </section>
  <section className="zodiac-result" aria-live="polite">
   <div className="zodiac-stars" aria-hidden="true">✦ · ✧ · ✦ · ✧ · ✦</div>
   <div className="zodiac-sign-row"><div><b>{A[1]}</b><strong>{A[0]}</strong><span>{A[2]}</span></div><div className="zodiac-score" style={{'--zodiac-score':value+'%'}}><strong>{value}%</strong><span>{vibe(value)}</span></div><div><b>{B[1]}</b><strong>{B[0]}</strong><span>{B[2]}</span></div></div>
   <div className="zodiac-summary"><span>{A[2]} × {B[2]}</span><strong>{value>=80?'Flow comes easily when you give each other room to shine.':value>=65?'Different rhythms can complement each other with curiosity and patience.':'The contrast is the fun part — communication makes the difference.'}</strong></div>
  </section>
 </div>
}
