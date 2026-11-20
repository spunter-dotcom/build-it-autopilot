// scene.glsl: Inca grass-rope suspension bridge (Q'eswachaka style).
// Site 0: a gorge running along z (cliff edges at |x|=13, floor and river far below). The bridge spans x in [-14,14].
// Site 1: a grass meadow where ichu is cut and twisted into a long thin cord.
// Site 2: a close-up bench: a thin cord (stage 0), a twisted rope (stage 1), a braided cable (stage 2).

float cy(float x){ float s=clamp(x/14.0,-1.0,1.0); return 1.0-1.5*(1.0-s*s); }   // cable sag curve

// one sagging cable at side offset z, height offset yo, radius r, reaching from x=-14 to x=reach
float cable(vec3 p, float z, float yo, float r, float reach){
  float x=clamp(p.x,-14.0,min(reach,14.0));
  return 0.8*(length(vec3(p.x-x,p.y-yo-cy(x),p.z-z))-r);
}

// the bridge in its own space (centre line z=0)
vec2 bridge(vec3 p, float ncab, float reach, float sticks, float mats){
  vec2 r=vec2(1e3,13.0);
  for(int i=0;i<6;i++){
    float fi=float(i);
    float side=mod(fi,2.0)<0.5?-1.0:1.0;
    float zz=fi<1.5?0.42:(fi<3.5?0.14:0.62);
    float yy=fi<3.5?0.0:0.95;
    if(fi<ncab) r.x=min(r.x,cable(p,side*zz,yy,fi<3.5?0.075:0.06,reach));
  }
  if(ncab>5.5){                                         // vertical ties between handrails and floor
    float q=mod(p.x+0.9,1.8)-0.9;
    float t=length(vec2(q,abs(p.z)-0.53))-0.018;
    t=max(t,max(p.y-cy(p.x)-0.95,cy(p.x)-p.y)); t=max(t,abs(p.x)-13.5);
    r.x=min(r.x,0.8*t);
  }
  if(sticks>0.01){
    float q=mod(p.x+0.45,0.9)-0.45;
    float s=sdRoundBox(vec3(q,p.y-cy(p.x)+0.07,p.z),vec3(0.035,0.03,0.62),0.01);
    s=max(s,max(abs(p.x)-13.7,p.x-(-14.0+28.0*sticks)));
    r=opU(r,vec2(0.8*s,3.0));
  }
  if(mats>0.01){
    float m=max(abs(p.z)-0.5,abs(p.y-cy(p.x)-0.03)-0.03);
    m=max(m,max(abs(p.x)-13.9,p.x-(-14.0+28.0*mats)));
    r.x=min(r.x,0.8*m);
  }
  return r;
}

// ---- site 2 helpers ----
float strands(vec3 p, float k, float rr, float rs){
  float d=1e3;
  for(int i=0;i<3;i++){
    float a=p.x*k+float(i)*2.094;
    d=min(d,length(p.yz-rr*vec2(cos(a),sin(a)))-rs);
  }
  return max(0.55*d,abs(p.x)-2.3);
}

