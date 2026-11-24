// scene.glsl: water clock (clepsydra). Site 0 Egyptian temple court with the outflow bowl,
// site 1 an Athenian court, site 2 Ctesibius's inflow clock.

// Frustum: radius rb at y=0 to rt at y=h (approximate distance, scaled for safety).
float sdFrustum(vec3 p, float rb, float rt, float h){
  float r=mix(rb,rt,clamp(p.y/h,0.0,1.0));
  return max(length(p.xz)-r, abs(p.y-0.5*h)-0.5*h)*0.9;
}
// Cut away the quadrant x>0, z>0 (faces a camera at ang about 0.78).
float cutQ(float d, vec3 p){ return max(d, min(p.x,p.z)); }

// Outflow bowl standing on y=0 (its own base), height 1.0. sl 0 straight sides, 1 sloped.
// lv water level 0..1, mk hour marks 0..1, cl 0 one column / 1 twelve columns, cut 1 = cutaway.
vec2 pBowl(vec3 p, float sl, float lv, float mk, float cl, float cut){
  float H=1.0, rt=0.62, rb=mix(0.62,0.36,sl), w=0.07;
  float outer=sdFrustum(p,rb,rt,H);
  float inner=sdFrustum(p-vec3(0.0,0.08,0.0),rb-w,rt-w,H);
  float sh=max(outer,-inner);
  if(cut>0.5) sh=cutQ(sh,p);
  vec2 res=vec2(sh,4.0);
  // water
  float ly=0.08+lv*(H-0.14);
  if(lv>0.01){
    float wa=max(sdFrustum(p-vec3(0.0,0.08,0.0),rb-w,rt-w,H)+0.005, p.y-ly);
    if(cut>0.5) wa=cutQ(wa,p);
    res=opU(res,vec2(wa,8.0));
  }
  // hour marks: ticks on the inner wall, one column at the back or twelve around
  if(mk>0.01){
    float a=atan(p.z,p.x);
    float sec=cl>0.5 ? 6.2831853/12.0 : 6.2831853;
    float aa=cl>0.5 ? mod(a+0.5*sec,sec)-0.5*sec : a+3.14159265*0.75;
    if(cl<0.5){ aa=mod(aa+3.14159265,6.2831853)-3.14159265; }
    float r=length(p.xz);
    vec3 q=vec3(r, p.y, aa*r);
    float n=count(mk,11.0);
    float yi=clamp(floor((1.02-p.y)/0.08+0.5),1.0,n);
    float rr=mix(rb,rt,clamp(p.y/H,0.0,1.0))-w;
    float tk=sdRoundBox(q-vec3(rr,1.02-yi*0.08,0.0),vec3(0.02,0.008,0.06),0.002);
    if(n<0.5) tk=1e3;
    if(cut>0.5) tk=cutQ(tk,p);
    res=opU(res,vec2(tk,15.0));
  }
  return res;
}

