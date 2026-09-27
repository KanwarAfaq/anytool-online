import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, BrainCircuit, Calculator, Code2, FileText, Image as ImageIcon, Palette, Search, Shield, Sparkles, Type, WalletCards } from 'lucide-react'
import { categories, tools } from '../data/tools'
import Seo from '../components/Seo'
import { useI18n } from '../i18n'

const categoryIcon={money:WalletCards,image:ImageIcon,document:FileText,ai:BrainCircuit,general:Calculator,developer:Code2,text:Type,security:Shield,design:Palette}
const isNew=tool=>Boolean(tool.updatedAt)&&Date.now()-new Date(tool.updatedAt+'T00:00:00Z').getTime()>=0&&Date.now()-new Date(tool.updatedAt+'T00:00:00Z').getTime()<45*864e5
const PAGE_SIZE=12

export default function Tools(){
 const {lang,t,toolName,toolDescription,pathFor}=useI18n()
 const [query,setQuery]=useState('')
 const [category,setCategory]=useState('all')
 const [page,setPage]=useState(1)
 const C={
  en:{eyebrow:'AnyTool library',title:'Find a tool. Get it done.',body:'Focused utilities without the wall of cards. Search, filter and move through the library in smaller pages.',search:'Search all tools',count:'tools',empty:'No tools match your search.',all:'All tools',showing:'Showing',of:'of',page:'Page',previous:'Previous',next:'Next'},
  'zh-TW':{eyebrow:'AnyTool 工具庫',title:'找到工具，立即完成。',body:'不用一次面對整頁工具卡。搜尋、分類，分頁瀏覽更容易。',search:'搜尋所有工具',count:'個工具',empty:'找不到相符工具。',all:'全部工具',showing:'顯示',of:'共',page:'第',previous:'上一頁',next:'下一頁'},
  ar:{eyebrow:'مكتبة AnyTool',title:'ابحث عن أداة وأنجز المهمة.',body:'أدوات واضحة بدون جدار طويل من البطاقات. ابحث وصفّح المكتبة على صفحات أصغر.',search:'ابحث في كل الأدوات',count:'أداة',empty:'لا توجد أدوات مطابقة.',all:'كل الأدوات',showing:'عرض',of:'من',page:'صفحة',previous:'السابق',next:'التالي'},
  ur:{eyebrow:'AnyTool لائبریری',title:'ٹول تلاش کریں، کام مکمل کریں۔',body:'لمبی کارڈ وال کے بجائے تلاش، فلٹر اور چھوٹے صفحات کے ذریعے ٹولز دیکھیں۔',search:'تمام ٹولز تلاش کریں',count:'ٹولز',empty:'کوئی ٹول نہیں ملا۔',all:'تمام ٹولز',showing:'دکھائے جا رہے ہیں',of:'از',page:'صفحہ',previous:'پچھلا',next:'اگلا'}
 }[lang]
 const filtered=useMemo(()=>tools.filter(tool=>(category==='all'||tool.category===category)&&(!query.trim()||(toolName(tool)+' '+toolDescription(tool)+' '+tool.category).toLowerCase().includes(query.toLowerCase()))),[query,category,lang,toolName,toolDescription])
 const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE))
 useEffect(()=>setPage(1),[query,category])
 useEffect(()=>{if(page>pages)setPage(pages)},[page,pages])
 const start=(page-1)*PAGE_SIZE
 const visible=filtered.slice(start,start+PAGE_SIZE)
 const pageUrl='https://www.anytool.online'+pathFor('/tools')
 const schemas=[{'@context':'https://schema.org','@type':'CollectionPage',name:C.title,description:C.body,url:pageUrl,inLanguage:lang,isPartOf:{'@type':'WebSite',name:'AnyTool.online',url:'https://www.anytool.online/'}},{'@context':'https://schema.org','@type':'ItemList',name:C.title,itemListElement:tools.map((tool,i)=>({'@type':'ListItem',position:i+1,name:toolName(tool),url:'https://www.anytool.online'+pathFor('/tools/'+tool.slug),image:'https://www.anytool.online/tool-art/'+tool.slug+'.svg'}))}]
 return <section className="mx-auto max-w-7xl px-4 py-12">
  <Seo title={C.title+' | AnyTool.online'} description={C.body} jsonLd={schemas}/>
  <div className="tool-library-hero"><span>{C.eyebrow}</span><h1>{C.title}</h1><p>{C.body}</p></div>
  <label className="tool-library-search"><Search size={25}/><span className="sr-only">{C.search}</span><input aria-label={C.search} value={query} onChange={e=>setQuery(e.target.value)} placeholder={C.search}/><b>{filtered.length} {C.count}</b></label>
  <div className="tool-filter-row" aria-label="Tool categories">
   <button className={category==='all'?'tool-filter-pill active':'tool-filter-pill'} onClick={()=>setCategory('all')}><Sparkles size={16}/>{C.all}</button>
   {categories.map(item=>{const I=categoryIcon[item.id]||Sparkles;return <button key={item.id} className={category===item.id?'tool-filter-pill active':'tool-filter-pill'} onClick={()=>setCategory(item.id)}><I size={16}/>{t('categories.'+item.id)}</button>})}
  </div>
  <div className="tool-pagination-summary"><span>{C.showing} {filtered.length?start+1:0}–{Math.min(start+PAGE_SIZE,filtered.length)} {C.of} {filtered.length}</span><span>{C.page} {page} / {pages}</span></div>
  <div className="directory-tool-grid directory-tool-grid-paged">{visible.map(tool=>{const I=categoryIcon[tool.category]||Sparkles;return <Link key={tool.slug} to={pathFor('/tools/'+tool.slug)} className={'directory-tool-button category-'+tool.category}><span className="directory-tool-icon"><I size={20}/></span><span className="min-w-0"><span className="flex items-center gap-2"><strong>{toolName(tool)}</strong>{isNew(tool)&&<em className="tool-new-badge">New</em>}</span><small>{toolDescription(tool)}</small></span><ArrowUpRight className="directory-tool-arrow" size={18}/></Link>})}</div>
  {filtered.length===0&&<div className="card mt-8 p-10 text-center text-slate-500">{C.empty}</div>}
  {filtered.length>0&&pages>1&&<nav className="tool-pagination" aria-label="Tool pagination">
   <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}><ArrowLeft size={16}/>{C.previous}</button>
   <div className="tool-pagination-pages">{Array.from({length:pages},(_,i)=>i+1).map(n=><button key={n} aria-current={n===page?'page':undefined} className={n===page?'active':''} onClick={()=>setPage(n)}>{n}</button>)}</div>
   <button disabled={page===pages} onClick={()=>setPage(p=>Math.min(pages,p+1))}>{C.next}<ArrowRight size={16}/></button>
  </nav>}
 </section>
}
