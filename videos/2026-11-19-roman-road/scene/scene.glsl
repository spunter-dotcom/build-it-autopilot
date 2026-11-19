// scene.glsl: Roman road. The road runs along z (centre x = 0) from z = -24 to u_end, so with u_end = 0
// its end face at z = 0 shows the layers in cross-section. Everything is evaluated once per map call.

float sdBox(vec3 p, vec3 b){ return sdRoundBox(p,b,0.0); }

// Cart facing along z, wheels on axles along x; moves with its own offset.
vec2 cart(vec3 q, float roll){
  float bb=sdBox(q-vec3(0.0,0.8,0.0),vec3(1.1,0.9,1.7));
  if(bb>0.6) return vec2(bb,0.0);
  vec2 r=pBeam(q-vec3(0.0,0.85,0.0),vec3(0.62,0.07,1.25));               // bed
  vec3 s=q; s.x=abs(s.x);
  r=opU(r,pBeam(s-vec3(0.6,1.12,0.0),vec3(0.04,0.22,1.25)));              // sides
  r=opU(r,pBeam(q-vec3(0.0,1.12,1.22),vec3(0.62,0.22,0.04)));
  r=opU(r,pBeam(q-vec3(0.0,0.8,-1.9),vec3(0.05,0.05,0.7)));               // shaft
  r=opU(r,pBlock(q-vec3(0.0,1.15,0.2),vec3(0.4,0.12,0.6),2.0));           // load of stone
  vec3 w=q; w.x=abs(w.x)-0.75; w.z=abs(w.z)-0.75;
  vec3 wq=vec3(w.z,w.y-0.5,w.x); wq.xy=rot(roll)*wq.xy;
  r=opU(r,pWheel(wq,0.48,0.05,0.12,6.0,3.0));
  return r;
}

// Height of the top of the core (nucleus) at x: flat, then cambered (higher in the middle).
float coreTop(float x){ float k=clamp(x/2.1,-1.0,1.0); return -0.4+0.25*u_nuc+0.12*u_camber*(1.0-k*k); }

