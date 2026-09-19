import { useEffect } from 'react'

export default function Seo({title,description,canonical}){
 useEffect(()=>{
   document.title=title
   const set=(sel,attrs)=>{let el=document.head.querySelector(sel);if(!el){el=document.createElement(attrs.tag||'meta');document.head.appendChild(el)}Object.entries(attrs).forEach(([k,v])=>{if(k!=='tag')el.setAttribute(k,v)})}
   set('meta[name="description"]',{name:'description',content:description||''})
   set('link[rel="canonical"]',{tag:'link',rel:'canonical',href:canonical||location.href})
   set('meta[property="og:title"]',{property:'og:title',content:title})
   set('meta[property="og:description"]',{property:'og:description',content:description||''})
   set('meta[property="og:url"]',{property:'og:url',content:canonical||location.href})
 },[title,description,canonical])
 return null
}
