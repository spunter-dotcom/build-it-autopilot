// scene.glsl: ballista. Ballista at the origin (moved along z by u_pos) shoots toward -z at a city wall at z = -34.
// The gastraphetes (belly bow) stands apart at x = -30. Every part is evaluated once per map call (no site branches).

// Gastraphetes held by a person facing +z. push = string drawn back (0..1.3), aim = 0 pointing at the ground, 1 level.
vec2 bellyBow(vec3 q){
  vec2 res=pPerson(q,0.0,0.3);
  if(u_bow<0.01) return res;
  vec3 b=drop(q,u_bow);
  vec3 B=vec3(0.0,0.78,0.2);
  vec3 dir=normalize(mix(vec3(0.0,-0.78,0.72),vec3(0.0,0.05,1.0),u_aim));
  vec3 F=B+dir*1.05;
  res=opU(res,pLog(b,B,F,0.045));                               // stock
  vec3 side=vec3(1.0,0.0,0.0);
  vec3 tipL=F+side*0.55-dir*(0.12+0.25*u_push), tipR=F-side*0.55-dir*(0.12+0.25*u_push);
  res=opU(res,pLog(b,F,tipL,0.035)); res=opU(res,pLog(b,F,tipR,0.035)); // the bow
  vec3 cl=F-dir*(0.08+0.6*u_push);
  res=opU(res,vec2(min(sdCapsule(b,tipL,cl,0.012),sdCapsule(b,tipR,cl,0.012)),13.0));
  return res;
}

vec2 ballista(vec3 q){
  float bb=sdRoundBox(q-vec3(0.0,1.0,0.6),vec3(2.0,1.1,2.6),0.0);
  if(bb>1.0) return vec2(bb,0.0);
  vec2 res=vec2(1e3,0.0);
  float D=u_draw*(1.0-u_fire);                                   // string pull right now
  float S=u_draw;                                                // slider position (stays back after the shot)
  float th=mix(-0.2,0.75,D), thS=mix(-0.2,0.75,S);
  float tipz=-1.0+1.15*sin(th);
  float clawz=mix(tipz,1.5,D);
  float slz=mix(-1.0+1.15*sin(thS),1.5,S);
  if(u_frame>0.01){
    vec3 f=drop(q,u_frame);
    res=opU(res,pBeam(f-vec3(0.0,1.1,0.4),vec3(0.12,0.08,1.7)));          // stock
    res=opU(res,pLog(f,vec3(0.0,0.0,0.4),vec3(0.0,1.05,0.4),0.1));          // post
    res=opU(res,pBeam(f-vec3(0.0,0.06,0.4),vec3(0.9,0.06,0.08)));           // feet
    res=opU(res,pBeam(f-vec3(0.0,0.06,0.4),vec3(0.08,0.06,0.9)));
    res=opU(res,pLog(f,vec3(0.0,0.5,0.4),vec3(0.0,1.0,-0.6),0.06));         // brace
    vec3 fr=f-vec3(0.0,0.0,-1.0);
    res=opU(res,pBeam(fr-vec3(0.0,1.62,0.0),vec3(0.82,0.07,0.13)));         // spring frame top and bottom
    res=opU(res,pBeam(fr-vec3(0.0,0.84,0.0),vec3(0.82,0.07,0.13)));
    vec3 ps=vec3(abs(fr.x),fr.y,fr.z);
    res=opU(res,pBeam(ps-vec3(0.78,1.23,0.0),vec3(0.05,0.36,0.11)));        // outer and inner stanchions
    res=opU(res,pBeam(ps-vec3(0.22,1.23,0.0),vec3(0.05,0.36,0.11)));
  }
  vec3 sq=q-vec3(0.0,0.0,-1.0); sq.x=abs(sq.x)-0.5;
  if(u_spring>0.01){
    float a=atan(sq.z,sq.x);
    float tw=0.018*sin(a*7.0+sq.y*30.0*u_spring);                // twisted skein
    float sk=sdCylinder(sq-vec3(0.0,1.23,0.0),0.31,0.13)+tw;
    sk=max(sk*0.8, sq.y-0.92-0.62*u_spring);
    res=opU(res,vec2(sk,13.0));
    res=opU(res,vec2(sdCylinder(sq-vec3(0.0,1.72,0.0),0.035,0.16*u_spring),7.0)); // bronze washer on top
  }
  vec3 tip=vec3(0.5+1.15*cos(th),1.23,tipz);
  if(u_arms>0.01){
    vec3 aq=drop(q,u_arms); aq.x=abs(aq.x);
    res=opU(res,pLog(aq,vec3(0.5,1.23,-1.0),tip,0.06));
  }
  if(u_string>0.01){
    vec3 rq=q; rq.x=abs(rq.x);
    vec3 cl=vec3(0.0,1.25,clawz);
    vec3 t2=mix(cl,tip,u_string);
    res=opU(res,vec2(sdCapsule(rq,t2,cl,0.022),13.0));
  }
  float W=S*14.0;
  if(u_winch>0.01){
    vec3 w=drop(q,u_winch)-vec3(0.0,1.0,1.95);
    res=opU(res,pLog(w,vec3(-0.45,0.0,0.0),vec3(0.45,0.0,0.0),0.09));
    vec3 hq=w; hq.yz=rot(W)*hq.yz; hq.x=abs(hq.x)-0.5;
    res=opU(res,pLog(hq,vec3(0.0,-0.35,0.0),vec3(0.0,0.35,0.0),0.035));
    res=opU(res,pLog(hq,vec3(0.0,0.0,-0.35),vec3(0.0,0.0,0.35),0.035));
    res=opU(res,pRope(q,vec3(0.0,1.08,1.95),vec3(0.0,1.25,slz)));
  }
  if(u_ratchet>0.01){
    vec3 g=drop(q,u_ratchet)-vec3(0.3,1.0,1.95);
    vec3 gg=vec3(g.z,g.y,g.x); gg.xy=rot(W)*gg.xy;
    res=opU(res,pGear(gg,0.17,10.0,0.05,0.05,7.0));
    res=opU(res,vec2(sdCapsule(g,vec3(0.0,0.4,-0.3),vec3(0.0,0.2,-0.08),0.025),7.0)); // pawl
  }
  if(u_slider>0.01){
    vec3 s=drop(q,u_slider);
    res=opU(res,pBeam(s-vec3(0.0,1.23,slz-1.0),vec3(0.08,0.04,1.0)));
    if(u_trig>0.01){
      res=opU(res,vec2(sdRoundBox(drop(s,u_trig)-vec3(0.0,1.3,slz+0.05),vec3(0.04,0.08,0.05),0.01),7.0));
      res=opU(res,vec2(sdCapsule(drop(s,u_trig),vec3(0.0,1.2,slz+0.08),vec3(0.0,1.0,slz+0.3),0.02),7.0));
    }
  }
  // crew member at the winch, facing -z
  vec3 pq=q-vec3(1.05,0.0,2.5); pq.xz=-pq.xz;
  res=opU(res,pPerson(pq,u_work,0.6));
  return res;
}

