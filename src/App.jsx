import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'

const ToolPage=lazy(()=>import('./pages/ToolPage'))
const AuthPage=lazy(()=>import('./pages/Auth'))
const Dashboard=lazy(()=>import('./pages/Dashboard'))
const About=lazy(()=>import('./pages/About'))
const Contact=lazy(()=>import('./pages/Contact'))
const Privacy=lazy(()=>import('./pages/Privacy'))
const Methodology=lazy(()=>import('./pages/Methodology'))
const Sources=lazy(()=>import('./pages/Sources'))
const Profile=lazy(()=>import('./pages/Profile'))
const Category=lazy(()=>import('./pages/Category'))

function Loading(){return <div className="mx-auto max-w-7xl px-4 py-20 text-slate-400">Loading…</div>}
function LocaleGate({children}){const {locale}=useParams();return ['zh-tw','ar','ur'].includes(locale)?children:<Navigate to="/" replace/>}

export default function App(){
 const base=[
  <Route key="home" path="/" element={<Home/>}/>,
  <Route key="tool" path="/tools/:slug" element={<ToolPage/>}/>,
  <Route key="category" path="/categories/:category" element={<Category/>}/>,
  <Route key="auth" path="/auth" element={<AuthPage/>}/>,
  <Route key="dash" path="/dashboard" element={<Dashboard/>}/>,
  <Route key="about" path="/about" element={<About/>}/>,
  <Route key="contact" path="/contact" element={<Contact/>}/>,
  <Route key="privacy" path="/privacy" element={<Privacy/>}/>,
  <Route key="method" path="/methodology" element={<Methodology/>}/>,
  <Route key="sources" path="/sources" element={<Sources/>}/>,
  <Route key="profile" path="/profile" element={<Profile/>}/>,
 ]
 const localized=[
  ['/:locale',<Home/>],['/:locale/tools/:slug',<ToolPage/>],['/:locale/categories/:category',<Category/>],['/:locale/auth',<AuthPage/>],['/:locale/dashboard',<Dashboard/>],
  ['/:locale/about',<About/>],['/:locale/contact',<Contact/>],['/:locale/privacy',<Privacy/>],['/:locale/methodology',<Methodology/>],['/:locale/sources',<Sources/>],['/:locale/profile',<Profile/>]
 ].map(([path,el])=><Route key={path} path={path} element={<LocaleGate>{el}</LocaleGate>}/>)
 return <Layout><Suspense fallback={<Loading/>}><Routes>{base}{localized}<Route path="*" element={<Navigate to="/" replace/>}/></Routes></Suspense></Layout>
}
