// All views use the source artwork's ratio, including a rotated phone.
export const BOOK_ASPECT = 1585 / 992;
export const COMPACT_QUERY = '(max-width:700px), (max-width:1100px) and (max-height:600px)';
export function bookLayout(viewportWidth, viewportHeight, view='spread', compact=false) {
 const edge=Math.max(4,Math.min(56,viewportWidth*.018));
 const top=compact?54:Math.max(56,Math.min(90,viewportHeight*.065));
 const canFocus=compact&&viewportHeight>viewportWidth;
 const bottom=canFocus?96:48;
 const availableWidth=Math.max(1,viewportWidth-2*edge);
 const availableHeight=Math.max(1,viewportHeight-top-bottom);
 const focused=canFocus&&view!=='spread';
 const width=Math.min(availableWidth*(focused?2:1),availableHeight*BOOK_ASPECT);
 const height=width/BOOK_ASPECT;
 const visibleWidth=focused?width/2:width;
 const left=viewportWidth/2-width*(focused?(view==='left'?.25:.75):.5);
 const y=top+(availableHeight-height)/2;
 return {width,height,left,top:y,visibleWidth,canFocus,view:focused?view:'spread',headerTop:y+height*.075-46,headerWidth:Math.min(availableWidth,Math.max(visibleWidth,compact?Math.min(380,availableWidth):0))};
}
