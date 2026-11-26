// scene.glsl: castle drawbridge. Site 0 = castle, moat and bridge (front faces +z). Site 1 = windlass room above the gate.
// Bridge hinge at z=0.2, deck length 5.6 over a moat from z=0.6 to z=5.4. Lift angle a = u_raise * 90 degrees.
// Gaffs pivot at y=6.6 above the hinge with the same length, so the chains stay vertical (parallelogram).
float sdBoxK(vec3 p, vec3 b){ vec3 q=abs(p)-b; return length(max(q,0.0))+min(max(q.x,max(q.y,q.z)),0.0); }

vec2 castle(vec3 p){
  // curtain wall x -11..11, z -3..0, height 9, with the gate passage cut through
  float w=sdBoxK(p-vec3(0.0,4.5,-1.5),vec3(11.0,4.5,1.5));
  w=max(w,-sdBoxK(p-vec3(0.0,1.8,-1.5),vec3(1.3,1.8,1.7)));
  vec2 r=vec2(w,2.0);
  // merlons along the top (limited repetition)
  vec3 m=p-vec3(0.0,9.4,-1.5); m.x-=1.4*clamp(floor(m.x/1.4+0.5),-7.0,7.0);
  r=opU(r,vec2(sdBoxK(m,vec3(0.4,0.45,1.4)),2.0));
  // gate towers either side
  vec3 t=vec3(abs(p.x)-3.4,p.y,p.z+0.6);
  r=opU(r,vec2(sdCylinder(t-vec3(0.0,6.0,0.0),6.0,1.9),2.0));
  vec3 tm=t-vec3(0.0,12.4,0.0); float ta=atan(tm.z,tm.x); float sec=6.2832/8.0;
  float aa=mod(ta+0.5*sec,sec)-0.5*sec; vec2 tq=length(tm.xz)*vec2(cos(aa),sin(aa));
  r=opU(r,vec2(max(max(abs(tq.x-1.6)-0.3,abs(tq.y)-0.35),abs(tm.y)-0.45),2.0));
  // chain holes / gaff slots above the gate
  r=opU(r,vec2(sdBoxK(vec3(abs(p.x)-1.2,p.y-6.6,p.z-0.02),vec3(0.18,0.25,0.03)),15.0));
  return r;
}

