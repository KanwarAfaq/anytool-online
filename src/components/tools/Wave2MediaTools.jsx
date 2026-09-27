import { useEffect, useMemo, useRef, useState } from 'react'
import { Copy, Download } from 'lucide-react'

const copyText=async text=>{try{await navigator.clipboard.writeText(String(text??''))}catch{}}
const downloadText=(name,text,type='text/plain')=>{const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
const downloadDataUrl=(name,url)=>{const a=document.createElement('a');a.href=url;a.download=name;a.click()}
const Field=({label,children})=><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-400">{label}</span>{children}</label>
const Action=({children,onClick,primary=false,disabled=false})=><button type="button" disabled={disabled} onClick={onClick} className={primary?'btn-primary':'btn-ghost'}>{children}</button>
const Output=({children})=><pre className="max-h-[24rem] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/[0.07] bg-slate-950/80 p-4 text-sm leading-6 text-slate-200">{children}</pre>

const iconSizes=[16,32,48,180,192,512]
function drawFavicon(canvas,char,bg,fg,shape){
 const ctx=canvas.getContext('2d');if(!ctx)return
 const s=canvas.width;ctx.clearRect(0,0,s,s);ctx.fillStyle=bg
 if(shape==='circle'){ctx.beginPath();ctx.arc(s/2,s/2,s/2,0,Math.PI*2);ctx.fill()}
 else if(shape==='rounded'){const r=s*.2;ctx.beginPath();ctx.moveTo(r,0);ctx.lineTo(s-r,0);ctx.quadraticCurveTo(s,0,s,r);ctx.lineTo(s,s-r);ctx.quadraticCurveTo(s,s,s-r,s);ctx.lineTo(r,s);ctx.quadraticCurveTo(0,s,0,s-r);ctx.lineTo(0,r);ctx.quadraticCurveTo(0,0,r,0);ctx.fill()}
 else ctx.fillRect(0,0,s,s)
 ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=Math.round(s*.58)+"px 'Segoe UI Emoji','Apple Color Emoji',sans-serif";ctx.fillText(char||'A',s/2,s*.54)
}
export function FaviconGenerator(){
 const canvasRef=useRef(null),[char,setChar]=useState('⚡'),[bg,setBg]=useState('#3b82f6'),[fg,setFg]=useState('#ffffff'),[shape,setShape]=useState('rounded'),[image,setImage]=useState('')
 useEffect(()=>{
  const c=canvasRef.current;if(!c)return;c.width=512;c.height=512
  if(image){const img=new Image();img.onload=()=>{const ctx=c.getContext('2d'),m=Math.min(img.width,img.height),sx=(img.width-m)/2,sy=(img.height-m)/2;ctx.clearRect(0,0,512,512);ctx.drawImage(img,sx,sy,m,m,0,0,512,512)};img.src=image}else drawFavicon(c,char,bg,fg,shape)
 },[char,bg,fg,shape,image])
 const make=size=>{const c=document.createElement('canvas');c.width=size;c.height=size;const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(canvasRef.current,0,0,size,size);return c.toDataURL('image/png')}
 const upload=file=>{const r=new FileReader();r.onload=()=>setImage(String(r.result));r.readAsDataURL(file)}
 const html='<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">'
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="Emoji / character"><input aria-label="Favicon character" className="input text-2xl" maxLength="2" value={char} onChange={e=>{setChar(e.target.value);setImage('')}}/></Field><Field label="Shape"><select className="input" value={shape} onChange={e=>setShape(e.target.value)}><option value="rounded">Rounded</option><option value="circle">Circle</option><option value="square">Square</option></select></Field><Field label="Background"><input className="input h-12" type="color" value={bg} onChange={e=>{setBg(e.target.value);setImage('')}}/></Field><Field label="Foreground"><input className="input h-12" type="color" value={fg} onChange={e=>{setFg(e.target.value);setImage('')}}/></Field></div><label className="btn-ghost cursor-pointer">Upload image<input aria-label="Upload favicon source" type="file" accept="image/*" className="hidden" onChange={e=>e.target.files?.[0]&&upload(e.target.files[0])}/></label><canvas ref={canvasRef} aria-label="Favicon preview" className="mx-auto size-48 rounded-3xl border border-white/[0.08]"/></section><section className="tool-result-panel"><h3 className="font-bold">Download sizes</h3><div className="mt-4 grid gap-2 sm:grid-cols-2">{iconSizes.map(size=><button key={size} className="btn-ghost justify-between" onClick={()=>downloadDataUrl(size===180?'apple-touch-icon.png':'favicon-'+size+'x'+size+'.png',make(size))}><span>{size}×{size}</span><Download size={14}/></button>)}</div><div className="mt-5"><Action onClick={()=>copyText(html)}><Copy size={15}/> Copy HTML</Action></div></section></div>
}

export function GradientGenerator(){
 const [type,setType]=useState('linear'),[angle,setAngle]=useState(135),[c1,setC1]=useState('#22d3ee'),[c2,setC2]=useState('#8b5cf6'),[c3,setC3]=useState('#f472b6'),[three,setThree]=useState(true)
 const css=type==='linear'?'linear-gradient('+angle+'deg, '+c1+' 0%, '+c2+' '+(three?'50%':'100%')+(three?', '+c3+' 100%':'')+')':'radial-gradient(circle, '+c1+' 0%, '+c2+' '+(three?'55%':'100%')+(three?', '+c3+' 100%':'')+')'
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><Field label="Gradient type"><select aria-label="Gradient type" className="input" value={type} onChange={e=>setType(e.target.value)}><option value="linear">Linear</option><option value="radial">Radial</option></select></Field>{type==='linear'&&<Field label={'Angle: '+angle+'°'}><input aria-label="Gradient angle" className="w-full" type="range" min="0" max="360" value={angle} onChange={e=>setAngle(Number(e.target.value))}/></Field>}<div className="grid gap-3 sm:grid-cols-3"><Field label="Color 1"><input type="color" className="input h-12" value={c1} onChange={e=>setC1(e.target.value)}/></Field><Field label="Color 2"><input type="color" className="input h-12" value={c2} onChange={e=>setC2(e.target.value)}/></Field>{three&&<Field label="Color 3"><input type="color" className="input h-12" value={c3} onChange={e=>setC3(e.target.value)}/></Field>}</div><label className="flex gap-2 text-sm"><input type="checkbox" checked={three} onChange={e=>setThree(e.target.checked)}/> Use third color</label></section><section className="tool-result-panel space-y-4"><div aria-label="Gradient preview" className="h-64 rounded-3xl border border-white/[0.08]" style={{background:css}}/><Output>{'background: '+css+';'}</Output><Action onClick={()=>copyText('background: '+css+';')}><Copy size={15}/> Copy CSS</Action></section></div>
}

export function BoxShadowGenerator(){
 const [x,setX]=useState(0),[y,setY]=useState(18),[blur,setBlur]=useState(45),[spread,setSpread]=useState(-12),[color,setColor]=useState('#000000'),[alpha,setAlpha]=useState(.45),[inset,setInset]=useState(false)
 const rgb=useMemo(()=>{const h=color.replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]},[color])
 const css=(inset?'inset ':'')+x+'px '+y+'px '+blur+'px '+spread+'px rgba('+rgb[0]+', '+rgb[1]+', '+rgb[2]+', '+alpha+')'
 const slider=(label,value,set,min,max,step=1)=><Field label={label+': '+value}><input className="w-full" type="range" min={min} max={max} step={step} value={value} onChange={e=>set(Number(e.target.value))}/></Field>
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-3">{slider('X offset',x,setX,-50,50)}{slider('Y offset',y,setY,-50,50)}{slider('Blur',blur,setBlur,0,100)}{slider('Spread',spread,setSpread,-50,50)}{slider('Opacity',alpha,setAlpha,0,1,.05)}<Field label="Shadow color"><input aria-label="Shadow color" type="color" className="input h-12" value={color} onChange={e=>setColor(e.target.value)}/></Field><label className="flex gap-2 text-sm"><input type="checkbox" checked={inset} onChange={e=>setInset(e.target.checked)}/> Inset shadow</label></section><section className="tool-result-panel space-y-5"><div className="grid min-h-64 place-items-center rounded-3xl bg-slate-950/70"><div aria-label="Box shadow preview" className="size-36 rounded-3xl bg-slate-800" style={{boxShadow:css}}/></div><Output>{'box-shadow: '+css+';'}</Output><Action onClick={()=>copyText('box-shadow: '+css+';')}><Copy size={15}/> Copy CSS</Action></section></div>
}

