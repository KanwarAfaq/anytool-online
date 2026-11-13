/* AETHER RUN — original procedural hover-racing game. No external assets. */
(() => {
  'use strict';
  const canvas=document.getElementById('game'),ctx=canvas.getContext('2d',{alpha:false});
  const W=960,H=600,TAU=Math.PI*2;
  const $=id=>document.getElementById(id);
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const rand=(a,b)=>a+Math.random()*(b-a);
  const state={mode:'ready',x:0,vx:0,speed:0,meters:0,energy:100,combo:0,score:0,near:0,time:0,objects:[],particles:[],flash:0,shake:0,spawn:0,best:0,mute:false,boost:false,keys:{},touch:0,checkpoint:0};
  try{state.best=Number((localStorage.getItem('kanwar-arcade:best:aether-run')||localStorage.getItem('arcade-aether-best')))||0;state.mute=localStorage.getItem('arcade-aether-mute')==='1';}catch{}
  $('best').textContent=state.best.toLocaleString();
  const ac=window.AudioContext||window.webkitAudioContext;let audio=null;
  function sound(f=400,d=.12,type='sine',vol=.04,end=null){
    if(state.mute||!ac)return;
    try{
      audio=audio||new ac();if(audio.state==='suspended')audio.resume();
      const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;
      o.type=type;o.frequency.setValueAtTime(f,t);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+d);
      g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
      o.connect(g).connect(audio.destination);o.start(t);o.stop(t+d+.03);
    }catch{}
  }
  function noiseBurst(){sound(125,.35,'sawtooth',.09,34);sound(720,.1,'triangle',.045,170);}
  function sync(){ $('distance').textContent=Math.floor(state.meters).toLocaleString();$('energy-text').textContent=Math.ceil(state.energy)+'%';$('energy-bar').style.width=clamp(state.energy,0,100)+'%';$('score').textContent=Math.floor(state.score).toLocaleString();$('best').textContent=state.best.toLocaleString();$('combo').textContent='x'+Math.max(1,state.combo);$('sound').textContent=state.mute?'SOUND OFF':'SOUND ON';$('sound').setAttribute('aria-pressed',String(!state.mute));$('boost').classList.toggle('active',state.boost&&state.mode==='running');}
  function overlay(title,desc,button){$('overlay').hidden=false;$('overlay-title').textContent=title;$('overlay-desc').textContent=desc;$('start').textContent=button;}
  function hideOverlay(){$('overlay').hidden=true;}
  function reset(){
    Object.assign(state,{mode:'running',x:0,vx:0,speed:240,meters:0,energy:100,combo:0,score:0,near:0,time:0,objects:[],particles:[],flash:0,shake:0,spawn:0,checkpoint:0});
    hideOverlay();sound(440,.13,'triangle',.05,660);sound(660,.3,'triangle',.05,990);sync();
  }
  function end(){state.mode='over';state.boost=false;if(state.score>state.best){state.best=Math.floor(state.score);try{localStorage.setItem('kanwar-arcade:best:aether-run',String(state.best));}catch{}}noiseBurst();sync();overlay('RUN COMPLETE','You traveled '+Math.floor(state.meters).toLocaleString()+' m · Final score '+Math.floor(state.score).toLocaleString()+' · Dodge the crimson barriers and collect cyan energy rings.','RACE AGAIN');}
  function pause(){if(state.mode==='running'){state.mode='paused';overlay('PAUSED','Your hovercraft is holding position. Resume when ready.','RESUME');}else if(state.mode==='paused'){state.mode='running';hideOverlay();}sync();}
  function play(){if(state.mode==='paused')pause();else reset();}
  $('start').addEventListener('click',play);$('pause').addEventListener('click',pause);
  $('sound').addEventListener('click',()=>{state.mute=!state.mute;try{localStorage.setItem('arcade-aether-mute',state.mute?'1':'0');}catch{}if(!state.mute)sound(680,.1);sync();});
  function setBoost(v){state.boost=v;}
  $('boost').addEventListener('pointerdown',e=>{e.preventDefault();setBoost(true);});
  ['pointerup','pointercancel','pointerleave'].forEach(t=>$('boost').addEventListener(t,()=>setBoost(false)));
  const mobileBoost=$('mobile-boost');
  mobileBoost.addEventListener('pointerdown',e=>{e.preventDefault();setBoost(true);});
  for(const type of ['pointerup','pointercancel','pointerleave'])mobileBoost.addEventListener(type,()=>setBoost(false));
  function touchDir(dir){return e=>{e.preventDefault();state.touch=dir;};}
  $('left').addEventListener('pointerdown',touchDir(-1));$('right').addEventListener('pointerdown',touchDir(1));
  for(const el of [$('left'),$('right')])for(const t of ['pointerup','pointerleave','pointercancel'])el.addEventListener(t,()=>state.touch=0);
  window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp',' ','a','d','A','D','Shift','p','P','Escape'].includes(e.key))e.preventDefault();state.keys[e.key.toLowerCase()]=true;if(e.repeat)return;if(e.key==='Escape'||e.key.toLowerCase()==='p')pause();if(e.key===' '&&state.mode!=='running')play();});
  window.addEventListener('keyup',e=>{state.keys[e.key.toLowerCase()]=false;});
  window.addEventListener('blur',()=>{state.keys={};state.touch=0;state.boost=false;if(state.mode==='running')pause();});
  const stars=Array.from({length:95},()=>({x:rand(0,W),y:rand(0,320),r:rand(.5,2),tw:rand(0,TAU)}));
  const mountains=Array.from({length:16},(_,i)=>({x:i*80-140,h:rand(20,125)}));
  function polygon(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
  function glow(x,y,r,color,alpha=1){ctx.save();ctx.globalAlpha=alpha;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();}
  function line(x1,y1,x2,y2,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
  function project(z,x=0){const p=1/(1+z*.0115),h=275+325*p,span=20+500*p;return {p,y:h,x:W/2+x*span,span};}
  function spark(x,y,color,n=12){for(let i=0;i<n;i++)state.particles.push({x,y,vx:rand(-220,220),vy:rand(-230,90),life:rand(.25,.8),max:.8,color,r:rand(1,4)});}
  function spawn(){const n=Math.random(),x=rand(-.8,.8);state.objects.push({z:140,x,kind:n<.27?'ring':n<.38?'gate':'barrier',passed:false,phase:rand(0,TAU)});}
  function update(dt){
    state.time+=dt;state.flash=Math.max(0,state.flash-dt*2.8);state.shake=Math.max(0,state.shake-dt*24);
    for(const p of state.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=140*dt;p.life-=dt;}state.particles=state.particles.filter(p=>p.life>0).slice(-150);
    if(state.mode!=='running')return;
    const steer=(state.keys.arrowleft||state.keys.a?-1:0)+(state.keys.arrowright||state.keys.d?1:0)+state.touch;
    state.vx=clamp(state.vx+steer*4.5*dt,-1.5,1.5);state.vx*=Math.exp(-5*dt);state.x=clamp(state.x+state.vx*dt,-1.05,1.05);
    const boost=(state.boost||state.keys.shift||state.keys.arrowup)&&state.energy>3;
    const target=boost?510:300+Math.min(125,state.meters*.012);state.speed+=(target-state.speed)*Math.min(1,dt*1.4);
    state.energy=clamp(state.energy+(boost?-15:2.6)*dt,0,100);
    state.meters+=state.speed*dt/10;state.score+=state.speed*dt*.065*(1+state.combo*.15);
    state.spawn-=dt;if(state.spawn<=0){spawn();state.spawn=clamp(.8-state.meters/16000,.4,.8);}
    for(const o of state.objects){
      o.z-=state.speed*dt*.43;
      if(!o.passed&&o.z<=5){
        o.passed=true;
        const dx=Math.abs(o.x-state.x);
        if(o.kind==='ring'&&dx<.28){state.energy=clamp(state.energy+20,0,100);state.combo=Math.min(8,state.combo+1);state.score+=250*state.combo;sound(580,.18,'sine',.06,1150);spark(W/2+state.x*290,470,'#65ffee',18);}
        if(o.kind==='barrier'&&dx<.24){state.energy-=34;state.combo=0;state.flash=.8;state.shake=12;noiseBurst();spark(W/2+state.x*290,488,'#ff648f',28);}
        else if(o.kind==='barrier'&&dx<.4){state.combo=Math.min(8,state.combo+1);state.score+=140*state.combo;sound(270,.08,'triangle',.03,560);}
        if(o.kind==='gate'&&dx<.72){state.score+=180;state.energy=clamp(state.energy+4,0,100);sound(430,.14,'triangle',.035,870);}
      }
    }
    state.objects=state.objects.filter(o=>o.z>-8);
    if(Math.floor(state.meters/1000)>state.checkpoint){state.checkpoint++;state.score+=1000;sound(640,.2,'triangle',.045,1100);}
    if(state.energy<=0)end();
    sync();
  }
  function world(){
    const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#070e2b');bg.addColorStop(.4,'#241c4b');bg.addColorStop(.73,'#863e70');bg.addColorStop(1,'#101a38');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    for(const s of stars){const a=.3+.4*Math.sin(state.time*2+s.tw);ctx.fillStyle='rgba(195,224,255,'+a+')';ctx.fillRect(s.x,s.y,s.r,s.r);}
    glow(480,260,270,'#fa6da1',.35);glow(480,195,150,'#ffcf9b',.18);
    ctx.fillStyle='#fed4b3';ctx.beginPath();ctx.arc(480,256,55,0,TAU);ctx.fill();glow(480,256,120,'#ff9d83',.6);
    for(let layer=0;layer<2;layer++){
      const shift=(state.meters*(layer?1.7:.6))%80;
      polygon([[0,300],...mountains.map(m=>[m.x-shift,318-m.h*(layer?.52:1)]),[W,310],[W,390],[0,390]],layer?'#141f40':'#252044');
    }
    // Infinite luminous track: converging stripes and moving road dashes.
    polygon([[440,275],[520,275],[935,600],[25,600]],'#10182f');
    polygon([[445,275],[515,275],[890,600],[70,600]],'#1a2646');
    line(445,275,70,600,'#fa77e0',5);line(515,275,890,600,'#7bfafa',5);
    for(let i=0;i<26;i++){
      const z=((i*9+state.meters*1.8)%234);
      const p=project(z);
      if(p.y>275&&p.y<600){const alpha=p.p*.75;line(480-p.span*.88,p.y,480+p.span*.88,p.y,'rgba(97,218,250,'+alpha+')',1.1+p.p*2);}
    }
    for(let side of [-1,1])for(let i=0;i<15;i++){
      const z=(i*12+state.meters*2)%180,p=project(z);if(p.y>598)continue;
      const x=480+side*(p.span+25*p.p);line(x,p.y,x,p.y-80*p.p,'rgba(129,242,255,.65)',1+p.p*2);glow(x,p.y-80*p.p,12*p.p+2,'#45deff',.8);
    }
    for(let i=0;i<9;i++){const p1=project((i*24+state.meters)%160);if(p1.y>590)continue;const x=480+(i%2?-.33:.33)*p1.span;line(x,p1.y,x,p1.y-25*p1.p,'rgba(245,162,241,.6)',1+p1.p*2);}
  }
  function drawObject(o){
    const p=project(o.z,o.x);if(o.z>130||p.y>640)return;
    const size=clamp(p.p*105,4,200);ctx.save();ctx.translate(p.x,p.y);
    if(o.kind==='ring'){ctx.shadowColor='#61ffee';ctx.shadowBlur=30*p.p;ctx.strokeStyle='#71fffa';ctx.lineWidth=6*p.p+1;ctx.beginPath();ctx.ellipse(0,-size*.52,size*.36,size*.65,0,0,TAU);ctx.stroke();ctx.strokeStyle='#f8ffff';ctx.lineWidth=1.6;ctx.stroke();glow(0,-size*.52,size*.72,'#4affe7',.45);}
    else if(o.kind==='gate'){ctx.shadowColor='#f9b971';ctx.shadowBlur=20;ctx.strokeStyle='#ffcf99';ctx.lineWidth=7*p.p+2;ctx.beginPath();ctx.moveTo(-size*.7,0);ctx.lineTo(-size*.7,-size*1.2);ctx.lineTo(size*.7,-size*1.2);ctx.lineTo(size*.7,0);ctx.stroke();glow(0,-size*1.2,size*.9,'#ffc88b',.23);}
    else{
      const s=size*.58;polygon([[-s,0],[-s*.9,-s*.7],[0,-s*1.1],[s*.9,-s*.7],[s,0]],'#e64276');
      polygon([[-s*.9,-s*.7],[0,-s*1.1],[s*.9,-s*.7],[0,-s*.35]],'#ff9ab1');
      line(-s*.6,-s*.3,s*.6,-s*.3,'#ffe0e9',2.5);glow(0,-s*.5,s*1.3,'#fa285e',.44);
    }ctx.restore();
  }
  function craft(){
    const x=480+state.x*285,y=490+Math.sin(state.time*6)*3;ctx.save();ctx.translate(x,y);ctx.rotate(-state.vx*.14);
    glow(0,20,115,'#59a8ff',.28);ctx.shadowBlur=25;ctx.shadowColor='#56dcff';
    polygon([[-76,22],[-46,-2],[-21,-1],[0,-55],[21,-1],[46,-2],[76,22],[29,17],[0,31],[-29,17]],'#c3dcfa');
    polygon([[-65,16],[-34,-9],[-19,12],[-36,20]],'#637ad2');polygon([[65,16],[34,-9],[19,12],[36,20]],'#637ad2');
    polygon([[-17,-3],[0,-44],[17,-3],[13,15],[-13,15]],'#16264f');
    glow(0,-12,26,'#58fbff',.7);polygon([[-10,-7],[0,-26],[10,-7],[8,4],[-8,4]],'#68fff4');
    ctx.fillStyle='#fff';ctx.fillRect(-48,12,12,4);ctx.fillRect(36,12,12,4);
    for(let k of [-31,31]){glow(k,25,state.speed>400?42:27,state.speed>400?'#ffaad6':'#5ccaff',.9);polygon([[k-11,18],[k+11,18],[k+5,38+Math.random()*14],[k-5,38+Math.random()*14]],state.speed>400?'#ff8bc8':'#56dfff');}
    ctx.restore();
  }
  function render(){
    ctx.save();if(state.shake)ctx.translate(rand(-state.shake,state.shake),rand(-state.shake,state.shake));
    world();state.objects.slice().sort((a,b)=>b.z-a.z).forEach(drawObject);
    craft();for(const p of state.particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);glow(p.x,p.y,10,p.color,.65);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.r,p.r);}ctx.globalAlpha=1;
    if(state.flash){ctx.fillStyle='rgba(255,35,93,'+(state.flash*.2)+')';ctx.fillRect(0,0,W,H);}
    const vign=ctx.createRadialGradient(W/2,H/2,120,W/2,H/2,650);vign.addColorStop(0,'transparent');vign.addColorStop(1,'rgba(0,0,20,.72)');ctx.fillStyle=vign;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#d6f2ff';ctx.font='600 13px system-ui';ctx.fillText('SECTOR  '+String(1+Math.floor(state.meters/1000)).padStart(2,'0')+'  /  SKYLINE CORRIDOR',27,36);
    ctx.textAlign='right';ctx.fillText(Math.round(state.speed*1.3)+' KM/H',930,36);ctx.textAlign='left';
    if(state.mode==='running'&&state.speed>400){ctx.strokeStyle='rgba(100,250,255,.22)';for(let i=0;i<15;i++){let x=rand(0,W);line(x,rand(170,600),x+rand(-100,100),600,'rgba(80,240,255,.25)',rand(1,3));}}
    ctx.restore();
  }
  let last=0;
  function frame(t){const dt=Math.min(.035,(t-last)/1000||.016);last=t;update(dt);render();requestAnimationFrame(frame);}
  sync();overlay('AETHER RUN','A cinematic high-speed hover race. Steer clear of red barriers, collect energy rings, and hold BOOST to break the skyline.','START RACE');
  requestAnimationFrame(frame);
  window.__aetherDebug={state,reset,update};
})();
