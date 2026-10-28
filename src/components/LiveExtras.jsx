import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import { useI18n } from '../i18n'

const labels = { en: 'Back to top', 'zh-TW': '回到頂端', ar: 'العودة إلى الأعلى', ur: 'اوپر جائیں' }

// Small interaction layer: scroll-progress bar, back-to-top button, "/" to open search, and fade-in-on-scroll for cards.
export default function LiveExtras() {
 const { lang } = useI18n()
 const { pathname } = useLocation()
 const [progress, setProgress] = useState(0)
 const [showTop, setShowTop] = useState(false)

 useEffect(() => {
  let raf = 0
  const update = () => {
   raf = 0
   const h = document.documentElement
   const max = h.scrollHeight - h.clientHeight
   setProgress(max > 0 ? Math.min(1, h.scrollTop / max) : 0)
   setShowTop(h.scrollTop > 700)
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
 }, [pathname])

 useEffect(() => {
  const onKey = e => {
   if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
   const el = document.activeElement
   if (el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)) return
   e.preventDefault()
   window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
 }, [])

 useEffect(() => {
  if (typeof IntersectionObserver === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('rv-in'); io.unobserve(en.target) } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 })
  const timer = setTimeout(() => {
   document.querySelectorAll('.tool-card, .bento-card, .directory-tool-button, .tool-visual-card, .resources-card').forEach((el, i) => {
    if (el.classList.contains('rv-in')) return
    el.classList.add('rv'); el.style.setProperty('--rv-d', (i % 6) * 45 + 'ms'); io.observe(el)
   })
  }, 60)
  return () => { clearTimeout(timer); io.disconnect() }
 }, [pathname, lang])

 return <>
  <div className="scroll-progress" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} />
  <button type="button" className={'back-to-top' + (showTop ? ' show' : '')} aria-label={labels[lang] || labels.en} title={labels[lang] || labels.en} tabIndex={showTop ? 0 : -1} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={18} aria-hidden="true" /></button>
 </>
}
