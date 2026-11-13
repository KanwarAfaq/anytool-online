/* MOONLIT GROVE — original fantasy survival arena / twin-stick spellcaster. */
(() => {
 'use strict';
 const c=document.getElementById('game'),g=c.getContext('2d',{alpha:false}),W=960,H=600,T=Math.PI*2;
 const $=id=>document.getElementById(id),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),rr=(a,b)=>a+Math.random()*(b-a);
 const S={mode:'ready',t:0,score:0,best:0,wave:1,health:100,mana:100,kills:0,spawn:1.2,flash:0,shake:0,x:480,y:310,inv:0,dash:0,dashCool:0,cool:0,aim:{x:650,y:310},enemies:[],bullets:[],motes:[],pickups:[],keys:{},finger:null,muted:false};
 try{S.best=Number((localStorage.getItem('kanwar-arcade:best:moonlit-grove')||localStorage.getItem('arcade-grove-best')))||0;S.muted=localStorage.getItem('arcade-grove-mute')==='1';}catch{}
 const ac=window.AudioContext||window.webkitAudioContext;let audio=null;
 function beep(f=440,d=.1,type='sine',vol=.045,to=0){if(S.muted||!ac)return;try{audio=audio||new ac();if(audio.state==='suspended')audio.resume();let o=audio.createOscillator(),v=audio.createGain(),t=audio.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);v.gain.setValueAtTime(vol,t);v.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(v).connect(audio.destination);o.start(t);o.stop(t+d+.02);}catch{}}
 function poly(points,color){g.fillStyle=color;g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();}
 function halo(x,y,r,color,a=1){g.save();g.globalAlpha=a;const grad=g.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,color);grad.addColorStop(1,'transparent');g.fillStyle=grad;g.fillRect(x-r,y-r,r*2,r*2);g.restore();}
 function text(str,x,y,size=16,color='#effafa',align='left'){g.fillStyle=color;g.font='700 '+size+'px system-ui';g.textAlign=align;g.fillText(str,x,y);g.textAlign='left';}
 const shrubs=Array.from({length:100},()=>({x:rr(0,W),y:rr(0,H),s:rr(4,18),phase:rr(0,T)}));
 const stones=Array.from({length:14},(_,i)=>({x:rr(50,W-50),y:rr(55,H-55),s:rr(15,35),rot:rr(0,T)}));
 const lilies=Array.from({length:38},()=>({x:rr(20,W-20),y:rr(20,H-20),s:rr(2,7),phase:rr(0,T)}));
 function burst(x,y,color,n=12){for(let i=0;i<n;i++)S.motes.push({x,y,vx:rr(-160,160),vy:rr(-150,150),life:rr(.2,.85),max:.85,color,r:rr(1,4)});}
 function ui(){ $('score').textContent=Math.floor(S.score).toLocaleString();$('best').textContent=S.best.toLocaleString();$('wave').textContent=S.wave;$('kills').textContent=S.kills;$('health-bar').style.width=cl(S.health,0,100)+'%';$('mana-bar').style.width=cl(S.mana,0,100)+'%';$('health').textContent=Math.ceil(S.health);$('mana').textContent=Math.ceil(S.mana);$('sound').textContent=S.muted?'SOUND OFF':'SOUND ON';$('sound').setAttribute('aria-pressed',String(!S.muted));$('dash').textContent=S.dashCool>0?'DASH '+S.dashCool.toFixed(1):'DASH READY';}
 function overlay(title,desc,button){$('overlay').hidden=false;$('overlay-title').textContent=title;$('overlay-desc').textContent=desc;$('start').textContent=button;}
 function start(){Object.assign(S,{mode:'running',t:0,score:0,wave:1,health:100,mana:100,kills:0,spawn:1.2,flash:0,shake:0,x:480,y:310,inv:0,dash:0,dashCool:0,cool:0,enemies:[],bullets:[],motes:[],pickups:[],keys:{}});$('overlay').hidden=true;beep(440,.18,'triangle',.06,820);beep(650,.23,'triangle',.05,1100);ui();}
 function over(){S.mode='over';S.finger=null;S.keys={};if(S.score>S.best){S.best=Math.floor(S.score);try{localStorage.setItem('kanwar-arcade:best:moonlit-grove',String(S.best));}catch{}}beep(170,.4,'sawtooth',.09,48);overlay('THE GROVE REMEMBERS','You survived '+Math.floor(S.t)+' seconds, defeated '+S.kills+' shadows, and scored '+Math.floor(S.score).toLocaleString()+'. Return stronger.','RE-ENTER THE GROVE');ui();}
 function pause(){if(S.mode==='running'){S.mode='paused';overlay('THE FOREST RESTS','Your adventure is paused. The spirits await your return.','CONTINUE');}else if(S.mode==='paused'){S.mode='running';$('overlay').hidden=true;}}
 $('start').onclick=()=>S.mode==='paused'?pause():start();$('pause').onclick=pause;
 $('sound').onclick=()=>{S.muted=!S.muted;try{localStorage.setItem('arcade-grove-mute',S.muted?'1':'0');}catch{}if(!S.muted)beep(700);ui();};
 function dash(){if(S.mode!=='running'||S.dashCool>0)return;S.dash=.2;S.inv=.35;S.dashCool=3;burst(S.x,S.y,'#95f8ff',30);beep(170,.17,'sawtooth',.065,650);}
 $('dash').onclick=dash;$('mobile-dash').onclick=dash;
 window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Shift','w','a','s','d','p','Escape'].includes(e.key))e.preventDefault();S.keys[e.key.toLowerCase()]=true;if(e.repeat)return;if(e.key==='Escape'||e.key.toLowerCase()==='p')pause();if(e.key==='Shift'||e.key===' ')S.mode==='running'?dash():start();});
 window.addEventListener('keyup',e=>{S.keys[e.key.toLowerCase()]=false;});
 window.addEventListener('blur',()=>{S.keys={};if(S.mode==='running')pause();});
 function pointer(e){const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H};}
 c.addEventListener('pointermove',e=>{const p=pointer(e);S.aim=p;if(e.pointerType==='touch')S.finger=p;});
 c.addEventListener('pointerdown',e=>{const p=pointer(e);S.aim=p;if(e.pointerType==='touch'){S.finger=p;}if(S.mode==='ready')start();c.setPointerCapture?.(e.pointerId);});
 c.addEventListener('pointerup',()=>S.finger=null);c.addEventListener('pointercancel',()=>S.finger=null);
 function spawn(){const a=rr(0,T),r=rr(335,510),x=cl(480+Math.cos(a)*r,-40,1000),y=cl(300+Math.sin(a)*r,-40,640);const brute=Math.random()<.12+S.wave*.012;S.enemies.push({x,y,r:brute?25:16,hp:brute?4:2,speed:(brute?43:67)+Math.min(65,S.wave*4),type:brute?'warden':'wisp',phase:rr(0,T),hit:0});}
 function fire(){if(S.mana<5||S.cool>0)return;S.cool=.16;S.mana-=4;let dx=S.aim.x-S.x,dy=S.aim.y-S.y;let len=Math.hypot(dx,dy)||1;
 if(S.enemies.length&&len<25){let nearest=S.enemies.reduce((a,b)=>Math.hypot(b.x-S.x,b.y-S.y)<Math.hypot(a.x-S.x,a.y-S.y)?b:a);dx=nearest.x-S.x;dy=nearest.y-S.y;len=Math.hypot(dx,dy)||1;}
 dx/=len;dy/=len;S.bullets.push({x:S.x+dx*24,y:S.y+dy*24,vx:dx*540,vy:dy*540,life:.9,r:7,damage:1});burst(S.x+dx*21,S.y+dy*21,'#aaffeb',3);beep(510,.075,'triangle',.025,870);
 }
 function update(dt){
 S.t+=dt;S.flash=Math.max(0,S.flash-dt*3);S.shake=Math.max(0,S.shake-dt*25);
 S.motes.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;p.vx*=.98;p.vy*=.98;});S.motes=S.motes.filter(p=>p.life>0).slice(-190);
 if(S.mode!=='running')return;
 S.inv=Math.max(0,S.inv-dt);S.dash=Math.max(0,S.dash-dt);S.dashCool=Math.max(0,S.dashCool-dt);S.cool-=dt;
 const level=1+Math.floor(S.kills/12);if(level>S.wave){S.wave=level;S.health=cl(S.health+12,0,100);S.score+=500;burst(S.x,S.y,'#fff1a8',45);beep(490,.25,'triangle',.07,990);}
 let dx=(S.keys.d||S.keys.arrowright?1:0)-(S.keys.a||S.keys.arrowleft?1:0),dy=(S.keys.s||S.keys.arrowdown?1:0)-(S.keys.w||S.keys.arrowup?1:0);
 if(S.finger){dx=(S.finger.x-S.x)/65;dy=(S.finger.y-S.y)/65;const distance=Math.hypot(dx,dy);if(distance<.4){dx=0;dy=0;}}
 const magnitude=Math.hypot(dx,dy)||1;const move=S.dash>0?830:205;S.x=cl(S.x+dx/magnitude*move*dt,35,W-35);S.y=cl(S.y+dy/magnitude*move*dt,46,H-36);
 S.mana=cl(S.mana+17*dt,0,100);if(S.cool<=0)fire();
 S.spawn-=dt;if(S.spawn<=0){spawn();S.spawn=cl(1.05-S.wave*.065,.3,1.05);}
 for(const b of S.bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;for(const enemy of S.enemies){if(enemy.hp<=0)continue;if(Math.hypot(b.x-enemy.x,b.y-enemy.y)<b.r+enemy.r){enemy.hp-=b.damage;enemy.hit=.18;b.life=0;burst(b.x,b.y,'#aefbe5',6);if(enemy.hp<=0){S.kills++;S.score+=enemy.type==='warden'?250:100;burst(enemy.x,enemy.y,enemy.type==='warden'?'#ffbd7f':'#dc9aff',20);if(Math.random()<.2)S.pickups.push({x:enemy.x,y:enemy.y,t:0});beep(290,.11,'triangle',.03,540);}else beep(240,.07,'sine',.035,160);break;}}}
 S.bullets=S.bullets.filter(b=>b.life>0&&b.x>-50&&b.x<W+50&&b.y>-50&&b.y<H+50);
 for(const e of S.enemies){if(e.hp<=0)continue;e.phase+=dt*3;e.hit=Math.max(0,e.hit-dt);const ax=S.x-e.x,ay=S.y-e.y,len=Math.hypot(ax,ay)||1;e.x+=ax/len*e.speed*dt;e.y+=ay/len*e.speed*dt;
 if(len<e.r+17&&S.inv<=0){S.health-=e.type==='warden'?27:13;S.inv=.8;S.flash=.6;S.shake=12;burst(S.x,S.y,'#ff9bb9',19);beep(130,.35,'sawtooth',.07,50);if(S.health<=0){over();return;}}}
 S.enemies=S.enemies.filter(e=>e.hp>0).slice(-75);
 for(const p of S.pickups){p.t+=dt;if(Math.hypot(p.x-S.x,p.y-S.y)<29){S.health=cl(S.health+20,0,100);S.mana=cl(S.mana+20,0,100);p.used=true;burst(p.x,p.y,'#ffe9a2',16);beep(630,.15,'sine',.045,1050);}}
 S.pickups=S.pickups.filter(p=>!p.used);
 ui();
 }
 function ground(){
 const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#061e2e');bg.addColorStop(.4,'#10383d');bg.addColorStop(1,'#102036');g.fillStyle=bg;g.fillRect(0,0,W,H);
 halo(170,110,320,'#1f777a',.35);halo(770,490,330,'#23505d',.35);
 for(let i=0;i<12;i++){g.save();g.translate(480,300);g.rotate(i*T/12);g.strokeStyle='rgba(142,214,187,.085)';g.lineWidth=2;g.beginPath();g.arc(0,0,150+i*11,0,.17);g.stroke();g.restore();}
 // Sanctuary stone circle and glowing etched runes.
 g.strokeStyle='rgba(166,218,202,.19)';g.lineWidth=15;g.beginPath();g.ellipse(480,300,335,212,0,0,T);g.stroke();
 g.strokeStyle='rgba(131,255,219,.19)';g.lineWidth=2;g.beginPath();g.ellipse(480,300,324,204,0,0,T);g.stroke();
 for(let i=0;i<24;i++){const a=i*T/24,t=300+Math.sin(S.t*.9+i)*6;const x=480+Math.cos(a)*320,y=300+Math.sin(a)*200;halo(x,y,16,'#67e2b5',.35);text(['ᚢ','ᛟ','ᚹ','ᚷ'][i%4],x,y,14,'rgba(153,255,210,.52)','center');}
 for(let i=0;i<stones.length;i++){const s=stones[i];g.save();g.translate(s.x,s.y);g.rotate(s.rot);poly([[-s.s,0],[-s.s*.65,-s.s*.6],[s.s*.25,-s.s],[s.s,s.s*.35],[0,s.s*.6]],'#234d50');poly([[-s.s*.65,-s.s*.6],[s.s*.25,-s.s],[s.s,s.s*.35]],'#357073');g.restore();}
 for(const sh of shrubs){g.fillStyle='rgba(43,113,97,.32)';g.beginPath();g.ellipse(sh.x,sh.y,sh.s*1.4,sh.s*.5,sh.phase,0,T);g.fill();}
 for(const l of lilies){let a=.28+.3*Math.sin(S.t*2+l.phase);halo(l.x,l.y,28,'#4de6ae',a);g.fillStyle='rgba(181,255,211,'+(.25+a)+')';g.beginPath();g.arc(l.x,l.y,l.s*.45,0,T);g.fill();}
 for(let side of [0,W])for(let i=0;i<7;i++){const x=side+(side?-1:1)*rr(0,0),y=i*100-30;halo(x,y,120,'#064033',.65);g.fillStyle='#092e2e';g.beginPath();g.arc(x,y,55+(i%3)*17,0,T);g.fill();}
 }
 function player(){
 g.save();g.translate(S.x,S.y);const a=Math.atan2(S.aim.y-S.y,S.aim.x-S.x);g.rotate(a);
 halo(0,0,78,S.inv?'#fdc9f6':'#72ffcf',.32);g.fillStyle='rgba(0,10,15,.4)';g.beginPath();g.ellipse(0,18,27,12,0,0,T);g.fill();
 if(S.dash>0){for(let i=0;i<4;i++)halo(-i*30,0,36,'#75fdff',.18);}
 poly([[-26,-17],[-29,16],[-7,28],[19,17],[17,-15]],'#41558d');
 poly([[-8,-18],[14,-14],[23,5],[8,19],[-15,9]],'#b1f4ef');
 halo(0,0,29,'#b7fff7',.53);
 g.fillStyle='#173748';g.beginPath();g.arc(0,-3,12,0,T);g.fill();
 g.fillStyle='#ffd7bb';g.beginPath();g.arc(5,-4,8,0,T);g.fill();
 poly([[18,-7],[33,-3],[32,3],[18,7]],'#e2f8ff');halo(35,0,26,'#65fff0',.75);
 g.restore();
 }
 function enemy(e){
 g.save();g.translate(e.x,e.y+Math.sin(e.phase)*3);
 const brute=e.type==='warden',r=e.r;halo(0,0,r*3,brute?'#ed656e':'#b37eff',.29);
 g.fillStyle=brute?'#70415a':'#524b89';g.beginPath();g.ellipse(0,2,r,r*1.2,0,0,T);g.fill();
 poly([[-r,0],[-r*.5,-r*1.2],[0,-r*.66],[r*.5,-r*1.2],[r,0]],brute?'#db7a70':'#958add');
 g.fillStyle='#fff6fa';g.beginPath();g.ellipse(-r*.33,-3,r*.17,3,0,0,T);g.ellipse(r*.33,-3,r*.17,3,0,0,T);g.fill();
 if(e.hit){g.fillStyle='rgba(255,255,255,'+(e.hit*4)+')';g.beginPath();g.arc(0,0,r,0,T);g.fill();}
 g.restore();
 }
 function draw(){
 g.save();if(S.shake)g.translate(rr(-S.shake,S.shake),rr(-S.shake,S.shake));ground();
 for(const p of S.pickups){halo(p.x,p.y,32,'#ffef9c',.52);g.save();g.translate(p.x,p.y+Math.sin(p.t*4)*4);g.rotate(Math.PI/4);g.fillStyle='#fff3bd';g.fillRect(-8,-8,16,16);g.restore();}
 for(const b of S.bullets){halo(b.x,b.y,32,'#aaffdf',.65);g.fillStyle='#eefffa';g.beginPath();g.arc(b.x,b.y,b.r,0,T);g.fill();}
 for(const e of S.enemies)enemy(e);player();
 for(const m of S.motes){g.globalAlpha=cl(m.life/m.max,0,1);halo(m.x,m.y,14,m.color,.5);g.fillStyle=m.color;g.beginPath();g.arc(m.x,m.y,m.r,0,T);g.fill();}g.globalAlpha=1;
 if(S.flash){g.fillStyle='rgba(255,88,137,'+(S.flash*.23)+')';g.fillRect(0,0,W,H);}
 const v=g.createRadialGradient(480,290,180,480,290,600);v.addColorStop(0,'transparent');v.addColorStop(1,'rgba(0,7,22,.83)');g.fillStyle=v;g.fillRect(0,0,W,H);
 text('THE FORGOTTEN SANCTUARY',28,36,13,'#b7e4d7');text('SURVIVAL  '+Math.floor(S.t)+'s',930,36,13,'#d9faed','right');
 g.restore();
 }
 let last=0;function frame(now){const dt=Math.min(.035,(now-last)/1000||.016);last=now;update(dt);draw();requestAnimationFrame(frame);}
 ui();overlay('MOONLIT GROVE','Defend an enchanted sanctuary. Move with WASD, aim with your mouse, fire magical bolts automatically, and dash through danger.','ENTER THE GROVE');requestAnimationFrame(frame);
 window.__groveDebug={S,start,update,spawn,dash};
})();