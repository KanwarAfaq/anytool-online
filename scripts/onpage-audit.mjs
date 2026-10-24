// On-page SEO audit over the built snapshots in dist/ (run after `npm run build`).
// Checks per page: keyword in <title>, first paragraph, an <h2>, image alt; internal + external links; JSON-LD validity.
// Usage: node scripts/onpage-audit.mjs [--strict]   (strict = exit 1 on any failure)
import { readFile, readdir, stat } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { tools } from '../src/data/tools.js'
import { toolTranslations } from '../src/data/toolTranslations.js'

const root=resolve(process.cwd(),'dist')
const strict=process.argv.includes('--strict')
const SITE='https://anytool.online'
const strip=h=>h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim()
const norm=s=>s.toLowerCase().replace(/[‑–—-]/g,' ').replace(/\s+/g,' ')

async function* walk(dir){for(const e of await readdir(dir)){const p=join(dir,e);const s=await stat(p);if(s.isDirectory()){if(e==='assets'||e==='tool-art')continue;yield* walk(p)}else if(e==='index.html')yield p}}

// --- JSON-LD structural validation (no network): required properties per type, absolute URLs, no empty values.
const abs=u=>typeof u==='string'&&/^https?:\/\//.test(u)
function validate(node,where,errs){
  if(Array.isArray(node)){node.forEach(n=>validate(n,where,errs));return}
  if(!node||typeof node!=='object')return
  const t=node['@type']
  for(const [k,v] of Object.entries(node)){
    if(v===undefined||v===null||v===''||(Array.isArray(v)&&!v.length))errs.push(`${where}: empty ${k}`)
    if(/^(url|image|logo|item|@id|contentUrl|target)$/.test(k)&&typeof v==='string'&&!abs(v)&&!v.includes('{'))errs.push(`${where}: relative ${k} ${v}`)
    if(v&&typeof v==='object')validate(v,where,errs)
  }
  const need=(...keys)=>keys.forEach(k=>{if(!node[k])errs.push(`${where}: ${t} missing ${k}`)})
  if(t==='WebSite')need('name','url')
  if(t==='Organization')need('name','url')
  if(t==='Person')need('name')
  if(t==='WebPage'||t==='CollectionPage')need('name','url')
  if(t==='SoftwareApplication')need('name','applicationCategory','operatingSystem','offers')
  if(t==='FAQPage'&&!(node.mainEntity||[]).every(q=>q['@type']==='Question'&&q.name&&q.acceptedAnswer?.text))errs.push(`${where}: FAQPage question/answer incomplete`)
  if(t==='BreadcrumbList'){(node.itemListElement||[]).forEach((li,i)=>{if(li.position!==i+1||!li.name||!li.item)errs.push(`${where}: breadcrumb item ${i+1} invalid`)});if(!(node.itemListElement||[]).length)errs.push(`${where}: empty breadcrumb`)}
  if(t==='ItemList'){(node.itemListElement||[]).forEach((li,i)=>{if(li.position!==i+1||!li.name||!li.url)errs.push(`${where}: list item ${i+1} invalid`)})}
  if(t==='Offer')need('price','priceCurrency')
}

const rows=[];let pages=0
for await(const file of walk(root)){
  const html=await readFile(file,'utf8')
  const path='/'+file.slice(root.length+1).replace(/index\.html$/,'').replace(/\/$/,'')
  const url=path==='/'?'/':path
  if(/<meta name="robots" content="noindex/.test(html))continue
  pages++
  const title=(html.match(/<title>([\s\S]*?)<\/title>/)||[])[1]||''
  const root_=(html.match(/<div id="root">([\s\S]*?)<\/div>\s*<script/)||[])[1]||html
  const mainHtml=root_
  const h1=strip((mainHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)||[])[1]||'')
  const firstP=strip((mainHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/)||[])[1]||'')
  const h2s=[...mainHtml.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map(m=>strip(m[1]))
  const alts=[...mainHtml.matchAll(/<img[^>]*\salt="([^"]*)"/g)].map(m=>strip(m[1]))
  const hrefs=[...mainHtml.matchAll(/<a[^>]*\shref="([^"]+)"/g)].map(m=>m[1])
  const internal=hrefs.filter(h=>h.startsWith('/')||h.startsWith(SITE)).length
  const external=hrefs.filter(h=>/^https?:\/\//.test(h)&&!h.startsWith(SITE)).length
  // keyword = tool name (tool pages) or the H1 (other pages)
  const slug=url.match(/\/tools\/([^/]+)$/)?.[1]
  const locale=url.startsWith('/zh-tw')?'zh':url.startsWith('/ar')?'ar':url.startsWith('/ur')?'ur':'en'
  const tool=slug&&tools.find(t=>t.slug===slug)
  const toolName=tool?(locale==='en'?tool.name:toolTranslations[slug]?.[locale]||tool.name):''
  // keyword = the tool's (localized) name on tool pages, otherwise the page H1
  const kw=norm(toolName||h1)
  const row={url,fails:[]}
  if(!norm(strip(title)).includes(kw)&&!kw.split(' ').slice(0,3).every(w=>norm(strip(title)).includes(w)))row.fails.push('title')
  if(!norm(firstP).includes(kw))row.fails.push('paragraph')
  if(!h2s.some(h=>norm(h).includes(kw)))row.fails.push('h2')
  if((url.includes('/tools/')||url==='/')&&!alts.some(a=>norm(a).includes(kw)))row.fails.push('alt')
  if(!internal)row.fails.push('internal')
  if(!external)row.fails.push('external')
  const errs=[]
  const blocks=[...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)]
  if(!blocks.length)errs.push(url+': no JSON-LD')
  for(const m of blocks){try{const d=JSON.parse(m[1]);if(d['@context']!=='https://schema.org')errs.push(url+': bad @context');validate(d,url,errs)}catch(e){errs.push(url+': invalid JSON '+e.message)}}
  if(errs.length)row.fails.push('schema'),row.schema=errs
  rows.push(row)
}
const count={};for(const r of rows)for(const f of r.fails)count[f]=(count[f]||0)+1
console.log(`On-page audit: ${pages} indexable pages`)
console.log(Object.keys(count).length?count:'all checks pass')
const bad=rows.filter(r=>r.fails.length)
for(const r of bad.slice(0,12))console.log(' ',r.url,r.fails.join(','),(r.schema||[]).slice(0,2).join(' | '))
if(bad.length>12)console.log(`  … ${bad.length-12} more`)
if(strict&&bad.length)process.exit(1)
if(process.argv.includes('--detail')){
  const msgs={};for(const r of rows)for(const m of r.schema||[])msgs[m.replace(/^[^:]*: /,'')]=(msgs[m.replace(/^[^:]*: /,'')]||0)+1
  console.log('schema messages',msgs)
  for(const k of ['paragraph','h2','alt'])console.log(k,rows.filter(r=>r.fails.includes(k)).slice(0,8).map(r=>r.url).join(' '))
}
