// scene.glsl: Viking longship (Gokstad-like). Ship lies along x (bow at +x), waterline at local y = 0.
// Hull about 24 long, beam 5.1, 16 strakes a side, 16 oars a side, square sail about 11 x 10.
// Starboard (the steering-board side) is +z, so the rudder faces a camera at ang 0.

float hullW(float x){ return sqrt(max(870.25-x*x,0.0))-26.95; }   // half-beam at x (2.55 midship, 0 at the stems)

vec2 longship(vec3 q, float keel, float stem, float planks, float riv, float ribs, float rud, float oars, float mast, float sail, float row){
  float hb=sdRoundBox(q-vec3(0.0,0.8,0.0), vec3(12.8,2.4,3.0), 0.0);   // hull region
  vec2 res=vec2(hb<0.6?1e3:hb,3.0);   // far away: the box is a safe step
  // hull solid: pointed plan, rockered keel line, flared sides
  float lens=length(vec2(q.x,abs(q.z)+26.95))-29.5;
  float rocker=length(vec2(q.x,q.y-59.3))-60.0;
  float vee=(abs(q.z)-0.15-1.35*(q.y+0.7))/1.68;
  float solid=max(lens,max(rocker,vee));
  float yy=q.y+0.7;                                   // height above the keel bottom
  float n=count(planks,16.0);
  float sheer=1.25+0.9*q.x*q.x/144.0;                 // gunwale rises toward bow and stern
  if(hb<0.6){
    if(keel>0.01){
      float k=max(max(abs(q.z)-0.12, rocker-0.16), max(q.y+0.3, abs(q.x)-11.9));
      k=max(k, q.x-mix(-12.0,12.0,keel));
      res=opU(res,vec2(k,3.0));
    }
    if(n>0.5){
      // clinker strakes: each plank steps out over the one below
      float st=solid-0.03*fract(yy*8.0);
      float sh=max(abs(st)-0.045, q.y-mix(-0.7,sheer,n/16.0));
      res=opU(res,vec2(sh*0.8,3.0));
    }
    if(riv>0.01 && n>0.5){
      float xr=q.x-0.3*floor(q.x/0.3+0.5);
      float yr=yy-0.125*floor(yy/0.125+0.5);
      float d=max(length(vec2(xr,yr))-0.03, abs(solid)-0.085);
      d=max(d, max(q.x-mix(-12.0,12.0,riv), yy-n*0.125+0.03));
      res=opU(res,vec2(d,7.0));
    }
    if(ribs>0.01){
      float xr=q.x-1.0*clamp(floor(q.x+0.5),-10.0,10.0);
      float d=max(abs(xr)-0.07, max(abs(solid+0.13)-0.08, q.y-1.05));
      d=max(d, q.x-mix(-11.0,11.0,ribs));
      res=opU(res,vec2(d,3.0));
      // floor boards laid over the ribs
      float fl=max(abs(q.y-0.25)-0.04, max(solid+0.2, abs(q.x)-9.5));
      res=opU(res,vec2(max(fl, q.x-mix(-11.0,11.0,ribs)),3.0));
    }
    if(oars>0.01 && count(oars,16.0)>0.5){
      // oar ports along the top strake
      float m=count(oars,16.0);
      float id=clamp(floor(q.x+0.5),-7.0,-8.0+m);
      float xr=q.x-id;
      float d=max(length(vec2(xr,q.y-0.95))-0.08, abs(solid)-0.09);
      res=opU(res,vec2(d,15.0));
    }
  }
  if(stem>0.01){
    vec3 r=vec3(abs(q.x),q.y,q.z);
    float sp=min(sdCapsule(r,vec3(11.4,0.2,0.0),vec3(12.3,2.2,0.0),0.16), sdCapsule(r,vec3(12.3,2.2,0.0),vec3(12.1,3.8,0.0),0.13));
    sp=min(sp, sdCapsule(r,vec3(12.1,3.8,0.0),vec3(11.6,4.2,0.0),0.11));
    res=opU(res,vec2(max(sp, q.y-mix(-0.7,4.4,stem)),3.0));
  }
  if(rud>0.01){
    vec3 r=drop(q,rud)-vec3(-9.4,0.0,1.25);
    float b=sdRoundBox(r-vec3(0.0,0.1,0.0),vec3(0.3,1.1,0.05),0.03);
    b=min(b, sdCapsule(r,vec3(0.0,1.2,0.0),vec3(0.0,1.6,0.0),0.09));
    b=min(b, sdCapsule(r,vec3(0.0,1.55,0.0),vec3(0.9,1.65,-0.8),0.05));   // tiller
    res=opU(res,vec2(b,3.0));
  }
  if(oars>0.01 && count(oars,16.0)>0.5){
    float m=count(oars,16.0);
    vec3 r=vec3(q.x,q.y,abs(q.z));
    float bd=sdRoundBox(r-vec3(0.0,0.4,4.4), vec3(8.6,1.1,2.4), 0.0);
    if(bd<0.3){
      float id=clamp(floor(r.x+0.5),-7.0,-8.0+m);
      float z0=hullW(id);
      float sw=mix(-0.45,0.45,row);
      r.x-=id;
      float d=sdCapsule(r, vec3(0.0,0.95,z0-0.6), vec3(sw,-0.05,z0+4.2), 0.045);
      d=min(d, sdRoundBox(r-vec3(sw*0.95,0.0,z0+4.0),vec3(0.03,0.04,0.35),0.02));
      res=opU(res,vec2(d,3.0));
    } else res=opU(res,vec2(bd,3.0));
  }
  if(mast>0.01){
    res=opU(res,vec2(sdCapsule(q,vec3(0.0,0.2,0.0),vec3(0.0,0.2+10.6*mast,0.0),0.15),3.0));
  }
  if(sail>0.01){
    res=opU(res,vec2(sdCapsule(q,vec3(0.2,10.3,-5.7),vec3(0.2,10.3,5.7),0.09),3.0));   // yard
    float hgt=9.6*sail;
    float zz=clamp(q.z/5.5,-1.0,1.0);
    vec3 s=q-vec3(0.35+0.7*(1.0-zz*zz)*sail,10.2-0.5*hgt,0.0);
    float d=sdRoundBox(s,vec3(0.03,0.5*hgt,5.5),0.02)*0.85;
    res=opU(res,vec2(d,9.0));
  }
  return res;
}
float shipBox(vec3 q){ return sdRoundBox(q-vec3(0.0,4.2,0.0), vec3(13.0,7.2,7.2), 0.0); }
float stroke(){ return 0.5+0.5*sin(u_time*0.55*6.2832); }