vec2 cityWall(vec3 p){
  vec3 w=p-vec3(0.0,0.0,-34.0);
  float bb=sdRoundBox(w-vec3(0.0,5.0,0.0),vec3(14.0,6.0,4.0),0.0);
  if(bb>1.0) return vec2(bb,0.0);
  vec2 res=pWall(w,vec3(16.0,3.5,1.0),2.0);
  vec3 t=vec3(abs(w.x)-9.0,w.y,w.z);
  res=opU(res,pWall(t,vec3(2.2,5.0,2.2),2.0));
  // battlements along the top
  float mx=mod(w.x+0.5,1.6)-0.8;
  float bt=sdRoundBox(vec3(mx,w.y-7.35,w.z-0.6),vec3(0.45,0.35,0.35),0.02);
  res=opU(res,vec2(max(bt,abs(w.x)-16.0),2.0));
  if(u_crack>0.01){
    vec3 c=w-vec3(0.0,3.2,1.0);
    float k=u_crack;
    float d=sdCapsule(c,vec3(0.0),vec3(1.4,1.1,0.0)*k,0.07);
    d=min(d,sdCapsule(c,vec3(0.0),vec3(-1.2,1.3,0.0)*k,0.06));
    d=min(d,sdCapsule(c,vec3(0.0),vec3(0.4,-2.4,0.0)*k,0.07));
    d=min(d,sdCapsule(c,vec3(0.0),vec3(-1.5,-1.2,0.0)*k,0.06));
    d=min(d,sdEllipsoid(c,vec3(0.55,0.5,0.12)*k));
    res=opU(res,vec2(d,15.0));
    res=opU(res,pRock(drop(w-vec3(0.8,0.25,2.0),k),0.35));
    res=opU(res,pRock(drop(w-vec3(-0.6,0.2,2.6),k),0.28));
  }
  return res;
}

vec2 map(vec3 p){
  vec2 res=vec2(p.y,0.0);
  res=opU(res,cityWall(p));
  res=opU(res,ballista(p-vec3(0.0,0.0,u_pos)));
  res=opU(res,bellyBow(p-vec3(-30.0,0.0,0.0)));
  if(u_stone>0.01){
    vec3 s0=vec3(0.0,1.42,mix(-1.0+1.15*sin(mix(-0.2,0.75,u_draw)),1.5,u_draw)-0.25+u_pos);
    vec3 s1=vec3(0.0,3.2,-33.0);
    vec3 sp=mix(s0,s1,u_fly)+vec3(0.0,7.0*sin(3.1416*u_fly),0.0);
    float d=u_fly>0.98 ? 1e3 : sdSphere(drop(p,u_stone)-sp,0.14);
    res=opU(res,vec2(d,2.0));
  }
  return res;
}
