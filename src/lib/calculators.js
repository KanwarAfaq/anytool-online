const LABOR_BRACKETS=[29500,30300,31800,33300,34800,36300,38200,40100,42000,43900,45800]
const NHI_BRACKETS=[29500,30300,31800,33300,34800,36300,38200,40100,42000,43900,45800,48200,50600,53000,55400,57800,60800,63800,66800,69800,72800,76500,80200,83900,87600,92100,96600,101100,105600,110100,115500,120900,126300,131700,137100,142500,147900,150000,156400,162800,169200,175600,182000,189500,197000,204500,212000,219500,228200,236900,245600,254300,263000,273000,283000,293000,303000,313000]
const bracket=(salary,arr)=>arr.find(v=>salary<=v)||arr[arr.length-1]
export const money=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(Math.round(n||0))

export function laborInsurance(salary,employment=true){
 const b=bracket(salary,LABOR_BRACKETS)
 return { bracket:b, labor:b*.115*.2, employment:employment?b*.01*.2:0 }
}
export function nhi(salary,dependents=0){
 const b=bracket(salary,NHI_BRACKETS)
 return { bracket:b, premium:b*.0517*.3*(1+Math.min(3,Math.max(0,dependents))) }
}
export function salaryTax(annual,spouse=0,dependents=0){
 const salaryEarners=spouse>0?2:1
 const gross=annual+spouse
 const exemptions=101000*(1+dependents+(spouse>0?1:0))
 const standard=spouse>0?272000:136000
 const employment=Math.min(227000,annual)+Math.min(227000,spouse)
 const taxable=Math.max(0,gross-exemptions-standard-employment)
 const brackets=[[610000,.05,0],[1380000,.12,42700],[2770000,.20,153100],[5190000,.30,430100],[Infinity,.40,949100]]
 const [_,rate,diff]=brackets.find(([cap])=>taxable<=cap)
 return {taxable,tax:Math.max(0,taxable*rate-diff),salaryEarners}
}
export function takeHome(salary,dependents=0,employment=true){
 const li=laborInsurance(salary,employment), nh=nhi(salary,dependents), tax=salaryTax(salary*12).tax/12
 const deductions=li.labor+li.employment+nh.premium+tax
 return { ...li, nhi:nh.premium, tax, deductions, net:salary-deductions }
}
export function overtime(salary,weekday=0,rest=0){
 const hourly=salary/240
 const w1=Math.min(2,weekday), w2=Math.max(0,Math.min(2,weekday-2))
 const r1=Math.min(2,rest), r2=Math.max(0,Math.min(6,rest-2)), r3=Math.max(0,Math.min(4,rest-8))
 return hourly*(w1*4/3+w2*5/3+r1*4/3+r2*5/3+r3*8/3)
}
export function employerCost(salary){
 const lb=bracket(salary,LABOR_BRACKETS), nb=bracket(salary,NHI_BRACKETS)
 const employerLabor=lb*.115*.7
 const employerEmployment=lb*.01*.7
 const employerNhi=nb*.0517*.6
 const pension=salary*.06
 return { employerLabor, employerEmployment, employerNhi, pension, total:salary+employerLabor+employerEmployment+employerNhi+pension }
}
