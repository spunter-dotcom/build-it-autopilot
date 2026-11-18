float sdSphere(vec3 p, float r){ return length(p)-r; }
float sdEllipsoid(vec3 p, vec3 r){ float k0=length(p/r), k1=length(p/(r*r)); return k0*(k0-1.0)/k1; }
float sdCapsule(vec3 p, vec3 a, vec3 b, float r){ vec3 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0); return length(pa-ba*h)-r; }
float sdRoundBox(vec3 p, vec3 b, float r){ vec3 q=abs(p)-b; return length(max(q,0.0))+min(max(q.x,max(q.y,q.z)),0.0)-r; }
float sdCylinder(vec3 p, float h, float r){ vec2 d=abs(vec2(length(p.xz),p.y))-vec2(r,h); return min(max(d.x,d.y),0.0)+length(max(d,0.0)); }
float sdTorus(vec3 p, vec2 t){ vec2 q=vec2(length(p.xz)-t.x,p.y); return length(q)-t.y; }
float smin(float a, float b, float k){ float h=clamp(0.5+0.5*(b-a)/k,0.0,1.0); return mix(b,a,h)-k*h*(1.0-h); }
vec2 opU(vec2 a, vec2 b){ return a.x<b.x ? a : b; }
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
float hash2(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash2(i),hash2(i+vec2(1.0,0.0)),f.x), mix(hash2(i+vec2(0.0,1.0)),hash2(i+vec2(1.0,1.0)),f.x), f.y); }
vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }

vec2 map(vec3 p);

vec2 screenP(vec2 uv, float pad){ vec2 p=(uv*u_resolution-0.5*u_resolution)/(u_resolution.y-2.0*pad); p.y=-p.y; return p; }
vec3 camRay(vec2 p, vec3 ro, vec3 ta, float lens){
  vec3 ww=normalize(ta-ro), uu=normalize(cross(ww,vec3(0.0,1.0,0.0))), vv=cross(uu,ww);
  return normalize(p.x*uu+p.y*vv+lens*ww);
}
vec3 calcNormal(vec3 p){ vec2 e=vec2(0.001,0.0);
  return normalize(vec3(map(p+e.xyy).x-map(p-e.xyy).x, map(p+e.yxy).x-map(p-e.yxy).x, map(p+e.yyx).x-map(p-e.yyx).x)); }
vec3 march(vec3 ro, vec3 rd, float tmax, float outlineW){
  float t=0.0, mh=1e9, mt=0.0;
  for(int i=0;i<96;i++){ vec2 h=map(ro+rd*t);
    if(h.x<0.001){ float w=outlineW*mt; float e=(mt<t-0.05) ? 1.0-smoothstep(0.5*w,w,mh) : 0.0; return vec3(t,h.y,e); }
    if(h.x<mh && h.y>0.5){ mh=h.x; mt=t; }
    t+=h.x; if(t>tmax) break; }
  float w=outlineW*max(mt,0.001); return vec3(-1.0,0.0,1.0-smoothstep(0.5*w,w,mh));
}
float softShadow(vec3 ro, vec3 rd, float k){ float res=1.0, t=0.02;
  for(int i=0;i<32;i++){ float h=map(ro+rd*t).x; res=min(res,k*h/t); t+=clamp(h,0.02,0.25); if(h<0.001||t>8.0) break; }
  return clamp(res,0.0,1.0); }
float calcAO(vec3 p, vec3 n){ float o=0.0, s=1.0;
  for(int i=1;i<=5;i++){ float h=0.04*float(i); o+=(h-map(p+n*h).x)*s; s*=0.7; } return clamp(1.0-2.5*o,0.0,1.0); }
vec3 shade(vec3 pos, vec3 n, vec3 rd, vec3 alb, vec3 L, vec3 keyCol, vec3 skyCol, vec3 bounceCol, float gloss){
  float sh=mix(0.35,1.0,softShadow(pos+n*0.01,L,6.0));
  float wrap=clamp((dot(n,L)+0.35)/1.35,0.0,1.0)*sh;
  float sky=0.5+0.5*n.y, bounce=clamp(-n.y*0.5+0.5,0.0,1.0)*0.6, ao=calcAO(pos,n);
  vec3 h=normalize(L-rd);
  float spec=pow(clamp(dot(n,h),0.0,1.0),mix(8.0,96.0,gloss))*mix(0.08,0.9,gloss)*sh;
  float rim=pow(clamp(1.0+dot(n,rd),0.0,1.0),3.0)*0.35;
  return alb*(wrap*keyCol + sky*skyCol*ao + bounce*bounceCol*ao) + spec*keyCol + rim*skyCol*ao;
}
vec3 grade(vec3 col, vec3 bg, float t, float hazeStart, float haze, float lift){
  col=mix(col,bg,haze*clamp((t-hazeStart)*0.15,0.0,1.0));
  col=pow(max(col,0.0),vec3(0.4545));
  return mix(col,vec3(1.0),lift)*(1.0-lift*0.3)+lift*0.3*pow(bg,vec3(0.4545));
}
