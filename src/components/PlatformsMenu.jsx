import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ExternalLink, Building2, HeartPulse, Home, LayoutGrid } from 'lucide-react'
import { platforms } from '../data/platforms'

const icons = { landlord: Home, ltc: HeartPulse, care: Building2 }
const titles = { en: 'Platforms', 'zh-TW': '平台', ar: 'المنصات', ur: 'پلیٹ فارمز' }
const all = { en: 'View all platforms', 'zh-TW': '查看全部平台', ar: 'عرض كل المنصات', ur: 'تمام پلیٹ فارمز دیکھیں' }

export default function PlatformsMenu({ lang, to }) {
 const [open, setOpen] = useState(false)
 const ref = useRef(null)
 useEffect(() => {
  if (!open) return
  const down = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
  const key = e => { if (e.key === 'Escape') setOpen(false) }
  document.addEventListener('mousedown', down); document.addEventListener('keydown', key)
  return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key) }
 }, [open])
 return <div className="platforms-menu" ref={ref}>
  <button type="button" className="modern-nav-link platforms-trigger" aria-haspopup="true" aria-expanded={open} aria-controls="platforms-panel" onClick={() => setOpen(v => !v)}>
   <LayoutGrid size={15} aria-hidden="true"/>{titles[lang] || titles.en}<ChevronDown size={14} aria-hidden="true" className={open ? 'rot' : ''}/>
  </button>
  {open && <div id="platforms-panel" className="platforms-panel" role="menu">
   {platforms.map(p => { const I = icons[p.id] || ExternalLink; return <a key={p.id} role="menuitem" data-platform={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="platform-card" onClick={() => setOpen(false)}>
    <span className="platform-ico"><I size={18} aria-hidden="true"/></span>
    <span className="platform-txt"><strong>{p.label[lang] || p.label.en}<ExternalLink size={12} aria-hidden="true"/></strong><small>{p.desc[lang] || p.desc.en}</small></span>
   </a> })}
   <Link role="menuitem" to={to} className="platform-all" onClick={() => setOpen(false)}>{all[lang] || all.en} →</Link>
  </div>}
 </div>
}
