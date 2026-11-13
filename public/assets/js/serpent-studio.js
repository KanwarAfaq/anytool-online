/* SERPENT STUDIO: customizable four-mode neon snake. */
(() => {'use strict';
const c=document.getElementById('game'),g=c.getContext('2d',{alpha:false}),W=960,H=600,N=22,STEP=23,OX=227,OY=46,TAU=Math.PI*2;
const $=id=>document.getElementById(id),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),r=(a,b)=>a+Math.random()*(b-a);
const colors={aurora:['#7ffff0','#1ab69c','#d5ffdc'],sakura:['#ffbbdf','#e56e9e','#fff0d5'],solar:['#ffe58a','#ee9b56','#fff3bb'],cosmic:['#baa7ff','#6f62e8','#ecddff']};
const S={mode:'ready',variant:'classic',difficulty:'normal',skin:'aurora',score:0,best:0,snake:[],prev:[],dir:{x:1,y:0},next:{x:1,y:0},food:null,bonus:null,rocks:[],particles:[],clock:0,t:0,tick:0,level:1,combo:0,flash:0,shake:0,muted:false,turnLocked:false};
const AC=window.AudioContext||window.webkitAudioContext;let audio;
try{S.variant=localStorage.getItem('studio-mode')||'classic';S.difficulty=localStorage.getItem('studio-difficulty')||'normal';S.skin=localStorage.getItem('studio-skin')||'aurora';S.muted=localStorage.getItem('studio-muted')==='1';}catch{}
if(!['classic','zen','sprint','maze'].includes(S.variant))S.variant='classic';
if(!['easy','normal','turbo'].includes(S.difficulty))S.difficulty='normal';
if(!colors[S.skin])S.skin='aurora';
$('variant').value=S.variant;$('difficulty').value=S.difficulty;$('skin').value=S.skin;
function tone(f=540,d=.14,kind='sine',volume=.045,to=0){if(S.muted||!AC)return;try{audio=audio||new AC();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),v=audio.createGain(),t=audio.currentTime;o.type=kind;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+d);v.gain.setValueAtTime(volume,t);v.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(v).connect(audio.destination);o.start(t);o.stop(t+d+.02);}catch{}}
function key(){return 'kanwar-arcade:best:serpent-studio:'+S.variant+':'+S.difficulty;}
function best(){try{return Number(localStorage.getItem(key()))||0;}catch{return 0;}}
function settings(){S.variant=$('variant').value;S.difficulty=$('difficulty').value;S.skin=$('skin').value;try{localStorage.setItem('studio-mode',S.variant);localStorage.setItem('studio-difficulty',S.difficulty);localStorage.setItem('studio-skin',S.skin);}catch{}S.best=best();sync();}
['variant','difficulty','skin'].forEach(id=>$(id).addEventListener('change',settings));
function sync(){$('score').textContent=S.score.toLocaleString();$('best').textContent=S.best.toLocaleString();$('length').textContent=S.snake.length||4;$('level').textContent=S.level;$('timer').textContent=S.variant==='sprint'?Math.max(0,90-S.clock).toFixed(1)+'s':'∞';$('sound').textContent=S.muted?'SOUND OFF':'SOUND ON';$('sound').setAttribute('aria-pressed',String(!S.muted));$('variant-label').textContent={classic:'CLASSIC',zen:'ZEN GARDEN',sprint:'90-SECOND SPRINT',maze:'MAZE QUEST'}[S.variant];}
function overlay(title,desc,label){$('overlay').hidden=false;$('overlay-title').textContent=title;$('overlay-desc').textContent=desc;$('start').textContent=label;}
function hide(){$('overlay').hidden=true;}
function occupied(x,y){return S.snake.some(p=>p.x===x&&p.y===y)||S.rocks.some(p=>p.x===x&&p.y===y)||(S.food&&S.food.x===x&&S.food.y===y);}
function place(){let spots=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!occupied(x,y))spots.push({x,y});return spots.length?spots[Math.floor(Math.random()*spots.length)]:null;}
function setupMaze(){S.rocks=[];if(S.variant!=='maze')return;for(let j=0;j<4;j++){const y=4+j*5, gap=2+j*5;for(let x=2;x<N-2;x++)if(Math.abs(x-gap)>2&&!(x>=8&&x<=13&&y>=8&&y<=13))S.rocks.push({x,y});}}
function reset(){settings();S.snake=[{x:10,y:11},{x:9,y:11},{x:8,y:11},{x:7,y:11}];S.prev=S.snake.map(p=>({...p}));S.dir={x:1,y:0};S.next={x:1,y:0};Object.assign(S,{mode:'running',score:0,clock:0,t:0,tick:0,level:1,combo:0,flash:0,shake:0,food:null,bonus:null,particles:[],turnLocked:false});setupMaze();S.food=place();S.best=best();['variant','difficulty','skin'].forEach(id=>$(id).disabled=true);hide();tone(480,.16,'triangle',.045,720);tone(780,.22,'triangle',.045,1080);sync();}
function finish(message){if(S.mode!=='running')return;S.mode='over';if(S.score>S.best){S.best=S.score;try{localStorage.setItem(key(),String(S.best));try{var ov=Number(localStorage.getItem('kanwar-arcade:best:serpent-studio'))||0;if(S.best>ov)localStorage.setItem('kanwar-arcade:best:serpent-studio',String(S.best));}catch{}const globalKey='kanwar-arcade:best:serpent-studio';const previous=Number(localStorage.getItem(globalKey))||0;if(S.best>previous)localStorage.setItem(globalKey,String(S.best));}catch{}}['variant','difficulty','skin'].forEach(id=>$(id).disabled=false);tone(190,.35,'sawtooth',.055,80);sync();overlay(message,'Score '+S.score+' · Length '+S.snake.length+' · '+S.variant.toUpperCase()+' mode. Try a new mode, speed, or snake style.','PLAY AGAIN');}
function pause(){if(S.mode==='running'){S.mode='paused';overlay('PAUSED','Your next move is ready when you are.','CONTINUE');}else if(S.mode==='paused'){S.mode='running';hide();}}
$('start').onclick=()=>S.mode==='paused'?pause():reset();$('pause').onclick=pause;
$('sound').onclick=()=>{S.muted=!S.muted;try{localStorage.setItem('studio-muted',S.muted?'1':'0');}catch{}if(!S.muted)tone(740);sync();};
function steer(x,y){if(S.mode!=='running'||S.turnLocked)return;if(x===-S.dir.x&&y===-S.dir.y)return;S.next={x,y};S.turnLocked=true;}
for(const [id,x,y] of [['up',0,-1],['down',0,1],['left',-1,0],['right',1,0]])$(id).addEventListener('pointerdown',e=>{e.preventDefault();steer(x,y);});
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase(),dirs={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]};if(dirs[k]||k===' '||k==='p'||k==='escape')e.preventDefault();if(dirs[k])steer(...dirs[k]);if(e.repeat)return;if(k==='p'||k==='escape')pause();if(k===' '&&S.mode!=='running')S.mode==='paused'?pause():reset();});
let touch=null;
c.addEventListener('pointerdown',e=>{touch={x:e.clientX,y:e.clientY};c.setPointerCapture?.(e.pointerId);});
c.addEventListener('pointerup',e=>{if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;if(Math.max(Math.abs(dx),Math.abs(dy))>18){if(Math.abs(dx)>Math.abs(dy))steer(Math.sign(dx),0);else steer(0,Math.sign(dy));}touch=null;});
window.addEventListener('blur',()=>{if(S.mode==='running')pause();});
function burst(x,y,col,n=14){for(let i=0;i<n;i++)S.particles.push({x,y,vx:r(-200,200),vy:r(-170,160),life:r(.3,.9),max:.9,c:col,size:r(2,5)});}
const sparkle=Array.from({length:110},()=>({x:r(0,W),y:r(0,H),size:r(.5,2),phase:r(0,TAU)}));
function xCell(x){return OX+x*STEP+STEP/2;}function yCell(y){return OY+y*STEP+STEP/2;}
function tick(){
S.prev=S.snake.map(p=>({...p}));S.dir={...S.next};S.turnLocked=false;
let x=S.snake[0].x+S.dir.x,y=S.snake[0].y+S.dir.y;
const wrap=S.variant==='zen';if(wrap){x=(x+N)%N;y=(y+N)%N;}else if(x<0||x>=N||y<0||y>=N){finish('OUT OF BOUNDS');return;}
const food=S.food&&x===S.food.x&&y===S.food.y,bonus=S.bonus&&x===S.bonus.x&&y===S.bonus.y;
const body=S.snake.slice(0,food||bonus?undefined:-1);
if(body.some(p=>p.x===x&&p.y===y)||S.rocks.some(p=>p.x===x&&p.y===y)){if(S.variant==='zen'){S.score=Math.max(0,S.score-70);S.combo=0;tone(150,.18,'sawtooth',.045,80);S.next={x:1,y:0};S.dir={x:1,y:0};S.snake=[{x:10,y:11},{x:9,y:11},{x:8,y:11},{x:7,y:11}];S.prev=S.snake.map(p=>({...p}));S.food=place();return;}finish('GAME OVER');return;}
S.snake.unshift({x,y});if(!food&&!bonus)S.snake.pop();
if(food){S.combo++;S.score+=(100+Math.min(S.combo,5)*25)*(S.difficulty==='turbo'?2:1);S.level=1+Math.floor((S.snake.length-4)/5);S.food=null;S.food=place();if(!S.food){finish('BOARD CLEARED!');return;}burst(xCell(x),yCell(y),colors[S.skin][2],20);tone(680,.14,'sine',.06,1180);if(S.combo%4===0&&!S.bonus)S.bonus=place();}
if(bonus){S.bonus=null;S.score+=420;burst(xCell(x),yCell(y),'#ffe89d',27);tone(880,.25,'triangle',.055,1500);}
if(S.score>S.best){S.best=S.score;try{localStorage.setItem(key(),String(S.best));try{var ov=Number(localStorage.getItem('kanwar-arcade:best:serpent-studio'))||0;if(S.best>ov)localStorage.setItem('kanwar-arcade:best:serpent-studio',String(S.best));}catch{}const globalKey='kanwar-arcade:best:serpent-studio';const previous=Number(localStorage.getItem(globalKey))||0;if(S.best>previous)localStorage.setItem(globalKey,String(S.best));}catch{}}sync();
}
function update(dt){S.t+=dt;S.flash=Math.max(0,S.flash-dt*3);S.shake=Math.max(0,S.shake-dt*22);for(const p of S.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;p.vx*=.98;p.vy*=.98;}S.particles=S.particles.filter(p=>p.life>0).slice(-170);
if(S.mode!=='running')return;
S.clock+=dt;if(S.variant==='sprint'&&S.clock>=90){S.clock=90;finish('TIME IS UP!');return;}
const base={easy:.19,normal:.135,turbo:.095}[S.difficulty],speed=Math.max(.065,base-(S.level-1)*.006);
S.tick+=dt;let steps=0;while(S.tick>=speed&&steps++<3&&S.mode==='running'){S.tick-=speed;tick();}
sync();}
function orb(x,y,r,col,a=1){g.save();g.globalAlpha=a;const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,col);q.addColorStop(1,'transparent');g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);g.restore();}
function rect(x,y,w,h,r,c){g.fillStyle=c;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();}
function star(x,y,rr,col){let pts=[];for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,v=i%2?rr*.44:rr;pts.push([x+Math.cos(a)*v,y+Math.sin(a)*v]);}g.fillStyle=col;g.beginPath();pts.forEach(([a,b],i)=>i?g.lineTo(a,b):g.moveTo(a,b));g.closePath();g.fill();}
function render(){
let bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#070e26');bg.addColorStop(.55,'#161b40');bg.addColorStop(1,'#211e43');g.fillStyle=bg;g.fillRect(0,0,W,H);
for(const p of sparkle){g.fillStyle='rgba(179,225,255,'+(.2+.25*Math.sin(S.t*2+p.phase))+')';g.fillRect(p.x,p.y,p.size,p.size);}
orb(120,110,200,'#7b47ed',.14);orb(850,500,240,'#16baa6',.15);
rect(OX-11,OY-11,N*STEP+22,N*STEP+22,28,'#1d315b');rect(OX-5,OY-5,N*STEP+10,N*STEP+10,24,'#0d1632');
const grid=g.createLinearGradient(OX,OY,OX+N*STEP,OY+N*STEP);grid.addColorStop(0,'#122b47');grid.addColorStop(1,'#15233d');g.fillStyle=grid;g.fillRect(OX,OY,N*STEP,N*STEP);
g.strokeStyle='#8de8ee17';g.lineWidth=1;g.beginPath();for(let i=0;i<=N;i++){g.moveTo(OX+i*STEP,OY);g.lineTo(OX+i*STEP,OY+N*STEP);g.moveTo(OX,OY+i*STEP);g.lineTo(OX+N*STEP,OY+i*STEP);}g.stroke();
for(let i=0;i<6;i++){let a=S.t*.3+i*TAU/6;orb(OX+(N*STEP)/2+Math.cos(a)*230,OY+(N*STEP)/2+Math.sin(a)*230,80,'#2f78ba',.09);}
for(const rock of S.rocks){const x=xCell(rock.x),y=yCell(rock.y);rect(x-10,y-10,20,20,5,'#59729a');rect(x-7,y-9,13,9,3,'#96b8ca');orb(x,y,25,'#80a2c4',.16);}
if(S.food){const x=xCell(S.food.x),y=yCell(S.food.y),r=9+Math.sin(S.t*5)*1.8;orb(x,y,35,'#ff9fb7',.55);g.fillStyle='#ff7d9e';g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.fillStyle='#fff2d9';g.beginPath();g.arc(x-3,y-3,3,0,TAU);g.fill();g.strokeStyle='#95edb5';g.lineWidth=3;g.beginPath();g.moveTo(x,y-8);g.lineTo(x+5,y-15);g.stroke();}
if(S.bonus){const x=xCell(S.bonus.x),y=yCell(S.bonus.y);orb(x,y,40,'#ffe68f',.6);star(x,y,12+Math.sin(S.t*4)*2,'#fff1ad');}
if(S.snake.length){const palette=colors[S.skin];let interp=cl(S.tick/({easy:.19,normal:.135,turbo:.095}[S.difficulty]),0,1);
for(let i=S.snake.length-1;i>=0;i--){const p=S.snake[i],previous=S.prev[i]||p;let x=previous.x+(p.x-previous.x)*interp,y=previous.y+(p.y-previous.y)*interp;
if(Math.abs(p.x-previous.x)>1)x=p.x;if(Math.abs(p.y-previous.y)>1)y=p.y;
const cx=xCell(x),cy=yCell(y),head=i===0,sz=head?10:Math.max(6.5,9.1-i*.09);
orb(cx,cy,head?32:25,palette[0],head?.4:.2);rect(cx-sz,cy-sz,sz*2,sz*2,head?9:7,head?palette[0]:i%3===0?palette[1]:palette[0]);
if(head){const dx=S.dir.x,dy=S.dir.y;for(const side of [-1,1]){const ex=cx+dx*4+(dy?side*4:0),ey=cy+dy*4+(dx?side*4:0);g.fillStyle='#172343';g.beginPath();g.arc(ex,ey,2.1,0,TAU);g.fill();}g.fillStyle='#fff';g.fillRect(cx-dy*3+dx*7,cy+dx*3+dy*7,3,3);}
}}
for(const p of S.particles){g.globalAlpha=cl(p.life/p.max,0,1);orb(p.x,p.y,17,p.c,.55);g.fillStyle=p.c;g.fillRect(p.x,p.y,p.size,p.size);}g.globalAlpha=1;
g.fillStyle='#c7ecf5';g.font='800 14px system-ui';g.fillText('SERPENT STUDIO  /  '+S.variant.toUpperCase(),28,38);g.font='600 12px system-ui';g.fillStyle='#88a7c6';g.fillText('4 MODES · 3 SPEEDS · 4 SKINS',30,61);
g.textAlign='right';g.fillStyle='#bed9ed';g.fillText('GROW  •  GLOW  •  SURVIVE',920,38);g.textAlign='left';
if(S.variant==='sprint'){const left=90-S.clock;rect(30,85,120,6,3,'#394862');rect(30,85,120*cl(left/90,0,1),6,3,left<15?'#ff799a':'#7bffda');}
}
let last=0;function frame(now){const dt=Math.min(.04,(now-last)/1000||.016);last=now;update(dt);render();requestAnimationFrame(frame);}
settings();sync();overlay('SERPENT STUDIO','Choose a mode, your speed, and your snake color. Classic, wall-free Zen, timed Sprint, or challenging Maze — four different ways to play.','START GAME');requestAnimationFrame(frame);
window.__serpentDebug={S,reset,update,tick,steer,finish};
})();