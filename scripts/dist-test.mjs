import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { tools } from '../src/data/tools.js'

const root=process.cwd()
const locales=['','zh-tw','ar','ur']
const staticPages=['','about','contact','privacy','methodology','sources','categories/money','categories/image','categories/document','categories/ai','categories/general']
await access(resolve(root,'dist/index.html'))
await access(resolve(root,'dist/robots.txt'))
await access(resolve(root,'dist/manifest.webmanifest'))

const sitemap=await readFile(resolve(root,'dist/sitemap.xml'),'utf8')
assert.ok(sitemap.includes('xmlns:xhtml='),'sitemap missing hreflang namespace')
const expectedUrls=(staticPages.length+tools.length)*locales.length
assert.equal((sitemap.match(/<url>/g)||[]).length,expectedUrls,'unexpected sitemap URL count')

for(const loc of locales){
 for(const page of staticPages){
  const parts=[loc,page].filter(Boolean)
  const file=parts.length?resolve(root,'dist',...parts,'index.html'):resolve(root,'dist','index.html')
  await access(file)
  const html=await readFile(file,'utf8')
  assert.ok(html.includes('rel="canonical"'),'canonical missing '+parts.join('/'))
 }
 for(const tool of tools){
  const parts=[loc,'tools',tool.slug].filter(Boolean)
  const file=resolve(root,'dist',...parts,'index.html')
  const html=await readFile(file,'utf8')
  const url='https://www.anytool.online/'+parts.join('/')
  assert.ok(sitemap.includes(url),'sitemap missing '+url)
  assert.ok(html.includes(url),'canonical missing '+url)
  assert.ok(html.includes('SoftwareApplication'),'schema missing '+tool.slug)
  assert.ok(html.includes('hreflang="zh-TW"'),'hreflang missing '+tool.slug)
  assert.ok(html.includes('seo-prerender'),'visible prerender content missing '+tool.slug)
  if(!loc) assert.ok(html.includes('How to use it'),'useful prerender guidance missing '+tool.slug)
  if(!loc&&['take-home-pay','taiwan-id-photo','taiwan-elder-care'].includes(tool.slug)) assert.ok(html.includes('Official sources'),'official source text missing '+tool.slug)
 }
}
console.log('SEO/dist smoke tests passed for '+tools.length+' tools × '+locales.length+' locales')
