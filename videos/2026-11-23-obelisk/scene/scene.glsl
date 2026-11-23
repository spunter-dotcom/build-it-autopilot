// scene.glsl: raising an Egyptian obelisk. Three sets (u_site):
// 0 quarry at Aswan: a bedrock shelf (top y=2) with an obelisk lying along x, freed by a trench that deepens
//   with u_trench; workers pound with stone balls; red marks on the far trench wall (u_marks); a crack (u_crack).
// 1 the Nile: river (z > -2) and a sandy bank with four trees; the obelisk on a wooden sledge moves along the bank (u_sx);
//   a barge (centre x = u_bx) carries it once u_load > 0.5.
// 2 the temple: pylon behind (z=-9), pedestal at the origin inside a brick sand pit (walls 5 high), a brick ramp
//   along +x. u_haul slides the obelisk (base first) along the ramp top to the pit; u_sand drains the pit so the
//   base sinks onto the pedestal; u_pull swings it upright with ropes (u_rope) held by a team; u_cut removes the
//   pit's front wall; u_clear hides ramp and pit (finished monument).
// The obelisk is scaled to 10 m long (real ones 20-42 m); sizes come from cards.

const float OL=10.0;   // shaft length
const float OW=0.55;   // half width at the base

// obelisk in its own frame: base centre at origin, axis +y
float sdObelisk(vec3 q){
  float bnd=sdCapsule(q,vec3(0.0),vec3(0.0,OL+0.6,0.0),0.85);
  if(bnd>0.3) return bnd;
  float t=clamp(q.y/OL,0.0,1.0);
  float w=mix(OW,0.38,t);
  float m=max(abs(q.x),abs(q.z));
  float shaft=max(m-w,abs(q.y-0.5*OL)-0.5*OL)*0.95;
  float py=q.y-OL;
  float cap=max(max(m-0.38*(1.0-py/0.6),-py),py-0.6)*0.7;
  return min(shaft,cap);
}

// obelisk in the xy plane: bottom-face line through b with direction d (unit), lying on its side face
vec2 pObeliskXY(vec3 p, vec2 b, vec2 d){
  vec2 n=vec2(-d.y,d.x);
  vec3 l=p-vec3(b+n*OW,0.0);
  vec3 q=vec3(dot(l.xy,n),dot(l.xy,d),l.z);
  return vec2(sdObelisk(q),4.0);
}

vec2 pPounder(vec3 p, float i){
  float s=0.5+0.5*sin(u_time*7.0+i*1.9);
  vec2 r=pPerson(p,s,i*0.37);
  r=opU(r,vec2(sdSphere(p-vec3(0.0,0.9+0.6*s,-0.45),0.17),2.0));
  return r;
}

