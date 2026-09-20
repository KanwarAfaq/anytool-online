import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, ExternalLink } from 'lucide-react'
import { officialSources } from '../../data/officialSources'
import { useI18n } from '../../i18n'

const presets={
  passport:{label:'Taiwan Passport',width:35,height:45,dpi:300,maxKB:5120,source:'taiwanPassport',age:'Taken within the last 6 months'},
  id:{label:'Taiwan National ID',width:35,height:45,dpi:300,maxKB:5120,source:'taiwanIdPhoto',age:'Taken within the last 2 years'},
  arc:{label:'Taiwan ARC / APRC',width:35,height:45,dpi:300,maxKB:5120,source:'arcPhoto',age:'Recent 2-inch color photo taken within the most recent 6 months, using Taiwan National ID photo specifications'}
}

const mmToPx=(mm,dpi)=>Math.max(1,Math.round(mm/25.4*dpi))

export default function IdPhotoTool(){
  const {lang}=useI18n()
  const labels={
    en:{preset:'Document preset',width:'Width (mm)',height:'Height (mm)',dpi:'DPI',background:'Background',zoom:'Zoom',horizontal:'Horizontal position',vertical:'Vertical position',rotation:'Rotation',quality:'JPEG quality',choose:'Choose portrait photo',download:'Download JPG',guide:'Official guide',note:'This tool crops and exports the file; it cannot certify biometric compliance. Use a properly taken, unedited original photo and verify the final photo with the issuing authority.',head:'Head-height guide: 32–36 mm',output:'Output'},
    'zh-TW':{preset:'證件預設',width:'寬度（mm）',height:'高度（mm）',dpi:'DPI',background:'背景',zoom:'縮放',horizontal:'水平位置',vertical:'垂直位置',rotation:'旋轉',quality:'JPG 品質',choose:'選擇人像照片',download:'下載 JPG',guide:'官方規格',note:'此工具僅協助裁切與輸出，不能保證生物辨識合規。請使用符合規定、未經變造的原始照片，並以主管機關審查結果為準。',head:'頭頂至下顎建議範圍：32–36 mm',output:'輸出'},
    ar:{preset:'إعداد الوثيقة',width:'العرض (مم)',height:'الارتفاع (مم)',dpi:'DPI',background:'الخلفية',zoom:'التكبير',horizontal:'الموضع الأفقي',vertical:'الموضع العمودي',rotation:'الدوران',quality:'جودة JPEG',choose:'اختر صورة شخصية',download:'تنزيل JPG',guide:'المواصفات الرسمية',note:'تقوم الأداة بالقص والتصدير فقط ولا تضمن قبول الصورة بيومترياً. استخدم صورة أصلية صحيحة وغير معدلة وتحقق من الجهة الرسمية.',head:'دليل ارتفاع الرأس: 32–36 مم',output:'الناتج'},
    ur:{preset:'دستاویز پری سیٹ',width:'چوڑائی (mm)',height:'اونچائی (mm)',dpi:'DPI',background:'پس منظر',zoom:'زوم',horizontal:'افقی پوزیشن',vertical:'عمودی پوزیشن',rotation:'گھماؤ',quality:'JPEG کوالٹی',choose:'پورٹریٹ تصویر منتخب کریں',download:'JPG ڈاؤن لوڈ',guide:'سرکاری ہدایات',note:'یہ ٹول صرف کراپ اور ایکسپورٹ کرتا ہے، بایومیٹرک منظوری کی ضمانت نہیں دیتا۔ درست اور غیر ترمیم شدہ اصل تصویر استعمال کریں اور سرکاری ادارے سے تصدیق کریں۔',head:'سر کی اونچائی گائیڈ: 32–36 mm',output:'آؤٹ پٹ'}
  }[lang]||null
  const L=labels||{
    preset:'Document preset',width:'Width (mm)',height:'Height (mm)',dpi:'DPI',background:'Background',zoom:'Zoom',horizontal:'Horizontal position',vertical:'Vertical position',rotation:'Rotation',quality:'JPEG quality',choose:'Choose portrait photo',download:'Download JPG',guide:'Official guide',note:'This tool crops and exports the file; it cannot certify biometric compliance. Use a properly taken, unedited original photo and verify the final photo with the issuing authority.',head:'Head-height guide: 32–36 mm',output:'Output'
  }
  const [presetKey,setPresetKey]=useState('passport')
  const [width,setWidth]=useState(35),[height,setHeight]=useState(45),[dpi,setDpi]=useState(300)
  const [background,setBackground]=useState('#ffffff'),[zoom,setZoom]=useState(1),[horizontal,setHorizontal]=useState(0),[vertical,setVertical]=useState(0),[rotation,setRotation]=useState(0),[quality,setQuality]=useState(.92)
  const [image,setImage]=useState(null),[fileName,setFileName]=useState('photo'),[downloadUrl,setDownloadUrl]=useState(''),[meta,setMeta]=useState(null)
  const canvasRef=useRef(null)
  const preset=presets[presetKey]
  const source=officialSources[preset.source]
  const outputPx=useMemo(()=>({w:mmToPx(width,dpi),h:mmToPx(height,dpi)}),[width,height,dpi])

  useEffect(()=>{
    setWidth(preset.width);setHeight(preset.height);setDpi(preset.dpi);setBackground('#ffffff');setZoom(1);setHorizontal(0);setVertical(0);setRotation(0)
  },[presetKey])

  async function load(file){
    if(!file)return
    const img=new Image()
    const url=URL.createObjectURL(file)
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url})
    setImage(img);setFileName(file.name.replace(/\.[^.]+$/,'')||'photo')
    URL.revokeObjectURL(url)
  }

  useEffect(()=>{
    if(!image||!canvasRef.current)return
    const c=canvasRef.current,ctx=c.getContext('2d')
    c.width=outputPx.w;c.height=outputPx.h
    ctx.fillStyle=background;ctx.fillRect(0,0,c.width,c.height)
    const cover=Math.max(c.width/image.width,c.height/image.height)*zoom
    const dw=image.width*cover,dh=image.height*cover
    const maxX=Math.max(0,(dw-c.width)/2),maxY=Math.max(0,(dh-c.height)/2)
    const dx=(c.width-dw)/2+(horizontal/100)*maxX
    const dy=(c.height-dh)/2+(vertical/100)*maxY
    ctx.save()
    ctx.translate(c.width/2,c.height/2)
    ctx.rotate(rotation*Math.PI/180)
    ctx.translate(-c.width/2,-c.height/2)
    ctx.drawImage(image,dx,dy,dw,dh)
    ctx.restore()
  },[image,outputPx,background,zoom,horizontal,vertical,rotation])

  async function exportJpg(){
    const c=canvasRef.current
    if(!c)return
    let q=quality,blob=await new Promise(r=>c.toBlob(r,'image/jpeg',q))
    const maxBytes=preset.maxKB?preset.maxKB*1024:null
    while(maxBytes&&blob&&blob.size>maxBytes&&q>.35){q-=.05;blob=await new Promise(r=>c.toBlob(r,'image/jpeg',q))}
    if(downloadUrl)URL.revokeObjectURL(downloadUrl)
    const url=URL.createObjectURL(blob);setDownloadUrl(url)
    setMeta({bytes:blob.size,w:c.width,h:c.height,q})
    const a=document.createElement('a');a.href=url;a.download=fileName+'-'+presetKey+'.jpg';a.click()
  }

  return <div className="space-y-5">
    <div className="card p-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label><span className="mb-1.5 block text-sm text-slate-400">{L.preset}</span><select className="input" value={presetKey} onChange={e=>setPresetKey(e.target.value)}>{Object.entries(presets).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></label>
        <label><span className="mb-1.5 block text-sm text-slate-400">{L.width}</span><input className="input" type="number" inputMode="decimal" min="1" value={width===0?'':width} placeholder="35" onFocus={e=>e.target.select()} onChange={e=>setWidth(e.target.value===''?0:Number(e.target.value))}/></label>
        <label><span className="mb-1.5 block text-sm text-slate-400">{L.height}</span><input className="input" type="number" inputMode="decimal" min="1" value={height===0?'':height} placeholder="45" onFocus={e=>e.target.select()} onChange={e=>setHeight(e.target.value===''?0:Number(e.target.value))}/></label>
        <label><span className="mb-1.5 block text-sm text-slate-400">{L.dpi}</span><input className="input" type="number" inputMode="numeric" min="72" value={dpi===0?'':dpi} placeholder="300" onFocus={e=>e.target.select()} onChange={e=>setDpi(e.target.value===''?0:Number(e.target.value))}/></label>
        <label><span className="mb-1.5 block text-sm text-slate-400">{L.background}</span><input className="input h-11 p-1" type="color" value={background} onChange={e=>setBackground(e.target.value)}/></label>
        <label><span className="mb-1.5 block text-sm text-slate-400">{L.zoom}: {zoom.toFixed(2)}×</span><input className="w-full" type="range" min="1" max="2.2" step=".02" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/></label>
        <label><span className="mb-1.5 block text-sm text-slate-400">{L.horizontal}: {horizontal}</span><input className="w-full" type="range" min="-100" max="100" value={horizontal} onChange={e=>setHorizontal(Number(e.target.value))}/></label>
        <label><span className="mb-1.5 block text-sm text-slate-400">{L.vertical}: {vertical}</span><input className="w-full" type="range" min="-100" max="100" value={vertical} onChange={e=>setVertical(Number(e.target.value))}/></label>
        <label><span className="mb-1.5 block text-sm text-slate-400">{L.rotation}: {rotation}°</span><input className="w-full" type="range" min="-15" max="15" step=".5" value={rotation} onChange={e=>setRotation(Number(e.target.value))}/></label>
        <label><span className="mb-1.5 block text-sm text-slate-400">{L.quality}: {Math.round(quality*100)}%</span><input className="w-full" type="range" min=".4" max="1" step=".02" value={quality} onChange={e=>setQuality(Number(e.target.value))}/></label>
      </div>
      <label className="upload-field mt-5"><span className="font-semibold">{L.choose}</span><input aria-label={L.choose} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>load(e.target.files?.[0])}/></label>
    </div>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="card p-5">
        <div className="relative mx-auto max-w-sm overflow-hidden rounded-xl bg-white">
          <canvas ref={canvasRef} className="block h-auto w-full"/>
          {image&&<div className="pointer-events-none absolute inset-x-[10%] top-[10%] bottom-[10%] rounded-[50%] border border-dashed border-emerald-500/80"/>}
        </div>
        {image&&<div className="mt-4 flex flex-wrap items-center gap-3"><button className="btn-primary" onClick={exportJpg}><Download className="me-2" size={16}/>{L.download}</button><span className="text-sm text-slate-400">{L.output}: {outputPx.w}×{outputPx.h}px{meta?' · '+Math.round(meta.bytes/1024)+' KB':''}</span></div>}
      </div>
      <aside className="card p-5">
        <h3 className="font-bold">{preset.label}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">35×45 mm · {L.head} ({mmToPx(32,dpi)}–{mmToPx(36,dpi)} px at {dpi} DPI) · {preset.age}</p><p className="mt-2 text-xs leading-5 text-slate-400">Official presets require a plain white background. Digital export is JPEG; the tool automatically reduces quality if needed to stay within the published 5 MB limit.</p>
        <p className="mt-3 text-xs leading-5 text-amber-200/90">{L.note}</p>
        <a className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-300" href={source.url} target="_blank" rel="noreferrer">{L.guide}<ExternalLink className="ms-1" size={14}/></a>
        <p className="mt-2 text-xs text-slate-500">{source.authority} · verified {source.verified}</p>
      </aside>
    </div>
  </div>
}