function parseExif(buffer){
 try{
  const dv=new DataView(buffer);if(dv.byteLength<4||dv.getUint16(0,false)!==0xffd8)return null
  let off=2
  while(off+4<dv.byteLength){
   if(dv.getUint8(off)!==0xff){off++;continue}
   const marker=dv.getUint8(off+1);off+=2
   if(marker===0xda||marker===0xd9)break
   const len=dv.getUint16(off,false)
   if(marker===0xe1&&off+len<=dv.byteLength){
    const exif=String.fromCharCode(...new Uint8Array(buffer,off+2,Math.min(4,len-2)))
    if(exif==='Exif'){
     const tiff=off+8,little=dv.getUint16(tiff,false)===0x4949
     const u16=p=>dv.getUint16(tiff+p,little),u32=p=>dv.getUint32(tiff+p,little)
     const str=(p,n)=>{let s='';for(let i=0;i<n&&tiff+p+i<dv.byteLength;i++){const c=dv.getUint8(tiff+p+i);if(!c)break;s+=String.fromCharCode(c)}return s.trim()}
     const first=u32(4),out={},n=u16(first)
     for(let i=0;i<n;i++){const p=first+2+i*12,tag=u16(p),type=u16(p+2),count=u32(p+4),val=u32(p+8);if(type===2&&count>0){const pos=count<=4?p+8:val,v=str(pos,count);if(tag===0x010f)out.Make=v;if(tag===0x0110)out.Model=v;if(tag===0x0131)out.Software=v;if(tag===0x0132)out.DateTime=v}}
     return out
    }
   }
   off+=len
  }
 }catch{}
 return null
}
export function ExifViewer(){
 const [info,setInfo]=useState(null),[error,setError]=useState('')
 const read=async file=>{setError('');const basic={File:file.name,Type:file.type||'unknown',Size:(file.size/1024).toFixed(1)+' KB',LastModified:new Date(file.lastModified).toLocaleString()},exif=parseExif(await file.arrayBuffer());setInfo({...basic,...(exif||{})});if(!exif)setError('No embedded JPEG EXIF metadata found. Basic file metadata is shown below.')}
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><label className="upload-field"><span className="font-semibold">Choose a JPEG or image file</span><input aria-label="Choose image for EXIF" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={e=>e.target.files?.[0]&&read(e.target.files[0])}/></label><p className="text-xs text-slate-500">Metadata is read locally in your browser.</p>{error&&<p className="text-sm text-amber-200">{error}</p>}</section><section className="tool-result-panel">{info?<div className="grid gap-2">{Object.entries(info).map(([k,v])=><div key={k} className="grid grid-cols-[130px_1fr] gap-3 rounded-lg border border-white/[0.06] px-3 py-2 text-sm"><span className="text-slate-500">{k}</span><span className="break-all">{String(v)}</span></div>)}</div>:<p className="text-slate-500">Upload an image to inspect metadata.</p>}</section></div>
}

