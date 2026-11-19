// scene.glsl: Greek trireme. Ship lies along x (bow at +x), waterline at local y = 0.
// Hull 20 long (bow/stern posts and ram make it about 23), beam 3.2, three tiers of oars per side.

// One tier of oars on both sides: n per side shown (0..N), oar ports at height y, inboard z0.
vec2 oarTier(vec3 q, float k, float N, float y, float z0, float xo, float sw){
  float n=count(k,N);
  if(n<0.5) return vec2(1e3,3.0);
  float s=0.8;
  float lo=-floor(N*0.5);
  vec3 r=vec3(q.x-xo, q.y, abs(q.z));
  float bd=sdRoundBox(r-vec3(0.0,0.5*y,z0+1.7), vec3(9.0,0.5*y+0.25,1.9), 0.0);
  if(bd>0.3) return vec2(bd,3.0);
  float id=clamp(floor(r.x/s+0.5), lo, lo+n-1.0);
  r.x-=id*s;
  float d=sdCapsule(r, vec3(0.0,y,z0), vec3(sw,-0.02,z0+3.4), 0.045);
  return vec2(d,3.0);
}

// The trireme. keel/planks/rope/deck/o1/o2/o3/ram are 0..1 build params, sag bends the hull, row = oar stroke 0..1.
vec2 trireme(vec3 q, float keel, float planks, float rope, float deck, float sag, float o1, float o2, float o3, float ram, float row){
  vec2 res=vec2(1e3,0.0);
  // bounding box: skip everything when far away (keeps the fleet shots fast)
  float bb=sdRoundBox(q-vec3(1.0,1.2,0.0), vec3(14.0,2.8,5.6), 0.0);
  if(bb>1.0) return vec2(bb,0.0);
  q.y+=sag*1.0*(1.0-clamp(q.x*q.x/100.0,0.0,1.0));        // a weak hull sags in the middle
  float hb=sdRoundBox(q-vec3(0.0,2.0,0.0), vec3(11.0,3.0,1.9), 0.0);
  if(hb>=0.5) res=vec2(hb,3.0);
  // hull solid: pointed plan (two arcs), curved keel line (rocker), V-shaped sides. Exact-ish, so it marches fast.
  float lens=length(vec2(q.x,abs(q.z)+30.45))-32.05;
  float rocker=length(vec2(q.x,q.y-59.4))-60.0;
  float vee=(abs(q.z)-0.3-1.08*(q.y+0.6))/1.47;
  float solid=max(lens,max(rocker,vee));
  if(hb<0.5 && keel>0.01){
    float k=max(max(abs(q.z)-0.12, rocker-0.12), max(q.y-0.35, abs(q.x)-10.1));
    k=max(k, q.x-mix(-10.5,10.5,keel));
    res=opU(res,vec2(k,3.0));
  }
  if(hb<0.5 && planks>0.01){
    float sh=max(abs(solid)-0.07, q.y-1.4);
    sh=max(sh, q.y-mix(-0.7,1.4,planks));
    res=opU(res,vec2(sh,3.0));
    // stern post curling up and back, bow post
    float sp=min(sdCapsule(q,vec3(-9.4,0.8,0.0),vec3(-10.4,2.2,0.0),0.16), sdCapsule(q,vec3(-10.4,2.2,0.0),vec3(-9.9,3.0,0.0),0.13));
    sp=min(sp, sdCapsule(q,vec3(9.6,0.6,0.0),vec3(10.3,1.8,0.0),0.14));
    res=opU(res,vec2(max(sp, q.y-mix(-0.7,3.2,planks)),3.0));
  }
  if(hb<0.5 && rope>0.01){
    vec3 r=vec3(q.x,q.y,abs(q.z));
    float tw=0.012*sin(q.x*6.0);
    float d=sdCapsule(r-vec3(0.0,tw,0.0), vec3(-8.5,1.15,0.35), vec3(mix(-8.5,8.5,rope),1.15,0.35), 0.08);
    res=opU(res,vec2(d,13.0));
  }
  if(hb<0.5 && deck>0.01){
    vec3 dq=drop(q,deck);
    res=opU(res,vec2(sdRoundBox(dq-vec3(0.0,1.45,0.0),vec3(8.6,0.06,1.25),0.02),3.0));
    // outrigger box along each side for the top rowers
    vec3 oq=vec3(dq.x,dq.y,abs(dq.z));
    res=opU(res,vec2(sdRoundBox(oq-vec3(0.0,1.3,1.75),vec3(8.0,0.12,0.22),0.02),3.0));
  }
  float sw=mix(-0.35,0.35,row);
  res=opU(res,oarTier(q,o1,21.0,1.3,1.8,0.4,sw));   // top tier (from the outrigger)
  res=opU(res,oarTier(q,o2,19.0,0.95,1.5,0.0,sw));  // middle tier
  res=opU(res,oarTier(q,o3,19.0,0.55,1.5,0.0,sw));  // bottom tier
  if(ram>0.01){
    vec3 rq=q-vec3(mix(2.5,0.0,ram),0.0,0.0);
    float d=sdEllipsoid(rq-vec3(10.9,0.05,0.0),vec3(1.3,0.24,0.26));
    d=min(d,sdRoundBox(rq-vec3(10.0,0.05,0.0),vec3(0.35,0.3,0.3),0.04));
    res=opU(res,vec2(d,14.0));
  }
  return res;
}

