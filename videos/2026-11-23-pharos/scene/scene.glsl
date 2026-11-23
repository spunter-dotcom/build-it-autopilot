// scene.glsl: Lighthouse of Alexandria. One world (no sites): open sea (water at y=0.1), the Alexandria
// shore along x < -34 with a few flat-roofed houses, the island of Pharos at the origin, the causeway
// (Heptastadion) from the shore to the island along x, shoal rocks and a ship to the south (+z).
// Tower on the island (base y=0.8): square tier 7 wide x 12 high, octagonal tier 4.6 wide x 7 high,
// round tier r 1.4 x 4 high, then a lantern of 4 columns with the furnace fire, a bronze mirror and Zeus.
// Params: u_ship (ship shown), u_shipx (ship x), u_wreck (ship heels over on the rocks), u_bfire (beach fire),
// u_cw (causeway grows 0..1), u_t1/u_t2/u_t3 (tiers rise), u_cut (cutaway of the square tier, shows the ramp),
// u_men (two people on the ramp), u_lan (lantern), u_fire (flame size), u_mir (mirror), u_zeus (statue drops in).

vec2 pShip(vec3 q){
  vec2 r=vec2(max(sdEllipsoid(q-vec3(0.0,0.35,0.0),vec3(2.6,0.75,0.85)),q.y-0.55),3.0);
  r=opU(r,vec2(sdCapsule(q,vec3(0.0,0.5,0.0),vec3(0.0,3.4,0.0),0.07),3.0));
  r=opU(r,vec2(sdRoundBox(q-vec3(0.1,2.3,0.0),vec3(0.04,0.9,1.2),0.02),12.0));
  return r;
}

