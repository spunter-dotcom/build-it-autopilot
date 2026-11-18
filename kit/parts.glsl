// ===== Build-it kit: reusable parts =====
// Material ids (colours live in render.glsl, so every video looks consistent):
//  0 ground (look set by u_ground)  1 packed dirt   2 cut stone blocks  3 wood / timber  4 marble
//  5 brick   6 roof tiles  7 iron  8 water  9 clothing  10 skin  11 foliage  12 plaster / concrete
// 13 rope / straw  14 gold / bronze  15 dark opening (door, window, hole)
// Every part takes p already moved into the part's own space (p - position).

// ---- reveal helpers: animate a 0..1 param to make parts arrive ----
// drop(p,k): part falls in from 4 units above as k goes 0 -> 1. Skip the part entirely when k <= 0.01.
vec3 drop(vec3 p, float k){ float e=1.0-clamp(k,0.0,1.0); return p-vec3(0.0,4.0*e*e,0.0); }
// rise(d,p,k,h): clip a part of height h so it grows upward from y=0 as k goes 0 -> 1.
float rise(float d, vec3 p, float k, float h){ return max(d, p.y-h*clamp(k,0.0,1.0)); }
// count(k,n): how many of n repeated items are visible for a 0..1 param (use with floor grids).
float count(float k, float n){ return floor(clamp(k,0.0,1.0)*n+0.001); }

// ---- safe repetition on the ground plane ----
// Returns the local position inside a cell of size s; cell id in c. Always combine the result with
// cellBound(...), and always evaluate the repeated part (never skip it with an if around the call),
// cellBound(...) so the marcher never steps across a cell boundary (otherwise shapes render hollow).
vec3 cellXZ(vec3 p, float s, out vec2 c){ c=floor(p.xz/s+0.5); return vec3(p.x-c.x*s, p.y, p.z-c.y*s); }
float cellBound(vec3 q, float s){ return g_bound>0.5 ? max(0.5*s-max(abs(q.x),abs(q.z)), 0.2) : 1e3; }

// ---- nature ----
vec2 pTree(vec3 p, float h){
  float tr=sdCylinder(p-vec3(0.0,h*0.5,0.0),h*0.5,0.16+0.02*h);
  float can=smin(sdSphere(p-vec3(0.0,h,0.0),0.28*h),sdSphere(p-vec3(0.0,h+0.25*h,0.0),0.2*h),0.3);
  return opU(vec2(tr,3.0),vec2(can,11.0));
}
// A patch of trees (use s >= 3.5): cells of size s inside |x|<=hx, z in [z0,z1]. Trees keep 0.5 units from cell edges.
vec2 pForest(vec3 p, float s, float hx, float z0, float z1){
  vec2 c; vec3 q=cellXZ(p,s,c);
  vec2 res=vec2(1e3,0.0);
  // bound only in and next to the forest, so open ground far away is marched in big steps
  if(abs(c.x*s)<=hx+s && c.y*s>=z0-s && c.y*s<=z1+s) res.x=cellBound(q,s);
  if(abs(c.x*s)<=hx && c.y*s>=z0 && c.y*s<=z1){
    vec2 o=(vec2(hash2(c),hash2(c+7.3))-0.5)*0.2*s;
    float h=min(2.6+1.6*hash2(c+3.1),1.4*s);
    res=opU(res,pTree(q-vec3(o.x,0.0,o.y),h));
  }
  return res;
}
vec2 pRock(vec3 p, float r){ return vec2(sdEllipsoid(p,vec3(r,0.6*r,0.8*r))+0.04*noise2(p.xz*5.0),2.0); }

// ---- people (simple wooden-figure style, no faces; pose: 0 stand, 1 arms up / working) ----
vec2 pPerson(vec3 p, float pose, float seed){
  float legs=sdCapsule(vec3(abs(p.x)-0.09,p.y,p.z),vec3(0.0,0.08,0.0),vec3(0.0,0.62,0.0),0.075);
  float body=smin(legs,sdCapsule(p,vec3(0.0,0.62,0.0),vec3(0.0,1.0,0.0),0.15),0.05);
  vec3 hand=mix(vec3(0.28,0.62,0.05),vec3(0.24,1.35,0.12),clamp(pose,0.0,1.0));
  body=smin(body,sdCapsule(vec3(abs(p.x),p.y,p.z),vec3(0.17,0.95,0.0),hand,0.055),0.04);
  float head=sdSphere(p-vec3(0.0,1.24,0.0),0.13);
  return opU(vec2(body,9.0+fract(seed)*0.9),vec2(head,10.0));
}

// ---- timber ----
// Log between a and b. For a wall course use pLogX / pLogZ.
vec2 pLog(vec3 p, vec3 a, vec3 b, float r){ return vec2(sdCapsule(p,a,b,r),3.0); }
// Log-cabin wall of n courses, length L along x (z along z when alongZ = 1), log radius r.
vec2 pLogWall(vec3 p, float L, float n, float r, float alongZ){
  vec3 q=alongZ>0.5 ? vec3(p.z,p.y,p.x) : p;
  float k=clamp(floor(q.y/(1.8*r)),0.0,n-1.0);
  float y=r+k*1.8*r;
  return vec2(sdCapsule(q,vec3(-0.5*L,y,0.0),vec3(0.5*L,y,0.0),r),3.0);
}
vec2 pBeam(vec3 p, vec3 size){ return vec2(sdRoundBox(p,size,0.02),3.0); }
vec2 pPlank(vec3 p, vec3 size){ return vec2(sdRoundBox(p,size,0.01),3.0); }