export function ImageWatermark(){
 const canvasRef=useRef(null),[src,setSrc]=useState(''),[name,setName]=useState('image'),[text,setText]=useState('© AnyTool'),[size,setSize]=useState(42),[opacity,setOpacity]=useState(.55),[color,setColor]=useState('#ffffff'),[position,setPosition]=useState('bottom-right')
 useEffect(()=>{
  if(!src||!canvasRef.current)return
  const img=new Image();img.onload=()=>{const c=canvasRef.current,x=c.getContext('2d'),max=1600,scale=Math.min(1,max/img.width,max/img.height);c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));x.clearRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);x.save();x.globalAlpha=opacity;x.fillStyle=color;x.font='700 '+Math.max(12,size*scale)+'px system-ui';x.textBaseline='middle';const pad=24*scale,m=x.measureText(text),w=m.width,h=size*scale;let px=pad,py=pad+h/2;if(position.includes('right'))px=c.width-pad-w;if(position==='center')px=(c.width-w)/2;if(position==='center')py=c.height/2;if(position.startsWith('bottom'))py=c.height-pad-h/2;x.fillText(text,px,py);x.restore()};img.src=src
 },[src,text,size,opacity,color,position])
 const load=file=>{setName(file.name.replace(/\.[^.]+$/,''));const r=new FileReader();r.onload=()=>setSrc(String(r.result));r.readAsDataURL(file)}
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><label className="upload-field"><span className="font-semibold">Choose image</span><input aria-label="Choose image to watermark" type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&load(e.target.files[0])}/></label><Field label="Watermark text"><input aria-label="Watermark text" className="input" value={text} onChange={e=>setText(e.target.value)}/></Field><Field label={'Font size: '+size+' px'}><input className="w-full" type="range" min="16" max="120" value={size} onChange={e=>setSize(Number(e.target.value))}/></Field><Field label={'Opacity: '+Math.round(opacity*100)+'%'}><input className="w-full" type="range" min=".1" max="1" step=".05" value={opacity} onChange={e=>setOpacity(Number(e.target.value))}/></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Color"><input className="input h-12" type="color" value={color} onChange={e=>setColor(e.target.value)}/></Field><Field label="Position"><select aria-label="Watermark position" className="input" value={position} onChange={e=>setPosition(e.target.value)}>{['top-left','top-right','center','bottom-left','bottom-right'].map(x=><option key={x}>{x}</option>)}</select></Field></div><Action primary disabled={!src} onClick={()=>canvasRef.current&&downloadDataUrl('watermarked-'+name+'.png',canvasRef.current.toDataURL('image/png'))}><Download size={15}/> Download PNG</Action></section><section className="tool-result-panel"><div className="grid min-h-72 place-items-center rounded-2xl bg-slate-950/80 p-3">{src?<canvas aria-label="Watermarked image preview" ref={canvasRef} className="max-h-[34rem] max-w-full rounded-xl"/>:<span className="text-slate-500">Upload an image to preview.</span>}</div></section></div>
}

