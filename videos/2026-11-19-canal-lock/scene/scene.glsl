// scene.glsl: canal lock. The canal runs along x, 4 m wide (|z|<2). Land rises from x=2 to x=7.
// Lower reach water LO (x<-4), upper reach HI (x>4). Site 0: an earth ramp (double slipway) at x=0.
// Site 1: a stone lock chamber x in [-4,4] with a gate at each end; u_level fills the chamber.
const float LO=-1.6;
const float HI=-0.1;

float landH(float x){ return 1.4*smoothstep(2.0,7.0,x); }
float rampY(float x){ return abs(x)<3.9 ? -2.5+2.7*sqrt(1.0-x*x/16.0) : -9.0; }
float chamberL(){ return mix(LO,HI,u_level); }
float levelAt(float x){
  if(u_site<0.5) return x<0.0 ? LO : HI;
  return x<-4.0 ? LO : (x>4.0 ? HI : chamberL());
}

// barge with grain sacks; boat-local p
vec2 barge(vec3 q){
  vec2 r=pBlock(q,vec3(1.6,0.3,0.7),3.0);
  r=opU(r,pBlock(q-vec3(0.0,0.32,0.0),vec3(1.65,0.04,0.74),3.0));
  r=opU(r,vec2(sdEllipsoid(q-vec3(-0.8,0.55,0.0),vec3(0.45,0.25,0.35)),13.0));
  r=opU(r,vec2(sdEllipsoid(q-vec3(0.0,0.55,0.1),vec3(0.45,0.25,0.35)),13.0));
  vec3 s=q-vec3(0.8,0.55,-0.1)-vec3(0.3,-1.6,1.4)*u_spill;
  r=opU(r,vec2(sdEllipsoid(s,vec3(0.45,0.25,0.35)),13.0));
  if(u_crack>0.5) r=opU(r,pBlock(q-vec3(0.4,0.0,0.71),vec3(0.6*u_crack,0.05,0.03),15.0));
  return r;
}

// guillotine gate at x=gx: two posts, a top beam, a board lifted by k (0 shut .. 1 up); board top at ytop
vec2 liftGate(vec3 p, float gx, float k, float ytop){
  vec3 q=p-vec3(gx,0.0,0.0);
  vec2 r=pLog(q,vec3(0.0,-0.5,2.3),vec3(0.0,3.1,2.3),0.13);
  r=opU(r,pLog(q,vec3(0.0,-0.5,-2.3),vec3(0.0,3.1,-2.3),0.13));
  r=opU(r,pLog(q,vec3(0.0,3.1,-2.4),vec3(0.0,3.1,2.4),0.13));
  float hh=0.5*(ytop+2.5);
  r=opU(r,pPlank(q-vec3(0.0,ytop-hh+2.6*k,0.0),vec3(0.1,hh,2.0)));
  return r;
}

// one mitre leaf hinged at z=1.95*s on x=-4; u_mopen 0 closed (V pointing upstream) .. 1 open
vec2 leaf(vec3 p, float s){
  float t=-s*1.279*(1.0-u_mopen);
  vec2 dir=vec2(cos(t),sin(t));
  vec2 d=p.xz-vec2(-4.0,1.95*s);
  vec3 l=vec3(dot(d,dir),p.y,dot(d,vec2(-dir.y,dir.x)));
  vec2 r=pPlank(l-vec3(1.045,-1.1,0.0),vec3(1.045,1.4,0.09));
  r=opU(r,pLog(l,vec3(0.0,0.5,0.0),vec3(-2.4,0.5,0.0),0.12));           // balance beam
  if(u_pad>0.01){
    vec3 a=drop(l,u_pad);
    r=opU(r,pBeam(a-vec3(1.0,0.75,0.0),vec3(0.06,0.45,0.06)));
    vec3 g=a-vec3(1.0,1.15,0.15); g.xy=rot(u_crank*6.0)*g.xy;
    r=opU(r,pGear(g,0.22,8.0,0.06,0.06,7.0));
    r=opU(r,pBlock(l-vec3(1.0,-1.9+0.4*u_crank,0.0),vec3(0.28,0.22,0.1),15.0)); // paddle hatch
  }
  return r;
}

