import { useI18n } from '../i18n'
import { faqForTool, faqTitleFor } from '../data/toolFaq'

export default function ToolFaq({tool}){
 const {lang,toolName,toolDescription}=useI18n()
 const items=faqForTool(tool,lang,toolName(tool),toolDescription(tool))
 return <section className="tool-faq rv" aria-labelledby="tool-faq-h">
  <h2 id="tool-faq-h">{toolName(tool)} — {faqTitleFor(lang)}</h2>
  <div className="tool-faq-list">{items.map(([q,a])=><details key={q} className="tool-faq-item"><summary>{q}</summary><p>{a}</p></details>)}</div>
 </section>
}
