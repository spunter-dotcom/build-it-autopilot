// scene.glsl: stone arch bridge. River flows along z; the bridge spans x. River bed y=-3, banks y=0.
// Two arches (radius 3) centred at x=-4 and x=4, springing at y=-2, central pier x in [-1,1].

// One voussoir of a 13-stone semicircular ring (index k), visible if its rank from the bottom < nv.
float vStone(vec3 q, float k, float nv, float key){
  float N=13.0; float sec=3.14159/N;
  if(k<0.0||k>N-1.0) return 1e3;
  float rank=min(k,N-1.0-k);
  if(k==6.0){ if(key<0.01) return 1e3; float e=1.0-clamp(key,0.0,1.0); q.y-=4.0*e*e; }
  else if(rank>=nv) return 1e3;
  float m=(k+0.5)*sec;
  vec2 l=vec2(cos(m)*q.x+sin(m)*q.y, -sin(m)*q.x+cos(m)*q.y);
  return sdRoundBox(vec3(l.x-3.4,l.y,q.z),vec3(0.4,3.4*sin(0.5*sec)-0.035,1.55),0.03);
}
// Ring of voussoirs around centre c: nv stones per side (0..6), keystone dropped in by key.
vec2 vRing(vec3 p, vec3 c, float nv, float key){
  vec3 q=p-c; float sec=3.14159/13.0;
  float k=clamp(floor(atan(max(q.y,-0.2),q.x)/sec),0.0,12.0);
  float d=min(vStone(q,k,nv,key),min(vStone(q,k-1.0,nv,key),vStone(q,k+1.0,nv,key)));
  float id=(k==6.0)?4.0:2.0;
  return vec2(d,id);
}

