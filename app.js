import {catalog} from './characters.js?v=ne-codex-3';
import {CATEGORIES,buildPages,categoriesOf,nextPosition,previousPosition,gridMetrics} from './catalog-core.mjs';
'use strict';
const entrance=document.querySelector('#entrance'),archive=document.querySelector('#archive'),book=document.querySelector('#open-book'),canvas=document.querySelector('#magic'),status=document.querySelector('#status');
const openAction=document.querySelector('#open-action');
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
let currentCategory='all',pagePosition=0;
const singlePage=matchMedia('(max-width:700px)');
const categories=document.querySelector('#categories'),pagesElement=document.querySelector('#pages'),reader=document.querySelector('#reader');
const previousButton=document.querySelector('#previous'),nextButton=document.querySelector('#next');
const dialog=document.querySelector('#character-dialog');
let allPages=buildPages(catalog.characters),layoutFrame=0;
const labels=Object.fromEntries(CATEGORIES);
const node=(tag,classes,text)=>{const n=document.createElement(tag);if(classes)n.className=classes;if(text!==undefined)n.textContent=text;return n;};
const ornament=classes=>{const img=node('img',classes);img.src='ornament.svg';img.alt='';return img;};
function safeURL(value){if(!value)return '';try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}}
function makeCard(character){
 const button=node('button','character-card');button.type='button';button.setAttribute('aria-label',character.name||'캐릭터');
 const frame=node('span','portrait-frame'),name=node('span','character-name',character.name||'');
 const src=safeURL(character.image);
 if(src){const img=node('img');img.src=src;img.alt=character.name||'';img.loading='lazy';img.decoding='async';img.style.objectPosition=character.position||'50% 50%';frame.append(img);img.addEventListener('error',()=>{img.hidden=true;frame.append(node('span','portrait-empty','◇'));},{once:true});}
 else frame.append(node('span','portrait-empty','◇'));
 button.append(frame,name);button.addEventListener('click',()=>showCharacter(character));return button;
}
function makePage(page,index,side){
 const sheet=node('section','paper-page '+side);sheet.setAttribute('aria-label',`${index+1}페이지`);sheet.dataset.page=String(index+1);sheet.dataset.kind=page.type;
 const content=node('div','page-content');sheet.append(content);
 if(page.type==='front'){
  content.classList.add('front-page');content.append(ornament('front-mark'),node('div','monogram','NE'),node('div','title-rule'),node('div','front-mobile','도감'));
 }else if(page.type==='title'){
  content.classList.add('title-page');content.append(ornament('title-ornament'),node('h1','book-title','도감'),node('div','title-rule'));
 }else if(page.type==='world'){
  content.classList.add('world-page');content.append(node('h1','page-heading','세계관'),ornament('world-ornament'),node('h2','world-name',labels[currentCategory]));
  const description=catalog.worlds?.[currentCategory];if(description)content.append(node('p','world-copy',description));
 }else if(page.type==='characters'){
  content.classList.add('catalog-page');content.append(node('h2','catalog-heading',labels[currentCategory]));const grid=node('div','character-grid');grid.setAttribute('aria-label','캐릭터 목록');
  page.items.forEach(character=>grid.append(makeCard(character)));content.append(grid);
 }
 if(page.type!=='front'&&page.type!=='title')sheet.append(node('span','page-number',String(index+1).padStart(2,'0')));
 return sheet;
}
const gridObserver=new ResizeObserver(()=>scheduleLayout());
function scheduleLayout(){if(layoutFrame)return;layoutFrame=requestAnimationFrame(()=>{layoutFrame=0;document.querySelectorAll('.character-grid').forEach(grid=>{const m=gridMetrics(grid.clientWidth,grid.clientHeight,singlePage.matches);grid.style.setProperty('--cols',m.columns);grid.style.setProperty('--card-w',m.cardWidth.toFixed(2)+'px');grid.style.setProperty('--gap',m.gap.toFixed(2)+'px');grid.style.setProperty('--label',m.label.toFixed(2)+'px');});});}
function lastPosition(){let count=allPages.length;if(singlePage.matches&&allPages[count-1].type==='blank')count--;return singlePage.matches?count-1:Math.floor((count-1)/2)*2;}
function renderArchive(direction=0){
 allPages=buildPages(catalog.characters,currentCategory);if(!singlePage.matches)pagePosition=Math.floor(pagePosition/2)*2;pagePosition=Math.max(0,Math.min(pagePosition,lastPosition()));
 gridObserver.disconnect();pagesElement.replaceChildren();
 const visible=singlePage.matches?1:2;for(let i=0;i<visible;i++){const index=pagePosition+i;if(allPages[index])pagesElement.append(makePage(allPages[index],index,i?'right':'left'));}
 pagesElement.classList.remove('turn-forward','turn-back');if(direction){void pagesElement.offsetWidth;pagesElement.classList.add(direction>0?'turn-forward':'turn-back');}
 previousButton.disabled=pagePosition===0;nextButton.disabled=nextPosition(pagePosition,currentCategory,singlePage.matches)>lastPosition();
 const number=n=>String(n).padStart(2,'0');document.querySelector('#pagination').textContent=currentCategory==='all'&&pagePosition===0?'':singlePage.matches?number(pagePosition+1):`${number(pagePosition+1)} — ${number(pagePosition+2)}`;
 document.querySelectorAll('.category-tab').forEach(tab=>tab.setAttribute('aria-pressed',String(tab.dataset.category===currentCategory)));
 document.querySelectorAll('.character-grid').forEach(grid=>gridObserver.observe(grid));scheduleLayout();
}
// Keep category controls usable as conventional buttons with no hidden navigation.
for(const [id,label] of CATEGORIES){const button=node('button','category-tab',label);button.type='button';button.dataset.category=id;button.setAttribute('aria-pressed',String(id==='all'));button.addEventListener('click',()=>{currentCategory=id;pagePosition=id==='all'?2:0;renderArchive(1);status.textContent=`${label} 도감`});categories.append(button);}
function turn(direction){if(direction>0&&nextButton.disabled||direction<0&&previousButton.disabled)return;pagePosition=direction>0?nextPosition(pagePosition,currentCategory,singlePage.matches):previousPosition(pagePosition,currentCategory,singlePage.matches);renderArchive(direction);status.textContent=`${pagePosition+1}페이지`;}
previousButton.addEventListener('click',()=>turn(-1));nextButton.addEventListener('click',()=>turn(1));
document.querySelector('#home').addEventListener('click',()=>{currentCategory='all';pagePosition=0;renderArchive(-1);});
document.addEventListener('keydown',event=>{if(archive.hidden||dialog.open||event.target.closest('input,textarea,select'))return;if(event.key==='ArrowRight'){event.preventDefault();turn(1);}if(event.key==='ArrowLeft'){event.preventDefault();turn(-1);}});
singlePage.addEventListener('change',()=>{if(!archive.hidden)renderArchive();});window.addEventListener('resize',scheduleLayout,{passive:true});
function showCharacter(character){
 const image=document.querySelector('#character-image');image.src=safeURL(character.image);image.alt=character.name||'';image.style.objectPosition=character.position||'50% 50%';image.parentElement.hidden=!safeURL(character.image);
 document.querySelector('#character-name').textContent=character.name||'';document.querySelector('#character-category').textContent=categoriesOf(character).map(c=>labels[c]).join(' · ');
 const description=document.querySelector('#character-description');description.textContent=character.description||'';description.hidden=!character.description;
 const link=document.querySelector('#character-link'),url=safeURL(character.url);link.hidden=!url;link.href=url||'#';link.setAttribute('aria-label',`${character.name||'캐릭터'} 링크 열기`);
 dialog.showModal();
}
document.querySelector('#close-character').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});

