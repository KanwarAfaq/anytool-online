import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE='https://anytool.online'
const locales=[
  ['en',''],
  ['zh-TW','/zh-tw'],
  ['ar','/ar'],
  ['ur','/ur'],
]
const stripLocale=path=>path.replace(/^\/(zh-tw|ar|ur)(?=\/|$)/,'')||'/'

export default function Seo({title,description,jsonLd,noindex=false}){
 const location=useLocation()
 useEffect(()=>{
   const path=location.pathname==='/'?'/':location.pathname.replace(/\/$/,'')
   const canonical=SITE+path
   const clean=stripLocale(path)
   document.title=title
   const setMeta=(sel,attrs)=>{let el=document.head.querySelector(sel);if(!el){el=document.createElement('meta');document.head.appendChild(el)}Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v))}
   const setLink=(sel,attrs)=>{let el=document.head.querySelector(sel);if(!el){el=document.createElement('link');document.head.appendChild(el)}Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v))}
   setMeta('meta[name="description"]',{name:'description',content:description||''})
   setMeta('meta[name="robots"]',{name:'robots',content:noindex?'noindex,nofollow':'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'})
   setMeta('meta[property="og:title"]',{property:'og:title',content:title})
   setMeta('meta[property="og:description"]',{property:'og:description',content:description||''})
   setMeta('meta[property="og:url"]',{property:'og:url',content:canonical})
   setMeta('meta[property="og:type"]',{property:'og:type',content:'website'})
   setMeta('meta[property="og:site_name"]',{property:'og:site_name',content:'AnyTool.online'})
   setMeta('meta[name="twitter:card"]',{name:'twitter:card',content:'summary_large_image'})
   setLink('link[rel="canonical"]',{rel:'canonical',href:canonical})
   for(const [hreflang,prefix] of locales){
     const href=SITE+(prefix||'')+(clean==='/'?'/':clean)
     setLink('link[rel="alternate"][hreflang="'+hreflang+'"]',{rel:'alternate',hreflang,href})
   }
   setLink('link[rel="alternate"][hreflang="x-default"]',{rel:'alternate',hreflang:'x-default',href:SITE+(clean==='/'?'/':clean)})

   document.head.querySelectorAll('script[data-anytool-jsonld]').forEach(x=>x.remove())
   const schemas=Array.isArray(jsonLd)?jsonLd:(jsonLd?[jsonLd]:[])
   for(const schema of schemas){
     const el=document.createElement('script');el.type='application/ld+json';el.dataset.anytoolJsonld='1';el.textContent=JSON.stringify(schema);document.head.appendChild(el)
   }
 },[title,description,location.pathname,JSON.stringify(jsonLd||null),noindex])
 return null
}
