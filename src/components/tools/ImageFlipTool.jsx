import { useEffect, useRef, useState } from 'react'
import { Download, FlipHorizontal2, FlipVertical2, RotateCcw } from 'lucide-react'

export default function ImageFlipTool(){
 const canvasRef=useRef(null),imageRef=useRef(null)
 const [flipX,setFlipX]=useState(false),[flipY,setFlipY]=useState(false),[ready,setReady]=useState(false),[name,setName]=useState('flipped-image')
 function render(){
  const img=imageRef.current,c=canvasRef.current;if(!img||!c)return
  const scale=Math.min(1,1800/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale))
  c.width=w;c.height=h
  const ctx=c.getContext('2d');ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(flipX?w:0,flipY?h:0);ctx.scale(flipX?-1:1,flipY?-1:1);ctx.drawImage(img,0,0,w,h);ctx.restore();setReady(true)
 }
 async function load(file){
  if(!file)return
  setName((file.name.replace(/\.[^.]+$/,'')||'image')+'-flipped')
  const img=new Image(),url=URL.createObjectURL(file)
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url})
  imageRef.current=img;URL.revokeObjectURL(url);setFlipX(false);setFlipY(false);window.setTimeout(render,0)
 }
 useEffect(()=>{render()},[flipX,flipY])
 function reset(){setFlipX(false);setFlipY(false)}
 function download(){const c=canvasRef.current;if(!c||!ready)return;const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download=name+'.png';a.click()}
 return <div className="flip-shell">
  <section className="tool-control-panel flip-controls">
   <div className="tool-panel-title">Flip image</div>
   <label className="upload-field"><span className="font-semibold">Choose image</span><input aria-label="Choose image to flip" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>load(e.target.files?.[0])}/></label>
   <div className="flip-actions"><button className={'flip-action '+(flipX?'active':'')} disabled={!ready} onClick={()=>setFlipX(v=>!v)}><FlipHorizontal2/><span>Flip left ↔ right</span></button><button className={'flip-action '+(flipY?'active':'')} disabled={!ready} onClick={()=>setFlipY(v=>!v)}><FlipVertical2/><span>Flip top ↕ bottom</span></button><button className="flip-action" disabled={!ready} onClick={reset}><RotateCcw/><span>Reset</span></button></div>
   <p className="text-xs leading-5 text-slate-500">Processing stays in your browser. Output downloads as PNG.</p>
  </section>
  <section className="tool-result-panel flip-preview">
   <div className="flip-checker"><canvas ref={canvasRef} aria-label="Flipped image preview" data-flip-x={flipX?'true':'false'} data-flip-y={flipY?'true':'false'}/>{!ready&&<div className="flip-empty"><FlipHorizontal2/><strong>Upload an image</strong><span>Mirror it left-to-right or top-to-bottom.</span></div>}</div>
   {ready&&<div className="flip-preview-footer"><span>{flipX?'Horizontal flipped':'Original horizontal'} · {flipY?'Vertical flipped':'Original vertical'}</span><button className="btn-primary" onClick={download}><Download size={17}/><span className="ms-2">Download PNG</span></button></div>}
  </section>
 </div>
}
