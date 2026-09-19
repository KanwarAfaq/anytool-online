import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import ToolPage from './pages/ToolPage'
import AuthPage from './pages/Auth'
import Dashboard from './pages/Dashboard'

export default function App(){
  return <Layout>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/tools/:slug" element={<ToolPage/>}/>
      <Route path="/auth" element={<AuthPage/>}/>
      <Route path="/dashboard" element={<Dashboard/>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  </Layout>
}