vec2 map(vec3 p){
  // ground with a river channel
  float g=(p.y+3.0*(1.0-smoothstep(8.5,10.5,abs(p.x))))*0.6;
  vec2 res=vec2(g,0.0);

  // water, drained inside the cofferdam ring while u_dry rises
  vec3 cc=vec3(0.0,0.0,-0.6); float ring=length(p.xz-cc.xz)-3.0;
  float wl=-2.3;
  float w=p.y-wl;
  if(u_site>0.5&&u_site<1.5&&u_clay>0.5) w=min(max(p.y-wl,-ring),max(p.y-mix(wl,-3.3,u_dry),ring));
  res=opU(res,vec2(w,8.0));

  // a little town on both banks
  res=opU(res,pWall(p-vec3(15.0,0.0,-3.0),vec3(1.6,1.2,1.5),12.0));
  res=opU(res,pRoof(p-vec3(15.0,2.4,-3.0),3.6,1.8,1.3,6.0));
  res=opU(res,pWall(p-vec3(15.5,0.0,4.0),vec3(1.5,1.0,1.6),12.0));
  res=opU(res,pRoof(p-vec3(15.5,2.0,4.0),3.4,1.9,1.2,6.0));
  res=opU(res,pWall(p-vec3(-15.0,0.0,2.0),vec3(1.5,1.1,1.5),12.0));
  res=opU(res,pRoof(p-vec3(-15.0,2.2,2.0),3.4,1.8,1.2,6.0));

  if(u_site<0.5){
    // Site 0: an old timber bridge on posts; u_rot sinks and tilts its middle span.
    for(int i=-1;i<=1;i++){
      float x=4.0*float(i);
      res=opU(res,pLog(p,vec3(x,-3.0,-1.1),vec3(x,0.3,-1.1),0.14));
      res=opU(res,pLog(p,vec3(x,-3.0,1.1),vec3(x,0.3,1.1),0.14));
    }
    res=opU(res,pPlank(p-vec3(-8.0,0.4,0.0),vec3(3.0,0.08,1.3)));
    res=opU(res,pPlank(p-vec3(8.0,0.4,0.0),vec3(3.0,0.08,1.3)));
    vec3 q=p-vec3(0.0,0.4-1.6*u_rot,0.0); q.xy=rot(0.35*u_rot)*q.xy;
    res=opU(res,pPlank(q,vec3(3.9,0.08,1.3)));
  }

  if(u_site>0.5&&u_site<1.5&&u_posts>0.01){
    // Site 1: cofferdam, a ring of posts sealed with clay.
    vec3 r=p-cc; float n=28.0; float sec=6.28318/n;
    float a=atan(r.z,r.x)+3.14159; float k=floor(a/sec);
    float vis=u_posts*n;
    float dp=1e3;
    for(int j=-1;j<=1;j++){
      float kk=mod(k+float(j),n);
      if(kk<vis){ float m=(kk+0.5)*sec-3.14159; vec3 c=vec3(cos(m)*3.0,0.0,sin(m)*3.0);
        dp=min(dp,sdCapsule(r,c+vec3(0.0,-3.3,0.0),c+vec3(0.0,-0.9,0.0),0.15)); }
    }
    res=opU(res,vec2(dp,3.0));
    if(u_clay>0.01){
      float cl=max(abs(length(r.xz)-3.3)-0.18,abs(r.y+2.2)-0.95*clamp(u_clay,0.0,1.0));
      res=opU(res,vec2(cl,1.0));
    }
  }

  // the central pier with a pointed upstream nose and a flood opening
  if(u_pier>0.01){
    vec3 q=p-vec3(0.0,-3.0,0.0);
    float d=rise(sdRoundBox(q-vec3(0.0,1.8,0.0),vec3(1.0,1.8,1.5),0.03),q,u_pier,3.6);
    if(u_nose>0.01){
      vec2 xz=vec2(abs(q.x),q.z);
      float wedge=max(dot(xz-vec2(1.0,-1.5),normalize(vec2(1.2,-1.0))),q.z+1.4);
      wedge=max(wedge,abs(q.y-1.8)-1.8);
      d=min(d,rise(wedge,q,u_nose,3.6));
    }
    if(u_hole>0.01) d=max(d,-(length(vec2(p.x,p.y+0.2))-0.5*u_hole));
    res=opU(res,vec2(d,2.0));
  }

  // abutments on both banks
  if(u_abut>0.5){
    res=opU(res,pBlock(p-vec3(-9.75,-0.8,0.0),vec3(1.75,2.2,1.5),2.0));
    res=opU(res,pBlock(p-vec3(9.75,-0.8,0.0),vec3(1.75,2.2,1.5),2.0));
  }

  // wooden centering under the left arch; u_strike lowers and removes it
  if(u_cent>0.01&&u_strike<0.99){
    vec3 q=drop(p-vec3(-4.0,-2.0-2.5*u_strike,0.0),u_cent);
    float sh=max(max(abs(length(q.xy)-2.9)-0.08,abs(q.z)-1.45),-q.y);
    float rib=max(max(abs(length(q.xy)-2.6)-0.2,abs(abs(q.z)-1.1)-0.1),-q.y);
    float post=min(sdRoundBox(q-vec3(0.0,0.3,0.0),vec3(0.12,1.6,1.3),0.02),
               min(sdRoundBox(q-vec3(-1.8,-0.2,0.0),vec3(0.12,1.0,1.3),0.02),sdRoundBox(q-vec3(1.8,-0.2,0.0),vec3(0.12,1.0,1.3),0.02)));
    float tie=sdRoundBox(q-vec3(0.0,0.05,0.0),vec3(2.8,0.1,1.3),0.02);
    res=opU(res,vec2(min(min(sh,rib),min(post,tie)),3.0));
  }

  // voussoir rings: left arch (u_stones, u_key) and right arch (u_arch2)
  if(u_stones>0.01||u_key>0.01) res=opU(res,vRing(p,vec3(-4.0,-2.0,0.0),floor(u_stones*6.0+0.001),u_key));
  if(u_arch2>0.01) res=opU(res,vRing(p,vec3(4.0,-2.0,0.0),floor(u_arch2*6.0+0.001),u_arch2>0.98?1.0:0.0));

  // spandrel fill, deck and parapets, people crossing
  if(u_fill>0.01){
    vec3 q=p-vec3(0.0,-3.0,0.0);
    float d=rise(pArcade(q,2.0,6.0,1.0,2.98,1.0,2.0).x,q,u_fill,4.4);
    if(u_hole>0.01) d=max(d,-(length(vec2(p.x,p.y+0.2))-0.5*u_hole));
    res=opU(res,vec2(d,5.0));
  }
  if(u_deck>0.01){
    vec3 q=drop(p,u_deck);
    res=opU(res,pBlock(q-vec3(0.0,1.48,0.0),vec3(11.5,0.08,1.55),2.0));
    res=opU(res,pBlock(q-vec3(0.0,1.85,1.4),vec3(11.5,0.3,0.15),2.0));
    res=opU(res,pBlock(q-vec3(0.0,1.85,-1.4),vec3(11.5,0.3,0.15),2.0));
  }
  if(u_people>0.01){
    res=opU(res,pPerson(p-vec3(-6.0+3.0*u_people,1.56,0.5),0.0,0.2));
    res=opU(res,pPerson(p-vec3(5.0-2.5*u_people,1.56,-0.5),0.0,0.7));
  }
  return res;
}
