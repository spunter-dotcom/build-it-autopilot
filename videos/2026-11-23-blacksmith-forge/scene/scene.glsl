// scene.glsl: blacksmith's forge.
// Site 0: a small village with a broken plough and a farmer. Site 1: the smithy yard.
// Smithy layout (metres): brick hearth at the origin (2 x 0.9 x 1.4), hood and chimney behind it on the back wall (z=-1.6),
// bellows on the left (x=-1.9), anvil on a stump on the right (x=2.2), water trough in front-right (x=1.0, z=1.5), smith at x=2.2,z=1.0.
// Params: u_hearth (hearth rises), u_coal (charcoal heap), u_fire (flame size), u_bel (bellows drops in), u_puff (bellows pumping 0..1),
// u_bar (iron bar shown), u_hot (0 cold, 0.33 red, 0.66 orange, 1 near white), u_barx (0 in the coals, 1 on the anvil),
// u_anvil (anvil drops in), u_ham (hammering), u_bend (bar bends), u_weld (second bar joins, 0..1 closes the gap),
// u_trough (trough drops in), u_blade (blade goes down into the trough, 0..1), u_steam (steam puff), u_smoke (chimney smoke).

float hotId(float k){ return k<0.2 ? 7.0 : (k<0.5 ? 5.0 : (k<0.85 ? 14.0 : 12.0)); }