vec2 map(vec3 p){
  vec2 res=vec2(p.y,0.0);
  res=opU(res,pWater(p,0.1));
  // the mainland shore and the island (sand: ground look)
  res=opU(res,vec2(sdRoundBox(p-vec3(-52.0,0.3,0.0),vec3(18.0,0.5,70.0),0.3),0.0));
  res=opU(res,vec2(sdEllipsoid(p-vec3(0.0,-1.0,0.0),vec3(11.0,1.8,9.0)),0.0));

  // Alexandria: a few flat-roofed houses on the shore (bounded)
  float dc=sdRoundBox(p-vec3(-44.0,4.0,0.0),vec3(8.0,4.0,14.0),0.0);
  if(dc<1.0){
    res=opU(res,pWall(p-vec3(-38.5,0.8,-6.0),vec3(2.0,1.6,2.2),12.0));
    res=opU(res,pWall(p-vec3(-39.0,0.8,-1.0),vec3(1.6,2.2,1.8),12.0));
    res=opU(res,pWall(p-vec3(-38.5,0.8,7.0),vec3(2.2,1.4,2.0),12.0));
    res=opU(res,pWall(p-vec3(-43.5,0.8,-9.0),vec3(2.0,2.6,2.4),12.0));
    res=opU(res,pWall(p-vec3(-44.0,0.8,3.0),vec3(2.4,1.8,2.6),12.0));
    res=opU(res,pWall(p-vec3(-48.0,0.8,-3.0),vec3(2.2,3.0,2.0),12.0));
    res=opU(res,pWall(p-vec3(-48.5,0.8,9.0),vec3(2.0,2.0,2.4),12.0));
  } else res=opU(res,vec2(dc,12.0));

  // beach fire on the shore
  if(u_bfire>0.01){
    vec3 b=p-vec3(-34.8,0.8,8.0);
    res=opU(res,pLog(b,vec3(-0.5,0.12,-0.2),vec3(0.5,0.12,0.2),0.1));
    res=opU(res,pLog(b,vec3(-0.4,0.12,0.3),vec3(0.4,0.12,-0.3),0.1));
    res=opU(res,vec2(sdEllipsoid(b-vec3(0.0,0.45*u_bfire,0.0),vec3(0.35,0.55,0.35)*u_bfire),14.0));
  }

  // shoal rocks south of the island
  res=opU(res,pRock(p-vec3(9.0,0.0,16.0),1.1));
  res=opU(res,pRock(p-vec3(12.5,0.0,18.5),0.8));
  res=opU(res,pRock(p-vec3(6.0,0.0,19.5),0.9));

  // the ship
  if(u_ship>0.5){
    vec3 q=p-vec3(u_shipx,0.0,17.5);
    q.xy=rot(0.35*u_wreck)*q.xy; q.yz=rot(0.3*u_wreck)*q.yz;
    res=opU(res,pShip(q));
  }

  // the causeway (Heptastadion): shore x=-34 to island x=-9.5
  if(u_cw>0.01){
    float xe=-34.0+24.5*clamp(u_cw,0.0,1.0);
    float cw=sdRoundBox(p-vec3(-21.75,0.55,0.0),vec3(12.25,0.45,1.3),0.05);
    res=opU(res,vec2(max(cw,p.x-xe),2.0));
  }

  // the tower, bounded by a box around the island centre
  vec3 t=p-vec3(0.0,0.8,0.0);
  float db=sdRoundBox(t-vec3(0.0,15.0,0.0),vec3(4.2,16.0,4.2),0.0);
  if(db>1.0){ res=opU(res,vec2(db,4.0)); return res; }

  if(u_t1>0.01){
    float o=sdRoundBox(t-vec3(0.0,6.0,0.0),vec3(3.5,6.0,3.5),0.02);
    if(u_cut>0.5){
      o=max(o,-sdRoundBox(t-vec3(0.0,6.0,0.0),vec3(3.0,5.6,3.0),0.0));   // hollow shell
      o=max(o,-sdRoundBox(t-vec3(0.0,6.3,4.0),vec3(3.6,5.4,1.2),0.0));   // front wall removed
      // central core
      o=min(o,sdRoundBox(t-vec3(0.0,6.0,0.0),vec3(1.1,6.0,1.1),0.0));
      // ramp: a square helix between the core and the walls, pitch 4
      float a=atan(t.z,t.x);
      float v=mod(t.y-4.0*a/6.2832,4.0);
      float sl=(min(v,4.0-v)-0.12)*0.45;
      float ring=max(max(abs(t.x),abs(t.z))-3.0,1.1-max(abs(t.x),abs(t.z)));
      float ramp=max(max(sl,ring),max(t.y-11.6,0.3-t.y));
      res=opU(res,vec2(ramp,2.0));
    }
    res=opU(res,vec2(rise(o,t,u_t1,12.0),4.0));
    // windows on the front face
    if(u_cut<0.5) res=opU(res,vec2(rise(sdRoundBox(t-vec3(0.0,6.0,3.48),vec3(0.25,4.0,0.05),0.0),t,u_t1,12.0),15.0));
  }
  if(u_men>0.5){
    res=opU(res,pPerson(t-vec3(-0.6,5.0,2.1),0.0,0.2));
    res=opU(res,pPerson(t-vec3(0.6,5.15,2.1),0.0,0.7));
  }
  if(u_t2>0.01){
    vec3 o2=t-vec3(0.0,12.0,0.0);
    vec3 r2=o2; r2.xz=rot(0.7854)*r2.xz;
    float oc=max(sdRoundBox(o2-vec3(0.0,3.5,0.0),vec3(2.3,3.5,2.3),0.0),sdRoundBox(r2-vec3(0.0,3.5,0.0),vec3(2.3,3.5,2.3),0.0));
    res=opU(res,vec2(rise(oc,o2,u_t2,7.0),4.0));
  }
  if(u_t3>0.01){
    vec3 o3=t-vec3(0.0,19.0,0.0);
    res=opU(res,vec2(rise(sdCylinder(o3-vec3(0.0,2.0,0.0),2.0,1.4),o3,u_t3,4.0),4.0));
  }
  vec3 o4=t-vec3(0.0,23.0,0.0);
  if(u_lan>0.01){
    vec3 l=drop(o4,u_lan);
    res=opU(res,pColumn(l-vec3(1.0,0.0,1.0),0.14,2.2,4.0));
    res=opU(res,pColumn(l-vec3(-1.0,0.0,1.0),0.14,2.2,4.0));
    res=opU(res,pColumn(l-vec3(1.0,0.0,-1.0),0.14,2.2,4.0));
    res=opU(res,pColumn(l-vec3(-1.0,0.0,-1.0),0.14,2.2,4.0));
    res=opU(res,vec2(sdCylinder(l-vec3(0.0,2.35,0.0),0.15,1.45),4.0));
    res=opU(res,vec2(sdCylinder(l-vec3(0.0,0.2,0.0),0.2,0.6),7.0));   // furnace bowl
  }
  if(u_fire>0.01) res=opU(res,vec2(sdEllipsoid(o4-vec3(0.0,0.4+0.55*u_fire,0.0),vec3(0.45,0.7,0.45)*u_fire),14.0));
  if(u_mir>0.01){
    vec3 m=o4-vec3(0.0,1.1,0.85); m.yz=rot(-0.3)*m.yz;
    res=opU(res,vec2(sdCylinder(m.xzy,0.04,0.6*u_mir),14.0));
  }
  if(u_zeus>0.01){
    vec3 z=drop(o4-vec3(0.0,2.5,0.0),u_zeus);
    res=opU(res,vec2(pPerson(z/1.3,1.0,0.5).x*1.3,14.0));
  }
  return res;
}