vec2 map(vec3 p){
  // ---- ground, carved by the trench and the side drains ----
  float zc=0.5*(u_end-24.0), zh=0.5*(u_end+24.0);                       // road z range [-24, u_end]
  float D=0.9*clamp(u_trench,0.0,1.0);
  float pz1=u_end<1.0 ? u_end+8.0 : u_end;                              // open viewing pit in front of the end face
  float pc=0.5*(pz1-24.0), ph=0.5*(pz1+24.0);
  float g=p.y;
  float gid=0.0;
  if(u_trench>0.01){
    float tb=sdBox(p-vec3(0.0,0.5*(1.0-D),pc),vec3(2.4,0.5*(1.0+D),ph));
    if(-tb>g){ g=-tb; gid=1.0; }
  }
  if(u_drain>0.01){
    float db=sdBox(vec3(abs(p.x)-4.6,p.y-0.5*(1.0-0.5*u_drain),p.z-zc),vec3(0.4,0.5*(1.0+0.5*u_drain),zh));
    if(-db>g){ g=-db; gid=1.0; }
  }
  vec2 res=vec2(g,gid);
  if(u_drain>0.01) res=opU(res,vec2(max(p.y+0.4*u_drain, sdBox(vec3(abs(p.x)-4.6,p.y,p.z-zc),vec3(0.4,1.0,zh))),8.0));

  // ---- trees on both sides, well away from the road ----
  res=opU(res,pForest(vec3(abs(p.x)-17.0,p.y,p.z),5.0,2.5,-25.0,25.0));

  // ---- mud puddles on the old dirt track (a thin strip of packed dirt on the grass) ----
  if(u_mud>0.01){
    res=opU(res,vec2(max(p.y-0.01,abs(p.x)-3.0),1.0));
    float pd=length(p.xz-vec2(0.6,1.0))-1.3*u_mud;
    pd=min(pd,length(p.xz-vec2(-0.9,-3.5))-1.6*u_mud);
    pd=min(pd,length(p.xz-vec2(0.4,-8.0))-1.9*u_mud);
    res=opU(res,vec2(max(p.y-0.03,pd),8.0));
  }

  // ---- marching legion: 3 files, 8 ranks, moving toward +z with u_march ----
  if(u_legion>0.5){
    vec3 lp=p-vec3(0.0,u_ly,u_march);
    vec2 c; vec3 q=cellXZ(lp,1.5,c);
    if(abs(c.x)<=1.0 && c.y>=-4.0 && c.y<=1.0 && lp.y<1.6) res.x=min(res.x,cellBound(q,1.5));
    if(abs(c.x)<=1.0 && c.y>=-3.0 && c.y<=0.0) res=opU(res,pPerson(q,0.0,0.05+0.02*hash2(c)));
  }

  // ---- surveyors' line: stakes every 5 m and a rope, growing toward +z ----
  if(u_line>0.01){
    float zl=-24.0+36.0*u_line;
    vec3 s=vec3(p.x,p.y,mod(p.z+2.5,5.0)-2.5);
    float st=sdCapsule(s,vec3(0.0,0.0,0.0),vec3(0.0,0.9,0.0),0.05);
    st=max(st,p.z-zl-0.1);
    if(g_bound>0.5 && abs(p.x)<1.0 && p.y<1.1) st=min(st,max(2.5-abs(s.z),0.2));
    res=opU(res,vec2(st,3.0));
    res=opU(res,pRope(p,vec3(0.0,0.85,-24.0),vec3(0.0,0.85,zl)));
    res=opU(res,pPerson(p-vec3(0.9,0.0,zl+1.0),1.0,0.6));
  }

  // ---- workers beside the trench ----
  if(u_workers>0.01){
    res=opU(res,pPerson(p-vec3(3.1,0.0,-1.6),u_work,0.2));
    res=opU(res,pPerson(p-vec3(-3.1,0.0,-3.4),1.0-u_work,0.45));
  }

  if(abs(p.x)>6.0) return res;                                            // nothing else out here

  // ---- road layers inside the trench ----
  float zend=p.z-u_end;
  if(u_rudus>0.01){
    float top=-0.9+0.5*u_rudus-0.12*u_spread;
    float w=2.1+0.5*u_spread*smoothstep(-0.9,-0.4,p.y);
    float d=max(sdBox(p-vec3(0.0,-0.95,zc),vec3(w,1.0,zh)),p.y-top);
    res=opU(res,vec2(max(d,zend),5.0));
  }
  if(u_curb>0.01){
    vec3 q=drop(p,u_curb); q.x=abs(q.x)-2.25;
    res=opU(res,vec2(sdRoundBox(q-vec3(0.0,-0.33,zc),vec3(0.15,0.58,zh),0.02),2.0));
  }
  if(u_nuc>0.01){
    float d=max(sdBox(p-vec3(0.0,-0.3,zc),vec3(2.1,0.6,zh)),p.y-coreTop(p.x));
    d=max(d,-p.y-0.4);
    res=opU(res,vec2(d*0.9,12.0));
  }
  if(u_flood>0.01) res=opU(res,vec2(max(sdBox(p-vec3(0.0,0.0,zc),vec3(2.1,1.0,zh)),p.y-(coreTop(0.0)+0.05*u_flood)),8.0));
  // paving slabs: a grid of fitted blocks sweeping in from -z, clipped by u_pave (skipped entirely before paving starts)
  if(u_pave>0.01){
    vec2 c; vec3 q=cellXZ(p,0.7,c);
    float base=coreTop(p.x);
    float d=sdRoundBox(q-vec3(0.0,base+0.075,0.0),vec3(0.33+0.02*hash2(c),0.075,0.33),0.03);
    d=max(d,abs(p.x)-2.1);
    d=max(d,p.z-(-24.0+(u_end+24.0)*u_pave));
    float pz=-24.0+(u_end+24.0)*u_pave;
    if(abs(p.x)<2.5 && p.y<0.6 && p.y>-0.6 && p.z<pz+1.0) d=min(d,cellBound(q,0.7));
    res=opU(res,vec2(d,2.0));
  }
  // footpaths of packed gravel beside the curbs
  if(u_path>0.01){
    vec3 q=vec3(abs(p.x)-3.15,p.y,p.z-zc);
    res=opU(res,vec2(sdBox(q-vec3(0.0,-0.2,0.0),vec3(0.75,0.25*u_path,zh)),1.0));
  }
  // taller guard blocks set into the curb every 4 m
  if(u_guard>0.01){
    vec3 q=drop(p,u_guard); q.x=abs(q.x)-2.25; q.z=mod(q.z+2.0,4.0)-2.0;
    float d=sdRoundBox(q-vec3(0.0,0.3,0.0),vec3(0.18,0.32,0.2),0.03);
    d=max(d,zend);
    if(g_bound>0.5 && abs(q.x)<0.8 && p.y<0.8 && p.y>-0.2) d=min(d,max(2.0-abs(q.z),0.2));
    res=opU(res,vec2(d,2.0));
  }
  // milestone beside the road
  if(u_mile>0.01) res=opU(res,vec2(sdCylinder(drop(p,u_mile)-vec3(3.3,0.95,6.0),0.95,0.3)-0.03,2.0));
  // carts: A drives toward -z on the right, B toward +z on the left; A can drift onto the footpath (u_cax)
  if(u_carts>0.5){
    vec3 a=p-vec3(1.05+u_cax,0.12,u_ca); a.xz=-a.xz;
    res=opU(res,cart(a,-u_ca/0.48));
    res=opU(res,cart(p-vec3(-1.05,0.12,u_cb),u_cb/0.48));
    res=opU(res,pPerson(p-vec3(3.2,0.0,u_walk),0.0,0.7));
  }
  return res;
}
