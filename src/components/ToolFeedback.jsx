import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Flag, ThumbsDown, ThumbsUp } from 'lucide-react'
import { logToolEvent } from '../lib/supabase'
import { useI18n } from '../i18n'

export default function ToolFeedback({tool}){
 const {lang,pathFor,toolName}=useI18n()
 const [choice,setChoice]=useState(()=>{try{return localStorage.getItem('anytool_feedback_'+tool.slug)||''}catch{return ''}})
 const C={
  en:{ask:'Was this tool useful?',yes:'Yes',no:'Not really',thanks:'Thanks — your feedback helps us improve.',report:'Report a problem',hint:'Calculation issue, broken control, outdated source or accessibility problem.'},
  'zh-TW':{ask:'這個工具有幫助嗎？',yes:'有幫助',no:'不太有',thanks:'謝謝，你的回饋會幫助我們改善。',report:'回報問題',hint:'可回報計算錯誤、控制項故障、資料過時或無障礙問題。'},
  ar:{ask:'هل كانت هذه الأداة مفيدة؟',yes:'نعم',no:'ليس كثيراً',thanks:'شكراً — تساعدنا ملاحظاتك على التحسين.',report:'أبلغ عن مشكلة',hint:'خطأ حسابي أو عنصر معطل أو مصدر قديم أو مشكلة وصول.'},
  ur:{ask:'کیا یہ ٹول مفید تھا؟',yes:'ہاں',no:'زیادہ نہیں',thanks:'شکریہ — آپ کا فیڈبیک ہمیں بہتر بنانے میں مدد دیتا ہے۔',report:'مسئلہ رپورٹ کریں',hint:'حساب کی خرابی، خراب کنٹرول، پرانا ماخذ یا رسائی کا مسئلہ۔'}
 }[lang]
 const vote=async value=>{setChoice(value);try{localStorage.setItem('anytool_feedback_'+tool.slug,value)}catch{};logToolEvent(tool.slug,'tool_feedback',{helpful:value==='yes'}).catch(()=>{})}
 const reportUrl=pathFor('/contact')+'?tool='+encodeURIComponent(tool.slug)+'&subject='+encodeURIComponent('Problem with '+toolName(tool))
 return <section className="tool-feedback">
  <div><div className="text-sm font-black">{C.ask}</div><p>{C.hint}</p></div>
  <div className="tool-feedback-actions">
   <button className={choice==='yes'?'tool-feedback-vote active':'tool-feedback-vote'} onClick={()=>vote('yes')} aria-pressed={choice==='yes'}><ThumbsUp size={15}/>{C.yes}</button>
   <button className={choice==='no'?'tool-feedback-vote active':'tool-feedback-vote'} onClick={()=>vote('no')} aria-pressed={choice==='no'}><ThumbsDown size={15}/>{C.no}</button>
   <Link className="tool-feedback-report" to={reportUrl}><Flag size={15}/>{C.report}</Link>
  </div>
  {choice&&<div className="tool-feedback-thanks"><Check size={14}/>{C.thanks}</div>}
 </section>
}
