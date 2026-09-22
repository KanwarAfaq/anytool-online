import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { tools } from '../src/data/tools.js'

const root=process.cwd()
const locales=['','zh-tw','ar','ur']
const staticPages=['','tools','about','contact','privacy','methodology','sources','categories/money','categories/image','categories/document','categories/ai','categories/general']
await access(resolve(root,'dist/index.html'))
await access(resolve(root,'dist/robots.txt'))
await access(resolve(root,'dist/manifest.webmanifest'))
await access(resolve(root,'dist/tool-catalog.json'))
await access(resolve(root,'dist/official-sources.json'))
await access(resolve(root,'dist/llms.txt'))
await access(resolve(root,'dist/favicon-192.png'))
await access(resolve(root,'dist/404.html'))
await access(resolve(root,'dist','a7f0d3e9b2c14f688e5a91c3d7b4f260.txt'))
for(const tool of tools) await access(resolve(root,'dist','tool-art',tool.slug+'.svg'))

const sitemap=await readFile(resolve(root,'dist/sitemap.xml'),'utf8')
assert.ok(sitemap.includes('xmlns:xhtml='),'sitemap missing hreflang namespace')
assert.ok(sitemap.includes('xmlns:image='),'sitemap missing image namespace')
assert.ok(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(sitemap),'sitemap missing meaningful lastmod dates')
assert.ok(!sitemap.includes('/auth</loc>'),'auth must not be in sitemap')
assert.ok(!sitemap.includes('/dashboard</loc>'),'dashboard must not be in sitemap')

const catalog=JSON.parse(await readFile(resolve(root,'dist/tool-catalog.json'),'utf8'))
assert.equal(catalog.tools.length,tools.length,'tool catalog count mismatch')
assert.ok(catalog.tools.every(t=>t.url.startsWith('https://www.anytool.online/tools/')),'tool catalog canonical host mismatch')
assert.ok(catalog.tools.every(t=>/^\d{4}-\d{2}-\d{2}$/.test(t.lastModified)),'tool catalog missing lastModified')
assert.ok(catalog.tools.every(t=>t.image===`https://www.anytool.online/tool-art/${t.slug}.svg`),'tool catalog image mismatch')
assert.ok(catalog.tools.every(t=>t.localizedUrls?.['zh-TW']&&t.localizedUrls?.ar&&t.localizedUrls?.ur),'tool catalog localized URLs missing')
assert.ok(catalog.tools.every(t=>['browser-local','authenticated-ai','deterministic-web'].includes(t.processing)),'tool catalog processing mode missing')
const sourceRegistry=JSON.parse(await readFile(resolve(root,'dist/official-sources.json'),'utf8'))
assert.ok(Object.keys(sourceRegistry.sources||{}).length>=10,'official source registry unexpectedly small')

const robots=await readFile(resolve(root,'dist/robots.txt'),'utf8')
assert.ok(robots.includes('Allow: /'),'robots should allow crawlable pages')
assert.ok(!robots.includes('Disallow: /auth'),'robots must not block pages that rely on X-Robots noindex')
const expectedUrls=(staticPages.length+tools.length)*locales.length
const homeHtml=await readFile(resolve(root,'dist/index.html'),'utf8')
assert.ok(homeHtml.includes('href="/favicon-192.png"'),'PNG favicon link missing from home HTML')
const manifest=JSON.parse(await readFile(resolve(root,'dist/manifest.webmanifest'),'utf8'))
assert.ok(manifest.icons?.some(x=>x.src==='/favicon-192.png'&&x.type==='image/png'),'manifest PNG icon missing')
const notFoundHtml=await readFile(resolve(root,'dist/404.html'),'utf8')
assert.ok(notFoundHtml.includes('noindex,nofollow'),'static 404 must be noindex')
const vercelConfig=JSON.parse(await readFile(resolve(root,'vercel.json'),'utf8'))
assert.ok(!vercelConfig.routes?.some(r=>r.src==='/.*'&&r.dest==='/index.html'),'global SPA fallback would create soft 404s')
assert.ok(vercelConfig.routes?.some(r=>r.src.includes('auth|dashboard|profile')&&r.dest==='/index.html'),'private SPA fallback missing')
for(const tool of tools) assert.ok(homeHtml.includes('/tools/'+tool.slug),'homepage prerender missing internal link '+tool.slug)
assert.equal((sitemap.match(/<url>/g)||[]).length,expectedUrls,'unexpected sitemap URL count')

for(const loc of locales){
 for(const page of staticPages){
  const parts=[loc,page].filter(Boolean)
  const file=parts.length?resolve(root,'dist',...parts,'index.html'):resolve(root,'dist','index.html')
  await access(file)
  const html=await readFile(file,'utf8')
  const url=parts.length?'https://www.anytool.online/'+parts.join('/'):'https://www.anytool.online/'
  assert.ok(html.includes('<link rel="canonical" href="'+url+'"'),'exact canonical missing '+url)
  assert.ok(html.includes('hreflang="x-default"'),'x-default hreflang missing '+url)
 }
 for(const tool of tools){
  const parts=[loc,'tools',tool.slug].filter(Boolean)
  const file=resolve(root,'dist',...parts,'index.html')
  const html=await readFile(file,'utf8')
  const url='https://www.anytool.online/'+parts.join('/')
  assert.ok(sitemap.includes(url),'sitemap missing '+url)
  assert.ok(html.includes(url),'canonical missing '+url)
  assert.ok(html.includes('SoftwareApplication'),'schema missing '+tool.slug)
  assert.ok(html.includes('/tool-art/'+tool.slug+'.svg'),'tool image metadata missing '+tool.slug)
  assert.ok(html.includes('visual preview'),'visible tool image alt missing '+tool.slug)
  assert.ok(html.includes('hreflang="zh-TW"'),'hreflang missing '+tool.slug)
  assert.ok(html.includes('seo-prerender'),'visible prerender content missing '+tool.slug)
  if(!loc) assert.ok(html.includes('How to use it'),'useful prerender guidance missing '+tool.slug)
  if(!loc&&['take-home-pay','taiwan-id-photo','taiwan-elder-care'].includes(tool.slug)) assert.ok(html.includes('Official sources'),'official source text missing '+tool.slug)
 }
}
console.log('SEO/dist smoke tests passed for '+tools.length+' tools × '+locales.length+' locales')

const qrArt=await readFile(resolve(root,'dist','tool-art','qr-generator.svg'),'utf8')
const pdfArt=await readFile(resolve(root,'dist','tool-art','pdf-merge.svg'),'utf8')
assert.ok(qrArt.includes('QR Code Generator visual preview'),'QR preview metadata missing')
assert.ok(pdfArt.includes('Merge PDF visual preview'),'PDF preview metadata missing')
assert.notEqual(qrArt,pdfArt,'tool preview art should be function-specific')
