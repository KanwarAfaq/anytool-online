import assert from 'node:assert/strict'
import { laborInsurance, nhi, salaryTax, takeHome, overtime, employerCost } from '../src/lib/calculators.js'
import { tools } from '../src/data/tools.js'
import { readFile } from 'node:fs/promises'
import aiHandler from '../api/ai-gateway.js'
import cloudinaryHandler from '../api/cloudinary-sign.js'
import healthHandler from '../api/health.js'
import sourceAssistantHandler from '../api/source-assistant.js'

assert.equal(tools.length,26,'expected 26 public tools')
assert.equal(new Set(tools.map(t=>t.slug)).size,tools.length,'tool slugs must be unique')

const labor=laborInsurance(36300)
assert.equal(labor.labor,835,'labor insurance regression')
assert.equal(labor.employment,73,'employment insurance regression')

const health=nhi(29500,0)
assert.equal(health.premium,458,'NHI regression')
assert.equal(nhi(29500,1).premium,916,'NHI dependent regression')
assert.equal(nhi(29500,1.9).dependents,1,'NHI dependents must be whole people')

const tax=salaryTax(720000)
assert.equal(Math.round(tax.tax),12800,'salary tax regression')

const net=takeHome(50000,0)
assert.ok(net.net>0 && net.net<50000,'take-home result range')

assert.ok(overtime(50000,2,0)>0,'overtime must be positive')
assert.equal(overtime(50000,-2,-4),0,'negative overtime hours must clamp to zero')
const employer=employerCost(36300)
assert.equal(employer.employerLabor,2922,'employer labor insurance regression')
assert.equal(employer.employerEmployment,254,'employer employment insurance regression')
assert.equal(employer.employerNhi,1757,'employer NHI regression')
assert.equal(employer.pension,2178,'employer pension regression')
assert.equal(employerCost(48000).pensionWage,48200,'labor pension contribution wage regression')
assert.equal(employerCost(48000).pension,2892,'labor pension contribution regression')
assert.ok(employerCost(50000).total>50000,'employer cost must exceed salary')

console.log('AnyTool smoke tests passed')

const i18n=await readFile(new URL('../src/i18n.jsx',import.meta.url),'utf8')
for(const marker of ["code:'en'","code:'zh-TW'","code:'ar'","code:'ur'"]) assert.ok(i18n.includes(marker),'missing locale '+marker)
assert.ok(i18n.includes("dir:'rtl'"),'RTL locale support missing')
console.log('Localization smoke tests passed')

function mockRes(){
  return {
    statusCode:200,
    headers:{},
    body:null,
    status(code){this.statusCode=code;return this},
    setHeader(k,v){this.headers[k.toLowerCase()]=v;return this},
    json(body){this.body=body;return this},
  }
}

{
  const res=mockRes()
  await aiHandler({method:'GET',headers:{}},res)
  assert.equal(res.statusCode,405,'AI gateway rejects unsupported methods')
}
{
  const res=mockRes()
  await aiHandler({method:'POST',headers:{},body:{}},res)
  assert.equal(res.statusCode,401,'AI gateway requires authentication')
}
{
  const res=mockRes()
  await cloudinaryHandler({method:'GET',headers:{}},res)
  assert.equal(res.statusCode,405,'Cloudinary signing rejects unsupported methods')
}
{
  const res=mockRes()
  await cloudinaryHandler({method:'POST',headers:{}},res)
  assert.equal(res.statusCode,401,'Cloudinary signing requires authentication')
}
{
  const res=mockRes()
  await healthHandler({method:'POST',headers:{}},res)
  assert.equal(res.statusCode,405,'Health endpoint is read-only')
}
{
  const res=mockRes()
  await sourceAssistantHandler({method:'POST',headers:{},body:{}},res)
  assert.equal(res.statusCode,401,'Official source assistant requires authentication')
}
console.log('Serverless API boundary tests passed')