// A finished trireme (used for other ships).
vec2 shipDone(vec3 q, float row){ return trireme(q,1.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,1.0,row); }

// A fleet on the water: one ship per 28 m cell inside |x|<=hx, z in [z0,z1].
vec2 pFleet(vec3 p, float hx, float z0, float z1, float row){
  float s=28.0;
  vec2 c; vec3 q=cellXZ(p,s,c);
  vec2 res=vec2(1e3,0.0);
  if(abs(c.x*s)<=hx+s && c.y*s>=z0-s && c.y*s<=z1+s) res.x=cellBound(q,s);
  if(abs(c.x*s)<=hx && c.y*s>=z0 && c.y*s<=z1){
    vec2 o=(vec2(hash2(c),hash2(c+7.3))-0.5)*vec2(1.6,5.0);
    res=opU(res,shipDone(q-vec3(o.x,0.0,o.y),fract(row+hash2(c+1.7))));
  }
  return res;
}

float stroke(){ return 0.5+0.5*sin(u_time*u_rowspd*6.2832); }

vec2 map(vec3 p){
  vec2 res=vec2(p.y,0.0);
  if(u_site<0.5){
    // Site 0: a Greek harbour town, an enemy fleet out at sea.
    res=opU(res,pWater(p,0.05));
    res=opU(res,pBlock(p-vec3(-40.0,0.4,0.0),vec3(30.0,0.4,60.0),1.0));
    res=opU(res,pWall(p-vec3(-13.0,0.8,-6.0),vec3(2.2,1.6,2.0),12.0));
    res=opU(res,pRoof(p-vec3(-13.0,4.0,-6.0),4.6,2.3,1.2,6.0));
    res=opU(res,pWall(p-vec3(-16.0,0.8,3.0),vec3(2.0,1.2,2.4),12.0));
    res=opU(res,pRoof(p-vec3(-16.0,3.2,3.0),4.2,2.6,1.1,6.0));
    vec3 t=p-vec3(-22.0,0.8,-1.0);
    res=opU(res,pBlock(t-vec3(0.0,0.3,0.0),vec3(4.0,0.3,2.4),4.0));
    vec3 tc=vec3(abs(t.x)-3.4,t.y-0.6,abs(t.z)-1.8);
    res=opU(res,pColumn(vec3(tc.x,tc.y,tc.z),0.28,3.0,4.0));
    res=opU(res,pRoof(t-vec3(0.0,3.6,0.0),4.4,2.6,1.2,4.0));
    res=opU(res,shipDone(p-vec3(22.0,0.05,0.0),stroke()));
    res=opU(res,shipDone(p-vec3(50.0,0.05,-4.0),fract(stroke()+0.3)));
  } else if(u_site<1.5){
    // Site 1: a beach shipyard. Timber, rope and people, and the empty slipway.
    res=opU(res,pLog(p,vec3(-5.0,0.25,2.0),vec3(1.0,0.25,2.6),0.25));
    res=opU(res,pLog(p,vec3(-5.0,0.25,2.55),vec3(1.0,0.25,3.15),0.25));
    res=opU(res,pLog(p,vec3(-5.0,0.68,2.3),vec3(1.0,0.68,2.9),0.25));
    vec3 tr=p-vec3(3.0,0.12,2.6);
    res=opU(res,vec2(sdTorus(tr,vec2(0.45,0.12)),13.0));
    res=opU(res,vec2(sdTorus(tr-vec3(0.0,0.24,0.0),vec2(0.42,0.12)),13.0));
    res=opU(res,vec2(sdTorus(tr-vec3(1.3,0.0,0.4),vec2(0.4,0.12)),13.0));
    res=opU(res,pPerson(p-vec3(-1.5,0.0,4.2),u_work,0.2));
    res=opU(res,pPerson(p-vec3(0.3,0.0,4.6),0.0,0.5));
    res=opU(res,pPerson(p-vec3(1.8,0.0,4.0),u_work,0.8));
    vec3 b=vec3(p.x-2.4*clamp(floor(p.x/2.4+0.5),-3.0,3.0),p.y,p.z+2.0);
    res=opU(res,pBlock(b-vec3(0.0,0.2,0.0),vec3(0.3,0.2,0.8),3.0));   // keel blocks on the slipway
  } else if(u_site<2.5){
    // Site 2: the hull on its slipway, built step by step.
    vec3 b=vec3(p.x-2.4*clamp(floor(p.x/2.4+0.5),-3.0,3.0),p.y,p.z);
    res=opU(res,pBlock(b-vec3(0.0,0.2,0.0),vec3(0.3,0.2,0.8),3.0));
    res=opU(res,trireme(p-vec3(0.0,0.75,0.0),u_keel,u_planks,u_rope,u_deck,u_sag,u_o1,u_o2,u_o3,u_ram,u_row*stroke()));
    res=opU(res,pPerson(p-vec3(-3.0,0.0,3.2),1.0,0.3));
    res=opU(res,pPerson(p-vec3(4.0,0.0,-3.0),1.0,0.6));
  } else if(u_site<3.5){
    // Site 3: the finished ship at sea; an enemy ship sideways ahead for the ramming shot.
    res=opU(res,pWater(p,0.05));
    res=opU(res,trireme(p-vec3(u_go,0.05,0.0),1.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,u_ram,u_row*stroke()));
    if(u_enemy>0.5){
      vec3 e=p-vec3(16.2,0.05-0.25*u_hit,0.0); e.xz=rot(1.5708)*e.xz; e.yz=rot(0.12*u_hit)*e.yz;
      res=opU(res,shipDone(e,0.5));
      if(u_hit>0.01) res=opU(res,vec2(sdEllipsoid(p-vec3(14.55,0.35,0.0),vec3(0.18,0.45,0.75)*u_hit),15.0));
    }
  } else {
    // Site 4: Salamis. A strait full of ships between two shores.
    res=opU(res,pWater(p,0.05));
    res=opU(res,pFleet(p,60.0,-30.0,30.0,stroke()));                   // never inside an if
    res=opU(res,vec2(sdEllipsoid(p-vec3(0.0,-6.0,-120.0),vec3(140.0,16.0,40.0)),1.0));
    res=opU(res,vec2(sdEllipsoid(p-vec3(-150.0,-6.0,0.0),vec3(45.0,14.0,140.0)),1.0));
  }
  return res;
}
