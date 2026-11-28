// Lime kiln. Site 0: village barn of stacked stones, limestone outcrop, small kiln on a hill far behind.
// Site 1: kiln built into a hillside (pot, draw arch), cutaway layers of wood and limestone, fire, quicklime heap.
// Site 2: work yard: slaking trough with steam, sand heap, wall rebuilt with lime mortar, field being limed.
// Params: u_fall (blocks fall off the barn), u_wash (mud washes out), u_work (person hammering/working), u_lumps (lump heap),
// u_kiln (kiln rises), u_cut (cutaway), u_fill (layers 0..1), u_fire (fire climbs 0..1), u_burnt (stone turned white),
// u_smoke, u_heap (quicklime heap), u_load (loader on top), u_pour, u_slake (lumps -> putty), u_steam,
// u_wall (courses rebuilt), u_white (whitewash), u_spread (lime on the field).
vec2 pMan(vec3 p, float pose, float seed){
  float b=sdRoundBox(p-vec3(0.0,0.75,0.0),vec3(0.45,0.8,0.45),0.0);
  if(b>0.25) return vec2(b,9.0);
  return pPerson(p,pose,seed);
}
vec2 map(vec3 p){
  vec2 res=vec2(p.y,0.0);
  float sw=u_work*(0.5+0.5*sin(u_time*8.0));
  if(u_site<0.5){
    res=opU(res,pForest(p,4.0,18.0,-24.0,-8.0));
    float wid=u_white>0.5?12.0:2.0;
    // barn of stacked stones
    res=opU(res,pWall(p-vec3(0.0,0.0,-2.0),vec3(3.3,1.3,0.3),wid));
    res=opU(res,pWall(p-vec3(-3.0,0.0,0.0),vec3(0.3,1.3,2.0),wid));
    res=opU(res,pWall(p-vec3(3.0,0.0,0.0),vec3(0.3,1.3,2.0),wid));
    res=opU(res,pWall(p-vec3(-1.95,0.0,2.0),vec3(1.05,1.3,0.3),wid));
    res=opU(res,pWall(p-vec3(1.95,0.0,2.0),vec3(1.05,1.05,0.3),wid));
    res=opU(res,pRoof(p-vec3(0.0,2.6,0.0),6.9,2.5,1.4,6.0));
    for(int i=0;i<3;i++){
      float fi=float(i);
      float f=clamp(u_fall*3.0-fi,0.0,1.0);
      vec3 b=p-vec3(1.25+0.7*fi,mix(2.35,0.25,f*f),2.0+(1.0+0.4*fi)*f);
      b.xy=rot(f*(0.6+0.5*fi))*b.xy;
      res=opU(res,pBlock(b,vec3(0.32,0.22,0.27),wid));
    }
    // mud in the joints, washing out
    float mw=1.0-clamp(u_wash,0.0,1.0);
    if(mw>0.01){
      float yy=p.y-0.65; yy=yy-0.6*clamp(floor(yy/0.6+0.5),0.0,2.0);
      res=opU(res,vec2(sdRoundBox(vec3(p.x+1.95,yy,p.z-2.32),vec3(1.0*mw,0.05,0.04),0.02),1.0));
    }
    // limestone outcrop, worker, lumps and dust
    res=opU(res,vec2(pRock(p-vec3(8.6,0.0,1.6),1.2).x,4.0));
    res=opU(res,vec2(pRock(p-vec3(9.8,0.0,0.6),0.9).x,4.0));
    res=opU(res,vec2(pRock(p-vec3(7.6,0.0,0.4),0.7).x,4.0));
    res=opU(res,pMan(p-vec3(7.0,0.0,3.0),sw,0.3));
    if(u_lumps>0.01){
      res=opU(res,vec2(sdEllipsoid(p-vec3(7.9,0.0,3.5),vec3(0.6,0.35,0.5)*u_lumps)+0.03*noise2(p.xz*9.0),4.0));
      res=opU(res,vec2(sdEllipsoid(p-vec3(6.2,0.0,3.8),vec3(0.35,0.12,0.3)*u_lumps),1.0));
    }
    // small kiln on a hill far behind
    res=opU(res,vec2(sdRoundBox(p-vec3(-9.0,1.2,-14.0),vec3(5.0,1.2,3.0),0.8),0.0));
    res=opU(res,pBlock(p-vec3(-9.0,1.5,-10.8),vec3(1.3,1.5,1.0),2.0));
    res=opU(res,pBlock(p-vec3(-9.0,0.45,-9.78),vec3(0.35,0.45,0.05),15.0));
    if(u_smoke>0.01){
      vec3 q=p-vec3(-9.0,3.6,-11.0);
      res=opU(res,vec2(sdSphere(q-vec3(0.2,0.3+0.2*sin(u_time),0.0),0.5*u_smoke),12.0));
      res=opU(res,vec2(sdSphere(q-vec3(0.6,1.2+0.2*sin(u_time*1.3),0.0),0.7*u_smoke),12.0));
    }
  } else if(u_site<1.5){
    // ---- hillside and kiln ----
    float cut=u_cut>0.5 ? p.z+1.4 : -1e3;            // > 0 in front of the cut plane
    float hill=sdRoundBox(p-vec3(0.0,1.6,-7.0),vec3(14.0,1.6,6.0),0.8);
    vec3 k=p-vec3(0.0,0.0,-1.4);
    float pot=max(length(k.xz)-1.2,-(k.y-0.6));
    float kiln=sdRoundBox(k-vec3(0.0,1.8,0.0),vec3(1.9,1.8,1.8),0.04);
    kiln=rise(kiln,p,u_kiln,3.6);
    float tunnel=max(abs(k.x)-0.45,max(k.y-1.0,-k.z));
    tunnel=min(tunnel,max(length(k.xy-vec2(0.0,1.0))-0.45,-k.z));
    hill=max(hill,-pot);
    hill=max(hill,-sdRoundBox(k-vec3(0.0,1.8,0.0),vec3(1.95,1.85,1.85),0.0));   // the dug-out hollow
    kiln=max(kiln,-pot);
    kiln=max(kiln,-tunnel);
    res=opU(res,vec2(max(hill,cut),11.0));
    if(u_kiln>0.01) res=opU(res,vec2(max(kiln,cut),2.0));
    // dark back of the draw arch, or fire there
    if(u_kiln>0.99){
      float back=sdRoundBox(k-vec3(0.0,0.5,0.75),vec3(0.45,0.5,0.05),0.0);
      res=opU(res,vec2(max(back,cut),u_fire>0.01&&u_burnt<0.5?14.0:15.0));
    }
    // layers of wood and limestone in the pot
    float n=count(u_fill,8.0);
    if(n>0.5){
      vec3 q=k-vec3(0.0,0.6,0.0);
      float ly=floor(q.y/0.34);
      float d=max(length(q.xz)-1.15,max(-q.y,q.y-n*0.34));
      float id=mod(ly,2.0)<0.5?3.0:2.0;
      if(q.y<u_fire*n*0.34+0.05) id=14.0;
      if(u_burnt>0.5) id=12.0;
      res=opU(res,vec2(max(d,cut),id));
    }
    // fire at the arch
    if(u_fire>0.01 && u_burnt<0.5){
      float f=0.8+0.15*sin(u_time*11.0);
      res=opU(res,vec2(max(sdEllipsoid(k-vec3(0.0,0.25,1.25),vec3(0.35,0.3*f,0.25)),cut),14.0));
    }
    if(u_smoke>0.01){
      vec3 q=k-vec3(0.0,3.8,0.0);
      res=opU(res,vec2(sdSphere(q-vec3(0.2,0.4+0.25*sin(u_time),0.0),0.6*u_smoke),12.0));
      res=opU(res,vec2(sdSphere(q-vec3(0.7,1.4+0.25*sin(u_time*1.3),-0.3),0.85*u_smoke),12.0));
    }
    // loader on top of the hill, stoker at the arch
    if(u_load>0.5) res=opU(res,pMan(p-vec3(2.4,3.2,-1.4),sw,0.6));
    res=opU(res,pMan(p-vec3(1.0,0.0,1.4),sw,0.4));
    // quicklime heap raked out, with the rake
    if(u_heap>0.01){
      res=opU(res,vec2(sdEllipsoid(p-vec3(-0.6,0.0,2.0),vec3(0.8,0.45,0.6)*u_heap)+0.03*noise2(p.xz*8.0),12.0));
      res=opU(res,pLog(p,vec3(0.85,0.95,1.5),vec3(-0.2,0.1,1.2+0.3*sin(u_time*3.0)),0.03));
    }
    // firewood stack
    res=opU(res,pBeam(p-vec3(3.2,0.25,0.6),vec3(0.7,0.25,0.35)));
  } else {
    // ---- work yard ----
    // trough
    vec3 t=p-vec3(0.0,0.0,0.0);
    float tr=max(sdRoundBox(t-vec3(0.0,0.3,0.0),vec3(1.2,0.3,0.6),0.02),-sdRoundBox(t-vec3(0.0,0.5,0.0),vec3(1.1,0.4,0.5),0.0));
    res=opU(res,vec2(tr,3.0));
    float s=clamp(u_slake,0.0,1.0);
    float fillD=sdRoundBox(t-vec3(0.0,0.3,0.0),vec3(1.1,0.2+0.06*s,0.5),0.0)+(1.0-s)*0.06*noise2(t.xz*7.0);
    res=opU(res,vec2(fillD,12.0));
    if(u_pour>0.5){
      res=opU(res,vec2(sdCapsule(p,vec3(1.1,1.25,0.2),vec3(0.6,0.5,0.1),0.06),8.0));
      res=opU(res,pBarrel(p-vec3(1.3,1.1,0.25),0.25,0.5));
    }
    res=opU(res,pMan(p-vec3(1.9,0.0,0.5),u_pour>0.5?1.0:sw,0.2));
    if(u_steam>0.01){
      vec3 q=p-vec3(-0.3,0.75,0.0);
      float r=0.16*u_steam;
      res=opU(res,vec2(sdSphere(q-vec3(0.0,0.1+0.35*fract(u_time*0.7),0.1),r),12.0));
      res=opU(res,vec2(sdSphere(q-vec3(-0.35,0.35+0.35*fract(u_time*0.7+0.5),-0.1),r*1.3),12.0));
    }
    // sand heap
    res=opU(res,vec2(sdEllipsoid(p-vec3(-2.4,0.0,0.6),vec3(0.8,0.5,0.7)),13.0));
    // wall rebuilt with lime mortar: stone courses with white joints, whitewash at the end
    float nc=count(u_wall,6.0);
    vec3 w=p-vec3(0.0,0.0,-2.6);
    float hw=nc*0.45;
    if(nc>0.5){
      float wd=sdRoundBox(w-vec3(0.0,0.5*hw,0.0),vec3(3.2,0.5*hw,0.3),0.02);
      float jy=fract(w.y/0.45);
      float jx=fract(w.x/0.9+0.5*mod(floor(w.y/0.45),2.0));
      float wid=(jy<0.1||jx<0.05)?12.0:2.0;
      if(u_white>0.5) wid=12.0;
      res=opU(res,vec2(wd,wid));
    }
    res=opU(res,pMan(p-vec3(-1.2,0.0,-1.8),sw,0.7));
    // field with lime spread on it
    vec3 f=p-vec3(7.0,0.0,0.0);
    res=opU(res,vec2(sdRoundBox(f-vec3(0.0,0.02,0.0),vec3(2.5,0.03,3.0),0.0),11.0));
    if(u_spread>0.01) res=opU(res,vec2(sdRoundBox(f-vec3(-2.5+2.5*u_spread,0.04,0.0),vec3(2.5*u_spread,0.03,3.0),0.0),12.0));
    res=opU(res,pMan(p-vec3(4.2+5.0*clamp(u_spread,0.0,1.0),0.0,1.0),u_spread>0.01?sw:0.0,0.9));
  }
  return res;
}
