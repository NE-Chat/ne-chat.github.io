'use strict';
const entrance=document.querySelector('#entrance');
const archive=document.querySelector('#archive');
const book=document.querySelector('#open-book');
const canvas=document.querySelector('#magic');
const ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const status=document.querySelector('#status');
let phase='idle',began=0,raf=0,timers=[],W=0,H=0,scale=1;
const dust=Array.from({length:72},()=>({x:Math.random(),y:Math.random(),z:Math.random(),p:Math.random()*6.283,s:Math.random()}));
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
function setPhase(value){phase=value;entrance.dataset.phase=value;}
function clearTimers(){timers.forEach(clearTimeout);timers=[];}
function later(fn,ms){timers.push(setTimeout(fn,ms));}
function size(){W=entrance.clientWidth;H=entrance.clientHeight;scale=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*scale);canvas.height=Math.round(H*scale);if(ctx)ctx.setTransform(scale,0,0,scale,0,0);}
function sparkle(x,y,r,a,color='242,242,245'){
 ctx.globalAlpha=a;ctx.fillStyle=`rgb(${color})`;ctx.beginPath();ctx.moveTo(x,y-r*2);ctx.quadraticCurveTo(x+r*.25,y-r*.25,x+r*1.4,y);ctx.quadraticCurveTo(x+r*.25,y+r*.25,x,y+r*2);ctx.quadraticCurveTo(x-r*.25,y+r*.25,x-r*1.4,y);ctx.quadraticCurveTo(x-r*.25,y-r*.25,x,y-r*2);ctx.fill();ctx.globalAlpha=1;
}
function idle(t){
 const br=book.getBoundingClientRect();
 const er=entrance.getBoundingClientRect();
 const bx=br.left+br.width/2,by=br.top-er.top+br.height/2;
 for(let i=0;i<22;i++){const p=dust[i],x=bx+(p.x-.5)*br.width*1.8+Math.sin(t*.25+p.p)*8,y=by+(p.y-.5)*br.height*1.3-((t*3+p.p*8)%35);sparkle(x,y,.6+p.z,.12+Math.max(0,Math.sin(t*.7+p.p))*.35,i%4?'215,213,211':'246,246,250');}
 const g=ctx.createRadialGradient(bx,by,2,bx,by,br.width*.16);g.addColorStop(0,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(bx-br.width*.2,by-br.width*.2,br.width*.4,br.width*.4);
}
function ribbon(x,y,height,t,seed,alpha){
 const count=84,pts=[],dark=seed>3; ctx.save(); ctx.globalCompositeOperation=dark?'source-over':'lighter';
 for(let i=0;i<=count;i++){
  const s=i/count,angle=s*9.5-t*1.8+seed;
  const radius=(Math.pow(Math.sin(s*Math.PI),.8)*height*.22+height*.025*(1-s));
  const depth=Math.cos(angle);
  pts.push({x:x+Math.sin(angle)*radius+Math.sin(s*16+t+seed)*height*.012*s,y:y-s*height+depth*radius*.14,w:Math.pow(Math.sin(Math.PI*s),.7)*(height*.017)*(1+depth*.32)});
 }
 const gradient=ctx.createLinearGradient(x,y,x,y-height);
 gradient.addColorStop(0,dark?'#19191d':'#fff');gradient.addColorStop(.2,dark?'#09090d':'#e0dfe3');gradient.addColorStop(.55,dark?'#252429':'#fff');gradient.addColorStop(.82,dark?'#08080b':'#cfced2');gradient.addColorStop(1,dark?'#3a393e':'#fff');
 ctx.globalAlpha=dark?Math.min(1,alpha*1.7):alpha;ctx.shadowBlur=dark?7:16;ctx.shadowColor=dark?'#111116':'#fff';ctx.fillStyle=gradient;
 ctx.beginPath();pts.forEach((p,i)=>{const prev=pts[Math.max(0,i-1)],next=pts[Math.min(count,i+1)],dx=next.x-prev.x,dy=next.y-prev.y,len=Math.hypot(dx,dy)||1;const px=p.x-dy/len*p.w,py=p.y+dx/len*p.w;i?ctx.lineTo(px,py):ctx.moveTo(px,py)});
 for(let i=count;i>=0;i--){const p=pts[i],prev=pts[Math.max(0,i-1)],next=pts[Math.min(count,i+1)],dx=next.x-prev.x,dy=next.y-prev.y,len=Math.hypot(dx,dy)||1;ctx.lineTo(p.x+dy/len*p.w,p.y-dx/len*p.w)}ctx.closePath();ctx.fill();
 ctx.shadowBlur=dark?1:4;ctx.strokeStyle=dark?'#9d9ca4':'#fff';ctx.lineWidth=1.1;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x+p.w*.6,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.restore();
}
function magic(t,elapsed){
 const r=document.querySelector('.spine-glow').getBoundingClientRect();
 const er=entrance.getBoundingClientRect();
 const x=r.left+r.width*.5,y=r.top-er.top+r.height*.47;
 const grow=ease((elapsed-.8)/2.1),height=Math.min(H*.58,W*.85)*grow;
 const alpha=ease((elapsed-.7)/1.1);
 if(height<2)return;
 ctx.globalCompositeOperation='lighter';
 let g=ctx.createRadialGradient(x,y-height*.3,0,x,y-height*.3,height*.55);g.addColorStop(0,`rgba(230,230,235,${alpha*.15})`);g.addColorStop(.5,`rgba(210,210,216,${alpha*.08})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-height*.6,y-height*.9,height*1.2,height*1.2);
 // Light reflected on the desk under the book.
 ctx.save();ctx.translate(x,y+7);ctx.scale(1,.25);g=ctx.createRadialGradient(0,0,0,0,0,height*.48);g.addColorStop(0,`rgba(245,245,248,${alpha*.7})`);g.addColorStop(.3,`rgba(220,220,225,${alpha*.24})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(-height*.5,-height*.5,height,height);ctx.restore();
 // The crystal-like heart of the rising spell.
 ctx.globalAlpha=alpha*.75;g=ctx.createLinearGradient(x,y,x,y-height);g.addColorStop(0,'#eeeeee');g.addColorStop(.5,'#77767c');g.addColorStop(1,'#f8f8f8');ctx.fillStyle=g;ctx.shadowBlur=25;ctx.shadowColor='#e1e0e5';ctx.beginPath();ctx.moveTo(x,y-height);ctx.bezierCurveTo(x-height*.01,y-height*.65,x+height*.15,y-height*.49,x+height*.07,y-height*.3);ctx.quadraticCurveTo(x+height*.02,y-height*.12,x,y);ctx.quadraticCurveTo(x-height*.12,y-height*.23,x-height*.08,y-height*.45);ctx.quadraticCurveTo(x-height*.015,y-height*.66,x,y-height);ctx.fill();ctx.shadowBlur=0;ctx.globalAlpha=1;
 ribbon(x,y,height,t,1.8,alpha*.6);ribbon(x,y,height*.9,t+.35,4.9,alpha*.8);ribbon(x,y,height*.99,t,.25,alpha*.85);ribbon(x,y,height*.82,t+.4,3.6,alpha*.65);
 // Broad orbiting strokes at the foot of the rising ribbons.
 for(let i=0;i<3;i++){
  ctx.save();ctx.translate(x,y-height*.07);ctx.rotate(-.07);ctx.scale(1,.25);ctx.beginPath();ctx.ellipse(0,0,height*(.26+i*.05),height*(.26+i*.05),0,t*(i%2?-.9:1.1)+i*2,t*(i%2?-.9:1.1)+i*2+Math.PI*.95);ctx.strokeStyle=i===1?'#fff':'#b1b0b9';ctx.globalAlpha=alpha*(.6-i*.1);ctx.lineWidth=2.7;ctx.shadowBlur=12;ctx.shadowColor='#efeff3';ctx.stroke();ctx.restore();
 }
 ctx.shadowBlur=0;ctx.globalAlpha=1;
 for(let i=0;i<dust.length;i++){
  const p=dust[i],u=(p.y+elapsed*(.13+p.s*.13))%1;
  const spread=height*(.08+u*.32),px=x+Math.sin(p.p+t*(.2+p.s*.5))*spread+(p.x-.5)*spread*.7,py=y-u*height*1.17;
  const a=alpha*Math.sin(u*Math.PI)*(.3+.7*Math.abs(Math.sin(t*1.5+p.p)));
  ctx.globalCompositeOperation=i%2?'lighter':'source-over';
  if(i%4===0)sparkle(px,py,1+p.z*2.1,a);else{ctx.globalAlpha=a;ctx.fillStyle=i%2?'#f3f2f6':'#151419';ctx.beginPath();ctx.arc(px,py,.6+p.z,0,Math.PI*2);ctx.fill();}
 }
 ctx.globalAlpha=alpha*.75;ctx.strokeStyle='#e7e7eb';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-height*.24,y-height*.72);ctx.lineTo(x+height*.24,y-height*.72);ctx.stroke();sparkle(x,y-height*.72,6,alpha*.85);
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function frame(now){
 raf=0;if(phase==='done'||document.hidden||reduced.matches||!ctx)return;
 ctx.clearRect(0,0,W,H);const t=now/1000;
 if(phase==='idle')idle(t);else magic(t,(now-began)/1000);
 raf=requestAnimationFrame(frame);
}
function startFrames(){if(!raf&&!document.hidden&&!reduced.matches&&ctx)raf=requestAnimationFrame(frame);}
function enter(){
 if(phase==='done')return;clearTimers();setPhase('done');cancelAnimationFrame(raf);raf=0;
 entrance.hidden=true;archive.hidden=false;document.querySelector('#chapter-title').focus({preventScroll:true});window.scrollTo(0,0);status.textContent='도감에 입장했습니다.';
}
function openBook(){
 if(phase!=='idle')return;
 setPhase('opening');began=performance.now();book.disabled=true;entrance.classList.add('opening');status.textContent='책이 열리고 있습니다.';
 if(reduced.matches){later(enter,180);return;}
 later(()=>setPhase('magic'),2000);
 later(()=>{setPhase('entering');entrance.classList.add('entering')},5700);
 later(enter,6800);
}
function replay(){
 clearTimers();archive.hidden=true;entrance.hidden=false;entrance.classList.remove('opening','entering');setPhase('idle');book.disabled=false;window.scrollTo(0,0);size();startFrames();book.focus({preventScroll:true});status.textContent='책을 눌러 입장 연출을 다시 볼 수 있습니다.';
}
book.addEventListener('click',openBook);
document.querySelector('#skip').addEventListener('click',enter);
document.querySelector('#replay').addEventListener('click',replay);
window.addEventListener('resize',size,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else startFrames()});
reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(raf);raf=0;if(ctx)ctx.clearRect(0,0,W,H);if(phase!=='idle'&&phase!=='done')enter()}else startFrames()});
const chapters={world:['CHAPTER Ⅰ · WORLD','세계관','이 세계가 시작된 이야기, 그리고 그 안의 규칙들.','세계의 배경과 역사를 담을 공간입니다.\n아직 등록된 세계관이 없습니다.','01'],characters:['CHAPTER Ⅱ · CHARACTERS','캐릭터','각자의 이야기를 품고, 이 세계를 살아가는 인물들.','캐릭터의 이미지와 설정을 담을 공간입니다.\n아직 등록된 캐릭터가 없습니다.','02'],places:['CHAPTER Ⅲ · PLACES','장소','이야기가 시작되고, 인연이 머물렀던 공간들.','주요 장소의 풍경과 설명을 담을 공간입니다.\n아직 등록된 장소가 없습니다.','03']};
document.querySelectorAll('.chapter').forEach(b=>b.addEventListener('click',()=>{
 const c=chapters[b.dataset.chapter];document.querySelectorAll('.chapter').forEach(n=>{n.classList.toggle('selected',n===b);n===b?n.setAttribute('aria-current','page'):n.removeAttribute('aria-current')});
 document.querySelector('#chapter-label').textContent=c[0];document.querySelector('#chapter-title').textContent=c[1];document.querySelector('#chapter-intro').textContent=c[2];document.querySelector('#empty-copy').textContent=c[3];document.querySelector('#empty-copy').style.whiteSpace='pre-line';document.querySelector('#page-number').textContent='— '+c[4]+' —';document.querySelector('#chapter-title').focus({preventScroll:true});
}));
setPhase('idle');size();startFrames();
