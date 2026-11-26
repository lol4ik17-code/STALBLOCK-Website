'use strict';
// Original procedural concept environment: independent of game engine or external assets.
(() => {
 const canvases=[...document.querySelectorAll('canvas[data-scene]')]; if(!canvases.length)return;
 function rng(seed){return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296)}
 function render(c){
  const width=c.clientWidth,height=c.clientHeight;if(!width||!height)return;
  const dpr=Math.min(2,window.devicePixelRatio||1); c.width=Math.round(width*dpr);c.height=Math.round(height*dpr);
  const ctx=c.getContext('2d');if(!ctx)return;ctx.setTransform(dpr,0,0,dpr,0,0);
  const mode=c.dataset.scene;const rand=rng(mode==='world'?814:307);const W=width,H=height;
  const focal=Math.max(W*.68,H*.9),cx=W*(W<700?.53:.62),horizon=H*.43,eye=2.4;
  const shade=(rgb,k,z)=>{let haze=Math.min(.74,z/145);return 'rgb('+rgb.map((v,i)=>Math.round(v*k*(1-haze)+[111,116,106][i]*haze)).join(',')+')'};
  const proj=([x,y,z])=>[cx+x*focal/z,horizon-(y-eye)*focal/z];
  function poly(points,fill){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill()}
  function shape(points,fill){if(points.some(p=>p[2]<.5))return;poly(points.map(proj),fill)}
  function box(x,y,z,w,h,d,col){
    if(z<.8)return;
    const a=[x,y,z],b=[x+w,y,z],c=[x+w,y+h,z],e=[x,y+h,z];
    const A=[x,y,z+d],B=[x+w,y,z+d],C=[x+w,y+h,z+d],E=[x,y+h,z+d];
    if(x+w<0)shape([b,B,C,c],shade(col,.70,z));else if(x>0)shape([A,a,e,E],shade(col,.65,z));
    if(y+h<eye)shape([e,c,C,E],shade(col,1.13,z));
    shape([a,b,c,e],shade(col,.91,z));
  }
  let sky=ctx.createLinearGradient(0,0,0,H*.75);sky.addColorStop(0,'#222b2e');sky.addColorStop(.38,'#5d6560');sky.addColorStop(.70,'#9a9280');sky.addColorStop(1,'#3d433d');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  const sx=W*(mode==='world'?.38:.76),sy=H*.23,rad=Math.min(W,H)*.11;
  let halo=ctx.createRadialGradient(sx,sy,rad*.15,sx,sy,rad*2.8);halo.addColorStop(0,'rgba(225,81,48,.58)');halo.addColorStop(.4,'rgba(193,69,39,.23)');halo.addColorStop(1,'rgba(193,69,39,0)');ctx.fillStyle=halo;ctx.fillRect(0,0,W,H);
  ctx.beginPath();ctx.arc(sx,sy,rad,0,Math.PI*2);ctx.fillStyle='#b94935';ctx.fill();
  for(let i=0;i<90;i++){let x=rand()*W,y=H*(.06+rand()*.42);ctx.fillStyle='rgba(43,52,51,'+(rand()*.09)+')';ctx.fillRect(x,y,rand()*W*.28+30,2+rand()*13)}
  let ground=ctx.createLinearGradient(0,horizon,0,H);ground.addColorStop(0,'#535b52');ground.addColorStop(1,'#202523');ctx.fillStyle=ground;ctx.fillRect(0,horizon,W,H-horizon);
  shape([[-2.2,0,120],[2.2,0,120],[5,0,1],[-5,0,1]],'#383f3a');
  for(let z=115;z>1;z-=2.4){let x=(rand()-.5)*35;shape([[x,0,z],[x+.35+rand(),0,z],[x+.35,0,z+.48],[x,0,z+.48]],shade([105,106,92],.65,z))}
  for(let i=0;i<180;i++){let z=2+rand()*95,x=(rand()-.5)*z*2;shape([[x,0,z],[x+.12+rand()*.55,0,z],[x+.13,0,z+.2+rand()*.7],[x,0,z+.4]],shade([93,100,83],.7+rand()*.3,z))}
  const objects=[];
  function add(x,y,z,w,h,d,col,kind='block'){objects.push({x,y,z,w,h,d,col,kind})}
  for(let i=0;i<33;i++){const z=45+rand()*74,x=(rand()-.5)*z*2,w=4+rand()*7,h=3+rand()*12;add(x,0,z,w,h,5+rand()*5,[92,99,94],'building')}
  const palette=[[100,105,96],[83,91,86],[117,113,98],[75,84,79]];
  for(let i=0;i<15;i++){const z=13+i*5.5+rand()*5;const side=i%2===0?-1:1;const w=4+rand()*6;let x=side<0?-w-4.8-rand()*3:4.8+rand()*6;let h=5+rand()*10;add(x,0,z,w,h,4+rand()*6,palette[i%4],'building')}
  if(mode==='world'){add(-11,0,16,8,5.5,9,[105,106,96],'building');add(5,0,23,10,8,8,[80,86,77],'building');for(let i=0;i<4;i++)add(8+i*1.65,8,27,.65,4+i*.4,.65,[96,94,83])}
  else {add(-13,0,12,8,9,8,[81,89,85],'building');add(10,0,16,7,10,8,[91,94,83],'building')}
  for(let i=0;i<32;i++){let z=4+rand()*48,x=(rand()<.5?-1:1)*(3.5+rand()*12);add(x,0,z,.12+rand()*.12,1.7+rand()*2,.17,[73,79,67],'tree')}
  for(let i=0;i<80;i++){let z=2+rand()*40,x=(rand()-.5)*z*1.6;if(Math.abs(x)<2.5)continue;add(x,0,z,.2+rand()*.6,.1+rand()*.45,.25+rand()*.7,[72,77,67])}
  function building(o){
    let{x,y,z,w,h,d,col}=o;box(x,y,z,w,h,d,col);
    let cols=Math.max(2,Math.floor(w/.95)),rows=Math.max(2,Math.floor(h/1.08));
    let dx=w/cols,dy=h/rows;
    for(let row=0;row<rows;row++){let yy=y+row*dy;shape([[x,yy+.04,z-.015],[x+w,yy+.04,z-.015],[x+w,yy+.10,z-.015],[x,yy+.10,z-.015]],shade(col,.72,z));
      for(let coln=0;coln<cols;coln++){let xx=x+coln*dx+dx*.20,wx=dx*.60,wy=dy*.58;let dark=rand()>.16?[29,38,37]:[61,67,62];shape([[xx,yy+dy*.20,z-.025],[xx+wx,yy+dy*.20,z-.025],[xx+wx,yy+dy*.20+wy,z-.025],[xx,yy+dy*.20+wy,z-.025]],shade(dark,1,z));
        if(rand()<.78)shape([[xx+wx*.48,yy+dy*.20,z-.03],[xx+wx*.54,yy+dy*.20,z-.03],[xx+wx*.54,yy+dy*.20+wy,z-.03],[xx+wx*.48,yy+dy*.20+wy,z-.03]],shade(o.col,.85,z));
      }
    }
    for(let i=0;i<Math.min(100,w*h*1.3);i++){let xx=x+rand()*w,yy=y+rand()*h,ww=.03+rand()*.20,hh=.02+rand()*.09;shape([[xx,yy,z-.04],[Math.min(x+w,xx+ww),yy,z-.04],[Math.min(x+w,xx+ww),Math.min(y+h,yy+hh),z-.04],[xx,Math.min(y+h,yy+hh),z-.04]],shade(o.col,.65+rand()*.5,z))}
    if(z<45){box(x+w*.08,h,z+.1,w*.13,.3,d*.7,[65,72,65]);box(x+w*.7,h,z+d*.5,w*.16,.5,.6,[73,77,70])}
  }
  for(const o of objects.sort((a,b)=>b.z-a.z)){if(o.kind==='building')building(o);else if(o.kind==='tree'){box(o.x,0,o.z,o.w,o.h,.15,[66,62,50]);for(let j=0;j<4;j++){let yy=o.h*.35+j*o.h*.15,s=o.h*(.48-j*.095);box(o.x-s/2,yy,o.z+.03,s,o.h*.19,s*.5,[48+j*3,62+j*3,48+j*2])}}else box(o.x,o.y,o.z,o.w,o.h,o.d,o.col)}
  // Foreground figure built from textured cuboids, with no franchise-specific assets.
  if(mode==='hero'){const z=W<700?8.8:8.2,x=W<700?1.0:2.30;let k=.85;const b=(a,y,zz,w,h,d,c)=>box(x+a*k,y*k,z+zz*k,w*k,h*k,d*k,c);
   shape([[x-.55,.01,z-.2],[x+1.1,.01,z-.2],[x+1.9,.01,z+2],[x-.2,.01,z+2]],'#1a201d');
   b(-.22,0,.03,.39,.92,.46,[46,54,48]);b(.25,0,.04,.39,.92,.46,[54,61,53]);b(-.26,0,-.11,.43,.19,.58,[25,31,29]);b(.23,0,-.11,.44,.19,.58,[25,31,29]);
   b(-.32,.88,.02,1.02,1.13,.50,[70,82,66]);b(-.60,1.0,.08,.27,.89,.37,[72,82,66]);b(.71,1.0,.08,.28,.89,.37,[65,76,62]);b(-.58,.98,-.01,.25,.25,.37,[34,41,36]);b(.72,.98,-.01,.25,.25,.37,[34,41,36]);
   b(-.20,1.03,-.08,.79,.76,.16,[48,59,47]);b(-.17,1.10,-.12,.30,.40,.10,[87,94,71]);b(.23,1.10,-.12,.30,.40,.10,[76,86,65]);b(-.16,1.62,-.12,.69,.10,.12,[111,112,89]);b(-.23,2.01,.04,.84,.82,.65,[62,72,62]);b(-.27,2.68,.01,.91,.19,.70,[80,88,74]);b(-.19,2.22,-.07,.76,.37,.13,[26,37,35]);b(-.13,2.28,-.12,.27,.22,.06,[112,130,117]);b(.23,2.28,-.12,.26,.22,.06,[99,117,108]);b(.04,2.06,-.13,.29,.24,.17,[38,48,42]);b(-.18,2.09,-.10,.18,.15,.19,[94,102,89]);b(.38,2.09,-.10,.18,.15,.19,[94,102,89]);b(-.23,1.85,-.04,.12,.11,.15,[180,78,52]);
  }
  const fog=ctx.createLinearGradient(0,H*.31,0,H*.72);fog.addColorStop(0,'rgba(185,185,165,0)');fog.addColorStop(.42,'rgba(185,185,165,.15)');fog.addColorStop(1,'rgba(185,185,165,0)');ctx.fillStyle=fog;ctx.fillRect(0,0,W,H);
  for(let i=0;i<Math.min(19000,W*H/42);i++){const x=rand()*W,y=rand()*H;ctx.fillStyle=rand()<.5?'rgba(0,0,0,.075)':'rgba(225,225,213,.04)';ctx.fillRect(x,y,1+rand()*1.6,1+rand()*1.6)}
  const v=ctx.createRadialGradient(W*.55,H*.43,H*.14,W*.55,H*.43,Math.max(W*.72,H*.74));v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.50)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
 }
 let frame=0;function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>canvases.forEach(render))}schedule();window.addEventListener('resize',schedule,{passive:true});
})();