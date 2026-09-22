import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, BrainCircuit, Calculator, FileText, Image as ImageIcon, Search, Sparkles, WalletCards } from 'lucide-react'
import { categories, tools } from '../data/tools'
import Seo from '../components/Seo'
import { useI18n } from '../i18n'

const categoryIcon={money:WalletCards,image:ImageIcon,document:FileText,ai:BrainCircuit,general:Calculator}

export default function Tools(){
 const {lang,t,toolName,toolDescription,pathFor}=useI18n()
 const [query,setQuery]=useState('')
 const C={
  en:{eyebrow:'AnyTool library',title:'Find a tool. Get it done.',body:'Large, focused utilities with no clutter. Search by task, format, calculator or keyword.',search:'Search all tools',count:'tools',empty:'No tools match your search.'},
  'zh-TW':{eyebrow:'AnyTool 工具庫',title:'找到工具，立即完成。',body:'大尺寸、專注、好搜尋的實用工具。可依工作、格式、計算器或關鍵字搜尋。',search:'搜尋所有工具',count:'個工具',empty:'找不到相符工具。'},
  ar:{eyebrow:'مكتبة AnyTool',title:'ابحث عن أداة وأنجز المهمة.',body:'أدوات كبيرة وواضحة وسهلة البحث بدون فوضى.',search:'ابحث في كل الأدوات',count:'أداة',empty:'لا توجد أدوات مطابقة.'},
  ur:{eyebrow:'AnyTool لائبریری',title:'ٹول تلاش کریں، کام مکمل کریں۔',body:'بڑے، واضح اور آسانی سے تلاش ہونے والے ٹولز۔',search:'تمام ٹولز تلاش کریں',count:'ٹولز',empty:'کوئی ٹول نہیں ملا۔'}
 }[lang]
 const filtered=useMemo(()=>tools.filter(tool=>!query.trim()||(toolName(tool)+' '+toolDescription(tool)+' '+tool.category).toLowerCase().includes(query.toLowerCase())),[query,lang,toolName,toolDescription])
 const pageUrl='https://www.anytool.online'+pathFor('/tools')
 const schemas=[{'@context':'https://schema.org','@type':'CollectionPage',name:C.title,description:C.body,url:pageUrl,inLanguage:lang,isPartOf:{'@type':'WebSite',name:'AnyTool.online',url:'https://www.anytool.online/'}},{'@context':'https://schema.org','@type':'ItemList',name:C.title,itemListElement:tools.map((tool,i)=>({'@type':'ListItem',position:i+1,name:toolName(tool),url:'https://www.anytool.online'+pathFor('/tools/'+tool.slug),image:'https://www.anytool.online/tool-art/'+tool.slug+'.svg'}))}]
 return <section className="mx-auto max-w-7xl px-4 py-12">
  <Seo title={C.title+' | AnyTool.online'} description={C.body} jsonLd={schemas}/>
  <div className="tool-library-hero"><span>{C.eyebrow}</span><h1>{C.title}</h1><p>{C.body}</p></div>
  <label className="tool-library-search"><Search size={25}/><span className="sr-only">{C.search}</span><input aria-label={C.search} value={query} onChange={e=>setQuery(e.target.value)} placeholder={C.search}/><b>{filtered.length} {C.count}</b></label>
  <nav aria-label="Tool categories" className="tool-library-tabs">{categories.map(category=>{const I=categoryIcon[category.id]||Sparkles;return <a key={category.id} href={'#category-'+category.id}><I size={16}/>{t('categories.'+category.id)}</a>})}</nav>
  <div className="mt-10 space-y-11">{categories.map(category=>{const list=filtered.filter(tool=>tool.category===category.id);if(!list.length)return null;const I=categoryIcon[category.id]||Sparkles;return <section key={category.id} id={'category-'+category.id} className="scroll-mt-28"><div className={'directory-category-title category-'+category.id}><span><I size={19}/></span><div><h2>{t('categories.'+category.id)}</h2><p>{list.length} {C.count}</p></div></div><div className="directory-tool-grid">{list.map(tool=><Link key={tool.slug} to={pathFor('/tools/'+tool.slug)} className={'directory-tool-button category-'+tool.category}><span className="directory-tool-icon"><I size={20}/></span><span className="min-w-0"><strong>{toolName(tool)}</strong><small>{toolDescription(tool)}</small></span><ArrowUpRight className="directory-tool-arrow" size={18}/></Link>)}</div></section>})}</div>
  {filtered.length===0&&<div className="card mt-8 p-10 text-center text-slate-500">{C.empty}</div>}
 </section>
}
