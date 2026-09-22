const LABOR_BRACKETS=[29500,30300,31800,33300,34800,36300,38200,40100,42000,43900,45800]
const NHI_BRACKETS=[29500,30300,31800,33300,34800,36300,38200,40100,42000,43900,45800,48200,50600,53000,55400,57800,60800,63800,66800,69800,72800,76500,80200,83900,87600,92100,96600,101100,105600,110100,115500,120900,126300,131700,137100,142500,147900,150000,156400,162800,169200,175600,182000,189500,197000,204500,212000,219500,228200,236900,245600,254300,263000,273000,283000,293000,303000,313000]
const PENSION_BRACKETS=NHI_BRACKETS.filter(v=>v<=150000)
const bracket=(salary,arr)=>arr.find(v=>salary<=v)||arr[arr.length-1]
const whole=n=>Math.round(n)
export const money=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(whole(n||0))

export function laborInsurance(salary,employment=true){
 const b=bracket(salary,LABOR_BRACKETS)
 return {
  bracket:b,
  labor:whole(b*.115*.2),
  employment:employment?whole(b*.01*.2):0
 }
}
export function nhi(salary,dependents=0){
 const b=bracket(salary,NHI_BRACKETS)
 const dependentCount=Math.min(3,Math.max(0,Math.floor(Number(dependents)||0)))
 const basePremium=whole(b*.0517*.3)
 return { bracket:b, basePremium, dependents:dependentCount, premium:basePremium*(1+dependentCount) }
}
export function salaryTax(annual,spouse=0,dependents=0){
 annual=Math.max(0,Number(annual)||0);spouse=Math.max(0,Number(spouse)||0);dependents=Math.max(0,Math.floor(Number(dependents)||0))
 const salaryEarners=spouse>0?2:1
 const gross=annual+spouse
 const exemptions=101000*(1+dependents+(spouse>0?1:0))
 const standard=spouse>0?272000:136000
 const employment=Math.min(227000,annual)+Math.min(227000,spouse)
 const taxable=Math.max(0,gross-exemptions-standard-employment)
 const brackets=[[610000,.05,0],[1380000,.12,42700],[2770000,.20,153100],[5190000,.30,430100],[Infinity,.40,949100]]
 const [,rate,diff]=brackets.find(([cap])=>taxable<=cap)
 return {taxable,tax:Math.max(0,taxable*rate-diff),salaryEarners}
}
export function takeHome(salary,dependents=0,employment=true){
 const li=laborInsurance(salary,employment), nh=nhi(salary,dependents), tax=salaryTax(salary*12).tax/12
 const deductions=li.labor+li.employment+nh.premium+tax
 return { ...li, nhi:nh.premium, tax, deductions, net:salary-deductions }
}
export function overtime(salary,weekday=0,rest=0){
 salary=Math.max(0,Number(salary)||0);weekday=Math.max(0,Number(weekday)||0);rest=Math.max(0,Number(rest)||0)
 const hourly=salary/240
 const w1=Math.min(2,weekday), w2=Math.max(0,Math.min(2,weekday-2))
 const r1=Math.min(2,rest), r2=Math.max(0,Math.min(6,rest-2)), r3=Math.max(0,Math.min(4,rest-8))
 return hourly*(w1*4/3+w2*5/3+r1*4/3+r2*5/3+r3*8/3)
}
export function employerCost(salary){
 const lb=bracket(salary,LABOR_BRACKETS)
 const nb=bracket(salary,NHI_BRACKETS)
 const pensionWage=bracket(salary,PENSION_BRACKETS)
 const employerLabor=whole(lb*.115*.7)
 const employerEmployment=whole(lb*.01*.7)
 const employerNhi=whole(nb*.0517*.6*1.56)
 const pension=whole(pensionWage*.06)
 return {
  employerLabor,
  employerEmployment,
  employerNhi,
  pension,
  pensionWage,
  total:whole(salary)+employerLabor+employerEmployment+employerNhi+pension
 }
}
