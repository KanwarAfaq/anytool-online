import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { tools } from '../src/data/tools.js'

const root=process.cwd()
await access(resolve(root,'dist/index.html'))
await access(resolve(root,'dist/robots.txt'))
await access(resolve(root,'dist/manifest.webmanifest'))

const sitemap=await readFile(resolve(root,'dist/sitemap.xml'),'utf8')
assert.ok(sitemap.includes('https://anytool.online/'),'homepage missing from sitemap')

for(const tool of tools){
  const url='https://anytool.online/tools/'+tool.slug
  assert.ok(sitemap.includes(url),'sitemap missing '+tool.slug)
  const html=await readFile(resolve(root,'dist/tools',tool.slug,'index.html'),'utf8')
  assert.ok(html.includes(url),'canonical missing for '+tool.slug)
  assert.ok(html.includes(tool.name.replaceAll('&','&amp;')),'metadata missing for '+tool.slug)
}
console.log('SEO/dist smoke tests passed for '+tools.length+' tools')
