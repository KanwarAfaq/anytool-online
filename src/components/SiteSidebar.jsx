import { Link, useLocation } from 'react-router-dom'
import { BrainCircuit, Calculator, FileText, Home, Image as ImageIcon, LayoutGrid, Sparkles, WalletCards, Wrench } from 'lucide-react'
import { categories, tools, toolBySlug } from '../data/tools'
import { useI18n } from '../i18n'

const categoryIcon={money:WalletCards,image:ImageIcon,document:FileText,ai:BrainCircuit,general:Calculator}
const stripLocale=path=>path.replace(/^\/(zh-tw|ar|ur)(?=\/|$)/,'')||'/'

export default function SiteSidebar(){
 const location=useLocation()
 const {lang,t,toolName,pathFor}=useI18n()
 const clean=stripLocale(location.pathname)
 const slug=clean.match(/^\/tools\/([^/]+)$/)?.[1]
 const routeCategory=clean.match(/^\/categories\/([^/]+)$/)?.[1]
 const activeTool=slug?toolBySlug[slug]:null
 const activeCategory=activeTool?.category||routeCategory||null
 const subTools=activeCategory?tools.filter(x=>x.category===activeCategory):tools.slice(0,7)
 const copy={
  en:{explore:'Explore AnyTool',categories:'Categories',quick:'Quick access',inside:'In this category',home:'Home',all:'All tools'},
  'zh-TW':{explore:'探索 AnyTool',categories:'分類',quick:'快速工具',inside:'此分類工具',home:'首頁',all:'全部工具'},
  ar:{explore:'استكشف AnyTool',categories:'الفئات',quick:'وصول سريع',inside:'في هذه الفئة',home:'الرئيسية',all:'كل الأدوات'},
  ur:{explore:'AnyTool دریافت کریں',categories:'کیٹیگریز',quick:'فوری رسائی',inside:'اس کیٹیگری میں',home:'ہوم',all:'تمام ٹولز'}
 }[lang]||{explore:'Explore AnyTool',categories:'Categories',quick:'Quick access',inside:'In this category',home:'Home',all:'All tools'}
 return <aside className="site-global-sidebar" aria-label={copy.explore}>
  <div className="site-sidebar-card">
   <div className="site-sidebar-title"><span><Wrench size={16}/></span><div><strong>{copy.explore}</strong><small>{tools.length} tools</small></div></div>
   <div className="site-sidebar-primary">
    <Link aria-current={clean==='/'?'page':undefined} className={clean==='/'?'active':''} to={pathFor('/')}><Home size={15}/>{copy.home}</Link>
    <Link aria-current={clean==='/tools'?'page':undefined} className={clean==='/tools'?'active':''} to={pathFor('/tools')}><LayoutGrid size={15}/>{copy.all}</Link>
   </div>
   <div className="site-sidebar-label">{copy.categories}</div>
   <nav className="site-sidebar-categories">
    {categories.map(category=>{const I=categoryIcon[category.id]||Sparkles;const active=activeCategory===category.id;return <Link key={category.id} aria-current={active?'page':undefined} className={active?'active':''} to={pathFor('/categories/'+category.id)}><span className={'category-'+category.id}><I size={15}/></span><b>{t('categories.'+category.id)}</b><small>{tools.filter(x=>x.category===category.id).length}</small></Link>})}
   </nav>
   <div className="site-sidebar-divider"/>
   <div className="site-sidebar-label">{activeCategory?copy.inside:copy.quick}</div>
   <nav className="site-sidebar-subtools">
    {subTools.map(item=><Link key={item.slug} aria-current={item.slug===slug?'page':undefined} className={item.slug===slug?'active':''} to={pathFor('/tools/'+item.slug)}><span>{toolName(item)}</span></Link>)}
   </nav>
  </div>
 </aside>
}
