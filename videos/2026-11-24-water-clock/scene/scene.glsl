// scene.glsl: the ONLY GLSL a video writes. Define map(p) from kit parts (parts.glsl).
// Use u_site to switch sets between shots and 0..1 params (declared in edit.jsx `def`) to make parts arrive.
// Keep it to a few dozen parts per site. Return vec2(distance, material id); ids are listed in parts.glsl.
vec2 map(vec3 p){
  vec2 res=vec2(p.y,0.0);                                   // ground (look from u_ground)
  if(u_site<0.5){
    // Site 0: a clearing in a forest, a person and a felled log.
    res=opU(res,pForest(p,3.6,22.0,-22.0,-6.0));    // never wrap pForest in an if: it must always run
    res=opU(res,pPerson(p-vec3(1.2,0.0,0.6),u_work,0.3));
    if(u_logs>0.01) res=opU(res,pLog(drop(p,u_logs),vec3(-1.5,0.25,0.0),vec3(1.0,0.25,0.4),0.25));
  } else if(u_site<1.5){
    // Site 1: masonry. A stone arcade, columns, a roofed building and stairs, rising with u_build.
    res=opU(res,vec2(rise(pArcade(p-vec3(0.0,0.0,-3.0),5.0,1.6,2.2,0.8,0.35,2.0).x,p,u_build,4.0),2.0));
    res=opU(res,pColumn(p-vec3(-3.0,0.0,1.0),0.3,3.2,4.0));
    res=opU(res,pColumn(p-vec3(3.0,0.0,1.0),0.3,3.2,4.0));
    res=opU(res,pWall(p-vec3(6.5,0.0,-1.0),vec3(1.5,1.2,1.5),12.0));
    res=opU(res,pRoof(p-vec3(6.5,2.4,-1.0),3.4,1.8,1.3,6.0));
    res=opU(res,pStairs(p-vec3(0.0,0.0,1.0),4.0,0.18,0.35,2.0,2.0));
  } else {
    // Site 2: machines and water.
    res=opU(res,pWater(p,0.15));
    vec3 q=p-vec3(0.0,1.6,0.0); q.xy=rot(u_time*0.6)*q.xy;
    res=opU(res,pWheel(q,1.5,0.08,0.4,8.0,3.0));
    vec3 g=p-vec3(2.4,1.6,0.0); g.xy=rot(-u_time*0.9)*g.xy;
    res=opU(res,pGear(g,0.7,12.0,0.12,0.25,7.0));
    res=opU(res,pBarrel(p-vec3(-2.5,0.0,1.0),0.4,1.0));
    res=opU(res,pRope(p,vec3(-2.5,1.0,1.0),vec3(-1.2,2.6,0.0)));
    res=opU(res,pBlock(p-vec3(0.0,0.4,-1.4),vec3(2.6,0.4,0.6),5.0));
  }
  return res;
}