// Speed note: every branch of map() is evaluated, so the longship is called exactly once
// and each site is kept small.
vec2 map(vec3 p){
  vec2 res=vec2(p.y,0.0);
  vec3 qa=p-vec3(1e4,0.0,0.0);
  float k=1.0, st=1.0, pl=1.0, rv=1.0, rb=1.0, ru=1.0, oa=1.0, ma=1.0, sa=1.0, rw=stroke();
  if(u_site<0.5){
    // Site 0: a northern shore, two longhouses, open sea.
    res=opU(res,pWater(p,0.05));
    res=opU(res,vec2(sdEllipsoid(p-vec3(-30.0,-3.0,0.0),vec3(24.0,3.6,60.0)),0.0));
    res=opU(res,pWall(p-vec3(-14.0,0.5,-5.0),vec3(4.0,0.9,1.6),3.0));
    res=opU(res,pRoof(p-vec3(-14.0,2.3,-5.0),8.6,2.0,1.6,13.0));
    res=opU(res,pWall(p-vec3(-18.0,0.6,3.0),vec3(3.5,0.9,1.5),3.0));
    res=opU(res,pRoof(p-vec3(-18.0,2.4,3.0),7.6,1.9,1.5,13.0));
    res=opU(res,pTree(p-vec3(-22.0,1.0,-9.0),4.0));
    res=opU(res,pTree(p-vec3(-25.0,1.2,6.0),4.5));
    res=opU(res,pPerson(p-vec3(-10.5,0.6,-1.0),0.0,0.4));
  } else if(u_site<1.5){
    // Site 1: an oak wood. A felled log, split into planks.
    res=opU(res,pTree(p-vec3(-4.0,0.0,-4.0),6.0));
    res=opU(res,pTree(p-vec3(3.5,0.0,-6.0),6.5));
    res=opU(res,pTree(p-vec3(-8.0,0.0,1.0),5.5));
    res=opU(res,pTree(p-vec3(7.0,0.0,-1.5),6.0));
    res=opU(res,pPerson(p-vec3(0.6,0.0,1.4),u_work,0.3));
    float sp=clamp(u_split,0.0,1.0);
    vec3 l=p-vec3(0.0,0.35,0.0);
    vec3 lz=vec3(l.x,l.y,abs(l.z)-0.25*sp);   // the log splits into two halves
    res=opU(res,vec2(max(sdCapsule(lz,vec3(-2.5,0.0,0.0),vec3(2.5,0.0,0.0),0.35), -lz.z),3.0));
    if(u_planks0>0.01){
      vec3 b=drop(p,u_planks0)-vec3(0.0,0.0,-1.6);
      float n=count(u_planks0,4.0);
      float id=clamp(floor(b.y/0.1),0.0,n-1.0);
      res=opU(res,pPlank(b-vec3(0.0,0.05+0.1*id,0.0),vec3(2.4,0.035,0.18)));
    }
  } else if(u_site<2.5){
    // Site 2: the beach shipyard. Keel blocks, a worker, the ship growing step by step.
    vec3 b=vec3(p.x-3.0*clamp(floor(p.x/3.0+0.5),-3.0,3.0),p.y,p.z);
    res=opU(res,pBlock(b-vec3(0.0,0.2,0.0),vec3(0.3,0.2,0.8),3.0));
    res=opU(res,pPerson(p-vec3(-3.0,0.0,3.6),1.0,0.3));
    res=opU(res,pPlank(p-vec3(3.0,0.1,4.2),vec3(2.4,0.08,0.4)));
    qa=p-vec3(0.0,0.75,0.0);
    k=u_keel; st=u_stem; pl=u_planks; rv=u_riv; rb=u_ribs; ru=u_rud; oa=u_oars; ma=u_mast; sa=u_sail; rw=u_row*stroke();
  } else {
    // Site 3: at sea, with a beach ahead at +x. The ship moves with u_go.
    res=opU(res,pWater(p,0.05));
    res=opU(res,vec2(sdEllipsoid(p-vec3(46.0,-3.0,0.0),vec3(20.0,4.0,60.0)),0.0));
    res=opU(res,pTree(p-vec3(44.0,1.0,-8.0),5.0));
    res=opU(res,pTree(p-vec3(48.0,0.9,5.0),5.5));
    qa=p-vec3(u_go,0.05,0.0); ma=u_mast; sa=u_sail; rw=u_row*stroke();
  }
  vec2 sh=longship(qa,k,st,pl,rv,rb,ru,oa,ma,sa,rw);
  return opU(res,sh);
}