// ---- stone and masonry ----
vec2 pBlock(vec3 p, vec3 size, float id){ return vec2(sdRoundBox(p,size,0.03),id); }
vec2 pWall(vec3 p, vec3 size, float id){ return vec2(sdRoundBox(p-vec3(0.0,size.y,0.0),size,0.02),id); }
// Column standing on y=0: radius r, height h, square base and capital.
vec2 pColumn(vec3 p, float r, float h, float id){
  float d=sdCylinder(p-vec3(0.0,0.5*h,0.0),0.5*h,r);
  d=min(d,sdRoundBox(p-vec3(0.0,0.1,0.0),vec3(1.35*r,0.1,1.35*r),0.02));
  d=min(d,sdRoundBox(p-vec3(0.0,h-0.08,0.0),vec3(1.4*r,0.08,1.4*r),0.02));
  return vec2(d,id);
}
// Round arch on y=0, opening width w, pier height ph, wall thickness t (along z), pier width pw.
vec2 pArch(vec3 p, float w, float ph, float t, float pw, float id){
  float r=0.5*w;
  float outer=sdRoundBox(p-vec3(0.0,0.5*(ph+r+0.4),0.0),vec3(r+pw,0.5*(ph+r+0.4),0.5*t),0.02);
  float hole=min(sdRoundBox(p-vec3(0.0,0.5*ph,0.0),vec3(r,0.5*ph+0.01,t),0.0),
                 length(vec2(p.x,p.y-ph))-r);
  hole=max(hole,abs(p.z)-t);
  return vec2(max(outer,-hole),id);
}
// Row of n arches along x, spacing = w + 2*pw. Use for arcades, aqueducts, the Colosseum.
vec2 pArcade(vec3 p, float n, float w, float ph, float t, float pw, float id){
  float sp=w+2.0*pw;
  float k=clamp(floor((p.x+0.5*(n-1.0)*sp)/sp+0.5),0.0,n-1.0);
  return pArch(p-vec3((k-0.5*(n-1.0))*sp,0.0,0.0),w,ph,t,pw,id);
}
// Gabled roof: ridge along x, half-width hw (z), length L, height h, sitting on y=0.
vec2 pRoof(vec3 p, float L, float hw, float h, float id){
  float slope=atan(h,hw);
  vec2 q=vec2(abs(p.z),p.y);
  float d=max(dot(q-vec2(hw,0.0),vec2(sin(slope),cos(slope))), -p.y);
  d=max(d,abs(p.x)-0.5*L);
  return vec2(d*0.8,id);
}
vec2 pDome(vec3 p, float r, float id){ return vec2(max(length(p)-r,-p.y),id); }
// Steps along +z rising in y: n steps of rise sr and run sd, width w.
vec2 pStairs(vec3 p, float n, float sr, float sd, float w, float id){
  float k=clamp(floor(p.z/sd),0.0,n-1.0);
  float d=sdRoundBox(p-vec3(0.0,0.5*sr*(k+1.0),(k+0.5)*sd),vec3(0.5*w,0.5*sr*(k+1.0),0.5*sd),0.01);
  return vec2(d,id);
}

// ---- machines ----
// Wheel in the xy plane (axle along z): radius r, rim thickness t, width w, n spokes.
vec2 pWheel(vec3 p, float r, float t, float w, float n, float id){
  float rim=max(abs(length(p.xy)-r)-t,abs(p.z)-0.5*w);
  float a=atan(p.y,p.x); float sec=6.2832/n;
  a=mod(a+0.5*sec,sec)-0.5*sec;
  vec2 q=length(p.xy)*vec2(cos(a),sin(a));
  float spoke=max(max(abs(q.y)-0.4*t,q.x-r),abs(p.z)-0.3*w);
  float hub=max(length(p.xy)-2.0*t,abs(p.z)-0.5*w);
  return vec2(min(rim,min(spoke,hub)),id);
}
// Gear in the xy plane: radius r, n teeth, tooth depth td, width w.
vec2 pGear(vec3 p, float r, float n, float td, float w, float id){
  float a=atan(p.y,p.x);
  float teeth=smoothstep(-0.3,0.3,sin(a*n));
  float d=max(length(p.xy)-(r+td*teeth),abs(p.z)-0.5*w);
  return vec2(d*0.7,id);
}
vec2 pRope(vec3 p, vec3 a, vec3 b){ return vec2(sdCapsule(p,a,b,0.03),13.0); }
vec2 pBarrel(vec3 p, float r, float h){ float b=sdCylinder(p-vec3(0.0,0.5*h,0.0),0.5*h,r*(1.0-0.12*pow((p.y/h-0.5)*2.0,2.0))); return vec2(b*0.9,3.0); }

// ---- water: a flat surface at height y (id 8). Combine with opU. ----
vec2 pWater(vec3 p, float y){ return vec2(p.y-y,8.0); }