export function BarcodeGenerator(){
 const svgRef=useRef(null),[text,setText]=useState('ANYTOOL-2026'),[format,setFormat]=useState('CODE128'),[height,setHeight]=useState(90),[width,setWidth]=useState(2),[display,setDisplay]=useState(true),[error,setError]=useState('')
 useEffect(()=>{let live=true;(async()=>{try{const JsBarcode=(await import('jsbarcode')).default;if(!live||!svgRef.current)return;JsBarcode(svgRef.current,text||' ',{format,width,height,displayValue:display,margin:12,background:'#ffffff',lineColor:'#000000'});setError('')}catch(e){setError(e.message)}})();return()=>{live=false}},[text,format,height,width,display])
 const svgString=()=>svgRef.current?new XMLSerializer().serializeToString(svgRef.current):''
 const saveSvg=()=>downloadText('barcode.svg',svgString(),'image/svg+xml')
 const savePng=()=>{if(!svgRef.current)return;const blob=new Blob([svgString()],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=img.width*2;c.height=img.height*2;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);downloadDataUrl('barcode.png',c.toDataURL('image/png'));URL.revokeObjectURL(url)};img.src=url}
 return <div className="tool-work-grid"><section className="tool-control-panel space-y-4"><Field label="Barcode value"><input aria-label="Barcode value" className="input font-mono" value={text} onChange={e=>setText(e.target.value)}/></Field><Field label="Format"><select aria-label="Barcode format" className="input" value={format} onChange={e=>setFormat(e.target.value)}><option>CODE128</option><option>CODE39</option><option>EAN13</option><option>UPC</option><option>ITF14</option><option>MSI</option></select></Field><Field label={'Bar width: '+width}><input className="w-full" type="range" min="1" max="4" step=".25" value={width} onChange={e=>setWidth(Number(e.target.value))}/></Field><Field label={'Height: '+height+' px'}><input className="w-full" type="range" min="40" max="180" value={height} onChange={e=>setHeight(Number(e.target.value))}/></Field><label className="flex gap-2 text-sm"><input type="checkbox" checked={display} onChange={e=>setDisplay(e.target.checked)}/> Show value</label>{error&&<p className="text-rose-300">{error}</p>}</section><section className="tool-result-panel space-y-4"><div className="overflow-auto rounded-2xl bg-white p-5"><svg aria-label="Barcode preview" ref={svgRef}/></div><div className="flex gap-2"><Action onClick={saveSvg}><Download size={15}/> SVG</Action><Action onClick={savePng}><Download size={15}/> PNG</Action></div></section></div>
}
