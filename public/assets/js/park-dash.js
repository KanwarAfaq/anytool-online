/* LITTLE LEGENDS: PARK DASH — original, kid-friendly racing on foot. */
(() => {
'use strict';
const C=document.getElementById('game'),g=C.getContext('2d',{alpha:false}),W=960,H=600,PI=Math.PI,TAU=PI*2;
const $=id=>document.getElementById(id),cl=(x,a,b)=>Math.max(a,Math.min(b,x)),rnd=(a,b)=>a+Math.random()*(b-a);
const L=[306,409,512,615],FINISH=1500;
const heroes=[
 {name:'YOU',skin:'#efb78b',shirt:'#2ccecf',shorts:'#164e8e',hair:'#442b35',x:0,dist:0,run:0,lane:1},
 {name:'MIA',skin:'#a96b49',shirt:'#f38bae',shorts:'#824d92',hair:'#252236',dist:0,run:0,lane:0},
 {name:'NOAH',skin:'#d39567',shirt:'#f8d15b',shorts:'#345cbd',hair:'#523027',dist:0,run:0,lane:2},
 {name:'ZOE',skin:'#f5cba2',shirt:'#ad88f8',shorts:'#cc6a66',hair:'#674936',dist:0,run:0,lane:3}
];
const S={mode:'ready',t:0,distance:0,score:0,best:0,coins:0,lane:1,desired:1,jump:0,jumpVy:0,stamina:100,boost:0,items:[],particles:[],sparks:[],spawn:.6,shake:0,flash:0,keys:{},muted:false,finishOrder:[],lastStep:0};
try{S.best=Number(localStorage.getItem('kanwar-arcade:best:park-dash'))||0;S.muted=localStorage.getItem('park-dash-muted')==='1';}catch{}
const AC=window.AudioContext||window.webkitAudioContext;let audio;
function tone(hz,len=.12,type='sine',volume=.04,end=null){if(S.muted||!AC)return;try{audio=audio||new AC();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),v=audio.createGain(),t=audio.currentTime;o.type=type;o.frequency.setValueAtTime(hz,t);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+len);v.gain.setValueAtTime(volume,t);v.gain.exponentialRampToValueAtTime(.001,t+len);o.connect(v).connect(audio.destination);o.start(t);o.stop(t+len+.03);}catch{}}
function sync(){$('score').textContent=Math.floor(S.score).toLocaleString();$('best').textContent=S.best.toLocaleString();$('distance').textContent=Math.floor(S.distance)+' / '+FINISH+' m';$('coins').textContent=S.coins;$('stamina').style.width=cl(S.stamina,0,100)+'%';$('stamina-value').textContent=Math.ceil(S.stamina)+'%';$('sound').textContent=S.muted?'SOUND OFF':'SOUND ON';$('sound').setAttribute('aria-pressed',String(!S.muted));$('rank').textContent='#'+(1+heroes.slice(1).filter(h=>h.dist>S.distance).length);}
function overlay(title,desc,label){$('overlay').hidden=false;$('overlay-title').textContent=title;$('overlay-desc').textContent=desc;$('start').textContent=label;}
function hide(){$('overlay').hidden=true;}
function reset(){Object.assign(S,{mode:'running',t:0,distance:0,score:0,coins:0,lane:1,desired:1,jump:0,jumpVy:0,stamina:100,boost:0,items:[],particles:[],sparks:[],spawn:.65,shake:0,flash:0,keys:{},finishOrder:[],lastStep:0});heroes.forEach((h,i)=>{h.dist=0;h.run=0;h.lane=i?i-1:1;h.x=0;});hide();tone(440,.12,'triangle',.04,660);tone(740,.18,'triangle',.045,1080);sync();}
function finish(){S.mode='complete';const rank=1+heroes.slice(1).filter(h=>h.dist>S.distance).length;S.score+=Math.max(0,5-rank)*500;if(S.score>S.best){S.best=Math.floor(S.score);try{localStorage.setItem('kanwar-arcade:best:park-dash',String(S.best));}catch{}}tone(620,.15,'triangle',.07,880);tone(880,.25,'triangle',.07,1320);sync();overlay('FINISH LINE!','You finished #'+rank+' with '+S.coins+' stars and '+Math.floor(S.score).toLocaleString()+' points. Race again to improve your time!','RACE AGAIN');}
function pause(){if(S.mode==='running'){S.mode='paused';overlay('TAKE A BREATHER','The track is yours whenever you are ready.','RESUME RACE');}else if(S.mode==='paused'){S.mode='running';hide();}}
$('start').onclick=()=>S.mode==='paused'?pause():reset();$('pause').onclick=pause;
$('sound').onclick=()=>{S.muted=!S.muted;try{localStorage.setItem('park-dash-muted',S.muted?'1':'0');}catch{}if(!S.muted)tone(680);sync();};
function move(d){if(S.mode==='running')S.desired=cl(S.desired+d,0,3);}
function jump(){if(S.mode!=='running'||S.jump>0||S.jumpVy>0)return;S.jumpVy=510;tone(350,.16,'triangle',.04,670);}
function sprint(flag){S.keys.sprint=flag;}
$('left').onclick=()=>move(-1);$('right').onclick=()=>move(1);$('jump').onclick=jump;
const touch=[['mobile-left',()=>move(-1)],['mobile-right',()=>move(1)],['mobile-jump',jump]];
for(const [id,fn] of touch)$(id).addEventListener('pointerdown',e=>{e.preventDefault();fn();});
for(const id of ['sprint','mobile-sprint']){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();sprint(true);});for(const name of ['pointerup','pointercancel','pointerleave'])el.addEventListener(name,()=>sprint(false));}
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup',' ','a','d','w','shift','p','escape'].includes(k))e.preventDefault();if(!e.repeat){if(k==='arrowleft'||k==='a')move(-1);if(k==='arrowright'||k==='d')move(1);if(k===' '||k==='arrowup'||k==='w')S.mode==='running'?jump():S.mode==='paused'?pause():reset();if(k==='p'||k==='escape')pause();}S.keys[k]=true;});
window.addEventListener('keyup',e=>{S.keys[e.key.toLowerCase()]=false;});
window.addEventListener('blur',()=>{S.keys={};if(S.mode==='running')pause();});
const scenery=Array.from({length:36},(_,i)=>({x:i*90,kind:i%5,c:Math.floor(rnd(0,3))}));
function rad(x,y,r,c,a=1){g.save();g.globalAlpha=a;let t=g.createRadialGradient(x,y,0,x,y,r);t.addColorStop(0,c);t.addColorStop(1,'transparent');g.fillStyle=t;g.fillRect(x-r,y-r,2*r,2*r);g.restore();}
function path(pts,color){g.fillStyle=color;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();}
function dust(x,y,col,n=10){for(let i=0;i<n;i++)S.particles.push({x,y,vx:rnd(-110,110),vy:rnd(-150,20),life:rnd(.25,.8),total:.8,col,r:rnd(2,6)});}
function spawn(){const kinds=['star','star','hurdle','puddle','star','boost'];S.items.push({kind:kinds[Math.floor(rnd(0,kinds.length))],lane:Math.floor(rnd(0,4)),at:S.distance+rnd(170,260),done:false,phase:rnd(0,TAU)});}
function step(dt){
S.t+=dt;S.flash=Math.max(0,S.flash-dt*3);S.shake=Math.max(0,S.shake-dt*25);
for(const p of S.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=170*dt;p.life-=dt;}S.particles=S.particles.filter(p=>p.life>0).slice(-150);
if(S.mode!=='running')return;
S.lane+=(S.desired-S.lane)*Math.min(1,dt*12);
if(S.jumpVy||S.jump){S.jump+=S.jumpVy*dt;S.jumpVy-=1250*dt;if(S.jump<0){S.jump=0;S.jumpVy=0;}}
let speed=46+Math.min(S.distance/180,9);const boosting=(S.keys.shift||S.keys.sprint)&&S.stamina>2;
S.stamina=cl(S.stamina+(boosting?-33:19)*dt,0,100);if(boosting)speed*=1.48;S.boost+=(Number(boosting)-S.boost)*Math.min(1,dt*9);
S.distance+=speed*dt;S.score+=speed*dt*.035;if(Math.floor(S.distance/17)>S.lastStep){S.lastStep=Math.floor(S.distance/17);if(S.lastStep%2===0)tone(110+S.lastStep%3*25,.037,'triangle',.013,90);}
for(let i=1;i<heroes.length;i++){const h=heroes[i];h.run+=dt;h.dist+=(44+4*Math.sin(S.t*.7+i)+i*.7)*dt;}
S.spawn-=dt;if(S.spawn<0){spawn();S.spawn=Math.max(.7,1.22-S.distance/3000);}
for(const it of S.items){const z=it.at-S.distance;if(it.done||z>13||z<-15)continue;it.done=true;if(Math.abs(S.lane-it.lane)>.32)continue;
if(it.kind==='star'){S.coins++;S.score+=150;S.stamina=cl(S.stamina+9,0,100);dust(480,L[Math.round(S.lane)]-50,'#fff3a5',18);tone(580,.17,'sine',.065,1150);}
if(it.kind==='boost'){S.stamina=100;S.score+=80;dust(480,L[Math.round(S.lane)]-40,'#8ffff0',16);tone(440,.2,'triangle',.055,990);}
if((it.kind==='hurdle'||it.kind==='puddle')&&S.jump<38){S.stamina=Math.max(0,S.stamina-27);S.distance=Math.max(0,S.distance-13);S.flash=.4;S.shake=8;dust(460,L[Math.round(S.lane)]-22,'#ff9b7f',16);tone(190,.22,'sawtooth',.07,65);}
}
S.items=S.items.filter(it=>it.at>S.distance-45);
if(S.distance>=FINISH){S.distance=FINISH;finish();}else sync();
}
function paint(){
const sky=g.createLinearGradient(0,0,0,420);sky.addColorStop(0,'#65c8f5');sky.addColorStop(.7,'#b9e9fa');sky.addColorStop(1,'#e9f9e5');g.fillStyle=sky;g.fillRect(0,0,W,H);
rad(800,108,125,'#fff9d2',.9);g.fillStyle='#fff1ad';g.beginPath();g.arc(800,104,46,0,TAU);g.fill();
for(let i=0;i<6;i++){const x=((i*215-S.distance*.16)%1250+1250)%1250-100,y=70+i%3*40;g.fillStyle='rgba(255,255,255,.83)';g.beginPath();g.ellipse(x,y,65,23,0,0,TAU);g.ellipse(x+35,y-10,47,24,0,0,TAU);g.fill();}
path([[0,215],[145,164],[300,195],[450,156],[700,195],[840,150],[960,180],[960,310],[0,310]],'#78c5a2');
path([[0,242],[220,195],[380,237],[610,200],[810,228],[960,195],[960,335],[0,335]],'#419e8f');
g.fillStyle='#73bb76';g.fillRect(0,260,W,340);
const offset=(S.distance*1.6)%220;
for(const tree of scenery){let x=(tree.x-offset+3560)%3560-150;if(x>W+80)continue;const y=240+(tree.kind%2)*24;
g.strokeStyle='#775d56';g.lineWidth=12;g.beginPath();g.moveTo(x,y+37);g.lineTo(x,y-23);g.stroke();
for(let j=0;j<3;j++){g.fillStyle=['#3d9b7d','#5bb584','#80c992'][j];g.beginPath();g.arc(x-22+j*21,y-37+(j%2)*5,31,0,TAU);g.fill();}
}
g.fillStyle='#e6cb99';g.fillRect(0,276,W,309);
g.fillStyle='#c37770';g.fillRect(0,286,W,296);
for(let i=0;i<5;i++){let y=286+i*76;g.fillStyle=i%2?'#d98c80':'#d4857a';g.fillRect(0,y,W,76);g.fillStyle='#f6d6ba';g.fillRect(0,y,W,3);}
for(let i=0;i<4;i++){g.fillStyle='rgba(255,250,223,.78)';g.fillRect(0,361+i*76,W,2);}
for(let i=0;i<16;i++){let x=(i*99-S.distance*5)%1100;if(x<0)x+=1100;g.fillStyle='rgba(255,237,211,.38)';g.fillRect(x,313,35,3);g.fillRect(x+45,541,28,3);}
g.fillStyle='#8fc0a7';g.fillRect(0,580,W,20);
g.fillStyle='#fff';g.font='900 14px system-ui';g.fillText('SUNNYVALE PARK • JUNIOR GRAND PRIX',27,36);
g.fillStyle='rgba(14,58,83,.75)';g.fillRect(32,45,220,5);g.fillStyle='#fff8c3';g.fillRect(32,45,220*S.distance/FINISH,5);
}
function runner(x,y,hero,t,jump=0,scale=1){const phase=t*11;g.save();g.translate(x,y-jump);g.scale(scale,scale);
const bob=Math.sin(phase)*2;if(jump)g.translate(0,-6);
g.fillStyle='rgba(45,36,54,.23)';g.beginPath();g.ellipse(0,33+jump,27,8,0,0,TAU);g.fill();
g.lineCap='round';g.lineWidth=9;g.strokeStyle=hero.shorts;
for(const side of [-1,1]){g.beginPath();g.moveTo(side*8,13);g.lineTo(side*(10+Math.sin(phase+side)*9),28);g.stroke();g.lineWidth=8;g.strokeStyle='#fff';g.beginPath();g.moveTo(side*(10+Math.sin(phase+side)*9),28);g.lineTo(side*(10+Math.sin(phase+side)*9)+7,29);g.stroke();}
g.fillStyle=hero.shirt;g.beginPath();g.roundRect(-18,-19+bob,36,38,9);g.fill();
g.strokeStyle=hero.skin;g.lineWidth=8;for(const side of [-1,1]){g.beginPath();g.moveTo(side*17,-11);g.lineTo(side*(24+Math.sin(phase+side*PI)*5),7);g.stroke();}
g.fillStyle=hero.skin;g.beginPath();g.arc(0,-38+bob,21,0,TAU);g.fill();
g.fillStyle=hero.hair;g.beginPath();g.arc(0,-43+bob,21,PI*1.02,PI*1.97);g.lineTo(19,-34+bob);g.lineTo(8,-48+bob);g.lineTo(-12,-44+bob);g.fill();
g.fillStyle='#302c40';g.beginPath();g.arc(-7,-36+bob,2.5,0,TAU);g.arc(7,-36+bob,2.5,0,TAU);g.fill();
g.strokeStyle='#a6535a';g.lineWidth=2;g.beginPath();g.arc(0,-29+bob,6,.2,PI-.2);g.stroke();
g.font='800 12px system-ui';g.textAlign='center';g.lineWidth=3;g.strokeStyle='#183044';g.strokeText(hero.name,0,-76+bob);g.fillStyle='#fff';g.fillText(hero.name,0,-76+bob);
g.restore();}
function item(it){const z=it.at-S.distance; if(z>280||z<-10)return;const x=410+z*1.9,y=L[it.lane],size=cl(1-z/350,.35,1.05);g.save();g.translate(x,y);g.scale(size,size);if(it.kind==='star'){rad(0,-32,40,'#ffe8a0',.7);g.save();g.translate(0,-37+Math.sin(S.t*4+it.phase)*6);g.rotate(S.t*1.6);let pts=[];for(let i=0;i<10;i++){const a=i*PI/5-PI/2,r=i%2?10:21;pts.push([Math.cos(a)*r,Math.sin(a)*r]);}path(pts,'#fff1a4');g.restore();}
else if(it.kind==='boost'){rad(0,-15,46,'#68fff5',.65);g.fillStyle='#b3fff5';g.font='900 40px system-ui';g.fillText('⚡',-21,0);}
else if(it.kind==='hurdle'){g.fillStyle='#f6ddc6';g.fillRect(-23,-28,7,38);g.fillRect(16,-28,7,38);g.fillStyle='#dff9fa';g.fillRect(-28,-28,56,11);g.fillStyle='#d8506d';for(let i=0;i<4;i++)g.fillRect(-24+i*14,-27,7,9);}
else{g.fillStyle='#79c8f2';g.beginPath();g.ellipse(0,8,40,12,0,0,TAU);g.fill();g.strokeStyle='#d2f6ff';g.lineWidth=3;g.stroke();}
g.restore();}
function draw(){g.save();if(S.shake)g.translate(rnd(-S.shake,S.shake),rnd(-S.shake,S.shake));paint();
for(const it of S.items.sort((a,b)=>b.at-a.at))item(it);
for(let i=1;i<heroes.length;i++){const h=heroes[i];let x=430+(h.dist-S.distance)*1.9;runner(cl(x,-80,1060),L[h.lane],h,S.t*(1.1+i*.09),0,.87);}
runner(410,L[0]+(L[1]-L[0])*S.lane,heroes[0],S.t,Math.max(0,S.jump),1.13);
for(const p of S.particles){g.globalAlpha=cl(p.life/p.total,0,1);rad(p.x,p.y,18,p.col,.6);g.fillStyle=p.col;g.beginPath();g.arc(p.x,p.y,p.r,0,TAU);g.fill();}g.globalAlpha=1;
if(S.flash){g.fillStyle='rgba(255,92,98,'+(S.flash*.2)+')';g.fillRect(0,0,W,H);}
g.fillStyle='rgba(18,51,65,.65)';g.fillRect(740,20,185,38);g.fillStyle='#fff';g.font='800 15px system-ui';g.fillText('FINISH '+Math.max(0,Math.ceil(FINISH-S.distance))+' m',757,45);
g.restore();}
let last=0;function frame(now){const dt=Math.min(.035,(now-last)/1000||.016);last=now;step(dt);draw();requestAnimationFrame(frame);}
sync();overlay('PARK DASH','Four kids. One colorful running track. Race on foot, jump hurdles, collect stars, and sprint your way to the finish. No cars, no scooters — just sneakers!','START THE RACE');requestAnimationFrame(frame);
window.__parkDebug={S,reset,step,move,jump,finish};
})();