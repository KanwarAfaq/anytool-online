import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { I18nProvider } from './i18n'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider><App /></I18nProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

// Privacy-friendly, cookieless analytics (Vercel Web Analytics + Speed Insights), loaded after the page is idle.
const startAnalytics=()=>{
  if(import.meta.env.DEV||navigator.webdriver)return
  import('@vercel/analytics').then(m=>m.inject()).catch(()=>{})
  import('@vercel/speed-insights').then(m=>m.injectSpeedInsights()).catch(()=>{})
}
if(document.readyState==='complete')setTimeout(startAnalytics,1500)
else window.addEventListener('load',()=>setTimeout(startAnalytics,1500),{once:true})
