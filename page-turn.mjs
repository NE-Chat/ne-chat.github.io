// A leaf is divided into articulated paper strips. Each strip has a front and
// a back; their shared edges follow the same continuous, inextensible curve.
export function leafGeometry(progress, width, count=18) {
 const p=Math.max(0,Math.min(1,progress)),step=width/count;
 const curl=Math.sin(Math.PI*p)*.68;
 let x=0,z=0;
 return Array.from({length:count},(_,i)=>{
  const s=(i+.5)/count;
  const angle=-Math.PI*p+curl*(1-2*s);
  const part={x,z,angle,width:step};
  x+=Math.cos(angle)*step;z-=Math.sin(angle)*step;
  return part;
 });
}

export function turnLeaf({host,pages,before,after,direction,single,duration=1100,onFinish}) {
 const width=pages.clientWidth/(single?1:2),height=pages.clientHeight;
 const layer=document.createElement('div');layer.className='leaf-layer';layer.setAttribute('aria-hidden','true');layer.inert=true;
 Object.assign(layer.style,{left:pages.offsetLeft+'px',top:pages.offsetTop+'px',width:pages.clientWidth+'px',height:height+'px',perspective:width*4+'px'});
 const clonePage=(page)=>{
  const clone=page.cloneNode(true);clone.classList.add('leaf-copy');clone.removeAttribute('aria-label');clone.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
  const right=single||page.classList.contains('right');
  const surfaceWidth=host.clientWidth*(single?2:1);
  const sourceX=single?host.clientWidth+pages.offsetLeft:pages.offsetLeft+(right?width:0);
  Object.assign(clone.style,{width:width+'px',height:height+'px'});
  clone.style.setProperty('--surface-size',`${surfaceWidth}px ${host.clientHeight}px`);
  clone.style.setProperty('--surface-position',`${-sourceX}px ${-pages.offsetTop}px`);
  clone.classList.add(right?'surface-right':'surface-left');
  return clone;
 };
 let front,back;
 if(single){front=direction>0?before[0]:after[0];back=direction>0?after[0]:before[0];if(direction<0){const stationary=clonePage(before[0]);stationary.classList.add('stationary-leaf');layer.append(stationary);}}
 else {
  front=direction>0?before[1]:after[1];back=direction>0?after[0]:before[0];
  const stationary=clonePage(direction>0?before[0]:before[1]);stationary.classList.add('stationary-leaf');stationary.style.left=direction>0?'0':width+'px';layer.append(stationary);
 }
 const shadow=document.createElement('div');shadow.className='leaf-shadow';layer.append(shadow);
 const strips=[],count=single?14:18,step=width/count;
 for(let i=0;i<count;i++){
  const strip=document.createElement('div');strip.className='leaf-strip';strip.style.width=(step+.6)+'px';strip.style.height=height+'px';
  for(const [side,source,offset] of [['front',front,-i*step],['back',back,-(width-(i+1)*step)]]){
   const face=document.createElement('div');face.className='leaf-face leaf-'+side;
   const copy=clonePage(source);copy.style.left=offset+'px';face.append(copy);strip.append(face);
  }
  layer.append(strip);strips.push(strip);
 }
 host.append(layer);host.dataset.turning='true';
 let frame=0,start=0,finished=false;
 function finish(){if(finished)return;finished=true;cancelAnimationFrame(frame);layer.remove();delete host.dataset.turning;onFinish?.();}
 function draw(now){
  if(!start)start=now;
  const t=Math.min(1,(now-start)/duration),eased=t*t*(3-2*t),p=direction>0?eased:1-eased;
  const geometry=leafGeometry(p,width,count),rise=Math.sin(Math.PI*p);
  geometry.forEach((part,i)=>{
   const hinge=single?0:width;
   strips[i].style.transform=`translate3d(${hinge+part.x}px,0,${part.z}px) rotateY(${part.angle}rad)`;
   strips[i].style.setProperty('--shade',String(Math.min(.23,Math.abs(Math.sin(part.angle))*.16+rise*i/count*.05)));
  });
  shadow.style.opacity=String(rise*.24);shadow.style.width=width*(.12+.5*rise)+'px';
  shadow.style.left=(single?0:width-width*(.12+.5*rise)*(p>.5?1:0))+'px';
  shadow.style.transform=`scaleX(${p>.5?1:-1})`;
  if(t<1)frame=requestAnimationFrame(draw);else finish();
 }
 frame=requestAnimationFrame(draw);
 return finish;
}
