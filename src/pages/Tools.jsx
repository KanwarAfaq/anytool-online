import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BrainCircuit, Calculator, FileText, Image as ImageIcon, Search, Sparkles, WalletCards } from 'lucide-react'
import { categories, tools } from '../data/tools'
import Seo from '../components/Seo'
import ToolArt from '../components/ToolArt'
import { useI18n } from '../i18n'

const categoryIcon={money:WalletCards,image:ImageIcon,document:FileText,ai:BrainCircuit,general:Calculator}
const categoryAccent={money:'text-lime-300',image:'text-sky-300',document:'text-indigo-300',ai:'text-violet-300',general:'text-amber-300'}

export default function Tools(){
 const {lang,t,toolName,toolDescription,pathFor}=useI18n()
 const [query,setQuery]=useState('')
 const C={
  en:{eyebrow:'All tools',title:'Every tool, easy to find',body:'Browse the complete AnyTool catalog. Nothing is hidden behind a carousel or menu.',search:'Search all tools…',count:'tools',empty:'No tools match your search.'},
  'zh-TW':{eyebrow:'所有工具',title:'每個工具都清楚可見',body:'瀏覽完整 AnyTool 工具目錄，不把工具藏在輪播或選單裡。',search:'搜尋所有工具…',count:'個工具',empty:'找不到相符工具。'},
  ar:{eyebrow:'كل الأدوات',title:'كل أداة ظاهرة وسهلة الوصول',body:'تصفح كتالوج AnyTool الكامل. لا توجد أدوات مخفية داخل قوائم أو شرائط متحركة.',search:'ابحث في كل الأدوات…',count:'أداة',empty:'لا توجد أدوات مطابقة.'},
  ur:{eyebrow:'تمام ٹولز',title:'ہر ٹول واضح اور آسان رسائی میں',body:'AnyTool کا مکمل کیٹلاگ دیکھیں۔ کوئی ٹول کیروسل یا مینو کے پیچھے چھپا نہیں ہے۔',search:'تمام ٹولز تلاش کریں…',count:'ٹولز',empty:'کوئی ٹول نہیں ملا۔'}
 }[lang]
 const filtered=useMemo(()=>tools.filter(tool=>!query.trim()||(toolName(tool)+' '+toolDescription(tool)).toLowerCase().includes(query.toLowerCase())),[query,lang,toolName,toolDescription])
 const pageUrl='https://www.anytool.online'+pathFor('/tools')
 const schemas=[
  {'@context':'https://schema.org','@type':'CollectionPage',name:C.title,description:C.body,url:pageUrl,inLanguage:lang,isPartOf:{'@type':'WebSite',name:'AnyTool.online',url:'https://www.anytool.online/'}},
  {'@context':'https://schema.org','@type':'ItemList',name:C.title,itemListElement:tools.map((tool,i)=>({'@type':'ListItem',position:i+1,name:toolName(tool),url:'https://www.anytool.online'+pathFor('/tools/'+tool.slug),image:'https://www.anytool.online/tool-art/'+tool.slug+'.svg'}))}
 ]
 return <section className="mx-auto max-w-7xl px-4 py-12">
  <Seo title={C.title+' | AnyTool.online'} description={C.body} jsonLd={schemas}/>
  <div className="max-w-3xl">
   <div className="text-xs font-black uppercase tracking-[.17em] text-lime-300">{C.eyebrow}</div>
   <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{C.title}</h1>
   <p className="mt-4 text-slate-400">{C.body}</p>
  </div>
  <div className="tool-directory-toolbar mt-7">
   <label className="relative block min-w-0 flex-1"><span className="sr-only">{C.search}</span><Search className="absolute start-4 top-3.5 text-slate-500" size={16}/><input aria-label={C.search} className="input ps-11" value={query} onChange={e=>setQuery(e.target.value)} placeholder={C.search}/></label>
   <div className="text-sm font-semibold text-slate-400">{filtered.length} {C.count}</div>
  </div>
  <nav aria-label="Tool categories" className="mt-5 flex flex-wrap gap-2">{categories.map(category=>{const I=categoryIcon[category.id]||Sparkles;return <a key={category.id} className="category-jump" href={'#category-'+category.id}><I className={categoryAccent[category.id]} size={14}/>{t('categories.'+category.id)}</a>})}</nav>

  <div className="mt-10 space-y-12">
   {categories.map(category=>{
    const list=filtered.filter(tool=>tool.category===category.id)
    if(!list.length)return null
    const I=categoryIcon[category.id]||Sparkles
    return <section key={category.id} id={'category-'+category.id} className="scroll-mt-28" aria-labelledby={'category-heading-'+category.id}>
      <div className="mb-4 flex items-center gap-3">
       <span className="tool-icon"><I className={categoryAccent[category.id]} size={17}/></span>
       <div><h2 id={'category-heading-'+category.id} className="text-2xl font-black">{t('categories.'+category.id)}</h2><p className="text-sm text-slate-500">{list.length} {C.count}</p></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
       {list.map(tool=><Link key={tool.slug} to={pathFor('/tools/'+tool.slug)} className={'card tool-card tool-card-visual category-'+tool.category+' group overflow-hidden'}><ToolArt tool={tool} name={toolName(tool)}/><div className="p-5">
        <div className="flex items-start justify-between gap-4">
         <h3 className="text-lg font-black leading-snug group-hover:text-lime-200">{toolName(tool)}</h3>
         <ArrowRight className="mt-1 shrink-0 text-slate-700 transition group-hover:translate-x-1 group-hover:text-lime-300" size={17}/>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-400">{toolDescription(tool)}</p>
       </div></Link>)}
      </div>
     </section>
   })}
  </div>
  {filtered.length===0&&<div className="card mt-8 p-10 text-center text-slate-500">{C.empty}</div>}
 </section>
}
