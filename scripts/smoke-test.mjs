import assert from 'node:assert/strict'
import { laborInsurance, nhi, salaryTax, takeHome, overtime, employerCost } from '../src/lib/calculators.js'
import { tools } from '../src/data/tools.js'
import { readFile } from 'node:fs/promises'

assert.equal(tools.length,21,'expected 21 public tools')
assert.equal(new Set(tools.map(t=>t.slug)).size,tools.length,'tool slugs must be unique')

const labor=laborInsurance(36300)
assert.equal(labor.labor,835,'labor insurance regression')
assert.equal(labor.employment,73,'employment insurance regression')

const health=nhi(29500,0)
assert.equal(health.premium,458,'NHI regression')
assert.equal(nhi(29500,1).premium,916,'NHI dependent regression')

const tax=salaryTax(720000)
assert.equal(Math.round(tax.tax),12800,'salary tax regression')

const net=takeHome(50000,0)
assert.ok(net.net>0 && net.net<50000,'take-home result range')

assert.ok(overtime(50000,2,0)>0,'overtime must be positive')
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
