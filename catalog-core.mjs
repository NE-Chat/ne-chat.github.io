export const PAGE_SIZE=12;
export const CATEGORIES=[['all','전체'],['daily','일상'],['fantasy','판타지'],['apocalypse','아포칼립스'],['sentinel','센티넬'],['simulation','시뮬레이션'],['collab','콜라보'],['other','기타']];
export function categoriesOf(character){const list=Array.isArray(character.categories)?character.categories:[character.category||'other'];return list.filter(id=>CATEGORIES.some(c=>c[0]===id&&id!=='all'));}
export function filteredCharacters(characters,category){return characters.filter(c=>category==='all'||categoriesOf(c).includes(category));}
export function buildPages(characters,category='all'){
 const items=filteredCharacters(characters,category),pages=category==='all'?[{type:'front'},{type:'title'}]:[{type:'world',category}];
 for(let i=0;i<Math.max(1,items.length);i+=PAGE_SIZE)pages.push({type:'characters',items:items.slice(i,i+PAGE_SIZE)});
 if(pages.length%2)pages.push({type:'blank'});
 return pages;
}
export function nextPosition(position,category,single){if(category==='all'&&position===0)return 2;return position+(single?1:2);}
export function previousPosition(position,category,single){if(category==='all'&&position===2)return 0;return Math.max(0,position-(single?1:2));}
export function gridMetrics(width,height,single=false){
 const gap=Math.max(2,Math.min(14,width*.027)),label=Math.max(6,Math.min(single?23:30,height*.05,width*.13));
 const candidate=columns=>{const rows=12/columns;return {columns,rows,gap,label,cardWidth:Math.max(2,Math.min((width-gap*(columns-1))/columns,((height-gap*(rows-1))/rows-label)*2/3))};};
 // Choose the most legible fixed grid for the page dimensions, never the item count.
 const four=candidate(4),three=candidate(3);
 return single&&three.cardWidth>four.cardWidth?three:four;
}

// A phone can inspect either half without losing the other page of its spread.
export function readingStep(position,view,direction,compact){
 if(compact&&view!=='spread'){
  if(direction>0&&view==='left')return {position,view:'right'};
  if(direction<0&&view==='right')return {position,view:'left'};
  return {position:position+direction*2,view:direction>0?'left':'right'};
 }
 return {position:position+direction*2,view:'spread'};
}
