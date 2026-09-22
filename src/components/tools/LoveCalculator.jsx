import { useState } from 'react'
import { Heart, Sparkles } from 'lucide-react'

const hash=s=>{let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
const scoreFor=(a,b,salt='')=>{const key=[a.trim().toLowerCase(),b.trim().toLowerCase()].sort().join('|')+salt;return 35+(hash(key)%66)}

export default function LoveCalculator(){
 const [a,setA]=useState(''),[b,setB]=useState(''),[result,setResult]=useState(null)
 function calculate(){
  if(!a.trim()||!b.trim())return
  const score=scoreFor(a,b),trust=Math.min(99,Math.max(30,scoreFor(a,b,'trust'))),communication=Math.min(99,Math.max(30,scoreFor(a,b,'talk')))
  setResult({score,trust,communication,chemistry:Math.min(99,Math.max(30,Math.round((score+scoreFor(a,b,'chem'))/2)))})
 }
 const label=result?(result.score>=88?'Soulmate energy ✨':result.score>=72?'Beautiful match 💞':result.score>=55?'Sweet connection 💗':'Opposites can surprise 💫'):''
 return <div className="love-shell">
  <div className="love-glow love-glow-a"/><div className="love-glow love-glow-b"/>
  <section className="love-input-card">
   <div className="love-title"><Heart fill="currentColor"/><div><span>For fun</span><h2>Love Calculator</h2></div></div>
   <p>Enter two names and reveal a playful compatibility score.</p>
   <div className="love-name-grid"><label><span>Your name</span><input aria-label="First name" className="input" value={a} onChange={e=>{setA(e.target.value);setResult(null)}} placeholder="Alex"/></label><div className="love-heart-join"><Heart fill="currentColor"/></div><label><span>Their name</span><input aria-label="Second name" className="input" value={b} onChange={e=>{setB(e.target.value);setResult(null)}} placeholder="Taylor"/></label></div>
   <button className="love-button" disabled={!a.trim()||!b.trim()} onClick={calculate}><Sparkles size={18}/> Calculate love</button>
   <p className="love-disclaimer">Entertainment only — the same two names always produce the same playful result.</p>
  </section>
  <section className={'love-result '+(result?'show':'')} aria-live="polite">
   {result?<><div className="love-score-ring" style={{'--love-score':result.score+'%'}}><div><strong>{result.score}%</strong><span>{label}</span></div></div><div className="love-pair">{a}<Heart fill="currentColor"/>{b}</div><div className="love-bars">{[['Trust',result.trust],['Chemistry',result.chemistry],['Communication',result.communication]].map(([name,value])=><div key={name}><div><span>{name}</span><b>{value}%</b></div><i><em style={{width:value+'%'}}/></i></div>)}</div></>:<div className="love-placeholder"><Heart size={48}/><strong>Your result appears here</strong><span>Two names. One colorful reveal.</span></div>}
  </section>
 </div>
}