function enter(){
 if(phase==='done')return;clearTimers();setPhase('done');cancelAnimationFrame(raf);raf=0;entrance.hidden=true;archive.hidden=false;currentCategory='all';pagePosition=0;renderArchive();reader.focus({preventScroll:true});status.textContent='NE 도감';
}
function openBook(){
 if(phase!=='idle')return;setPhase('opening');began=performance.now();book.disabled=true;openAction.disabled=true;entrance.classList.add('opening');status.textContent='책이 열리고 있습니다.';size();startFrames();
 if(reduced.matches){enter();return;}
 later(()=>{setPhase('open');openAction.hidden=true;book.tabIndex=-1;size();},2100);
 later(()=>{setPhase('zooming');entrance.classList.add('zooming');},4200);
 later(enter,5750);
}
function replay(){
 clearTimers();archive.hidden=true;entrance.hidden=false;entrance.classList.remove('opening','zooming');setPhase('idle');book.disabled=false;book.tabIndex=0;openAction.disabled=false;openAction.hidden=false;if(ctx)ctx.clearRect(0,0,view.width,view.height);size();book.focus({preventScroll:true});status.textContent='책 펼치기';
}
book.addEventListener('click',openBook);openAction.addEventListener('click',openBook);document.querySelector('#skip').addEventListener('click',enter);document.querySelector('#replay').addEventListener('click',replay);
window.addEventListener('resize',size,{passive:true});new ResizeObserver(size).observe(entrance);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else startFrames();});
reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(raf);raf=0;if(phase!=='idle'&&phase!=='done')enter();}else startFrames();});
entrance.dataset.renderer='textured-canvas';setPhase('idle');size();
