import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'

const ToolPage=lazy(()=>import('./pages/ToolPage'))
const AuthPage=lazy(()=>import('./pages/Auth'))
const Dashboard=lazy(()=>import('./pages/Dashboard'))

function Loading(){
  return <div className="mx-auto max-w-7xl px-4 py-20 text-slate-400">Loading…</div>
}

export default function App(){
  return <Layout>
    <Suspense fallback={<Loading/>}>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/tools/:slug" element={<ToolPage/>}/>
        <Route path="/auth" element={<AuthPage/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </Suspense>
  </Layout>
}
