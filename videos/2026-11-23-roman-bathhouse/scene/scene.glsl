// Roman bathhouse with hypocaust. One site: a long brick hall along x (x -9..9, z -3..3).
// Hot room x -9..-3 (next to the furnace at x < -9), warm room -3..3, cold room 3..9.
// u_cut 1 = front wall (z = +3) removed so we see inside; u_roof shows the roof.
// Params: u_hall (walls rise), u_cpool (cold pool), u_fire + u_smoke (fire on the floor), u_furn (furnace),
// u_pilae (tile stacks grow and lift the floor), u_heat (hot-air streams under the floor), u_layers (concrete
// and top tiles), u_tubes (wall flue tubes and chimneys), u_hpool (hot pool), u_bench, u_tank (bronze tank),
// u_px/u_py/u_pz (the bather), u_work (stoker pose).
vec2 map(vec3 p){
  vec2 res=vec2(p.y,0.0);
  // Interior paving (only once the hall exists).
  float pave=max(sdRoundBox(p-vec3(0.0,0.02,0.0),vec3(9.0,0.03,3.0),0.0),-1e3);
  if(u_hall>0.01) res=opU(res,vec2(pave,2.0));
  // ---- walls ----
  float H=4.5;
  float w=sdRoundBox(p-vec3(0.0,H*0.5,-3.0),vec3(9.15,H*0.5,0.15),0.01);          // back
  w=min(w,sdRoundBox(vec3(abs(p.x)-9.0,p.y-H*0.5,p.z),vec3(0.15,H*0.5,3.15),0.01)); // ends
  float fw=sdRoundBox(p-vec3(0.0,H*0.5,3.0),vec3(9.15,H*0.5,0.15),0.01);           // front
  fw=max(fw,-sdRoundBox(vec3(p.x-6.0,p.y-1.1,p.z-3.0),vec3(0.6,1.1,0.4),0.0));    // front door, cold room
  fw=max(fw,-sdRoundBox(vec3(mod(p.x+1.5,3.0)-1.5,p.y-3.3,p.z-3.0),vec3(0.45,0.55,0.4),0.0)); // windows
  w=min(w,u_cut>0.5 ? 1e3 : fw);
  float dv=sdRoundBox(vec3(abs(p.x)-3.0,p.y-H*0.5,p.z),vec3(0.12,H*0.5,3.0),0.01);  // dividers
  dv=max(dv,-sdRoundBox(vec3(abs(p.x)-3.0,p.y-1.3,p.z-1.2),vec3(0.3,1.3,0.6),0.0)); // doorways
  w=min(w,dv);
  w=rise(w,p,u_hall,H);
  res=opU(res,vec2(u_hall>0.01 ? w : 1e3,5.0));
  // Window glow in the exterior shots (dark openings, back wall only so the cutaway stays clean).
  // ---- cold pool in the cold room ----
  if(u_cpool>0.01){
    vec3 c=p-vec3(6.0,0.0,-0.6);
    float rim=sdRoundBox(c-vec3(0.0,0.3,0.0),vec3(1.8,0.3,1.4),0.03);
    rim=max(rim,-sdRoundBox(c-vec3(0.0,0.45,0.0),vec3(1.55,0.4,1.15),0.0));
    rim=rise(rim,c,u_cpool,0.6);
    res=opU(res,vec2(rim,4.0));
    res=opU(res,vec2(max(sdRoundBox(c-vec3(0.0,0.25,0.0),vec3(1.55,0.25,1.15),0.0),c.y-0.5*u_cpool),8.0));
  }
  // ---- fire on the floor and its smoke (middle room) ----
  if(u_fire>0.01){
    vec3 f=p-vec3(0.0,0.05,0.2);
    res=opU(res,pLog(f,vec3(-0.5,0.08,-0.2),vec3(0.5,0.08,0.2),0.08));
    res=opU(res,pLog(f,vec3(-0.5,0.08,0.2),vec3(0.5,0.08,-0.2),0.08));
    res=opU(res,vec2(sdEllipsoid(f-vec3(0.0,0.35,0.0),vec3(0.35,0.5*u_fire,0.35)),14.0));
  }
  if(u_smoke>0.01){
    float s=u_smoke;
    float sm=sdEllipsoid(p-vec3(0.0,3.4,-0.4),vec3(1.0+4.5*s,0.5+0.9*s,0.8+1.8*s));
    sm+=0.15*noise2(p.xz*1.3+p.y);
    res=opU(res,vec2(sm,12.0));
  }
  // ---- furnace outside the hot room's end wall ----
  if(u_furn>0.01){
    vec3 q=p-vec3(-10.3,0.0,0.0);
    float fb=sdRoundBox(q-vec3(0.0,0.9,0.0),vec3(1.15,0.9,1.2),0.03);
    float mouth=sdRoundBox(q-vec3(-1.2,0.45,0.0),vec3(0.5,0.45,0.45),0.0);
    mouth=min(mouth,length(vec2(q.y-0.9,q.z))-0.45+max(q.x+0.7,0.0)*10.0);
    fb=max(fb,-mouth);
    fb=rise(fb,q,u_furn,1.8);
    res=opU(res,vec2(fb,5.0));
    res=opU(res,vec2(max(sdRoundBox(q-vec3(-0.75,0.5,0.0),vec3(0.05,0.45,0.42),0.0),q.y-1.8*u_furn),15.0));
    res=opU(res,vec2(sdEllipsoid(q-vec3(-0.95,0.35,0.0),vec3(0.18,0.32*u_furn,0.3)),14.0));
    // wood pile and the stoker
    res=opU(res,pLog(q,vec3(-2.3,0.12,1.5),vec3(-2.3,0.12,2.5),0.12));
    res=opU(res,pLog(q,vec3(-2.6,0.12,1.5),vec3(-2.6,0.12,2.5),0.12));
    res=opU(res,pLog(q,vec3(-2.45,0.33,1.5),vec3(-2.45,0.33,2.5),0.12));
    res=opU(res,pPerson(q-vec3(-2.0,0.0,0.6),u_work,0.2));
  }
  // ---- hypocaust: tile stacks and the floor they carry (hot and warm rooms, x -8.85..2.85) ----
  float FH=0.9*clamp(u_pilae,0.0,1.0);
  {
    vec2 cc; vec3 q=cellXZ(p-vec3(0.2,0.0,0.0),0.8,cc);
    bool inz=cc.x>=-11.0 && cc.x<=3.0 && cc.y>=-3.0 && cc.y<=3.0;
    float d=1e3;
    if(inz && p.y<1.3) d=cellBound(q,0.8);
    if(inz) d=min(d,sdRoundBox(q-vec3(0.0,0.5*FH,0.0),vec3(0.16,0.5*FH+0.001,0.16),0.01));
    res=opU(res,vec2(u_pilae>0.01 ? d : 1e3,5.0));
  }
  // First floor layer (tiles), lifted with the stacks.
  vec3 fl=p-vec3(-3.0,0.0,0.0);
  float lay1=sdRoundBox(fl-vec3(0.0,FH+0.05,0.0),vec3(5.85,0.05,2.85),0.0);
  if(u_pilae>0.01) res=opU(res,vec2(lay1,5.0));
  // Concrete, then big square tiles, dropped on top.
  float l2=clamp(u_layers*2.0,0.0,1.0), l3=clamp(u_layers*2.0-1.0,0.0,1.0);
  if(l2>0.01) res=opU(res,vec2(sdRoundBox(drop(fl,l2)-vec3(0.0,FH+0.17,0.0),vec3(5.85,0.07,2.85),0.0),12.0));
  if(l3>0.01){
    vec3 t=drop(fl,l3)-vec3(0.0,FH+0.27,0.0);
    float tile=sdRoundBox(vec3(mod(t.x+0.3,0.6)-0.3,t.y,mod(t.z+0.3,0.6)-0.3),vec3(0.285,0.03,0.285),0.01);
    tile=max(tile,sdRoundBox(t,vec3(5.85,0.04,2.85),0.0));
    res=opU(res,vec2(tile,4.0));
  }
  float FT=FH+0.3; // top of the finished floor
  // Hot-air streams under the floor, from the furnace towards the warm room.
  if(u_heat>0.01){
    float x1=-9.4+11.8*clamp(u_heat,0.0,1.0);
    float hs=1e3;
    for(int i=0;i<4;i++){
      float z=-1.2+0.8*float(i);
      hs=min(hs,sdCapsule(p,vec3(-9.4,0.42,z),vec3(x1,0.42+0.04*sin(p.x*2.0+float(i)),z),0.07));
    }
    res=opU(res,vec2(hs,14.0));
  }
  // ---- hollow wall tubes (back wall and hot-room end wall), then chimneys ----
  if(u_tubes>0.01){
    float top=FT+3.0*clamp(u_tubes,0.0,1.0);
    float tx=mod(p.x+0.225,0.45)-0.225;
    float tb=sdRoundBox(vec3(tx,p.y-2.85,p.z+2.79),vec3(0.17,1.65,0.07),0.01);
    tb=max(tb,abs(p.x+3.0)-5.8);
    float tz=mod(p.z+0.225,0.45)-0.225;
    float te=sdRoundBox(vec3(p.x+8.79,p.y-2.85,tz),vec3(0.07,1.65,0.17),0.01);
    te=max(te,abs(p.z)-2.8);
    tb=min(tb,te);
    tb=max(tb,max(p.y-top,FT-p.y));
    res=opU(res,vec2(tb,6.0));
  }
  // ---- chimneys through the roof, with smoke (only with the roof on) ----
  if(u_roof>0.5 && u_tubes>0.5){
    vec3 ch=vec3(mod(p.x+1.5,3.0)-1.5,p.y,p.z+1.5);
    float cd=sdRoundBox(ch-vec3(0.0,H+1.2,0.0),vec3(0.3,1.2,0.3),0.02);
    cd=max(cd,abs(p.x+3.0)-5.5);
    res=opU(res,vec2(cd,5.0));
    float pf=sdEllipsoid(ch-vec3(0.25,H+3.1,0.0),vec3(0.55,0.4,0.5))+0.08*noise2(p.xz*3.0+p.y);
    pf=min(pf,sdEllipsoid(ch-vec3(0.7,H+3.8,0.1),vec3(0.75,0.45,0.6)));
    pf=max(pf,abs(p.x+3.0)-6.5);
    res=opU(res,vec2(pf,12.0));
  }
  // ---- hot pool (caldarium) and warm-room bench ----
  if(u_hpool>0.01){
    vec3 c=drop(p-vec3(-6.0,FT,-0.7),u_hpool);
    float rim=sdRoundBox(c-vec3(0.0,0.4,0.0),vec3(1.9,0.4,1.3),0.03);
    rim=max(rim,-sdRoundBox(c-vec3(0.0,0.6,0.0),vec3(1.65,0.4,1.05),0.0));
    res=opU(res,vec2(rim,4.0));
    res=opU(res,vec2(sdRoundBox(c-vec3(0.0,0.35,0.0),vec3(1.65,0.33,1.05),0.0),8.0));
  }
  if(u_bench>0.01){
    vec3 b=drop(p-vec3(0.0,FT,-2.35),u_bench);
    res=opU(res,vec2(sdRoundBox(b-vec3(0.0,0.25,0.0),vec3(2.0,0.25,0.35),0.03),4.0));
  }
  // ---- bronze tank over the furnace, with a pipe into the hot room ----
  if(u_tank>0.01){
    vec3 k=drop(p-vec3(-10.3,1.8,0.0),u_tank);
    res=opU(res,vec2(sdCylinder(k-vec3(0.0,0.55,0.0),0.55,0.6),14.0));
    res=opU(res,vec2(sdCapsule(k,vec3(0.3,0.7,0.0),vec3(1.6,0.7,0.0),0.08),14.0));
  }
  // ---- roof ----
  if(u_roof>0.01) res=opU(res,pRoof(drop(p-vec3(0.0,H,0.0),u_roof),18.8,3.5,1.6,6.0));
  // ---- the bather ----
  res=opU(res,pPerson(p-vec3(u_px,u_py,u_pz),0.0,0.7));
  // trees outside
  res=opU(res,pTree(p-vec3(4.0,0.0,-8.0),4.2));
  res=opU(res,pTree(p-vec3(-6.0,0.0,-9.0),3.8));
  return res;
}