vec2 map(vec3 p){
  vec2 res;
  if(u_site<0.5){
    // ground with the moat ditch (the cut box pokes above y=0)
    float g=p.y;
    if(u_dig>0.01) g=max(g,-sdBoxK(p-vec3(0.0,0.0,3.0),vec3(40.0,2.2*u_dig,2.4)));
    res=vec2(g,0.0);
    if(u_moat>0.01) res=opU(res,vec2(max(p.y-(-2.0+1.6*u_moat),sdBoxK(p-vec3(0.0,-1.0,3.0),vec3(40.0,1.2,2.45))),8.0));
    res=opU(res,castle(p));
    float a=1.5708*clamp(u_raise,0.0,1.0);
    vec3 dir=vec3(0.0,sin(a),cos(a));
    // bridge deck with cross planks
    if(u_deck>0.01){
      vec3 q=drop(p,u_deck)-vec3(0.0,0.15,0.2); q.yz=rot(-a)*q.yz;
      res=opU(res,pPlank(q-vec3(0.0,0.0,2.8),vec3(1.25,0.1,2.8)));
      vec3 c=q-vec3(0.0,0.13,2.8); c.z-=0.7*clamp(floor(c.z/0.7+0.5),-3.0,3.0);
      res=opU(res,pBeam(c,vec3(1.3,0.04,0.08)));
    }
    vec3 hinge=vec3(0.0,0.25,0.2), endD=hinge+5.4*dir;
    if(u_chain>0.01){
      vec3 top= u_gaff>0.5 ? vec3(0.0,6.6,0.3)+5.4*dir : vec3(0.0,6.6,0.05);
      vec3 pa=vec3(abs(p.x)-1.2,p.y,p.z);
      vec3 b=mix(endD,top,clamp(u_chain,0.0,1.0));
      res=opU(res,vec2(sdCapsule(pa,endD,b,0.06),7.0));
    }
    // lifting arms (gaffs): pivot above the gate, inner ends into the wall
    if(u_gaff>0.01){
      vec3 pg=drop(p,u_gaff); vec3 pa=vec3(abs(pg.x)-1.2,pg.y,pg.z);
      vec3 piv=vec3(0.0,6.6,0.3);
      res=opU(res,vec2(sdCapsule(pa,piv-2.5*dir,piv+5.5*dir,0.17),3.0));
    }
    // portcullis in the gate passage, drops from above
    if(u_port>0.01){
      vec3 g2=p-vec3(0.0,1.8+3.4*(1.0-u_port),-1.6);
      vec3 gb=g2; gb.x-=0.32*clamp(floor(gb.x/0.32+0.5),-3.0,3.0);
      float bars=sdCapsule(gb,vec3(0.0,-1.8,0.0),vec3(0.0,1.8,0.0),0.05);
      vec3 gh=g2; gh.y-=0.6*clamp(floor(gh.y/0.6+0.5),-2.0,2.0);
      bars=min(bars,sdBoxK(gh,vec3(1.25,0.05,0.06)));
      res=opU(res,vec2(max(bars,sdBoxK(g2,vec3(1.3,1.85,0.2))),7.0));
    }
    // people: soldiers march from the far bank, villagers wait
    for(int i=0;i<3;i++){
      float fi=float(i);
      float z=11.0+1.2*fi-10.5*u_march;
      float y=(z>0.4 && z<5.8) ? 0.25 : 0.0;
      res=opU(res,pPerson(p-vec3(-0.6+0.6*fi,y,z),0.0,0.15+0.1*fi));
    }
    res=opU(res,pPerson(p-vec3(3.0,0.0,7.2),u_wave,0.7));
    res=opU(res,pPerson(p-vec3(4.0,0.0,7.6),0.0,0.85));
    res=opU(res,pForest(p,4.0,30.0,-40.0,-16.0));
  } else {
    // windlass room: plank floor, stone walls, drum with handle wheels, chains down through the floor
    res=vec2(p.y,0.0);
    res=opU(res,pWall(p-vec3(0.0,0.0,-2.2),vec3(4.5,1.8,0.3),2.0));
    res=opU(res,pWall(vec3(abs(p.x)-4.5,p.y,p.z),vec3(0.3,1.8,3.0),2.0));
    res=opU(res,vec2(sdBoxK(vec3(abs(p.x)-1.2,p.y,p.z-1.3),vec3(0.2,0.02,0.2)),15.0));
    float turn=u_turn;
    if(u_drum>0.01){
      vec3 d=drop(p,u_drum)-vec3(0.0,1.1,-0.6);
      vec3 dc=d.yxz; dc.xz=rot(turn)*dc.xz;
      res=opU(res,vec2(sdCylinder(dc,1.9,0.35),3.0));
      vec3 wq=vec3(abs(d.x)-2.1,d.y,d.z).zyx; wq.xy=rot(turn)*wq.xy;
      res=opU(res,pWheel(wq,0.9,0.05,0.12,6.0,3.0));
      // posts holding the axle
      res=opU(res,pBeam(vec3(abs(d.x)-2.45,d.y+0.55,d.z),vec3(0.1,0.6,0.12)));
    }
    // chains from the drum (or from hands) down through the floor holes
    vec3 pc=vec3(abs(p.x)-1.2,p.y,p.z);
    float cy= u_drum>0.5 ? 1.1 : 1.0;
    res=opU(res,vec2(sdCapsule(pc,vec3(0.0,0.0,1.3),vec3(0.0,cy,u_drum>0.5 ? -0.3 : 0.6),0.05),7.0));
    // counterweights: stone blocks hung on chains near the front, they sink as the bridge rises
    if(u_cw>0.01){
      vec3 w=drop(p,u_cw); vec3 wc=vec3(abs(w.x)-3.2,w.y-(1.4-0.9*u_raise),w.z-0.8);
      res=opU(res,pBlock(wc,vec3(0.35,0.4,0.35),2.0));
      res=opU(res,vec2(sdCapsule(wc,vec3(0.0,0.4,0.0),vec3(0.0,3.0,0.0),0.05),7.0));
    }
    // guards at the handles
    res=opU(res,pPerson(p-vec3(-2.1,0.0,0.6),1.0,0.25));
    res=opU(res,pPerson(p-vec3(2.1,0.0,0.6),1.0,0.45));
  }
  return res;
}
