import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { useI18n } from '../i18n'

export default function NotFound(){
 const {pathFor}=useI18n()
 return <section className="mx-auto max-w-3xl px-4 py-24 text-center">
  <Seo title="Page not found | AnyTool.online" description="The requested AnyTool page does not exist." noindex/>
  <p className="text-xs font-black uppercase tracking-[.18em] text-lime-300">404</p>
  <h1 className="mt-3 text-4xl font-black">Page not found</h1>
  <p className="mx-auto mt-4 max-w-xl text-slate-400">This URL does not match an AnyTool page. Use the tool directory to find the calculator or utility you need.</p>
  <div className="mt-7 flex flex-wrap justify-center gap-3"><Link className="btn-primary" to={pathFor('/tools')}>Browse all tools</Link><Link className="btn-ghost" to={pathFor('/')}>Home</Link></div>
 </section>
}
