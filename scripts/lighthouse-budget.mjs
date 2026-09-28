import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const dir=resolve(process.cwd(),process.argv[2]||'.lighthouse')
const files=(await readdir(dir)).filter(x=>x.endsWith('.json')).sort()
assert.ok(files.length>=4,'expected Lighthouse reports for at least four representative pages')

const rows=[]
let failed=false
for(const file of files){
 const report=JSON.parse(await readFile(resolve(dir,file),'utf8'))
 const categories=report.categories||{},audits=report.audits||{}
 const performance=categories.performance?.score??0
 const accessibility=categories.accessibility?.score??0
 const bestPractices=categories['best-practices']?.score??0
 const seo=categories.seo?.score??0
 const lcp=audits['largest-contentful-paint']?.numericValue??Infinity
 const cls=audits['cumulative-layout-shift']?.numericValue??Infinity
 const tbt=audits['total-blocking-time']?.numericValue??Infinity
 const row={page:report.finalUrl||file,performance,accessibility,bestPractices,seo,lcpMs:Math.round(lcp),cls:Number(cls.toFixed(3)),tbtMs:Math.round(tbt)}
 rows.push(row)
 const hard=[
  ['performance',performance>=0.65,performance],
  ['accessibility',accessibility>=0.90,accessibility],
  ['best-practices',bestPractices>=0.90,bestPractices],
  ['seo',seo>=0.95,seo],
  ['LCP <= 4000ms',lcp<=4000,lcp],
  ['CLS <= 0.15',cls<=0.15,cls],
  ['TBT <= 600ms',tbt<=600,tbt],
 ]
 for(const [name,ok,value] of hard)if(!ok){failed=true;console.error('FAIL '+file+' '+name+': '+value)}
 if(lcp>2500)console.warn('TARGET '+file+' LCP is above the good-CWV target of 2500ms: '+Math.round(lcp)+'ms')
 if(cls>0.10)console.warn('TARGET '+file+' CLS is above the good-CWV target of 0.10: '+cls.toFixed(3))
 if(tbt>200)console.warn('TARGET '+file+' TBT is above the preferred lab target of 200ms: '+Math.round(tbt)+'ms')
}
console.table(rows)
if(failed)process.exitCode=2
else console.log('Lighthouse quality budgets passed.')
