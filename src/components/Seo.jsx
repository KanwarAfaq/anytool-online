import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE='https://www.anytool.online'
const locales=[
  ['en',''],
  ['zh-TW','/zh-tw'],
  ['ar','/ar'],
  ['ur','/ur'],
]
const stripLocale=path=>path.replace(/^\/(zh-tw|ar|ur)(?=\/|$)/,'')||'/'

export default function Seo({title,description,jsonLd,noindex=false,image=''}){
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
   setMeta('meta[name="twitter:title"]',{name:'twitter:title',content:title})
   setMeta('meta[name="twitter:description"]',{name:'twitter:description',content:description||''})
   const imageUrl=image?(image.startsWith('http')?image:SITE+image):''
   if(imageUrl){setMeta('meta[property="og:image"]',{property:'og:image',content:imageUrl});setMeta('meta[property="og:image:alt"]',{property:'og:image:alt',content:title});setMeta('meta[property="og:image:width"]',{property:'og:image:width',content:'640'});setMeta('meta[property="og:image:height"]',{property:'og:image:height',content:'360'});setMeta('meta[name="twitter:image"]',{name:'twitter:image',content:imageUrl});setMeta('meta[name="twitter:image:alt"]',{name:'twitter:image:alt',content:title})}
   else{document.head.querySelector('meta[property="og:image"]')?.remove();document.head.querySelector('meta[property="og:image:alt"]')?.remove();document.head.querySelector('meta[property="og:image:width"]')?.remove();document.head.querySelector('meta[property="og:image:height"]')?.remove();document.head.querySelector('meta[name="twitter:image"]')?.remove();document.head.querySelector('meta[name="twitter:image:alt"]')?.remove()}
   const langCode=path.startsWith('/zh-tw')?'zh-TW':path.startsWith('/ar')?'ar':path.startsWith('/ur')?'ur':'en'
   const ogLocale=langCode==='zh-TW'?'zh_TW':langCode==='ar'?'ar_AR':langCode==='ur'?'ur_PK':'en_US'
   setMeta('meta[property="og:locale"]',{property:'og:locale',content:ogLocale})
   setLink('link[rel="canonical"]',{rel:'canonical',href:canonical})
   for(const [hreflang,prefix] of locales){
     const href=SITE+(prefix||'')+(clean==='/'?'/':clean)
     setLink('link[rel="alternate"][hreflang="'+hreflang+'"]',{rel:'alternate',hreflang,href})
   }
   setLink('link[rel="alternate"][hreflang="x-default"]',{rel:'alternate',hreflang:'x-default',href:SITE+(clean==='/'?'/':clean)})

   document.head.querySelectorAll('script[data-anytool-jsonld],script[data-anytool-prerender-jsonld]').forEach(x=>x.remove())
   const explicitSchemas=Array.isArray(jsonLd)?jsonLd:(jsonLd?[jsonLd]:[])
   const schemas=explicitSchemas.length||noindex?explicitSchemas:[{'@context':'https://schema.org','@type':'WebPage',name:title,description:description||'',url:canonical,inLanguage:langCode,isPartOf:{'@type':'WebSite',name:'AnyTool.online',url:SITE+'/'}}]
   for(const schema of schemas){
     const el=document.createElement('script');el.type='application/ld+json';el.dataset.anytoolJsonld='1';el.textContent=JSON.stringify(schema);document.head.appendChild(el)
   }
 },[title,description,location.pathname,JSON.stringify(jsonLd||null),noindex,image])
 return null
}