vec2 map(vec3 p){
  vec2 res=vec2(p.y,0.0);
  if(u_site<0.5){
    // ---- Egypt: temple court at night, bowl on a stone stand, priest, catch basin ----
    // temple: pylon and a row of columns behind
    res=opU(res,pWall(p-vec3(-6.0,0.0,-11.0),vec3(3.2,3.6,1.0),2.0));
    res=opU(res,pWall(p-vec3(6.0,0.0,-11.0),vec3(3.2,3.6,1.0),2.0));
    res=opU(res,pWall(p-vec3(0.0,0.0,-11.5),vec3(2.8,2.6,0.6),2.0));
    vec3 cq=p-vec3(0.0,0.0,-6.5); cq.x=cq.x-2.4*clamp(floor(cq.x/2.4+0.5),-3.0,3.0);
    res=opU(res,pColumn(cq,0.38,4.2,2.0));
    res=opU(res,pBeam(p-vec3(0.0,4.45,-6.5),vec3(8.0,0.25,0.5)));
    // stand
    res=opU(res,pBlock(p-vec3(0.0,0.45,0.0),vec3(0.5,0.45,0.5),2.0));
    // bowl
    if(u_bowl>0.01){
      vec3 b=drop(p-vec3(0.0,0.9,0.0),u_bowl);
      res=opU(res,pBowl(b,u_slope,u_fill*u_lvl,u_marks,u_cols,u_cut));
      // spout near the bottom on +x, slightly to -z so it stays outside the cutaway
      float rb=mix(0.62,0.36,u_slope);
      if(u_hole>0.01){
        vec3 s=b-vec3(rb+0.04,0.12,-0.25);
        res=opU(res,vec2(sdCapsule(s,vec3(-0.06,0.0,0.0),vec3(0.06,0.0,0.0),0.03),4.0));
        // the drip: a thin stream plus a falling drop, to a basin on the ground
        float sp=mix(0.6,1.6,u_drip);
        float fy=fract(u_time*sp);
        vec3 dp=p-vec3(rb+0.12,0.9+0.12-fy*0.95,-0.25);
        if(u_drip>0.01) res=opU(res,vec2(sdSphere(dp,0.035),8.0));
        if(u_drip>0.01) res=opU(res,vec2(sdCapsule(p-vec3(rb+0.12,0.0,-0.25),vec3(0.0,0.2,0.0),vec3(0.0,1.0,0.0),0.012*u_drip),8.0));
      }
    }
    // catch basin
    res=opU(res,vec2(max(sdCylinder(p-vec3(0.95,0.1,-0.25),0.1,0.28),-sdCylinder(p-vec3(0.95,0.2,-0.25),0.1,0.22)),2.0));
    res=opU(res,vec2(sdCylinder(p-vec3(0.95,0.1,-0.25),0.08,0.22),8.0));
    // priest carving / watching
    res=opU(res,pPerson(p-vec3(-1.0,0.0,0.35),u_work,0.1));
  } else if(u_site<1.5){
    // ---- Athens: a court. Speaker, bowl on a stand, rows of jurors ----
    res=opU(res,pStairs(p-vec3(0.0,0.0,-4.5),3.0,0.25,0.6,8.0,4.0));
    vec3 cq=p-vec3(0.0,0.0,-3.4); cq.x=cq.x-2.0*clamp(floor(cq.x/2.0+0.5),-2.0,2.0);
    res=opU(res,pColumn(cq,0.3,3.4,4.0));
    res=opU(res,pBeam(p-vec3(0.0,3.65,-3.4),vec3(5.0,0.22,0.45)));
    res=opU(res,pBlock(p-vec3(0.0,0.45,0.0),vec3(0.45,0.45,0.45),4.0));
    vec3 b=p-vec3(0.0,0.9,0.0);
    res=opU(res,pBowl(b,1.0,u_lvl,1.0,0.0,1.0));
    float sp=1.4; float fy=fract(u_time*sp);
    res=opU(res,vec2(sdCapsule(b-vec3(0.4,0.12,-0.25),vec3(-0.06,0.0,0.0),vec3(0.06,0.0,0.0),0.03),4.0));
    res=opU(res,vec2(sdSphere(p-vec3(0.48,1.02-fy*0.95,-0.25),0.035),8.0));
    res=opU(res,vec2(max(sdCylinder(p-vec3(0.48,0.1,-0.25),0.1,0.26),-sdCylinder(p-vec3(0.48,0.2,-0.25),0.1,0.2)),4.0));
    // speaker
    res=opU(res,pPerson(p-vec3(-1.2,0.0,0.6),u_work,0.55));
    // jurors on benches
    vec3 jq=p-vec3(0.0,0.0,3.2); float jx=clamp(floor(jq.x/0.9+0.5),-3.0,3.0); jq.x-=jx*0.9;
    float jz=clamp(floor(jq.z/1.1+0.5),0.0,1.0); jq.z-=jz*1.1;
    res=opU(res,pPerson(jq-vec3(0.0,0.0,0.0),0.0,0.2+0.13*jx+0.3*jz));
    res=opU(res,pBeam(p-vec3(0.0,0.3,3.55),vec3(3.2,0.08,0.2)));
  } else {
    // ---- Alexandria: Ctesibius's inflow clock ----
    res=opU(res,pWall(p-vec3(0.0,0.0,-6.0),vec3(6.0,2.2,0.4),12.0));
    // tank on a pillar
    res=opU(res,pBlock(p-vec3(-0.3,1.5,0.0),vec3(0.3,1.5,0.3),2.0));
    if(u_tank>0.01){
      vec3 t=drop(p-vec3(-0.3,3.0,0.0),u_tank);
      float tb=sdRoundBox(t-vec3(0.0,0.4,0.0),vec3(0.55,0.4,0.55),0.02);
      float ti=sdRoundBox(t-vec3(0.0,0.48,0.0),vec3(0.48,0.4,0.48),0.0);
      float tk=cutQ(max(tb,-ti),t);
      res=opU(res,vec2(tk,2.0));
      float tw=cutQ(max(ti+0.005,t.y-0.68),t);
      res=opU(res,vec2(tw,8.0));
      // feed pipe from the back, always flowing in
      res=opU(res,vec2(sdCapsule(t,vec3(-0.3,0.95,-0.3),vec3(-0.3,0.95,-1.6),0.06),5.0));
      res=opU(res,vec2(sdCapsule(t,vec3(-0.3,0.95,-0.3),vec3(-0.3,0.6,-0.3),0.035),8.0));
      // overflow pipe near the top on the -x side, spilling to the ground
      if(u_over>0.01){
        res=opU(res,vec2(sdCapsule(t,vec3(-0.5,0.68,0.0),vec3(-0.85,0.68,0.0),0.05),14.0));
        res=opU(res,vec2(sdCapsule(t,vec3(-0.85,0.66,0.0),vec3(-0.85,-2.45,0.0),0.025*u_over),8.0));
      }
      // outlet: spout to the jar and the steady stream
      res=opU(res,vec2(sdCapsule(t,vec3(0.5,0.1,0.0),vec3(1.45,0.1,0.0),0.04),14.0));
    }
    if(u_jar>0.01){
      vec3 j=p-vec3(1.1,0.0,0.0);
      // stream from the tank spout into the jar
      float hj=2.2;
      float jo=sdCylinder(j-vec3(0.0,0.5*hj*u_jar,0.0),0.5*hj*u_jar,0.42);
      float ji=sdCylinder(j-vec3(0.0,0.5*hj+0.08,0.0),0.5*hj,0.35);
      res=opU(res,vec2(cutQ(max(jo,-ji),j),5.0));
      float wl=0.08+u_flt*1.75;
      if(u_tank>0.99) res=opU(res,vec2(sdCapsule(j,vec3(0.0,wl,0.0),vec3(0.0,3.05,0.0),0.018),8.0));
      if(u_flt>0.0){
        res=opU(res,vec2(cutQ(max(ji+0.005,j.y-wl),j),8.0));
      }
      if(u_jar>0.99){
        // float (phellos): an inverted bowl riding the water
        res=opU(res,vec2(sdCylinder(j-vec3(0.0,wl+0.04,0.0),0.05,0.28),3.0));
        // the bar up from the float, with a pointer
        float bt=wl+0.04+2.0;
        if(u_ptr>0.01){
          res=opU(res,pBeam(j-vec3(0.0,wl+0.04+1.0,0.0),vec3(0.035,1.0,0.035)));
          res=opU(res,vec2(sdCapsule(j,vec3(0.0,bt-0.15,0.0),vec3(0.75*u_ptr,bt-0.15,0.0),0.035),14.0));
          res=opU(res,vec2(sdSphere(j-vec3(0.75*u_ptr,bt-0.15,0.0),0.07),14.0));
        }
        // teeth on the upper bar and the drum they turn
        if(u_teeth>0.01){
          vec3 r=j-vec3(-0.06,bt-1.0,0.0);
          float ry=r.y-0.12*clamp(floor(r.y/0.12+0.5),-7.0,7.0);
          float rk=sdRoundBox(vec3(r.x+0.03,ry,r.z),vec3(0.05,0.03,0.035),0.005);
          rk=max(rk,abs(r.y)-0.9);
          res=opU(res,vec2(rk,14.0));
          vec3 g=p-vec3(1.1-0.36,2.6,0.0);
          g.xy=rot(-u_flt*9.0)*g.xy;
          res=opU(res,pGear(drop(g,u_teeth),0.26,12.0,0.06,0.12,14.0));
          res=opU(res,vec2(sdCapsule(p,vec3(1.1-0.36,2.6,-0.15),vec3(1.1-0.36,2.6,-0.6),0.04),3.0));
          res=opU(res,pBlock(p-vec3(1.1-0.36,1.3,-0.6),vec3(0.06,1.3,0.06),3.0));
        }
      }
      // the hour scale: a post with marks beside the jar
      if(u_ptr>0.01){
        res=opU(res,pBlock(p-vec3(2.0,1.95,0.0),vec3(0.08,1.95,0.08),12.0));
        vec3 m=p-vec3(1.92,0.0,0.0);
        float my=clamp(floor((m.y-2.0)/0.16+0.5),0.0,11.0);
        res=opU(res,vec2(sdRoundBox(m-vec3(0.08,2.0+my*0.16,0.11),vec3(0.07,0.014,0.025),0.002),15.0));
      }
    }
    res=opU(res,pPerson(p-vec3(-2.4,0.0,0.9),u_work,0.7));
  }
  return res;
}