vec2 map(vec3 p){
  vec2 res=vec2(p.y,0.0);
  if(u_site<0.5){
    // ---- village ----
    res=opU(res,pWall(p-vec3(-4.0,0.0,-5.0),vec3(1.8,1.1,1.4),12.0));
    res=opU(res,pRoof(p-vec3(-4.0,2.2,-5.0),4.0,1.7,1.3,13.0));
    res=opU(res,pWall(p-vec3(3.5,0.0,-6.5),vec3(1.6,1.0,1.3),12.0));
    res=opU(res,pRoof(p-vec3(3.5,2.0,-6.5),3.6,1.6,1.2,13.0));
    res=opU(res,pTree(p-vec3(7.0,0.0,-3.0),4.0));
    res=opU(res,pTree(p-vec3(-8.0,0.0,-2.0),3.6));
    res=opU(res,pPerson(p-vec3(0.9,0.0,0.6),0.0,0.3));
    // broken plough: beam, handles and a snapped iron share lying apart
    res=opU(res,pLog(p,vec3(-1.6,0.35,0.2),vec3(0.4,0.15,0.2),0.07));
    res=opU(res,pLog(p,vec3(-1.6,0.35,0.2),vec3(-2.1,0.95,0.45),0.04));
    res=opU(res,pLog(p,vec3(-1.6,0.35,0.2),vec3(-2.1,0.95,-0.05),0.04));
    res=opU(res,vec2(sdRoundBox(p-vec3(0.55,0.05,0.75),vec3(0.25,0.03,0.1),0.01),7.0));
  } else {
    // ---- smithy ----
    res=opU(res,pWall(p-vec3(0.0,0.0,-1.9),vec3(4.0,1.6,0.25),12.0));            // back wall
    // hearth of brick rising with u_hearth
    res=opU(res,vec2(rise(sdRoundBox(p-vec3(0.0,0.45,0.0),vec3(1.0,0.45,0.7),0.02),p,u_hearth,0.92),5.0));
    // hood and chimney (part of the back wall, only once the hearth is up)
    if(u_hearth>0.99){
      res=opU(res,pBlock(p-vec3(0.0,2.4,-1.15),vec3(0.9,0.5,0.5),5.0));
      res=opU(res,pBlock(p-vec3(0.0,3.6,-1.4),vec3(0.35,0.8,0.3),5.0));
    }
    if(u_smoke>0.01){
      float s=u_smoke; vec3 q=p-vec3(0.0,4.7,-1.4);
      res=opU(res,vec2(sdSphere(q-vec3(0.1,0.35+0.2*sin(u_time),0.0),0.35*s),12.0));
      res=opU(res,vec2(sdSphere(q-vec3(0.35,0.95+0.2*sin(u_time*1.3),0.0),0.45*s),12.0));
    }
    // charcoal heap and fire
    if(u_coal>0.01) res=opU(res,vec2(sdEllipsoid(p-vec3(0.0,0.9,0.0),vec3(0.75,0.22*u_coal,0.5)),15.0));
    if(u_fire>0.01){
      float f=u_fire*(1.0+0.12*sin(u_time*11.0));
      res=opU(res,vec2(sdEllipsoid(p-vec3(0.0,0.95+0.18*f,0.0),vec3(0.45,0.35*f,0.3)),14.0));
    }
    // bellows: two boards hinged at the nozzle end, leather between them, iron pipe into the hearth
    if(u_bel>0.01){
      vec3 b=drop(p,u_bel)-vec3(-2.1,0.75,0.0);
      float open=0.12+0.14*(0.5+0.5*sin(u_time*4.0*u_puff+1.0))*step(0.01,u_puff)+0.14*(1.0-step(0.01,u_puff));
      vec3 c=b; c.x-=0.6;                                // hinge at x=+0.6 (towards the hearth)
      float tw=clamp(-c.x/1.2,0.0,1.0);                    // 0 at hinge, 1 at back end
      float top=sdRoundBox(c-vec3(-0.6,open*tw*2.0+0.05,0.0),vec3(0.6,0.03,0.35),0.01);
      float bot=sdRoundBox(c-vec3(-0.6,-0.05,0.0),vec3(0.6,0.03,0.35),0.01);
      res=opU(res,vec2(min(top,bot),3.0));
      res=opU(res,vec2(sdRoundBox(c-vec3(-0.6,open*tw,0.0),vec3(0.55,max(open*tw,0.02),0.3),0.02),9.0));
      res=opU(res,vec2(sdCapsule(b,vec3(0.6,0.0,0.0),vec3(1.4,0.15,0.0),0.06),7.0));
      res=opU(res,pBlock(b-vec3(-0.2,-0.4,0.0),vec3(0.5,0.3,0.25),3.0));   // stand
    }
    // anvil on a stump
    if(u_anvil>0.01){
      vec3 a=drop(p,u_anvil)-vec3(2.2,0.0,0.2);
      res=opU(res,vec2(sdCylinder(a-vec3(0.0,0.3,0.0),0.3,0.32),3.0));
      float an=sdRoundBox(a-vec3(0.0,0.75,0.0),vec3(0.35,0.1,0.15),0.02);
      an=min(an,sdRoundBox(a-vec3(0.0,0.66,0.0),vec3(0.18,0.08,0.11),0.02));
      an=min(an,sdCapsule(a,vec3(-0.3,0.78,0.0),vec3(-0.62,0.8,0.0),0.06));   // horn
      res=opU(res,vec2(an,7.0));
    }
    // the smith; arms swing while hammering
    float pose=u_ham>0.01 ? 0.5+0.5*sin(u_time*7.0) : 0.0;
    res=opU(res,pPerson(p-vec3(2.2,0.0,0.95),pose,0.55));
    if(u_ham>0.01){
      vec3 hp=mix(vec3(2.4,0.66,1.05),vec3(2.4,1.35,1.07),pose);
      res=opU(res,vec2(sdRoundBox(p-hp-vec3(0.0,0.0,-0.25),vec3(0.06,0.06,0.1),0.01),7.0));
    }
    // iron bar: in the coals (u_barx 0) or on the anvil (u_barx 1)
    float hid=hotId(u_hot);
    if(u_bar>0.01){
      vec3 a0=mix(vec3(-0.3,1.0,0.0),vec3(1.75,0.9,0.2),u_barx);
      vec3 a1=mix(vec3(1.3,1.05,0.3),vec3(2.55,0.9+0.3*u_bend,0.2+0.25*u_bend),u_barx);
      res=opU(res,vec2(sdCapsule(p,a0,a1,0.035),hid));
    }
    // forge weld: a second bar slides in to meet the first on the anvil
    if(u_weld>0.01){
      vec3 w0=vec3(2.6+0.5*(1.0-u_weld),0.9,0.2), w1=w0+vec3(0.7,0.0,0.0);
      res=opU(res,vec2(sdCapsule(p,w0,w1,0.035),12.0));
    }
    // water trough and the blade
    if(u_trough>0.01){
      vec3 t=drop(p,u_trough)-vec3(0.9,0.0,1.6);
      float box=sdRoundBox(t-vec3(0.0,0.3,0.0),vec3(0.6,0.3,0.25),0.02);
      box=max(box,-sdRoundBox(t-vec3(0.0,0.45,0.0),vec3(0.52,0.3,0.17),0.0));
      res=opU(res,vec2(box,3.0));
      res=opU(res,vec2(sdRoundBox(t-vec3(0.0,0.45,0.0),vec3(0.52,0.01,0.17),0.0),8.0));
    }
    if(u_blade>0.01){
      vec3 bl=p-vec3(0.9,1.3-0.8*u_blade,1.6);
      float bd=sdRoundBox(bl,vec3(0.03,0.32,0.07),0.005);
      bd=min(bd,sdRoundBox(bl-vec3(0.0,0.45,0.0),vec3(0.035,0.13,0.035),0.01));
      res=opU(res,vec2(bd,u_blade>0.9 ? 7.0 : 14.0));
    }
    if(u_steam>0.01){
      vec3 s=p-vec3(0.9,0.75+0.5*u_steam,1.6);
      res=opU(res,vec2(sdSphere(s,0.3*u_steam),12.0));
      res=opU(res,vec2(sdSphere(s-vec3(0.25,0.3*u_steam,0.05),0.22*u_steam),12.0));
    }
    // a finished plough share leaning on the wall for the ending
    res=opU(res,vec2(sdRoundBox(p-vec3(-3.0,0.35,-1.5),vec3(0.25,0.35,0.03),0.01),7.0));
  }
  return res;
}
