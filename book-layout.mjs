export const BOOK_ASPECT=1585/992;
export const COMPACT_QUERY='(max-width:900px), (pointer:coarse)';
// Portrait is a close camera view. Only decorative edges can leave the screen;
// content remains inside the selected page's visible safe area.
export function bookLayout(w,h,view='left',compact=false){
 const portrait=compact&&h>w;
 const edge=portrait?6:Math.max(4,Math.min(22,w*.008));
 const availableWidth=w-edge*2,top=20,bottom=portrait?4:6;
 const availableHeight=h-top-bottom;
 const width=portrait?Math.max(availableWidth/.394,availableHeight*BOOK_ASPECT):Math.min(availableWidth,availableHeight*BOOK_ASPECT);
 const height=width/BOOK_ASPECT,side=view==='right'?'right':'left';
 const left=w/2-width*(portrait?(side==='right'?.697:.303):.5);
 const y=top+(availableHeight-height)/2,pageWidth=width*.394;
 const inset=portrait?Math.max(width*.022,(pageWidth-availableWidth)/2+18):width*.028;
 return {width,height,left,top:y,portrait,view:portrait?side:'spread',pageInset:inset,headerWidth:portrait?w-8:width*.94,headerTop:Math.max(2,y+height*.045-16)};
}
