import { useRef, useState } from 'react'
import { Download, Pencil } from 'lucide-react'

export default function SketchTool(){
 const canvasRef=useRef(null)
 const [strength,setStrength]=useState(1.5),[warm,setWarm]=useState(true),[ready,setReady]=useState(false),[name,setName]=useState('sketch')
 const imageRef=useRef(null)
 function render(){
  const img=imageRef.current,c=canvasRef.current;if(!img||!c)return
  const scale=Math.min(1,1600/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale))
  c.width=w;c.height=h
  const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h)
  const src=ctx.getImageData(0,0,w,h),gray=new Float32Array(w*h)
  for(let i=0,p=0;i<src.data.length;i+=4,p++)gray[p]=src.data[i]*.299+src.data[i+1]*.587+src.data[i+2]*.114
  const out=ctx.createImageData(w,h),paper=warm?[249,246,238]:[255,255,255]
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=y*w+x,o=p*4;if(x===0||y===0||x===w-1||y===h-1){out.data[o]=paper[0];out.data[o+1]=paper[1];out.data[o+2]=paper[2];out.data[o+3]=255;continue}
    const gx=-gray[p-w-1]-2*gray[p-1]-gray[p+w-1]+gray[p-w+1]+2*gray[p+1]+gray[p+w+1]
    const gy=-gray[p-w-1]-2*gray[p-w]-gray[p-w+1]+gray[p+w-1]+2*gray[p+w]+gray[p+w+1]
    const edge=Math.min(255,Math.hypot(gx,gy)*strength),shade=Math.max(0,255-edge)
    out.data[o]=Math.min(paper[0],shade);out.data[o+1]=Math.min(paper[1],shade);out.data[o+2]=Math.min(paper[2],shade);out.data[o+3]=255
  }
  ctx.putImageData(out,0,0);setReady(true)
 }
 async function load(file){
  if(!file)return;setName((file.name.replace(/\.[^.]+$/,'')||'sketch')+'-sketch')
  const img=new Image(),url=URL.createObjectURL(file)
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url});imageRef.current=img;URL.revokeObjectURL(url);render()
 }
 function download(){const c=canvasRef.current;if(!c||!ready)return;const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download=name+'.png';a.click()}
 return <div className="tool-work-grid sketch-layout">
  <section className="tool-control-panel">
   <div className="tool-panel-title"><Pencil size={18}/> Handmade sketch controls</div>
   <label className="upload-field"><span className="font-semibold">Choose a photo</span><input aria-label="Choose photo for sketch" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>load(e.target.files?.[0])}/></label>
   <label className="mt-5 block"><span className="tool-label">Pencil line strength · {strength.toFixed(1)}</span><input aria-label="Sketch line strength" className="w-full" type="range" min=".6" max="3" step=".1" value={strength} onChange={e=>{setStrength(Number(e.target.value));window.setTimeout(render,0)}}/></label>
   <label className="mt-4 flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={warm} onChange={e=>{setWarm(e.target.checked);window.setTimeout(render,0)}}/>Warm paper tone</label>
   <p className="mt-4 text-xs leading-5 text-slate-500">Runs locally in your browser. Large images are scaled to a maximum 1600 px side for responsive processing.</p>
  </section>
  <section className="tool-result-panel sketch-stage">
   <div className="sketch-canvas-wrap"><canvas ref={canvasRef} aria-label="Sketch preview"/></div>
   {!ready&&<div className="sketch-empty"><Pencil size={28}/><span>Upload a photo to create a pencil sketch</span></div>}
   {ready&&<button className="btn-primary mt-4" onClick={download}><Download size={17}/><span className="ms-2">Download PNG sketch</span></button>}
  </section>
 </div>
}