vec2 map(vec3 p){
  // ground with the canal channel cut into it
  float h=landH(p.x);
  float chan=max(abs(p.z)-2.0,h-2.5-p.y);
  vec2 res=vec2(max((p.y-h)*0.85,-chan),0.0);

  // water
  float w;
  if(u_site<0.5) w=min(max(p.y-LO,p.x),max(p.y-HI,-p.x));
  else w=min(max(p.y-LO,p.x+4.0),min(max(p.y-chamberL(),abs(p.x)-4.0),max(p.y-HI,4.0-p.x)));
  res=opU(res,vec2(w,8.0));

  // a village and trees on the banks (each skipped far away: a sphere bound keeps the marcher stepping)
  vec3 c;
  c=vec3(12.0,2.8,5.5); if(length(p-c)<6.5){ res=opU(res,pWall(p-vec3(12.0,1.4,5.5),vec3(1.5,1.1,1.4),12.0)); res=opU(res,pRoof(p-vec3(12.0,3.6,5.5),3.4,1.7,1.2,6.0)); } else res.x=min(res.x,length(p-c)-5.5);
  c=vec3(-11.0,1.4,-5.5); if(length(p-c)<6.5){ res=opU(res,pWall(p-vec3(-11.0,0.0,-5.5),vec3(1.4,1.0,1.5),12.0)); res=opU(res,pRoof(p-vec3(-11.0,2.0,-5.5),3.2,1.8,1.1,6.0)); } else res.x=min(res.x,length(p-c)-5.5);
  c=vec3(-7.0,2.4,5.0); if(length(p-c)<4.0) res=opU(res,pTree(p-vec3(-7.0,0.0,5.0),3.2)); else res.x=min(res.x,length(p-c)-3.0);
  c=vec3(7.5,4.1,-5.0); if(length(p-c)<4.4) res=opU(res,pTree(p-vec3(7.5,1.4,-5.0),3.6)); else res.x=min(res.x,length(p-c)-3.4);
  c=vec3(1.0,2.1,-6.0); if(length(p-c)<3.6) res=opU(res,pTree(p-vec3(1.0,0.0,-6.0),2.8)); else res.x=min(res.x,length(p-c)-2.6);

  // barge
  float by=levelAt(u_bx)-0.05;
  float tilt=0.0;
  if(u_site<0.5){
    float ry=rampY(u_bx);
    if(ry+0.3>by){ by=ry+0.3; tilt=atan(-2.7*u_bx/16.0/sqrt(max(1.0-u_bx*u_bx/16.0,0.05))); }
  }
  vec3 bq=p-vec3(u_bx,by,0.0); bq.xy=rot(tilt+u_tilt)*bq.xy;
  if(length(bq)<3.6) res=opU(res,barge(bq)); else res.x=min(res.x,length(bq)-2.6);

  if(u_site<0.5){
    // Site 0: earth ramp across the canal, haulers on the bank
    res=opU(res,vec2(sdEllipsoid(p-vec3(0.0,-2.5,0.0),vec3(4.0,2.7,2.3)),1.0));
    vec3 hc=vec3(u_bx+3.6,by+1.0,2.0);
    if(length(p-hc)>4.6) res.x=min(res.x,length(p-hc)-3.6); else {
    vec3 bow=vec3(u_bx+1.6*cos(tilt),by+0.3+1.6*sin(tilt),0.4);
    for(int i=0;i<2;i++){
      float px=u_bx+4.5+1.2*float(i);
      vec3 pp=vec3(px,landH(px),3.0+0.5*float(i));
      res=opU(res,pPerson(p-pp,u_work,0.3+0.4*float(i)));
      res=opU(res,pRope(p,bow,pp+vec3(0.0,0.9,0.0)));
    }
    }
  } else {
    // Site 1: the lock. Everything below sits inside a box bound (skipped far away).
    float lb=length(max(abs(p)-vec3(7.5,8.0,5.0),0.0));
    if(lb>1.0) res.x=min(res.x,lb); else {
    // Stone chamber walls rise with u_walls.
    vec3 wq=p-vec3(0.0,-2.5,0.0);
    float wall=sdRoundBox(vec3(p.x,p.y+1.15,abs(p.z)-2.12),vec3(4.0,1.35,0.12),0.02);
    res=opU(res,vec2(rise(wall,wq,u_walls,2.7),2.0));
    if(u_gates>0.01){
      vec3 gp=drop(p,u_gates);
      res=opU(res,liftGate(gp,4.0,u_uo,0.4));
      if(u_mitre<0.01) res=opU(res,liftGate(gp,-4.0,u_lo,0.2));
    }
    if(u_mitre>0.01){
      vec3 mp=drop(p,u_mitre);
      res=opU(res,leaf(mp,1.0));
      res=opU(res,leaf(mp,-1.0));
    }
    // water pouring under the raised top gate
    if(u_pour>0.01){
      float L=chamberL();
      res=opU(res,pBlock(p-vec3(3.75,0.5*(HI+L),0.0),vec3(0.12,max(0.5*(HI-L),0.05),1.9*u_pour),8.0));
    }
    // lock keepers
    res=opU(res,pPerson(p-vec3(4.8,landH(4.8),2.8),u_work,0.5));
    res=opU(res,pPerson(p-vec3(-4.8,0.0,-2.8),u_work2,0.8));
    }
  }
  return res;
}
