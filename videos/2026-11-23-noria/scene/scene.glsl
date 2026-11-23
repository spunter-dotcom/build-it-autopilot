// scene.glsl: noria. One world (no sites): a river in a stone-lined cut running along x, fields on the
// north bank (z < -6), a wheel in the river at z = -3.5, an aqueduct on arches beside it (z = -5.3).
// Params: u_wheel (drop in), u_R (wheel radius), u_turn (0/1 spinning), u_pad (paddles), u_box (boxes),
// u_spill (water falling back), u_aq (aqueduct rises), u_flow (water in the trough), u_crop (crop health),
// u_man (farmer shown), u_walk (farmer climbs the steps 0..1).

vec2 pCrops(vec3 p, float s, float x0, float x1, float z0, float z1, float hk){
  vec2 c; vec3 q=cellXZ(p,s,c);
  vec2 res=vec2(1e3,0.0);
  float inX=step(x0-s,c.x*s)*step(c.x*s,x1+s), inZ=step(z0-s,c.y*s)*step(c.y*s,z1+s);
  if(inX*inZ>0.5 && p.y<1.4) res.x=cellBound(q,s);
  if(c.x*s>=x0 && c.x*s<=x1 && c.y*s>=z0 && c.y*s<=z1){
    float h=(0.25+0.45*hk)*(0.8+0.4*hash2(c));
    vec3 r=q; r.xy=rot((1.0-hk)*0.7*(hash2(c+2.0)-0.3))*r.xy;   // wilted plants lean over
    res=opU(res,vec2(sdEllipsoid(r-vec3(0.0,0.5*h,0.0),vec3(0.16+0.06*hk,0.5*h,0.16+0.06*hk)),11.0));
  }
  return res;
}

vec2 map(vec3 p){
  // ground with the river cut: -6 < z < 14, floor at y = -2.6
  float cut=sdRoundBox(p-vec3(0.0,-0.3,4.0),vec3(400.0,2.3,10.0),0.0);   // box pokes above y=0 so the top really opens   // river from z=-6 to z=14
  vec2 res=vec2(max(p.y,-cut),0.0);
  res=opU(res,pWater(p,-1.2));
  // stone lining on the north bank face
  res=opU(res,pBlock(p-vec3(-4.0,-1.3,-6.15),vec3(30.0,1.3,0.15),2.0));

  // woods and the fields on the north bank
  res=opU(res,pForest(p,3.6,30.0,-32.0,-20.0));   // woods behind the fields
  res=opU(res,pCrops(p,1.2,-24.0,14.0,-16.0,-7.5,u_crop));

  // steps from the river up to the field (x = 8)
  vec3 sq=p-vec3(8.0,-2.6,-2.0); sq.z=-sq.z;
  res=opU(res,pStairs(sq,10.0,0.26,0.4,1.4,2.0));

  // farmer with a jar on the head, climbing the steps
  if(u_man>0.5){
    float k=clamp(u_walk,0.0,1.0);
    vec3 fp=vec3(8.0,-2.6+2.6*k,-2.3-3.9*k);
    vec3 pq=p-fp; pq.xz=rot(3.1416)*pq.xz;
    res=opU(res,pPerson(pq,1.0,0.35));
    res=opU(res,vec2(sdEllipsoid(p-fp-vec3(0.0,1.55,0.0),vec3(0.2,0.24,0.2)),5.0));
  }

  float R=u_R, y0=R-1.8;                       // wheel bottom sits 0.6 below the water
  // the wheel, axle, paddles and boxes
  if(u_wheel>0.01){
    vec3 w=drop(p,u_wheel)-vec3(0.0,y0,-3.5);
    // axle and its two stone piers
    res=opU(res,pLog(w,vec3(0.0,0.0,-1.1),vec3(0.0,0.0,1.2),0.22+0.02*R));
    res=opU(res,pBlock(w-vec3(0.0,-0.5*(y0+2.6)-0.3,1.0),vec3(0.6,0.5*(y0+2.6),0.25),2.0));
    res=opU(res,pBlock(w-vec3(0.0,-0.5*(y0+2.6)-0.3,-0.95),vec3(0.6,0.5*(y0+2.6),0.25),2.0));
    vec3 q=w; q.xy=rot(-u_time*0.4*u_turn)*q.xy;
    res=opU(res,pWheel(q,R,0.06+0.03*R,1.0,12.0,3.0));
    float NB=floor(mix(16.0,120.0,clamp((R-3.0)/7.5,0.0,1.0))+0.5);
    float sec=6.2832/NB;
    float a=atan(q.y,q.x);
    // paddles: centred on sector lines
    float kp=floor(a/sec+0.5); vec2 rp=rot(kp*sec)*q.xy;   // rotate the point back into sector 0
    float sp=clamp(u_pad*NB-mod(kp+NB,NB),0.0,1.0);
    res=opU(res,vec2(sdRoundBox(vec3(rp.x-R-0.15,rp.y,q.z),vec3(0.42,0.03,0.5)*sp,0.0),3.0));
    // boxes: between the paddles
    float kb=floor(a/sec)+0.5; vec2 rb=rot(kb*sec)*q.xy;
    float sb=clamp(u_box*NB-mod(floor(kb)+NB,NB),0.0,1.0);
    res=opU(res,vec2(sdRoundBox(vec3(rb.x-R-0.05,rb.y,q.z-0.05),vec3(0.24,min(0.2,0.4*R*sec),0.4)*sb,0.01),3.0));
    // water spilling back into the river from the top
    if(u_spill>0.01){
      float yb=mix(y0+R,-1.2,clamp(u_spill,0.0,1.0));
      res=opU(res,vec2(sdCapsule(p,vec3(0.35,y0+R-0.2,-3.2),vec3(0.35+0.15*(y0+R-yb),yb,-3.2),0.09),8.0));
    }
  }

  // aqueduct on arches beside the wheel, top just under the top of the wheel
  float yt=2.0*R-2.4;
  if(u_aq>0.01){
    float ph=2.0*R-1.7;
    vec3 ap=p-vec3(-11.0,-2.6,-5.3);
    float arc=pArcade(ap,6.0,3.0,ph,0.8,0.5,2.0).x;
    arc=rise(arc,ap,u_aq,yt+2.6+0.01);
    res=opU(res,vec2(arc,2.0));
    if(u_aq>0.99){
      // open trough on top, widened toward the wheel
      vec3 tp=p-vec3(-11.0,yt+0.3,-4.95);
      float tr=max(sdRoundBox(tp,vec3(12.0,0.3,0.75),0.02),-sdRoundBox(tp-vec3(0.0,0.2,0.0),vec3(11.9,0.3,0.6),0.0));
      res=opU(res,vec2(tr,2.0));
      if(u_flow>0.01){
        res=opU(res,vec2(sdRoundBox(tp-vec3(0.0,0.1,0.0),vec3(11.9,0.06,0.6),0.0),8.0));
        res=opU(res,vec2(sdCapsule(p,vec3(0.15,y0+R+0.1,-3.6),vec3(-0.25,yt+0.4,-4.7),0.11),8.0));
      }
    }
  }
  return res;
}