vec2 map(vec3 p){
  vec2 res=vec2(p.y,0.0);
  if(u_site<0.5){
    // gorge: cliffs slope inward as they drop; floor at y=-20; river on the floor
    float wall=max(p.y,0.97*(13.0+0.25*p.y-abs(p.x)));
    float g=min(wall,p.y+20.0);
    res=vec2(g,p.y<-0.15?2.0:0.0);
    res=opU(res,pWater(p,-19.6));
    // stone bases on both cliffs, rising with u_bases (left first, then right)
    res=opU(res,vec2(rise(sdRoundBox(p-vec3(-14.9,0.55,0.0),vec3(0.9,0.55,1.0),0.05),p,clamp(2.0*u_bases,0.0,1.0),1.1),2.0));
    res=opU(res,vec2(rise(sdRoundBox(p-vec3(14.9,0.55,0.0),vec3(0.9,0.55,1.0),0.05),p,clamp(2.0*u_bases-1.0,0.0,1.0),1.1),2.0));
    // a hut and two trees on the left cliff, a tree on the right
    res=opU(res,pWall(p-vec3(-20.0,0.0,-5.0),vec3(1.4,1.0,1.4),12.0));
    res=opU(res,pRoof(p-vec3(-20.0,2.0,-5.0),3.2,1.7,1.4,13.0));
    vec3 c=vec3(-18.0,2.0,4.0); if(length(p-c)<4.0) res=opU(res,pTree(p-vec3(-18.0,0.0,4.0),3.0)); else res.x=min(res.x,length(p-c)-3.0);
    c=vec3(19.0,2.0,-4.0); if(length(p-c)<4.0) res=opU(res,pTree(p-vec3(19.0,0.0,-4.0),3.2)); else res.x=min(res.x,length(p-c)-3.0);
    // people at the bases
    res=opU(res,pPerson(p-vec3(-16.2,0.0,1.2),u_work,0.3));
    res=opU(res,pPerson(p-vec3(16.2,0.0,-1.2),u_work,0.7));
    if(u_crowd>0.5){
      res=opU(res,pPerson(p-vec3(-16.6,0.0,-1.4),u_work,0.1));
      res=opU(res,pPerson(p-vec3(-17.4,0.0,0.4),0.0,0.5));
      res=opU(res,pPerson(p-vec3(16.8,0.0,1.3),u_work,0.9));
      res=opU(res,pPerson(p-vec3(17.6,0.0,-0.2),0.0,0.2));
    }
    // the new bridge (inside a box bound); u_sway makes the floor swing sideways
    vec3 b=p; b.z-=u_sway*0.35*sin(u_time*3.0)*(1.0-pow(clamp(p.x/14.0,-1.0,1.0),2.0));
    float bb=length(max(abs(b-vec3(0.0,0.3,0.0))-vec3(15.0,2.0,1.0),0.0));
    if(bb>0.6) res.x=min(res.x,bb); else res=opU(res,bridge(b,u_cab*6.0+0.001,-14.0+28.0*u_haul,u_sticks,u_mats));
    // the old bridge beside it, cut at the left end and swinging down from the right anchor
    if(u_old>0.5){
      vec3 o=p-vec3(14.0,1.0,2.6); o.xy=rot(1.45*u_fall)*o.xy; o+=vec3(14.0,1.0,0.0);
      float ob=length(max(abs(o-vec3(0.0,0.3,0.0))-vec3(15.0,2.0,1.0),0.0));
      if(ob>0.6) res.x=min(res.x,ob); else res=opU(res,bridge(o,6.0,14.0,1.0,1.0));
      res=opU(res,vec2(sdRoundBox(p-vec3(-14.9,0.45,2.6),vec3(0.8,0.45,0.9),0.05),2.0));
      res=opU(res,vec2(sdRoundBox(p-vec3(14.9,0.45,2.6),vec3(0.8,0.45,0.9),0.05),2.0));
    }
  } else if(u_site<1.5){
    // meadow of ichu tufts (repeated cells, always evaluated, bounded)
    vec2 id; vec3 q=cellXZ(p-vec3(0.0,0.0,0.3),1.3,id);
    float j=fract(sin(dot(id,vec2(12.9898,78.233)))*43758.5453);
    q.xz+=0.25*vec2(j-0.5,fract(j*7.3)-0.5);
    float tuft=sdEllipsoid(q-vec3(0.0,0.3,0.0),vec3(0.32,0.5+0.2*j,0.32));
    float near=length(vec2(p.x-0.0,p.z-1.6))-2.4;        // keep a clearing around the worker
    tuft=max(tuft,-near);
    tuft=min(tuft,cellBound(q,1.3));
    res=opU(res,vec2(tuft,13.0));
    res=opU(res,pPerson(p-vec3(0.6,0.0,1.4),u_work,0.3));
    if(u_cut>0.01){
      vec3 s=drop(p,u_cut);
      res=opU(res,vec2(sdCapsule(s,vec3(-1.3,0.18,1.2),vec3(-0.1,0.18,0.7),0.16),13.0));
      res=opU(res,vec2(sdCapsule(s,vec3(-1.2,0.18,0.8),vec3(-0.2,0.18,1.3),0.14),13.0));
    }
    if(u_cord>0.01){
      res=opU(res,vec2(sdCapsule(p,vec3(-1.0,0.04,2.6),vec3(-1.0+9.0*u_cord,0.04,2.9),0.035),13.0));
    }
  } else {
    // bench: two wooden trestles holding the work at y=1.05
    res=opU(res,pBeam(p-vec3(-1.9,0.5,0.6),vec3(0.08,0.5,1.4)));
    res=opU(res,pBeam(p-vec3(1.9,0.5,0.6),vec3(0.08,0.5,1.4)));
    res=opU(res,pBeam(p-vec3(-1.9,1.0,0.6),vec3(0.14,0.06,1.5)));
    res=opU(res,pBeam(p-vec3(1.9,1.0,0.6),vec3(0.14,0.06,1.5)));
    vec3 w=p-vec3(0.0,1.1,0.0);
    if(u_stage<0.5){
      float d=max(length(w.yz)-0.03,abs(w.x)-2.3);
      d=max(d,0.02+0.25*u_snap-abs(w.x));                  // the snap opens a gap in the middle
      res=opU(res,vec2(d,13.0));
      // a few more thin cords lying beside it
      res=opU(res,vec2(max(length(vec2(w.y,w.z-0.25))-0.03,abs(w.x)-2.3),13.0));
      res=opU(res,vec2(max(length(vec2(w.y,w.z-0.45))-0.03,abs(w.x)-2.3),13.0));
    } else if(u_stage<1.5){
      res=opU(res,vec2(strands(w,9.0,0.045,0.035),13.0));
      res=opU(res,vec2(strands(w-vec3(0.0,0.0,0.4),9.0,0.045,0.035),13.0));
      res=opU(res,vec2(strands(w-vec3(0.0,0.0,0.8),9.0,0.045,0.035),13.0));
    } else {
      float n=1.0+count(u_six,5.0);
      for(int i=0;i<6;i++){
        if(float(i)<n) res=opU(res,vec2(strands(w-vec3(0.0,0.0,0.42*float(i)),3.5,0.1,0.085),13.0));
      }
    }
    res=opU(res,pPerson(p-vec3(0.2,0.0,-1.0),u_work,0.3));
  }
  return res;
}
