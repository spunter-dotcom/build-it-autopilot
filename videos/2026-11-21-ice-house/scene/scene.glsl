// Ice house. Sites: 0 frozen lake, cutting blocks and a cart; 1 a shed where ice melts;
// 2 the ice well in cutaway (u_cut 1) or intact under its mound with the big house (u_cut 0).
// Params: u_blocks (cut blocks appear), u_load (blocks on cart), u_melt (shed ice shrinks), u_dig, u_brick,
// u_pool (meltwater at the bottom), u_drain, u_dome, u_earth, u_ice (fill with straw layers), u_pass, u_cut.
vec2 map(vec3 p){
  vec2 res=vec2(p.y,0.0);
  if(u_site<0.5){
    // Frozen lake: an ice sheet in a snowy field (ground 5).
    float lake=max(abs(p.y-0.02)-0.04,length(p.xz-vec2(0.0,-6.0))-11.0);
    res=opU(res,vec2(lake,4.0));
    // Six cut blocks lifted out beside the hole.
    float nb=count(u_blocks,6.0);
    float bl=1e3;
    for(int i=0;i<6;i++){
      float fi=float(i);
      if(fi<nb){ vec3 q=p-vec3(-1.6+0.85*mod(fi,3.0),0.3,1.4+0.85*floor(fi/3.0)); bl=min(bl,sdRoundBox(q,vec3(0.36,0.28,0.36),0.04)); }
    }
    res=opU(res,vec2(bl,4.0));
    res=opU(res,vec2(sdRoundBox(p-vec3(-0.8,0.03,-0.6),vec3(1.4,0.05,0.7),0.01),8.0)); // the open water slot
    res=opU(res,pPerson(p-vec3(0.6,0.0,0.3),u_work,0.3));
    // Cart with loaded blocks.
    vec3 c=p-vec3(3.6,0.0,1.8);
    res=opU(res,pBeam(c-vec3(0.0,0.75,0.0),vec3(1.1,0.08,0.6)));
    vec3 w=vec3(c.x,c.y-0.5,abs(c.z)-0.68);
    res=opU(res,pWheel(w,0.5,0.05,0.1,6.0,3.0));
    if(u_load>0.01) res=opU(res,vec2(sdRoundBox(drop(c-vec3(0.0,1.12,0.0),u_load),vec3(0.8,0.28,0.4),0.04),4.0));
    res=opU(res,pLog(p,vec3(4.7,0.75,1.8),vec3(6.2,0.6,1.8),0.06));
  } else if(u_site<1.5){
    // A plain shed with an open front; ice blocks inside shrink and a puddle spreads.
    vec3 s=p-vec3(0.0,0.0,-1.0);
    float sh=sdRoundBox(s-vec3(0.0,1.2,0.0),vec3(2.0,1.2,1.6),0.02);
    sh=max(sh,-sdRoundBox(s-vec3(0.0,1.2,0.4),vec3(1.85,1.05,1.6),0.0));
    res=opU(res,vec2(sh,3.0));
    res=opU(res,pRoof(s-vec3(0.0,2.4,0.0),4.4,1.9,1.0,6.0));
    float k=1.0-0.85*clamp(u_melt,0.0,1.0);
    float bl=sdRoundBox(vec3(abs(s.x)-0.55,s.y-0.3*k,s.z-0.2),vec3(0.4*k,0.3*k,0.4*k),0.05);
    res=opU(res,vec2(bl,4.0));
    float pud=max(abs(p.y-0.01)-0.01,length(vec2(p.x,(p.z+0.8)*1.2))-(0.4+2.2*clamp(u_melt,0.0,1.0)));
    res=opU(res,vec2(pud,8.0));
    res=opU(res,pTree(p-vec3(-4.5,0.0,-3.0),3.2));
  } else {
    // ---- Site 2: the ice well. Origin at the top of the pit. ----
    float cut=u_cut;
    // Cutaway: remove the earth in front (z > 0) near the pit, down to 11 m.
    float cbox=sdRoundBox(p-vec3(0.0,-3.0,30.0),vec3(9.0,8.0,30.0),0.0);
    cbox=cut>0.5 ? cbox : 1e3;
    // The pit: a brick cup about 9 m deep, 4.8 m wide at the top (dug to depth 9.2*u_dig).
    float cup=0.5*sdEllipsoid(p,vec3(2.4,9.2,2.4));
    float pit=max(cup,-p.y-9.2*clamp(u_dig,0.0,1.0)-0.05);
    float earth=max(p.y,-cbox);
    earth=max(earth,-pit);
    float eid=(p.y>-cbox && p.y>-pit) ? 0.0 : 1.0;
    res=vec2(earth,eid);
    float front=cut>0.5 ? p.z : -1e3;           // cut every part of the house at z = 0 in cutaway shots
    // Brick lining, rising from the bottom.
    float shell=abs(cup)-0.26;
    shell=max(shell,p.y);
    shell=max(shell,p.y+9.45-9.45*clamp(u_brick,0.0,1.0));
    shell=max(shell,front);
    res=opU(res,vec2(shell,5.0));
    // Drain hole and channel at the bottom.
    float dr=sdCapsule(p,vec3(0.0,-9.3,0.0),vec3(0.0,-10.4,0.0),0.16*u_drain);
    dr=min(dr,sdCapsule(p,vec3(0.0,-10.4,0.0),vec3(5.5,-10.6,0.0),0.16*u_drain));
    res=opU(res,vec2(max(dr,front),15.0));
    // Meltwater pool at the bottom.
    float pool=max(cup+0.24,p.y+9.2-1.4*clamp(u_pool,0.0,1.0));
    pool=max(pool,front);
    res=opU(res,vec2(u_pool>0.01 ? pool : 1e3,8.0));
    // Ice fill with straw layers (every 0.8 m a thin straw band).
    float fill=max(cup+0.24,p.y+9.2-9.0*clamp(u_ice,0.0,1.0));
    fill=max(fill,front+0.02);
    float sid=fract(p.y/0.8)<0.14 ? 13.0 : 4.0;
    res=opU(res,vec2(u_ice>0.01 ? fill : 1e3,sid));
    // Brick dome over the top, dropping in.
    vec3 dq=u_dome>0.01 ? drop(p,u_dome) : p+vec3(0.0,100.0,0.0);
    float dome=max(abs(length(dq)-2.4)-0.22,-dq.y);
    dome=max(dome,-sdRoundBox(dq-vec3(-2.4,0.95,0.0),vec3(0.6,0.95,0.6),0.0));   // doorway on the -x side
    dome=max(dome,front);
    res=opU(res,vec2(dome,5.0));
    // Earth and turf heaped over the dome, rising.
    float mound=sdEllipsoid(p,vec3(5.5,4.0*clamp(u_earth,0.0,1.0)+0.01,5.5));
    mound=max(mound,-(length(p)-2.65));
    mound=max(mound,-sdRoundBox(p-vec3(-5.0,0.95,0.0),vec3(3.2,0.95,0.7),0.0)); // room for the passage
    mound=max(mound,front);
    res=opU(res,vec2(u_earth>0.01 ? mound : 1e3,0.0));
    // Entrance passage along -x with two sets of doors.
    vec3 t=p-vec3(-4.6,0.0,0.0);
    float tun=sdRoundBox(t-vec3(0.0,1.15,0.0),vec3(2.4,1.15,0.95),0.02);
    tun=max(tun,-sdRoundBox(t-vec3(0.0,1.0,0.0),vec3(2.6,1.0,0.7),0.0));
    tun=rise(tun,t,u_pass,2.3);
    tun=max(tun,front);
    res=opU(res,vec2(tun,5.0));
    float dk=clamp(u_pass*2.0-1.0,0.0,1.0);
    vec3 d1=vec3(abs(t.x)-1.6,t.y,t.z);
    float door=rise(sdRoundBox(d1-vec3(0.0,0.95,0.0),vec3(0.06,0.95,0.68),0.01),d1,dk,1.9);
    res=opU(res,vec2(u_pass>0.5 ? max(door,front) : 1e3,3.0));
    // The big house in the distance (only seen from behind in the intact shots).
    vec3 h=p-vec3(-6.0,0.0,-22.0);
    res=opU(res,pWall(h,vec3(6.0,3.0,3.0),12.0));
    res=opU(res,pRoof(h-vec3(0.0,6.0,0.0),12.4,3.2,2.4,6.0));
    res=opU(res,vec2(sdRoundBox(vec3(abs(h.x)-2.0,h.y-3.2,h.z-3.02),vec3(0.45,0.7,0.02),0.0),15.0));
    res=opU(res,pTree(p-vec3(7.0,0.0,-6.0),4.0));
    res=opU(res,pTree(p-vec3(-11.0,0.0,-4.0),3.6));
    res=opU(res,pPerson(p-vec3(u_px,0.0,u_pz),u_work,0.6));
  }
  return res;
}
