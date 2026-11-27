'use strict';
const entrance=document.querySelector('#entrance'),archive=document.querySelector('#archive'),book=document.querySelector('#open-book'),canvas=document.querySelector('#magic'),status=document.querySelector('#status');
const openAction=document.querySelector('#open-action'),enterAction=document.querySelector('#enter');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let phase='idle',began=0,raf=0,timers=[],view={width:0,height:0};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const later=(f,ms)=>timers.push(setTimeout(f,ms));
function clearTimers(){timers.forEach(clearTimeout);timers=[];}
function setPhase(value){phase=value;entrance.dataset.phase=value;}

// Textured smoke parcels rise, spread and rotate independently without a loop reset.
const ctx=canvas.getContext('2d',{alpha:true});
const smokeImage=new Image();smokeImage.src='smoke.webp';let darkSmoke=null;
smokeImage.onload=()=>{
 darkSmoke=document.createElement('canvas');darkSmoke.width=smokeImage.width;darkSmoke.height=smokeImage.height;
 const d=darkSmoke.getContext('2d');d.drawImage(smokeImage,0,0);d.globalCompositeOperation='source-atop';d.fillStyle='rgba(0,0,0,.96)';d.fillRect(0,0,darkSmoke.width,darkSmoke.height);
 if(reduced.matches&&phase==='open')draw(began+3500);
};
const parcels=Array.from({length:84},(_,i)=>({seed:i*2.399963,offset:Math.floor(i/2)/42,side:i%2,speed:i%2?.073:.069}));
function size(){
 if(entrance.hidden)return;
 const W=entrance.clientWidth,H=entrance.clientHeight,spread=document.querySelector('#spread');
 const x=W*.5,y=spread.offsetTop+spread.offsetHeight*.35;
 const h=Math.min(y-H*.035,H*.69,W*1.16),w=Math.min(W*.98,h*1.2);
 view={width:w,height:h,x:x-w/2,y:y-h+6};
 Object.assign(canvas.style,{left:view.x+'px',top:view.y+'px',width:w+'px',height:h+'px'});
 const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));
 if(ctx)ctx.setTransform(dpr,0,0,dpr,0,0);
}
function draw(now){
 if(!ctx)return;
 const elapsed=(now-began)/1000,strength=clamp((elapsed-.8)/2.4),t=now/1000;
 ctx.clearRect(0,0,view.width,view.height);
 if(!smokeImage.complete||!smokeImage.naturalWidth||!darkSmoke)return;
 for(const p of parcels){
  const age=(t*p.speed+p.offset)%1;
  const growth=clamp((elapsed-1)/3.3);if(age>growth)continue;
  const s=p.side?1:-1;
  const wave=Math.sin(age*8-t*.44+p.side*2.6),curl=Math.sin(age*14+t*.3+p.seed);
  const x=view.width*.5+wave*view.width*(.01+.055*age)+s*view.width*(.025+.13*Math.sin(age*3.2+t*.22))+curl*view.width*.012*age;
  const y=view.height*(.97-age*.86);
  const r=view.height*(.035+.18*Math.pow(age,.8))*(.9+.18*Math.sin(p.seed));
  const fade=Math.pow(Math.sin(age*Math.PI),1.15)*strength*(1-clamp((age-.72)/.28));
  ctx.save();ctx.translate(x,y);ctx.rotate(p.seed+s*t*(.035+.025*age));ctx.scale(1,1.22);
  ctx.globalAlpha=fade*(p.side?.25:.16);ctx.drawImage(p.side?smokeImage:darkSmoke,-r,-r,r*2,r*2);ctx.restore();
 }
 // A little reflected light at the gutter, with restrained rising dust.
 const glow=ctx.createRadialGradient(view.width/2,view.height*.96,0,view.width/2,view.height*.96,view.width*.11);
 glow.addColorStop(0,`rgba(255,250,240,${strength*.12})`);glow.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=glow;ctx.fillRect(0,view.height*.8,view.width,view.height*.2);
 for(let i=0;i<16;i++){const u=(t*(.035+i*.001)+i*.173)%1,x=view.width/2+Math.sin(i*1.71+t*.22)*view.width*(.04+u*.25),y=view.height*(1-u*.91);ctx.globalAlpha=Math.sin(u*Math.PI)*strength*.35;ctx.fillStyle=i%3?'#e6e1d9':'#08080a';ctx.beginPath();ctx.arc(x,y,.5+(i%3)*.35,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
}
function frame(now){raf=0;if(phase==='idle'||phase==='done'||document.hidden||reduced.matches)return;draw(now);raf=requestAnimationFrame(frame);}
function startFrames(){if(!raf&&!document.hidden&&!reduced.matches&&phase!=='idle'&&phase!=='done')raf=requestAnimationFrame(frame);}
function enter(){
 if(phase==='done')return;clearTimers();setPhase('done');cancelAnimationFrame(raf);raf=0;entrance.hidden=true;archive.hidden=false;document.querySelector('#chapter-title').focus({preventScroll:true});window.scrollTo(0,0);status.textContent='도감에 입장했습니다.';
}
function transitionIn(){if(phase!=='open')return;setPhase('entering');entrance.classList.add('entering');enterAction.disabled=true;later(enter,reduced.matches?0:700);}
function openBook(){
 if(phase!=='idle')return;setPhase('opening');began=performance.now();book.disabled=true;openAction.disabled=true;entrance.classList.add('opening');status.textContent='책이 열리고 있습니다.';size();startFrames();
 later(()=>{setPhase('open');openAction.hidden=true;enterAction.hidden=false;enterAction.disabled=false;book.tabIndex=-1;status.textContent='책을 펼쳤습니다. 입장 버튼을 누르면 도감으로 이동합니다.';size();if(reduced.matches)draw(began+3500);},reduced.matches?0:2100);
}
function replay(){
 clearTimers();archive.hidden=true;entrance.hidden=false;entrance.classList.remove('opening','entering');setPhase('idle');book.disabled=false;book.tabIndex=0;openAction.disabled=false;openAction.hidden=false;enterAction.hidden=true;enterAction.disabled=false;if(ctx)ctx.clearRect(0,0,view.width,view.height);window.scrollTo(0,0);size();book.focus({preventScroll:true});status.textContent='책을 다시 펼칠 수 있습니다.';
}
book.addEventListener('click',openBook);openAction.addEventListener('click',openBook);enterAction.addEventListener('click',transitionIn);document.querySelector('#skip').addEventListener('click',enter);document.querySelector('#replay').addEventListener('click',replay);
window.addEventListener('resize',size,{passive:true});
new ResizeObserver(size).observe(entrance);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else startFrames();});
reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(raf);raf=0;if(phase==='open'||phase==='opening')draw(began+3500);}else startFrames();});
entrance.dataset.renderer='textured-canvas';setPhase('idle');size();