vec2 map(vec3 p){
  vec2 res=vec2(p.y,0.0);
  if(u_site<0.5){
    // ---- quarry ----
    float rock=sdRoundBox(p-vec3(0.0,1.0,0.0),vec3(10.0,1.0,4.5),0.05);
    float dep=1.4*clamp(u_trench,0.0,1.0);
    float tr=sdRoundBox(p-vec3(0.3,2.2-0.5*(dep+0.2),0.0),vec3(6.3,0.5*(dep+0.2),1.2),0.0);
    vec3 o=p-vec3(-5.0,2.0-OW,0.0); o=vec3(-o.y,o.x,o.z);           // axis along +x, top face at y=2
    float ob=max(sdObelisk(o),p.y-2.0);
    res=opU(res,vec2(max(rock,-tr),1.0));
    res=opU(res,vec2(ob,4.0));
    if(u_crack>0.01){
      vec3 c=p-vec3(-2.2,1.5,0.0); c.xz=rot(0.25)*c.xz;
      res=opU(res,vec2(sdRoundBox(c,vec3(0.035*u_crack,0.62,0.75),0.0),15.0));
    }
    if(u_marks>0.01){
      float mi=clamp(floor((p.x+4.5)/2.4+0.5),0.0,4.0);
      res=opU(res,vec2(sdRoundBox(p-vec3(-4.5+2.4*mi,2.0-0.7*u_marks,-1.21),vec3(0.05,0.7*u_marks,0.02),0.0),5.0));
    }
    // workers on the near edge of the trench
    float wy=2.0;
    float wb=sdRoundBox(p-vec3(0.85,3.0,1.6),vec3(5.0,1.2,0.7),0.0);
    if(wb>0.5) res=opU(res,vec2(wb,9.0)); else {
      float wi=clamp(floor((p.x+3.5)/3.0+0.5),0.0,3.0);
      res=opU(res,pPounder(p-vec3(-3.5+3.0*wi,wy,1.75),wi));
    }
    res=opU(res,pRock(p-vec3(-14.0,0.0,-6.0),2.5));
    res=opU(res,pRock(p-vec3(13.0,0.0,-5.0),2.0));
  } else if(u_site<1.5){
    // ---- the Nile ----
    res=opU(res,pWater(p,0.1));
    res=opU(res,vec2(sdRoundBox(p-vec3(0.0,0.25,-32.0),vec3(200.0,0.3,30.0),0.2),0.0));
    float fb=sdRoundBox(p-vec3(0.5,4.0,-15.0),vec3(14.5,4.0,3.0),0.0);
    if(fb>0.5) res=opU(res,vec2(fb,11.0)); else {
      res=opU(res,pTree(p-vec3(-12.0,0.55,-14.0),3.6));
      res=opU(res,pTree(p-vec3(-4.0,0.55,-16.0),4.2));
      res=opU(res,pTree(p-vec3(4.5,0.55,-13.5),3.4));
      res=opU(res,pTree(p-vec3(13.0,0.55,-15.5),4.0));
    }
    // the barge
    vec3 b=p-vec3(u_bx,0.0,4.0);
    float bbx=sdRoundBox(b-vec3(0.0,1.0,0.0),vec3(9.5,1.6,2.8),0.0);
    if(bbx>0.5) res=opU(res,vec2(bbx,3.0)); else {
    float hull=max(sdEllipsoid(b-vec3(0.0,0.2,0.0),vec3(9.0,1.0,2.4)),b.y-0.6);
    res=opU(res,vec2(hull,3.0));
    res=opU(res,pBeam(b-vec3(-7.6,1.2,0.0),vec3(0.08,0.9,0.08)));
    res=opU(res,pPerson(b-vec3(-7.0,0.6,0.9),1.0,0.2));
    res=opU(res,pPerson(b-vec3(7.0,0.6,-0.9),1.0,0.6));
    res=opU(res,pPerson(b-vec3(6.4,0.6,1.0),1.0,0.8));
    if(u_load>0.5){
      vec3 o=b-vec3(-4.6,0.6+OW,0.0); o=vec3(-o.y,o.x,o.z);
      res=opU(res,vec2(sdObelisk(o),4.0));
    }
    }
    if(u_load<0.5){
      // on a sledge on the bank, haulers ahead with ropes
      vec3 s=p-vec3(u_sx,0.55,-4.0);
      float sb=sdRoundBox(s-vec3(1.1,0.5,0.0),vec3(9.5,1.2,1.4),0.0);
      if(sb>0.5) res=opU(res,vec2(sb,3.0)); else {
      res=opU(res,pBeam(s-vec3(5.0,0.12,0.45),vec3(5.6,0.12,0.12)));
      res=opU(res,pBeam(s-vec3(5.0,0.12,-0.45),vec3(5.6,0.12,0.12)));
      vec3 o=s-vec3(0.0,0.24+OW,0.0); o=vec3(-o.y,o.x,o.z);
      res=opU(res,vec2(sdObelisk(o),4.0));
      float si=clamp(floor((-s.x-2.0)/1.3+0.5),0.0,3.0);
      float sz=s.z>0.0 ? 0.0 : 0.6;
      res=opU(res,pPerson(s-vec3(-2.0-1.3*si-sz,-0.55,sign(s.z)*0.9),1.0,0.1*si+sz));
      res=opU(res,pRope(s,vec3(0.0,0.3,0.4),vec3(-7.0,1.0,0.9)));
      res=opU(res,pRope(s,vec3(0.0,0.3,-0.4),vec3(-7.6,1.0,-0.9)));
      }
    }
  } else {
    // ---- the temple ----
    // pylon gateway behind
    res=opU(res,pWall(p-vec3(-6.0,0.0,-10.0),vec3(4.0,6.0,1.6),12.0));
    res=opU(res,pWall(p-vec3(6.0,0.0,-10.0),vec3(4.0,6.0,1.6),12.0));
    res=opU(res,pWall(p-vec3(0.0,0.0,-10.0),vec3(2.0,4.0,1.2),12.0));
    res=opU(res,vec2(sdRoundBox(p-vec3(0.0,1.8,-8.75),vec3(1.0,1.8,0.1),0.0),15.0));
    // pedestal with its turning groove
    res=opU(res,pBlock(p-vec3(0.0,0.4,0.0),vec3(0.95,0.4,0.95),2.0));
    res=opU(res,vec2(sdRoundBox(p-vec3(OW,0.8,0.0),vec3(0.06,0.03,0.75),0.0),15.0));
    // the obelisk
    float yb=max(mix(4.95,0.3,clamp(u_sand,0.0,1.0)),0.8);
    vec2 bb=vec2(mix(6.0,OW,clamp(u_haul,0.0,1.0)),yb);
    vec2 E=vec2(2.2,5.0);
    vec2 d=yb>4.9 ? vec2(1.0,0.0) : normalize(E-bb);
    if(u_pull>0.001){
      float a0=atan(d.y,d.x);
      float a=mix(a0,1.5708,clamp(u_pull,0.0,1.0));
      d=vec2(cos(a),sin(a));
    }
    if(u_hide<0.5) res=opU(res,pObeliskXY(p,bb,d));
    if(u_rope>0.5){
      vec2 n=vec2(-d.y,d.x);
      vec3 top=vec3(bb+n*OW+d*7.0,0.0);
      res=opU(res,pRope(p,top+vec3(0.0,0.0,0.3),vec3(-9.0,1.0,1.0)));
      res=opU(res,pRope(p,top-vec3(0.0,0.0,0.3),vec3(-9.0,1.0,-1.0)));
      float tb=sdRoundBox(p-vec3(-11.0,0.8,0.0),vec3(2.8,0.9,1.4),0.0);
      if(tb>0.5) res=opU(res,vec2(tb,9.0)); else
      {
        float ti=clamp(floor((-p.x-9.0)/1.2+0.5),0.0,3.0);
        float tz=p.z>0.0 ? 0.0 : 0.5;
        res=opU(res,pPerson(p-vec3(-9.0-1.2*ti-tz,0.0,sign(p.z)*1.0),1.0,0.15*ti+tz));
      }
    }
    float gb=sdRoundBox(p-vec3(11.8,2.6,0.0),vec3(14.4,2.7,2.4),0.0);
    if(u_clear<0.5 && gb>0.5) res=opU(res,vec2(gb,5.0));
    else if(u_clear<0.5){
      // sand pit: brick walls 5 high around the pedestal
      float wall=max(sdRoundBox(p-vec3(0.0,2.5,0.0),vec3(2.2,2.5,2.2),0.0),-sdRoundBox(p-vec3(0.0,2.5,0.0),vec3(1.8,3.0,1.8),0.0));
      if(u_cut>0.5) wall=max(wall,p.z-1.6);
      res=opU(res,vec2(wall,5.0));
      float sl=mix(4.95,0.3,clamp(u_sand,0.0,1.0));
      float sand=sdRoundBox(p-vec3(0.0,0.5*sl,0.0),vec3(1.79,0.5*sl,1.79),0.0);
      sand=max(sand,-sdRoundBox(p-vec3(0.0,0.4,0.0),vec3(0.96,0.41,0.96),0.0));
      res=opU(res,vec2(sand,0.0));
      // drained sand piles up outside
      float ps=clamp(u_sand,0.0,1.0);
      if(ps>0.01) res=opU(res,vec2(sdEllipsoid(p-vec3(0.0,0.0,-3.4),vec3(1.8,1.3*ps,1.0)),0.0));
      // ramp: level top x 2.2..12 at y 5, slope down to x 26
      float rt=sdRoundBox(p-vec3(7.1,2.5,0.0),vec3(4.9,2.5,1.5),0.0);
      float rs=max(sdRoundBox(p-vec3(19.0,2.5,0.0),vec3(7.0,2.5,1.5),0.0),(p.y-5.0*(26.0-p.x)/14.0)*0.94);
      res=opU(res,vec2(min(rt,rs),5.0));
      // haulers on the ramp behind the obelisk's top end
      if(u_haul>0.01 && u_haul<0.999){
        float hx=bb.x+11.2, hy=min(5.0,5.0*(26.0-hx)/14.0);
        res=opU(res,pPerson(p-vec3(hx,hy,0.7),1.0,0.3));
        res=opU(res,pPerson(p-vec3(hx,hy,-0.7),1.0,0.7));
      }
    }
  }
  return res;
}
