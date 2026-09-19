import assert from 'node:assert/strict'
import { laborInsurance, nhi, salaryTax, takeHome, overtime, employerCost } from '../src/lib/calculators.js'
import { tools } from '../src/data/tools.js'

assert.equal(tools.length,21,'expected 21 public tools')
assert.equal(new Set(tools.map(t=>t.slug)).size,tools.length,'tool slugs must be unique')

const labor=laborInsurance(36300)
assert.ok(Math.abs(labor.labor-834.9)<0.001,'labor insurance regression')
assert.ok(Math.abs(labor.employment-72.6)<0.001,'employment insurance regression')

const health=nhi(29500,0)
assert.ok(Math.abs(health.premium-457.545)<0.001,'NHI regression')

const tax=salaryTax(720000)
assert.equal(Math.round(tax.tax),12800,'salary tax regression')

const net=takeHome(50000,0)
assert.ok(net.net>0 && net.net<50000,'take-home result range')

assert.ok(overtime(50000,2,0)>0,'overtime must be positive')
assert.ok(employerCost(50000).total>50000,'employer cost must exceed salary')

console.log('AnyTool smoke tests passed')