const chapters={world:['CHAPTER Ⅰ · WORLD','세계관','이 세계가 시작된 이야기, 그리고 그 안의 규칙들.','세계의 배경과 역사를 담을 공간입니다.\n아직 등록된 세계관이 없습니다.','01'],characters:['CHAPTER Ⅱ · CHARACTERS','캐릭터','각자의 이야기를 품고, 이 세계를 살아가는 인물들.','캐릭터의 이미지와 설정을 담을 공간입니다.\n아직 등록된 캐릭터가 없습니다.','02'],places:['CHAPTER Ⅲ · PLACES','장소','이야기가 시작되고, 인연이 머물렀던 공간들.','주요 장소의 풍경과 설명을 담을 공간입니다.\n아직 등록된 장소가 없습니다.','03']};
document.querySelectorAll('.chapter').forEach(b=>b.addEventListener('click',()=>{
 const c=chapters[b.dataset.chapter];document.querySelectorAll('.chapter').forEach(n=>{n.classList.toggle('selected',n===b);n===b?n.setAttribute('aria-current','page'):n.removeAttribute('aria-current')});
 document.querySelector('#chapter-label').textContent=c[0];document.querySelector('#chapter-title').textContent=c[1];document.querySelector('#chapter-intro').textContent=c[2];document.querySelector('#empty-copy').textContent=c[3];document.querySelector('#empty-copy').style.whiteSpace='pre-line';document.querySelector('#page-number').textContent='— '+c[4]+' —';document.querySelector('#chapter-title').focus({preventScroll:true});
}));
