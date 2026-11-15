float taper(vec3 p, float x0, float x1, float r0, float r1){
  float t=clamp((p.x-x0)/(x1-x0),0.0,1.0);
  return max(length(p.yz)-mix(r0,r1,t),max(x0-p.x,p.x-x1))*0.8;
}
float fig(vec3 p){
  float d=sdCapsule(p,vec3(-0.19,0.15,0.0),vec3(-0.17,1.95,0.0),0.17);
  d=smin(d,sdCapsule(p,vec3(0.36,0.15,0.06),vec3(0.2,1.95,0.0),0.165),0.1);
  d=smin(d,sdEllipsoid(p-vec3(0.0,2.5,0.0),vec3(0.4,0.72,0.25)),0.15);
  d=smin(d,sdEllipsoid(p-vec3(0.0,2.98,0.0),vec3(0.5,0.38,0.27)),0.12);
  d=smin(d,sdCapsule(p,vec3(0.0,3.3,0.0),vec3(0.02,3.5,0.0),0.12),0.08);
  d=smin(d,sdEllipsoid(p-vec3(0.04,3.74,0.0),vec3(0.25,0.29,0.26)),0.06);
  d=smin(d,sdCapsule(p,vec3(-0.55,3.08,0.0),vec3(-0.62,1.95,0.06),0.115),0.1);
  d=smin(d,sdCapsule(p,vec3(0.55,3.08,0.0),vec3(0.7,2.45,0.04),0.11),0.1);
  d=smin(d,sdCapsule(p,vec3(0.7,2.45,0.04),vec3(0.4,3.12,0.2),0.1),0.06);
  d=smin(d,sdCapsule(p,vec3(-0.3,0.1,-0.16),vec3(-0.3,0.95,-0.16),0.13),0.08);
  d=min(d,sdRoundBox(p-vec3(0.05,0.07,0.0),vec3(0.62,0.07,0.34),0.01));
  return d;
}
float statue(vec3 p, float c){
  float b=sdRoundBox(p-vec3(0.0,2.07,0.0),vec3(0.85,2.05,0.38),0.02);
  if(b>0.4 || c<0.005) return b;
  return mix(b,fig(p),c);
}
float man(vec3 p){
  float d=sdCapsule(vec3(abs(p.x)-0.09,p.y,p.z),vec3(0.0,0.08,0.0),vec3(0.0,0.62,0.0),0.075);
  d=smin(d,sdCapsule(p,vec3(0.0,0.62,0.0),vec3(0.0,1.0,0.0),0.14),0.05);
  return min(d,sdSphere(p-vec3(0.0,1.22,0.0),0.12));
}
float pointTool(vec3 p){
  float d=taper(p,-0.8,0.35,0.08,0.08);
  d=min(d,taper(p,0.35,0.9,0.08,0.006));
  return min(d,taper(p,-0.9,-0.8,0.105,0.105));
}
vec2 map(vec3 p){
  vec2 res=vec2(p.y,0.0);
  if(u_site<0.5){
    res=opU(res,vec2(sdRoundBox(p-vec3(0.0,1.5,-3.2),vec3(14.0,1.5,0.25),0.02),2.0));
    res=opU(res,vec2(sdSphere(p-vec3(-5.0,2.0,-20.0),6.0),6.0));
    if(u_lie>0.5){
      res=opU(res,vec2(sdRoundBox(p-vec3(0.0,0.52,0.0),vec3(2.05,0.38,0.85),0.02),1.0));
      res=opU(res,vec2(sdRoundBox(vec3(abs(p.x)-1.2,p.y-0.06,p.z),vec3(0.12,0.06,0.95),0.01),3.0));
    } else {
      res=opU(res,vec2(statue(p,u_carve),1.0));
    }
    if(u_men>0.5) res=opU(res,vec2(man(p-vec3(u_manx,0.0,0.55)),5.0));
    if(u_men>1.5) res=opU(res,vec2(man(p-vec3(u_manx+0.75,0.0,0.05)),5.0));
    if(u_tap>0.5){
      float sw=abs(sin(u_time*9.0));
      vec3 tp=p-vec3(u_manx-0.36,u_taph,0.5); tp.x=-tp.x; tp/=0.36;
      res=opU(res,vec2(pointTool(tp)*0.36,4.0));
      float cx=u_manx+0.04+0.14*sw;
      res=opU(res,vec2(sdCapsule(p,vec3(cx,u_taph,0.5),vec3(cx+0.14,u_taph,0.5),0.1),3.0));
    }
  } else if(u_site<1.5){
    res=opU(res,vec2(sdRoundBox(p-vec3(0.0,1.3,2.2),vec3(1.3,1.3,2.8),0.02),9.0));
    res=opU(res,vec2(sdCylinder(p-vec3(0.0,2.0,-1.8),2.0,1.95),9.0));
    res=opU(res,vec2(sdEllipsoid(p-vec3(0.0,4.0,-1.8),vec3(1.9,2.5,1.9)),6.0));
    res=opU(res,vec2(sdCylinder(p-vec3(0.0,6.75,-1.8),0.35,0.2),9.0));
    res=opU(res,vec2(sdSphere(p-vec3(0.0,7.2,-1.8),0.16),9.0));
    res=opU(res,vec2(sdRoundBox(p-vec3(2.4,3.4,4.2),vec3(0.55,3.4,0.55),0.02),9.0));
  } else if(u_site<2.5){
    float r=length(p.xz-vec2(0.0,-11.0));
    res=opU(res,vec2((p.y-(9.0-r))*0.7,8.0));
    for(int k=0;k<4;k++){ float f=float(k);
      res=opU(res,vec2(sdRoundBox(p-vec3(0.0,0.45+0.9*f,-4.6-1.0*f),vec3(3.6-0.55*f,0.45,1.6),0.02),9.0)); }
    res=opU(res,vec2(sdRoundBox(p-vec3(0.3,0.4,-2.7+2.6*u_slide),vec3(0.85,0.38,2.05),0.02),1.0));
  } else if(u_site<3.5){
    res=vec2(p.y+0.1,0.0);
    if(u_tool<1.5){
      res=opU(res,vec2(pointTool(p),4.0));
      vec3 q=p-vec3(0.35,0.14,-0.85);
      res=opU(res,vec2(sdCylinder(vec3(q.x,q.z,q.y),0.24,0.23),3.0));
      res=opU(res,vec2(sdCapsule(p,vec3(0.35,0.14,-0.85),vec3(-0.85,0.0,-0.85),0.055),3.0));
    } else if(u_tool<2.5){
      float d=taper(p,-0.9,0.25,0.075,0.075);
      float bl=sdRoundBox(p-vec3(0.5,0.0,0.0),vec3(0.3,0.022,0.17),0.008);
      float nt=max(abs(mod(p.z+0.045,0.09)-0.045)-0.018,0.68-p.x);
      res=opU(res,vec2(min(d,max(bl,-nt)),4.0));
    } else {
      res=opU(res,vec2(sdRoundBox(p-vec3(0.2,-0.03,0.0),vec3(0.75,0.035,0.12),0.01),4.0));
      res=opU(res,vec2(sdCapsule(p,vec3(-0.6,-0.02,0.0),vec3(-1.1,-0.02,0.0),0.075),3.0));
    }
  } else if(u_site<4.5){
    res=opU(res,vec2(max(3.6-abs(p.z),p.y-5.8),2.0));
    vec3 gp=p-vec3(u_mx,0.0,0.0);
    float lx=mod(p.x+0.3,0.6)-0.3;
    res=opU(res,vec2(max(length(vec2(lx,p.y-0.12))-0.11,max(abs(p.z)-1.0,abs(gp.x)-2.4)),7.0));
    res=opU(res,vec2(sdRoundBox(gp-vec3(0.0,0.3,0.0),vec3(1.5,0.07,0.75),0.01),3.0));
    float fr=sdRoundBox(vec3(abs(gp.x)-1.15,gp.y-2.7,abs(gp.z)-0.6),vec3(0.07,2.35,0.07),0.01);
    fr=min(fr,sdRoundBox(vec3(gp.x,abs(gp.y-3.8)-1.2,abs(gp.z)-0.6),vec3(1.25,0.07,0.07),0.01));
    fr=min(fr,sdRoundBox(vec3(abs(gp.x)-1.15,gp.y-5.0,gp.z),vec3(0.07,0.07,0.65),0.01));
    res=opU(res,vec2(fr,3.0));
    res=opU(res,vec2(statue(gp-vec3(0.0,0.5,0.0),1.0),1.0));
    res=opU(res,vec2(sdCapsule(vec3(abs(gp.x),gp.y,gp.z),vec3(0.5,3.5,0.0),vec3(1.1,5.0,0.0),0.025),7.0));
    vec3 mp=vec3(abs(gp.x)-2.3,p.y,abs(p.z)-0.95);
    float k=clamp(floor(mp.x/0.8+0.5),0.0,4.0); mp.x-=0.8*k;
    float md=man(mp);
    md=min(md,man(vec3(mp.x-0.4,p.y,p.z)));
    res=opU(res,vec2(md,5.0));
  } else {
    float pz=sdRoundBox(p-vec3(0.5,3.0,-6.0),vec3(4.5,3.0,1.5),0.02);
    pz=min(pz,sdRoundBox(p-vec3(0.5,6.3,-6.0),vec3(4.7,0.45,1.7),0.02));
    pz=min(pz,sdRoundBox(p-vec3(-0.8,9.0,-6.0),vec3(0.75,3.0,0.75),0.02));
    pz=min(pz,sdRoundBox(p-vec3(-0.8,12.3,-6.0),vec3(0.95,0.4,0.95),0.02));
    res=opU(res,vec2(pz,2.0));
    res=opU(res,vec2(sdRoundBox(p-vec3(0.0,0.45,0.0),vec3(0.8,0.45,0.55),0.02),9.0));
    res=opU(res,vec2(statue(p-vec3(0.0,0.9,0.0),1.0),1.0));
    vec3 mp=vec3(abs(p.x)-1.9,p.y,p.z-1.3);
    float k=clamp(floor(mp.x/0.7+0.5),0.0,2.0); mp.x-=0.7*k;
    res=opU(res,vec2(man(mp),5.0));
  }
  return res;
}
vec3 skyCol(vec3 rd){
  vec3 top=lin(vec3(0.24,0.52,0.86)), hor=lin(vec3(0.66,0.82,0.95));
  vec3 c=mix(hor,top,pow(clamp(rd.y,0.0,1.0),0.6));
  vec2 cp=rd.xz/max(rd.y,0.05)*1.2+vec2(u_time*0.02,0.0);
  float cl=smoothstep(0.55,0.8,noise2(cp*1.3)*0.65+noise2(cp*3.1)*0.35)*smoothstep(0.02,0.15,rd.y);
  c=mix(c,vec3(1.0),cl*0.9);
  if(rd.y<0.0) return lin(vec3(0.62,0.70,0.62));
  float ang=atan(rd.x,rd.z);
  float hill=0.015+0.02*noise2(vec2(ang*3.0,5.0));
  if(rd.y<hill) c=mix(c,lin(vec3(0.42,0.56,0.40)),0.85);
  return c;
}
vec4 pixel(vec2 uv){
  vec2 p=screenP(uv,0.0);
  vec3 ta=vec3(u_tx,u_ty,u_tz);
  vec3 ro=ta+vec3(sin(u_ang)*u_dist,u_h,cos(u_ang)*u_dist);
  vec3 rd=camRay(p,ro,ta,u_lens);
  vec3 sky=skyCol(rd);
  vec3 hazeC=lin(vec3(0.66,0.76,0.74));
  vec3 m=march(ro,rd,70.0,0.0);
  vec3 col;
  if(m.x>0.0){
    vec3 pos=ro+rd*m.x, n=calcNormal(pos);
    float id=m.y; vec3 alb; float gloss=0.1;
    if(id<0.5){
      if(u_site>1.5 && u_site<2.5){
        float g=noise2(pos.xz*1.7)*0.6+noise2(pos.xz*9.0)*0.4;
        alb=mix(lin(vec3(0.80,0.79,0.74)),lin(vec3(0.62,0.66,0.52)),g);
      } else if(u_site>2.5 && u_site<3.5){
        float g=noise2(vec2(pos.x*1.5,pos.z*22.0));
        alb=mix(lin(vec3(0.50,0.33,0.18)),lin(vec3(0.63,0.44,0.25)),g);
        alb*=1.0-0.3*step(fract(pos.z/1.1),0.02);
      } else {
        vec2 gq=pos.xz/0.9;
        float j=max(step(fract(gq.x+0.5*floor(gq.y)),0.035),step(fract(gq.y),0.035));
        float g=hash2(floor(vec2(gq.x+0.5*floor(gq.y),gq.y)));
        alb=mix(lin(vec3(0.66,0.60,0.50)),lin(vec3(0.76,0.70,0.60)),g)*(1.0-0.3*j);
      }
    } else if(id<1.5){
      float s=0.5*noise2(pos.xz*2.3+pos.y)+0.5*noise2(pos.xy*2.9+pos.z);
      alb=mix(lin(vec3(0.88,0.86,0.82)),lin(vec3(0.97,0.96,0.93)),s);
      float v=abs(noise2(pos.xy*2.2+pos.z*1.7)-0.5);
      alb=mix(alb,lin(vec3(0.55,0.56,0.60)),smoothstep(0.035,0.0,v)*0.6*u_flaw);
      vec3 cq=pos*13.0; vec3 ci=floor(cq); vec3 cf=fract(cq)-0.5;
      float hh=hash2(ci.xy+ci.z*7.3);
      if(hh<0.16*u_flaw && length(cf)<0.3) alb=lin(vec3(0.22,0.20,0.18));
      float st=noise2(pos.xz*1.3+3.0)*0.6+noise2(pos.xy*4.0)*0.4;
      alb=mix(alb,alb*lin(vec3(0.72,0.70,0.58)),u_dirty*smoothstep(0.25,0.75,st));
      float pt=noise2(pos.xy*38.0+pos.z*31.0);
      alb*=1.0-0.42*u_pit*smoothstep(0.5,0.72,pt);
      float cl=step(0.5,fract((pos.y+0.55*pos.x+0.4*pos.z)*26.0));
      alb*=1.0-0.2*u_claw*cl;
      gloss=0.12+0.78*u_gloss;
    } else if(id<2.5){
      if(u_site<0.5){
        float course=floor(pos.y/0.3);
        float j=max(step(fract(pos.y/0.3),0.08),step(fract(pos.x/0.7+0.5*course),0.04));
        alb=mix(lin(vec3(0.70,0.52,0.36)),lin(vec3(0.80,0.63,0.45)),hash2(vec2(floor(pos.x/0.7+0.5*course),course)))*(1.0-0.3*j);
      } else if(u_site<4.5){
        float bz=floor(pos.x/5.0);
        alb=mix(lin(vec3(0.86,0.72,0.48)),lin(vec3(0.80,0.58,0.42)),hash2(vec2(bz,2.0)));
        float w=step(abs(fract(pos.x/1.25)-0.5),0.16)*step(abs(fract(pos.y/1.8)-0.6),0.22);
        alb=mix(alb,lin(vec3(0.20,0.15,0.12)),w*step(abs(n.z),2.0)*step(0.5,abs(n.z)));
        alb*=1.0-0.25*step(fract(pos.x/5.0),0.012);
      } else {
        float course=floor(pos.y/0.4);
        float j=max(step(fract(pos.y/0.4),0.07),step(fract(pos.x/0.8+0.5*course),0.04));
        alb=mix(lin(vec3(0.62,0.50,0.36)),lin(vec3(0.72,0.60,0.44)),hash2(vec2(floor(pos.x/0.8+0.5*course),course)))*(1.0-0.25*j);
        float w=step(abs(fract(pos.x/1.5)-0.5),0.13)*step(abs(pos.y-3.6)-0.0,0.5)+step(abs(fract(pos.x/1.5)-0.5),0.13)*step(abs(pos.y-1.5),0.4);
        alb=mix(alb,lin(vec3(0.16,0.12,0.10)),clamp(w,0.0,1.0)*step(0.5,n.z));
      }
    } else if(id<3.5){
      alb=mix(lin(vec3(0.50,0.33,0.18)),lin(vec3(0.66,0.47,0.27)),noise2(vec2(pos.x*3.0+pos.z*2.0,pos.y*14.0)));
    } else if(id<4.5){
      alb=lin(vec3(0.20,0.20,0.23)); gloss=0.7;
      if(u_site>2.5 && u_tool>2.5){ vec2 dq=fract(pos.xz*vec2(26.0,26.0))-0.5; alb*=1.0+1.2*step(length(dq),0.25); }
    } else if(id<5.5){
      float c2=hash2(vec2(floor(pos.x*1.25+0.5),floor(pos.z*1.3)));
      vec3 cc=c2<0.35 ? vec3(0.62,0.26,0.20) : (c2<0.6 ? vec3(0.28,0.36,0.52) : (c2<0.8 ? vec3(0.72,0.56,0.30) : vec3(0.36,0.46,0.30)));
      if(pos.y>1.08) cc=vec3(0.86,0.66,0.52);
      alb=lin(cc);
    } else if(id<6.5){
      alb=mix(lin(vec3(0.66,0.28,0.18)),lin(vec3(0.76,0.36,0.22)),noise2(pos.xy*5.0));
      vec3 dc=u_site<0.5 ? vec3(-5.0,2.0,-20.0) : vec3(0.0,4.0,-1.8);
      float a=atan(pos.z-dc.z,pos.x-dc.x);
      float rib=step(abs(fract(a*8.0/6.2832)-0.5),0.035);
      alb=mix(alb,lin(vec3(0.93,0.91,0.86)),rib);
    } else if(id<7.5){
      alb=mix(lin(vec3(0.40,0.27,0.16)),lin(vec3(0.52,0.37,0.22)),noise2(pos.xz*9.0)); gloss=0.4;
    } else if(id<8.5){
      float g=noise2(pos.xz*0.9)*0.5+noise2(pos.xz*4.0+pos.y)*0.5;
      alb=mix(lin(vec3(0.74,0.75,0.74)),lin(vec3(0.93,0.93,0.91)),g);
      alb=mix(lin(vec3(0.36,0.50,0.26)),alb,smoothstep(0.4,2.4,pos.y+g));
    } else {
      float s=noise2(pos.xz*2.3)+noise2(pos.xy*2.9);
      alb=mix(lin(vec3(0.88,0.86,0.80)),lin(vec3(0.96,0.95,0.91)),0.5*s);
      if(u_site>0.5 && u_site<1.5) alb=mix(alb,lin(vec3(0.30,0.46,0.36)),step(fract(pos.y/0.52),0.16)*0.8);
      if(u_site>1.5 && u_site<2.5) alb*=1.0-0.2*step(fract(pos.x/0.9+floor(pos.y/0.9)*0.5),0.03);
    }
    vec3 Ld=normalize(vec3(0.6,0.9,0.45));
    vec3 key=lin(vec3(1.0,0.95,0.85))*1.6;
    vec3 skyF=lin(vec3(0.55,0.72,0.95))*0.55;
    col=shade(pos,n,rd,alb,Ld,key,skyF,lin(vec3(0.55,0.55,0.4))*0.4,gloss);
    col=grade(col,hazeC,m.x,24.0,0.45,0.02);
  } else {
    col=pow(sky,vec3(0.4545));
  }
  return vec4(col,1.0);
}
