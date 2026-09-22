import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BrainCircuit, Calculator, FileText, Image as ImageIcon, Search, Sparkles, WalletCards } from 'lucide-react'
import { categories, tools } from '../data/tools'
import Seo from '../components/Seo'
import { useI18n } from '../i18n'

const categoryIcon={money:WalletCards,image:ImageIcon,document:FileText,ai:BrainCircuit,general:Calculator}
const accent={money:'#55b85a',image:'#3488e5',document:'#6b63df',ai:'#a251d8',general:'#ef8b2c'}

export default function Tools(){
 const {lang,t,toolName,toolDescription,pathFor}=useI18n()
 const [query,setQuery]=useState(''),[category,setCategory]=useState('all')
 const C={
  en:{eyebrow:'AnyTool directory',title:'Find the tool. Get the job done.',body:'Large, focused utilities with no clutter. Search by task, format or calculation.',search:'Search all tools',all:'All tools',count:'tools',empty:'No matching tools.'},
  'zh-TW':{eyebrow:'AnyTool 工具目錄',title:'找到工具，直接完成。',body:'大型、專注、不雜亂。可依任務、格式或計算快速搜尋。',search:'搜尋所有工具',all:'全部工具',count:'個工具',empty:'找不到相符工具。'},
  ar:{eyebrow:'دليل AnyTool',title:'ابحث عن الأداة وأنجز المهمة.',body:'أدوات كبيرة ومباشرة بلا فوضى. ابحث بالمهمة أو الصيغة أو الحساب.',search:'ابحث في كل الأدوات',all:'كل الأدوات',count:'أداة',empty:'لا توجد أدوات مطابقة.'},
  ur:{eyebrow:'AnyTool ڈائریکٹری',title:'ٹول تلاش کریں، کام مکمل کریں۔',body:'بڑے، واضح اور غیر ضروری ہجوم کے بغیر ٹولز۔ کام، فارمیٹ یا حساب سے تلاش کریں۔',search:'تمام ٹولز تلاش کریں',all:'تمام ٹولز',count:'ٹولز',empty:'کوئی ٹول نہیں ملا۔'}
 }[lang]
 const filtered=useMemo(()=>tools.filter(tool=>(category==='all'||tool.category===category)&&(!query.trim()||(toolName(tool)+' '+toolDescription(tool)).toLowerCase().includes(query.toLowerCase()))),[query,category,lang,toolName,toolDescription])
 const pageUrl='https://www.anytool.online'+pathFor('/tools')
 const schemas=[
  {'@context':'https://schema.org','@type':'CollectionPage',name:C.title,description:C.body,url:pageUrl,inLanguage:lang,isPartOf:{'@type':'WebSite',name:'AnyTool.online',url:'https://www.anytool.online/'}},
  {'@context':'https://schema.org','@type':'ItemList',name:C.title,itemListElement:tools.map((tool,i)=>({'@type':'ListItem',position:i+1,name:toolName(tool),url:'https://www.anytool.online'+pathFor('/tools/'+tool.slug),image:'https://www.anytool.online/tool-art/'+tool.slug+'.svg'}))}
 ]
 return <section className="mx-auto max-w-7xl px-4 py-12">
  <Seo title={C.title+' | AnyTool.online'} description={C.body} jsonLd={schemas}/>
  <div className="tools-directory-heading"><p>{C.eyebrow}</p><h1>{C.title}</h1><span>{C.body}</span></div>
  <div className="tool-browser-panel">
   <label className="tool-browser-search"><Search size={24}/><span className="sr-only">{C.search}</span><input aria-label={C.search} value={query} onChange={e=>setQuery(e.target.value)} placeholder={C.search}/><kbd>⌘ K</kbd></label>
   <div className="tool-browser-filters"><button data-active={category==='all'} onClick={()=>setCategory('all')}>{C.all}</button>{categories.map(c=>{const I=categoryIcon[c.id]||Sparkles;return <button key={c.id} data-active={category===c.id} style={{'--chip':accent[c.id]}} onClick={()=>setCategory(c.id)}><I size={15}/>{t('categories.'+c.id)}</button>})}<span>{filtered.length} {C.count}</span></div>
   <div className="tool-browser-grid">{filtered.map(tool=>{const I=categoryIcon[tool.category]||Sparkles;return <Link key={tool.slug} to={pathFor('/tools/'+tool.slug)} className="tool-browser-card" style={{'--tool-card-accent':accent[tool.category]}}><span className="tool-browser-icon"><I size={19}/></span><span className="tool-browser-copy"><strong>{toolName(tool)}</strong><small>{toolDescription(tool)}</small></span><ArrowRight size={18}/></Link>})}</div>
   {!filtered.length&&<div className="tool-browser-empty">{C.empty}</div>}
  </div>
 </section>
}
