// Olive press. Site 0: olive grove and village. Site 1: press yard with trapetum, basket stack, lever beam, weight stone, screw, settling pit.
vec2 map(vec3 p){
  vec2 res=vec2(p.y,0.0);
  if(u_site<0.5){
    res=opU(res,pForest(p,4.0,24.0,-26.0,-5.0));                 // olive grove (never inside an if of its own)
    res=opU(res,pWall(p-vec3(-5.0,0.0,2.5),vec3(1.6,1.1,1.3),12.0));
    res=opU(res,pRoof(p-vec3(-5.0,2.2,2.5),3.6,1.6,1.1,6.0));
    res=opU(res,pWall(p-vec3(5.5,0.0,3.0),vec3(1.4,1.0,1.2),12.0));
    res=opU(res,pRoof(p-vec3(5.5,2.0,3.0),3.2,1.5,1.0,6.0));
    res=opU(res,pPerson(p-vec3(0.0,0.0,0.5),u_squeeze,0.3));
    res=opU(res,pPerson(p-vec3(-2.2,0.0,-1.5),1.0,0.6));
    res=opU(res,pBarrel(p-vec3(0.8,0.0,0.9),0.3,0.6));
    res=opU(res,vec2(sdSphere(p-vec3(0.8,0.62,0.9),0.24),11.0));  // olives heaped in the basket
  } else {
    // ---- trapetum (crushing mill) ----
    vec3 t=p-vec3(3.8,0.0,-4.5);
    if(u_tra>0.01){
      vec3 tq=drop(t,u_tra);
      float bowl=max(sdCylinder(tq-vec3(0.0,0.3,0.0),0.3,1.15),-sdCylinder(tq-vec3(0.0,0.62,0.0),0.32,0.97));
      res=opU(res,vec2(bowl,2.0));
      res=opU(res,vec2(sdCylinder(tq-vec3(0.0,0.55,0.0),0.55,0.12),2.0));       // central post
      res=opU(res,vec2(sdCylinder(tq-vec3(0.0,0.34,0.0),0.04,0.96),u_paste>0.5?1.0:11.0)); // olives -> paste
      vec3 r=tq; r.xz=rot(u_spin)*r.xz;
      res=opU(res,pLog(r,vec3(-1.9,0.95,0.0),vec3(1.9,0.95,0.0),0.08));           // beam through the post
      res=opU(res,vec2(sdCylinder((r-vec3(0.45,0.72,0.0)).yxz,0.15,0.42),2.0));   // crushing wheels
      res=opU(res,vec2(sdCylinder((r-vec3(-0.45,0.72,0.0)).yxz,0.15,0.42),2.0));
      res=opU(res,pPerson(r-vec3(2.15,0.0,0.0),1.0,0.2));
    }
    // ---- press bed, baskets, wall ----
    res=opU(res,pWall(p-vec3(-0.9,0.0,0.0),vec3(0.35,2.1,2.6),2.0));
    res=opU(res,pBlock(p-vec3(1.5,0.17,0.0),vec3(0.9,0.17,0.9),2.0));
    res=opU(res,pBlock(p-vec3(1.5,0.08,1.25),vec3(0.12,0.08,0.45),2.0));          // channel to the pit
    float bh=0.26*(1.0-0.2*clamp(u_sink,0.0,1.0));
    float nb=count(u_bask,5.0);
    vec3 b=p-vec3(1.5,0.35,0.0);
    float k=clamp(floor(b.y/bh),0.0,max(nb-1.0,0.0));
    float bd=sdCylinder(b-vec3(0.0,(k+0.5)*bh,0.0),0.5*bh-0.015,0.55);
    if(nb>0.5) res=opU(res,vec2(max(bd,b.y-nb*bh),13.0));
    // ---- lever beam ----
    float top=0.35+5.0*bh;
    float a=atan(top+0.2-1.85,1.8);
    vec2 dir=vec2(cos(a),sin(a));
    vec3 P=vec3(-0.3,1.85,0.0);
    vec3 E=P+vec3(dir*6.7,0.0);
    if(u_beam>0.01) res=opU(res,pLog(drop(p,u_beam),P-vec3(dir*0.5,0.0),E,0.2));
    // ---- weight stone and screw ----
    float sy=u_screw>0.5 ? 0.4+0.45*u_lift : max(E.y-0.95,0.4);
    if(u_stone>0.01){
      vec3 s=drop(p-vec3(E.x,sy,0.0),u_stone);
      res=opU(res,pBlock(s,vec3(0.55,0.4,0.55),2.0));
      if(u_screw<0.5) res=opU(res,pRope(p,vec3(E.x,sy+0.4,0.0),E));
    }
    if(u_screw>0.01){
      vec3 c=drop(p-vec3(E.x,0.0,0.0),u_screw);
      float th=0.17+0.035*sin(atan(c.z,c.x)+c.y*14.0-u_turn*6.2832);
      float sc=max(length(c.xz)-th,abs(c.y-(sy+1.6))-1.6);
      res=opU(res,vec2(sc*0.7,3.0));
      res=opU(res,pLog(c,vec3(-0.6,3.0,0.0),vec3(0.6,3.0,0.0),0.06));   // turning bar on top
    }
    // ---- workers ----
    res=opU(res,pPerson(p-vec3(E.x+1.0,0.0,0.9),u_work,0.5));
    res=opU(res,pPerson(p-vec3(E.x-0.9,0.0,-1.0),u_work,0.8));
    // ---- settling pit ----
    vec3 q=p-vec3(1.5,0.0,2.4);
    res=opU(res,vec2(max(sdCylinder(q-vec3(0.0,0.3,0.0),0.3,0.75),-sdCylinder(q-vec3(0.0,0.45,0.0),0.3,0.6)),2.0));
    float yl=0.15+0.35*clamp(u_fill,0.0,1.0);
    if(u_fill>0.01) res=opU(res,vec2(sdCylinder(q-vec3(0.0,0.5*yl,0.0),0.5*yl,0.61),u_settle>0.5?8.0:1.0));
    float ot=0.07*(1.0-clamp(u_pour,0.0,1.0));
    if(u_settle>0.5 && ot>0.005) res=opU(res,vec2(sdCylinder(q-vec3(0.0,yl+ot,0.0),ot,0.61),14.0));
    if(u_flow>0.5) res=opU(res,vec2(sdCapsule(p,vec3(1.5,0.2,0.75),vec3(1.5,0.2,1.75),0.05),14.0));
    res=opU(res,pPerson(p-vec3(2.7,0.0,3.0),u_pour>0.01?1.0:0.0,0.1));
    if(u_pour>0.01) res=opU(res,pBarrel(p-vec3(2.3,0.0,2.6),0.22,0.5));
  }
  return res;
}
