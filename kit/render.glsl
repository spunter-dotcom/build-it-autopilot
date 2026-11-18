// ===== Build-it kit: camera, sky, materials, lighting. The video's scene.glsl only defines map(). =====
// Camera (all animatable): orbit angle u_ang (radians, 0 = camera on +z), distance u_dist, height u_h
// above the target, target u_tx/u_ty/u_tz, lens u_lens (0.7 wide .. 1.4 normal .. 2.4 tele).
// Look: u_ground 0 grass, 1 dirt, 2 stone paving, 3 sand, 4 wood floor, 5 snow. u_night 0 day .. 1 night.

vec2 surfUV(vec3 pos, vec3 n){
  vec3 a=abs(n);
  if(a.y>a.x && a.y>a.z) return pos.xz;
  if(a.x>a.z) return vec2(pos.z,pos.y);
  return pos.xy;
}
vec3 skyCol(vec3 rd){
  vec3 top=lin(vec3(0.24,0.52,0.86)), hor=lin(vec3(0.66,0.82,0.95));
  vec3 c=mix(hor,top,pow(clamp(rd.y,0.0,1.0),0.6));
  vec2 cp=rd.xz/max(rd.y,0.05)*1.2+vec2(u_time*0.02,0.0);
  float cl=smoothstep(0.55,0.8,noise2(cp*1.3)*0.65+noise2(cp*3.1)*0.35)*smoothstep(0.02,0.15,rd.y);
  c=mix(c,vec3(1.0),cl*0.9);
  vec3 nightC=mix(lin(vec3(0.10,0.13,0.25)),lin(vec3(0.02,0.03,0.09)),clamp(rd.y*2.0,0.0,1.0));
  float star=step(0.997,hash2(floor(rd.xy*420.0)))*smoothstep(0.05,0.3,rd.y);
  c=mix(c,nightC+star,u_night);
  float ang=atan(rd.x,rd.z);
  float hill=0.015+0.025*noise2(vec2(ang*3.0,5.0));
  if(rd.y<hill) c=mix(c,mix(lin(vec3(0.40,0.55,0.38)),lin(vec3(0.05,0.08,0.07)),u_night),0.85);
  return c;
}
vec3 groundAlb(vec3 pos){
  vec2 q=pos.xz;
  float g=noise2(q*0.7)*0.5+noise2(q*3.0)*0.3+noise2(q*11.0)*0.2;
  if(u_ground<0.5) return mix(lin(vec3(0.42,0.62,0.26)),lin(vec3(0.58,0.74,0.32)),g);
  if(u_ground<1.5) return mix(lin(vec3(0.50,0.40,0.28)),lin(vec3(0.62,0.51,0.36)),g);
  if(u_ground<2.5){
    vec2 gq=q/0.9;
    float j=max(step(fract(gq.x+0.5*floor(gq.y)),0.035),step(fract(gq.y),0.035));
    float h=hash2(floor(vec2(gq.x+0.5*floor(gq.y),gq.y)));
    return mix(lin(vec3(0.66,0.60,0.50)),lin(vec3(0.76,0.70,0.60)),h)*(1.0-0.3*j);
  }
  if(u_ground<3.5) return mix(lin(vec3(0.82,0.72,0.52)),lin(vec3(0.90,0.80,0.60)),g);
  if(u_ground<4.5){
    float b=floor(q.x/0.35); float h=hash2(vec2(b,3.0));
    return mix(lin(vec3(0.50,0.33,0.18)),lin(vec3(0.63,0.44,0.25)),0.6*h+0.4*noise2(vec2(q.x*2.0,q.y*12.0)))*(1.0-0.3*step(fract(q.x/0.35),0.03));
  }
  return mix(lin(vec3(0.86,0.89,0.94)),lin(vec3(0.97,0.98,1.0)),g);
}
// Albedo and gloss for a material id at a surface point.
vec3 matAlb(float id, vec3 pos, vec3 n, out float gloss){
  gloss=0.1;
  vec2 uv=surfUV(pos,n);
  float g=noise2(uv*2.3)*0.6+noise2(uv*9.0)*0.4;
  if(id<0.5) return groundAlb(pos);
  if(id<1.5) return mix(lin(vec3(0.45,0.36,0.25)),lin(vec3(0.56,0.45,0.31)),g);
  if(id<2.5){
    float course=floor(uv.y/0.5);
    vec2 bq=vec2(uv.x/0.9+0.5*course,uv.y/0.5);
    float j=max(step(fract(bq.x),0.03),step(fract(bq.y),0.05));
    float h=hash2(floor(bq));
    return mix(lin(vec3(0.70,0.67,0.60)),lin(vec3(0.84,0.81,0.73)),0.6*h+0.4*g)*(1.0-0.28*j);
  }
  if(id<3.5){ gloss=0.15; return mix(lin(vec3(0.46,0.30,0.17)),lin(vec3(0.64,0.45,0.26)),noise2(vec2(uv.x*2.0,uv.y*14.0))*0.7+0.3*g); }
  if(id<4.5){
    gloss=0.35;
    vec3 a=mix(lin(vec3(0.88,0.86,0.82)),lin(vec3(0.97,0.96,0.93)),g);
    float v=abs(noise2(uv*2.2+pos.z)-0.5);
    return mix(a,lin(vec3(0.62,0.63,0.66)),smoothstep(0.03,0.0,v)*0.5);
  }
  if(id<5.5){
    float course=floor(uv.y/0.22);
    vec2 bq=vec2(uv.x/0.5+0.5*course,uv.y/0.22);
    float j=max(step(fract(bq.x),0.05),step(fract(bq.y),0.1));
    return mix(lin(vec3(0.66,0.36,0.24)),lin(vec3(0.78,0.48,0.32)),hash2(floor(bq)))*(1.0-0.35*j);
  }
  if(id<6.5){
    float j=step(fract(uv.x/0.32),0.12)+step(fract(uv.y/0.4),0.1);
    return mix(lin(vec3(0.66,0.28,0.18)),lin(vec3(0.76,0.36,0.22)),g)*(1.0-0.3*clamp(j,0.0,1.0));
  }
  if(id<7.5){ gloss=0.6; return lin(vec3(0.22,0.22,0.25))*(0.85+0.3*g); }
  if(id<8.5){ gloss=0.95; return mix(lin(vec3(0.16,0.38,0.50)),lin(vec3(0.26,0.52,0.62)),noise2(pos.xz*1.5+u_time*0.3)); }
  if(id<9.95){
    float c=fract(id)*10.0;
    vec3 cc=c<2.5 ? vec3(0.62,0.26,0.20) : (c<5.0 ? vec3(0.28,0.36,0.52) : (c<7.5 ? vec3(0.72,0.56,0.30) : vec3(0.36,0.46,0.30)));
    return lin(cc);
  }
  if(id<10.5) return lin(vec3(0.86,0.66,0.52));
  if(id<11.5) return mix(lin(vec3(0.20,0.40,0.16)),lin(vec3(0.32,0.54,0.22)),g);
  if(id<12.5) return mix(lin(vec3(0.82,0.78,0.70)),lin(vec3(0.92,0.89,0.82)),g);
  if(id<13.5) return mix(lin(vec3(0.70,0.58,0.34)),lin(vec3(0.82,0.70,0.44)),noise2(uv*30.0));
  if(id<14.5){ gloss=0.8; return lin(vec3(0.85,0.62,0.22))*(0.85+0.3*g); }
  return lin(vec3(0.10,0.08,0.07));
}
vec4 pixel(vec2 uv){
  vec2 p=screenP(uv,0.0);
  vec3 ta=vec3(u_tx,u_ty,u_tz);
  vec3 ro=ta+vec3(sin(u_ang)*u_dist,u_h,cos(u_ang)*u_dist);
  vec3 rd=camRay(p,ro,ta,u_lens);
  vec3 sky=skyCol(rd);
  vec3 haze=mix(lin(vec3(0.66,0.76,0.80)),lin(vec3(0.06,0.08,0.14)),u_night);
  vec3 m=march(ro,rd,80.0,0.0);
  vec3 col;
  if(m.x>0.0){
    vec3 pos=ro+rd*m.x, n=calcNormal(pos);
    float gloss;
    vec3 alb=matAlb(m.y,pos,n,gloss);
    vec3 Ld=normalize(vec3(0.6,0.9,0.45));
    vec3 key=mix(lin(vec3(1.0,0.95,0.85))*1.6,lin(vec3(0.55,0.62,0.9))*0.35,u_night);
    vec3 skyF=mix(lin(vec3(0.55,0.72,0.95))*0.55,lin(vec3(0.15,0.2,0.35))*0.4,u_night);
    col=shade(pos,n,rd,alb,Ld,key,skyF,lin(vec3(0.55,0.55,0.4))*0.4,gloss);
    if(m.y>14.5) col=alb*0.6;
    col=grade(col,haze,m.x,24.0,0.45,0.02);
  } else {
    col=pow(sky,vec3(0.4545));
  }
  return vec4(col,1.0);
}
