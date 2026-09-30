/* K3D: the Comics Come Alive mini 3D engine.
   WebGL2, toon shading with halftone shadows and ink outlines, particles,
   tap picking, third-person follow camera, touch joystick, HTML speech bubbles, WebXR (VR headsets).
   Classic script (works on file:// and GitHub Pages). Global: window.K3D */
(function(){
'use strict';
const K={};
const TAU=Math.PI*2;
/* ---------------- math ---------------- */
const M4={
 id(){const m=new Float32Array(16);m[0]=m[5]=m[10]=m[15]=1;return m},
 mul(a,b,o){const r=o||new Float32Array(16);
  const a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15];
  for(let i=0;i<4;i++){const b0=b[i*4],b1=b[i*4+1],b2=b[i*4+2],b3=b[i*4+3];
   r[i*4]=a00*b0+a10*b1+a20*b2+a30*b3;r[i*4+1]=a01*b0+a11*b1+a21*b2+a31*b3;r[i*4+2]=a02*b0+a12*b1+a22*b2+a32*b3;r[i*4+3]=a03*b0+a13*b1+a23*b2+a33*b3}
  return r},
 persp(fov,asp,n,f){const t=1/Math.tan(fov/2),m=new Float32Array(16);m[0]=t/asp;m[5]=t;m[10]=(f+n)/(n-f);m[11]=-1;m[14]=2*f*n/(n-f);return m},
 look(e,c,u){let zx=e[0]-c[0],zy=e[1]-c[1],zz=e[2]-c[2];let l=Math.hypot(zx,zy,zz)||1;zx/=l;zy/=l;zz/=l;
  let xx=u[1]*zz-u[2]*zy,xy=u[2]*zx-u[0]*zz,xz=u[0]*zy-u[1]*zx;l=Math.hypot(xx,xy,xz)||1;xx/=l;xy/=l;xz/=l;
  const yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx;const m=new Float32Array(16);
  m[0]=xx;m[1]=yx;m[2]=zx;m[4]=xy;m[5]=yy;m[6]=zy;m[8]=xz;m[9]=yz;m[10]=zz;
  m[12]=-(xx*e[0]+xy*e[1]+xz*e[2]);m[13]=-(yx*e[0]+yy*e[1]+yz*e[2]);m[14]=-(zx*e[0]+zy*e[1]+zz*e[2]);m[15]=1;return m},
 trs(p,r,s,o){const m=o||new Float32Array(16);const cx=Math.cos(r[0]),sx=Math.sin(r[0]),cy=Math.cos(r[1]),sy=Math.sin(r[1]),cz=Math.cos(r[2]),sz=Math.sin(r[2]);
  const r00=cy*cz+sy*sx*sz,r01=-cy*sz+sy*sx*cz,r02=sy*cx,r10=cx*sz,r11=cx*cz,r12=-sx,r20=-sy*cz+cy*sx*sz,r21=sy*sz+cy*sx*cz,r22=cy*cx;
  m[0]=r00*s[0];m[1]=r10*s[0];m[2]=r20*s[0];m[3]=0;m[4]=r01*s[1];m[5]=r11*s[1];m[6]=r21*s[1];m[7]=0;m[8]=r02*s[2];m[9]=r12*s[2];m[10]=r22*s[2];m[11]=0;m[12]=p[0];m[13]=p[1];m[14]=p[2];m[15]=1;return m},
 inv(m){const o=new Float32Array(16),a=m;
  const b00=a[0]*a[5]-a[1]*a[4],b01=a[0]*a[6]-a[2]*a[4],b02=a[0]*a[7]-a[3]*a[4],b03=a[1]*a[6]-a[2]*a[5],b04=a[1]*a[7]-a[3]*a[5],b05=a[2]*a[7]-a[3]*a[6],
  b06=a[8]*a[13]-a[9]*a[12],b07=a[8]*a[14]-a[10]*a[12],b08=a[8]*a[15]-a[11]*a[12],b09=a[9]*a[14]-a[10]*a[13],b10=a[9]*a[15]-a[11]*a[13],b11=a[10]*a[15]-a[11]*a[14];
  let d=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(!d)return M4.id();d=1/d;
  o[0]=(a[5]*b11-a[6]*b10+a[7]*b09)*d;o[1]=(a[2]*b10-a[1]*b11-a[3]*b09)*d;o[2]=(a[13]*b05-a[14]*b04+a[15]*b03)*d;o[3]=(a[10]*b04-a[9]*b05-a[11]*b03)*d;
  o[4]=(a[6]*b08-a[4]*b11-a[7]*b07)*d;o[5]=(a[0]*b11-a[2]*b08+a[3]*b07)*d;o[6]=(a[14]*b02-a[12]*b05-a[15]*b01)*d;o[7]=(a[8]*b05-a[10]*b02+a[11]*b01)*d;
  o[8]=(a[4]*b10-a[5]*b08+a[7]*b06)*d;o[9]=(a[1]*b08-a[0]*b10-a[3]*b06)*d;o[10]=(a[12]*b04-a[13]*b02+a[15]*b00)*d;o[11]=(a[9]*b02-a[8]*b04-a[11]*b00)*d;
  o[12]=(a[5]*b07-a[4]*b09-a[6]*b06)*d;o[13]=(a[0]*b09-a[1]*b07+a[2]*b06)*d;o[14]=(a[13]*b01-a[12]*b03-a[14]*b00)*d;o[15]=(a[8]*b03-a[9]*b01+a[10]*b00)*d;return o},
 xf(m,v){const x=v[0],y=v[1],z=v[2],w=v[3]===undefined?1:v[3];return[m[0]*x+m[4]*y+m[8]*z+m[12]*w,m[1]*x+m[5]*y+m[9]*z+m[13]*w,m[2]*x+m[6]*y+m[10]*z+m[14]*w,m[3]*x+m[7]*y+m[11]*z+m[15]*w]}
};
K.M4=M4;
K.hex=h=>{if(Array.isArray(h))return h;h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]};
K.lerp=(a,b,t)=>a+(b-a)*t;K.clamp=(v,a,b)=>v<a?a:v>b?b:v;K.rand=(a,b)=>a+Math.random()*(b-a);

/* ---------------- geometry ---------------- */
function G(pos,nor,uv,idx){return{pos:new Float32Array(pos),nor:new Float32Array(nor),uv:new Float32Array(uv),idx:new Uint16Array(idx)}}
const GEO={
 box(w=1,h=1,d=1){const x=w/2,y=h/2,z=d/2,P=[],N=[],U=[],I=[];
  const f=(a,b,c,d2,n)=>{const o=P.length/3;[a,b,c,d2].forEach(v=>{P.push(...v);N.push(...n)});U.push(0,0,1,0,1,1,0,1);I.push(o,o+1,o+2,o,o+2,o+3)};
  f([-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z],[0,0,1]);f([x,-y,-z],[-x,-y,-z],[-x,y,-z],[x,y,-z],[0,0,-1]);
  f([x,-y,z],[x,-y,-z],[x,y,-z],[x,y,z],[1,0,0]);f([-x,-y,-z],[-x,-y,z],[-x,y,z],[-x,y,-z],[-1,0,0]);
  f([-x,y,z],[x,y,z],[x,y,-z],[-x,y,-z],[0,1,0]);f([-x,-y,-z],[x,-y,-z],[x,-y,z],[-x,-y,z],[0,-1,0]);return G(P,N,U,I)},
 sphere(r=.5,seg=18,ring=12){const P=[],N=[],U=[],I=[];for(let j=0;j<=ring;j++){const v=j/ring,th=v*Math.PI;for(let i=0;i<=seg;i++){const u=i/seg,ph=(u-.5)*TAU;
  const nx=Math.sin(th)*Math.sin(ph),ny=Math.cos(th),nz=Math.sin(th)*Math.cos(ph);P.push(nx*r,ny*r,nz*r);N.push(nx,ny,nz);U.push(u,1-v)}}
  for(let j=0;j<ring;j++)for(let i=0;i<seg;i++){const a=j*(seg+1)+i,b=a+seg+1;I.push(a,b,a+1,b,b+1,a+1)}return G(P,N,U,I)},
 cyl(rt=.5,rb=.5,h=1,seg=18,caps=true){const P=[],N=[],U=[],I=[],y=h/2,sl=(rb-rt)/h;
  for(let i=0;i<=seg;i++){const a=i/seg*TAU,c=Math.cos(a),s=Math.sin(a);const l=Math.hypot(1,sl);
   P.push(s*rt,y,c*rt,s*rb,-y,c*rb);N.push(s/l,sl/l,c/l,s/l,sl/l,c/l);U.push(i/seg,1,i/seg,0)}
  for(let i=0;i<seg;i++){const a=i*2;I.push(a,a+1,a+2,a+1,a+3,a+2)}
  if(caps){[[y,rt,1],[-y,rb,-1]].forEach(([yy,r,n])=>{if(r<=0)return;const o=P.length/3;P.push(0,yy,0);N.push(0,n,0);U.push(.5,.5);
   for(let i=0;i<=seg;i++){const a=i/seg*TAU;P.push(Math.sin(a)*r,yy,Math.cos(a)*r);N.push(0,n,0);U.push(.5+Math.sin(a)*.5,.5+Math.cos(a)*.5)}
   for(let i=0;i<seg;i++)n>0?I.push(o,o+1+i,o+2+i):I.push(o,o+2+i,o+1+i)})}
  return G(P,N,U,I)},
 plane(w=1,d=1){const x=w/2,z=d/2;return G([-x,0,z,x,0,z,x,0,-z,-x,0,-z],[0,1,0,0,1,0,0,1,0,0,1,0],[0,0,1,0,1,1,0,1],[0,1,2,0,2,3])},
 quad(w=1,h=1){const x=w/2,y=h/2;return G([-x,-y,0,x,-y,0,x,y,0,-x,y,0],[0,0,1,0,0,1,0,0,1,0,0,1],[0,0,1,0,1,1,0,1],[0,1,2,0,2,3])},
 torus(R=.5,r=.15,seg=24,tube=10){const P=[],N=[],U=[],I=[];for(let j=0;j<=tube;j++){const v=j/tube*TAU;for(let i=0;i<=seg;i++){const u=i/seg*TAU;
  const cx=Math.cos(u),sx=Math.sin(u),cv=Math.cos(v),sv=Math.sin(v);P.push((R+r*cv)*cx,r*sv,(R+r*cv)*sx);N.push(cv*cx,sv,cv*sx);U.push(i/seg,j/tube)}}
  for(let j=0;j<tube;j++)for(let i=0;i<seg;i++){const a=j*(seg+1)+i,b=a+seg+1;I.push(a,b,a+1,b,b+1,a+1)}return G(P,N,U,I)},
 prism(pts,d=.2){/* star-shaped 2D outline (x,y) extruded along z, fan from centroid */
  let ar=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];ar+=a[0]*b[1]-b[0]*a[1]}if(ar<0)pts=pts.slice().reverse();
  const P=[],N=[],U=[],I=[],n=pts.length;let cx=0,cy=0;pts.forEach(p=>{cx+=p[0];cy+=p[1]});cx/=n;cy/=n;const z=d/2;
  [[z,1],[-z,-1]].forEach(([zz,s])=>{const o=P.length/3;P.push(cx,cy,zz);N.push(0,0,s);U.push(.5,.5);pts.forEach(p=>{P.push(p[0],p[1],zz);N.push(0,0,s);U.push(p[0],p[1])});
   for(let i=0;i<n;i++){const a=o+1+i,b=o+1+(i+1)%n;s>0?I.push(o,a,b):I.push(o,b,a)}});
  for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];let nx=b[1]-a[1],ny=-(b[0]-a[0]);const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;const o=P.length/3;
   P.push(a[0],a[1],z,b[0],b[1],z,b[0],b[1],-z,a[0],a[1],-z);for(let k=0;k<4;k++){N.push(nx,ny,0)}U.push(0,0,1,0,1,1,0,1);I.push(o,o+2,o+1,o,o+3,o+2)}
  return G(P,N,U,I)}
};
K.GEO=GEO;
K.starPts=(ro=.5,ri=.22,n=5)=>{const a=[];for(let i=0;i<n*2;i++){const r=i%2?ri:ro,t=i/(n*2)*TAU-Math.PI/2;a.push([Math.cos(t)*r,-Math.sin(t)*r])}return a};
K.heartPts=(s=.5)=>{const a=[];for(let i=0;i<40;i++){const t=i/40*TAU;a.push([16*Math.pow(Math.sin(t),3)/34*s*2,(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/34*s*2])}return a};

/* ---------------- scene graph ---------------- */
class Node{
 constructor(o={}){this.p=o.p?o.p.slice():[0,0,0];this.r=o.r?o.r.slice():[0,0,0];this.s=o.s!==undefined?(typeof o.s==='number'?[o.s,o.s,o.s]:o.s.slice()):[1,1,1];
  this.kids=[];this.parent=null;this.geo=o.geo||null;this.col=K.hex(o.col||'#ffffff');this.mode=o.mode||0;this.outline=o.outline===undefined?1:o.outline;
  this.alpha=o.alpha===undefined?1:o.alpha;this.tex=o.tex||null;this.emis=o.emis||0;this.visible=o.visible===undefined?true:o.visible;this.ds=!!o.ds;
  this.m=M4.id();this.name=o.name||'';this.tap=o.tap||null;this.pickR=o.pickR||0;this.blob=o.blob||0;this.bill=!!o.bill;this.noSkip=!!o.noSkip;this.billOff=o.billOff||0}
 add(...n){n.forEach(c=>{if(!c)return;if(c.parent)c.parent.remove(c);c.parent=this;this.kids.push(c)});return this}
 remove(c){const i=this.kids.indexOf(c);if(i>=0)this.kids.splice(i,1);c.parent=null;return this}
 wpos(){return[this.m[12],this.m[13],this.m[14]]}
 find(name){if(this.name===name)return this;for(const k of this.kids){const f=k.find(name);if(f)return f}return null}
 each(fn){fn(this);this.kids.forEach(k=>k.each(fn))}
}
K.Node=Node;
K.group=(o={})=>new Node(o);
K.mesh=(type,args,col,o={})=>{o.col=col;o.geo={type,args:args||[]};if(type==='prism'&&o.ds===undefined)o.ds=true;return new Node(o)};

/* ---------------- world ---------------- */
const VS=`#version 300 es
layout(location=0) in vec3 aP;layout(location=1) in vec3 aN;layout(location=2) in vec2 aU;
uniform mat4 uVP,uM;uniform float uOut;out vec3 vN;out vec3 vW;out vec2 vU;
void main(){vec3 n=normalize(mat3(uM)*aN);vec4 w=uM*vec4(aP,1.);w.xyz+=n*uOut;vW=w.xyz;vN=n;vU=aU;gl_Position=uVP*w;}`;
const FS=`#version 300 es
precision highp float;in vec3 vN;in vec3 vW;in vec2 vU;
uniform vec3 uCol,uL,uEye,uFogC,uAmb,uSpP,uSpD;uniform float uMode,uAlpha,uEmis,uUseTex,uDot,uTime,uSpot,uDark;uniform vec2 uFog;uniform sampler2D uTex;out vec4 o;
void main(){
 if(uMode>1.5){o=vec4(.04,.03,.06,uAlpha);return;}
 vec4 b=vec4(uCol,1.);if(uUseTex>.5){b=texture(uTex,vU)*vec4(uCol,1.);}
 if(b.a<.04)discard;vec3 c=b.rgb;
 if(uMode<.5){vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec3 L=normalize(uL);float d=dot(N,L);
  float band=d>.5?1.:(d>0.?.82:.62);band=mix(band,1.,uEmis);c*=band*uAmb;
  if(d<=0.&&uEmis<.5){vec2 g=mod(gl_FragCoord.xy,uDot)-uDot*.5;if(length(g)<uDot*.22)c*=.8;}
  vec3 V=normalize(uEye-vW);float rim=pow(1.-max(dot(N,V),0.),3.);c+=rim*.14*(1.-uEmis);
  float sp=pow(max(dot(reflect(-L,N),V),0.),48.);if(sp>.55)c+=.22*(1.-uEmis);}
 if(uSpot>0.){vec3 sd=vW-uSpP;float sl=length(sd);float cone=smoothstep(uSpot,uSpot+.08,dot(sd/sl,normalize(uSpD)));float att=clamp(1.-sl/16.,0.,1.);c*=mix(uDark,1.25,cone*att*(1.-uEmis*.0))+uEmis*.6*(1.-cone);}
 float dist=length(uEye-vW);float f=clamp((dist-uFog.x)/(uFog.y-uFog.x),0.,1.);c=mix(c,uFogC,f*f);
 o=vec4(c,b.a*uAlpha);}`;
const SKYV=`#version 300 es
const vec2 P[3]=vec2[3](vec2(-1,-1),vec2(3,-1),vec2(-1,3));out vec2 vP;void main(){vP=P[gl_VertexID];gl_Position=vec4(vP,0.9999,1.);}`;
const SKYF=`#version 300 es
precision highp float;in vec2 vP;uniform vec3 uTop,uBot,uCam;uniform mat4 uIVP;uniform float uStars,uTime;out vec4 o;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec4 w=uIVP*vec4(vP,1.,1.);vec3 d=normalize(w.xyz/w.w-uCam);float t=clamp(d.y*1.4+.25,0.,1.);vec3 c=mix(uBot,uTop,t);
 if(uStars>0.){vec2 g=floor(vec2(atan(d.z,d.x)*180.,d.y*300.));float s=h(g);if(s>.997&&d.y>0.)c+=uStars*(.6+.4*sin(uTime*2.+s*50.));}
 o=vec4(c,1.);}`;
const PV=`#version 300 es
layout(location=0) in vec3 aP;layout(location=1) in vec4 aC;layout(location=2) in float aS;uniform mat4 uVP;uniform float uH;out vec4 vC;
void main(){vec4 p=uVP*vec4(aP,1.);gl_Position=p;gl_PointSize=aS*uH/max(p.w,.1);vC=aC;}`;
const PF=`#version 300 es
precision mediump float;in vec4 vC;out vec4 o;void main(){vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5)discard;o=vec4(vC.rgb,vC.a*smoothstep(.5,.3,d));}`;

function prog(gl,v,f){const mk=(t,s)=>{const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));return sh};
 const p=gl.createProgram();gl.attachShader(p,mk(gl.VERTEX_SHADER,v));gl.attachShader(p,mk(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));const u={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);
 for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);u[a.name]=gl.getUniformLocation(p,a.name)}return{p,u}}

class World{
 constructor(host,o={}){
  this.host=host;host.classList.add('k3d');this.o=o;
  this.cv=document.createElement('canvas');this.cv.className='k3d-cv';host.appendChild(this.cv);
  this.ui=document.createElement('div');this.ui.className='k3d-ui';host.appendChild(this.ui);
  this.bubLayer=document.createElement('div');this.bubLayer.className='k3d-bubs';host.appendChild(this.bubLayer);
  const gl=this.cv.getContext('webgl2',{antialias:true,alpha:false,xrCompatible:true,powerPreference:'high-performance'});
  if(!gl){host.classList.add('k3d-nogl');host.insertAdjacentHTML('beforeend','<p class="k3d-fail">This 3D world needs WebGL. Try a newer browser (Chrome, Safari, Edge or Firefox).</p>');this.ok=false;return}
  this.ok=true;this.gl=gl;
  this.P=prog(gl,VS,FS);this.S=prog(gl,SKYV,SKYF);this.PP=prog(gl,PV,PF);
  this.skyVAO=gl.createVertexArray();
  this.geoCache=new Map();this.root=new Node({name:'root'});
  this.light=o.light||[.45,.85,.35];this.amb=o.amb||[1,1,1];this.skyTop=K.hex(o.skyTop||'#6CC6F2');this.skyBot=K.hex(o.skyBot||'#E8F7FF');
  this.fogC=K.hex(o.fogC||o.skyBot||'#E8F7FF');this.fog=o.fog||[40,120];this.stars=o.stars||0;this.dot=o.dot||7;
  this.cam={yaw:o.yaw||0,pitch:o.pitch===undefined?.35:o.pitch,dist:o.dist||8,minD:o.minD||3,maxD:o.maxD||22,target:[0,1,0],fov:o.fov||55,mode:o.camMode||'follow',eye:[0,4,8],shake:0};
  this.player=null;this.speed=o.speed||4.2;this.colliders=[];this.bounds=o.bounds||60;this.entities=[];this.tapTargets=[];this.bubs=[];
  this.keys={};this.joy={x:0,y:0};this.walkTo=null;this.time=0;this.onUpdate=null;this.onTapGround=null;this.paused=false;
  this.parts=[];this.pBuf=gl.createBuffer();this.pVAO=gl.createVertexArray();
  gl.bindVertexArray(this.pVAO);gl.bindBuffer(gl.ARRAY_BUFFER,this.pBuf);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,32,0);
  gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,4,gl.FLOAT,false,32,12);gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,1,gl.FLOAT,false,32,28);gl.bindVertexArray(null);
  this.blobGeo=this.geo({type:'cyl',args:[.5,.5,.01,20,true]});
  this.dpr=Math.min(window.devicePixelRatio||1,o.maxDpr||(matchMedia('(pointer:coarse)').matches?1.6:2));
  this._resize=()=>{const r=host.getBoundingClientRect();this.W=Math.max(1,r.width);this.H=Math.max(1,r.height);this.cv.width=Math.round(this.W*this.dpr);this.cv.height=Math.round(this.H*this.dpr)};
  this._resize();new ResizeObserver(this._resize).observe(host);
  this._input();this._ui();
  this.last=performance.now();this.visible=true;
  new IntersectionObserver(es=>{this.visible=es[0].isIntersecting}).observe(host);
  const loop=t=>{if(this.xrs)return;requestAnimationFrame(loop);if(!this.visible&&!this.forceRun)return;this._frame(t)};requestAnimationFrame(loop);
 }
 geo(g){const key=g.type+':'+JSON.stringify(g.args);let v=this.geoCache.get(key);if(v)return v;const gl=this.gl;const d=GEO[g.type](...g.args);
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);const put=(i,arr,n)=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,n,gl.FLOAT,false,0,0)};
  put(0,d.pos,3);put(1,d.nor,3);put(2,d.uv,2);const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,d.idx,gl.STATIC_DRAW);gl.bindVertexArray(null);
  let r=0;for(let i=0;i<d.pos.length;i+=3)r=Math.max(r,Math.hypot(d.pos[i],d.pos[i+1],d.pos[i+2]));
  v={vao,n:d.idx.length,r};this.geoCache.set(key,v);return v}
 tex(canvas,repeat){const gl=this.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,canvas);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  const w=repeat?gl.REPEAT:gl.CLAMP_TO_EDGE;gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,w);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,w);return t}
 updateTex(t,canvas){const gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,canvas);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.generateMipmap(gl.TEXTURE_2D)}
 canvasTex(w,h,draw,repeat){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);return this.tex(c,repeat)}
 add(...n){this.root.add(...n);return n[0]}
 collide(c){this.colliders.push(c);return c}
 onTap(node,fn,r){node.tap=fn;node.pickR=r||node.pickR||1;if(!this.tapTargets.includes(node))this.tapTargets.push(node);return node}
 entity(fn){this.entities.push(fn);return fn}
 shake(a){this.cam.shake=Math.max(this.cam.shake,a||.3)}
 /* ---------- particles ---------- */
 burst(p,o={}){const n=o.n||24;for(let i=0;i<n;i++){const a=Math.random()*TAU,e=Math.random()*Math.PI*(o.up?.5:1)-(o.up?0:Math.PI/2),s=(o.speed||4)*K.rand(.4,1);
  const cols=o.cols||[o.col||'#FFD91A'];const c=K.hex(cols[i%cols.length]);
  this.parts.push({p:[p[0],p[1],p[2]],v:[Math.cos(a)*Math.cos(e)*s,Math.abs(Math.sin(e))*s*(o.up?1.2:1)+(o.lift||0),Math.sin(a)*Math.cos(e)*s],c,a:1,life:o.life||1.2,t:0,s:o.size||.25,g:o.g===undefined?6:o.g})}
  if(this.parts.length>1500)this.parts.splice(0,this.parts.length-1500)}
 rain(on,o={}){this.rainOn=on;this.rainO=o}
 /* ---------- speech bubbles (HTML over canvas) ---------- */
 say(node,text,o={}){const el=document.createElement('div');el.className='k3d-bub'+(o.cls?' '+o.cls:'');el.textContent=text;this.bubLayer.appendChild(el);
  const b={node,el,t:0,life:o.life||Math.max(2.6,text.length*.075),off:o.off===undefined?2.3:o.off};this.bubs=this.bubs.filter(x=>{if(x.node===node){x.el.remove();return false}return true});this.bubs.push(b);return b}
 /* ---------- input ---------- */
 _input(){const cv=this.cv;let drag=null,pinch=null,moved=0;const pts=new Map();
  addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select'))return;this.keys[e.key.toLowerCase()]=true;if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase())&&this._inView())e.preventDefault()});
  addEventListener('keyup',e=>{this.keys[e.key.toLowerCase()]=false});
  cv.addEventListener('pointerdown',e=>{pts.set(e.pointerId,{x:e.clientX,y:e.clientY});try{cv.setPointerCapture(e.pointerId)}catch(_){}moved=0;
   if(pts.size===1)drag={x:e.clientX,y:e.clientY,yaw:this.cam.yaw,pitch:this.cam.pitch};
   if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),dist:this.cam.dist};drag=null}});
  cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pinch&&pts.size===2){const [a,b]=[...pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);this.cam.dist=K.clamp(pinch.dist*pinch.d/Math.max(d,1),this.cam.minD,this.cam.maxD);moved=99;return}
   if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;moved=Math.max(moved,Math.hypot(dx,dy));if(moved>6){this.cam.yaw=drag.yaw-dx*.006;this.cam.pitch=K.clamp(drag.pitch+dy*.004,-.05,1.25)}}});
  const up=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(pts.size===0){if(drag&&moved<7)this._tap(e.clientX,e.clientY);drag=null}};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{if(!this.o.wheelZoom&&!document.fullscreenElement&&!e.ctrlKey&&!this.host.classList.contains('k3d-full'))return;e.preventDefault();this.cam.dist=K.clamp(this.cam.dist*(e.deltaY>0?1.1:.9),this.cam.minD,this.cam.maxD)},{passive:false});
 }
 _inView(){const r=this.host.getBoundingClientRect();return r.top<innerHeight*.6&&r.bottom>innerHeight*.4}
 ray(cx,cy){const r=this.cv.getBoundingClientRect();const x=(cx-r.left)/r.width*2-1,y=-((cy-r.top)/r.height*2-1);const iv=M4.inv(this.vp);
  const a=M4.xf(iv,[x,y,-1,1]),b=M4.xf(iv,[x,y,1,1]);const o=[a[0]/a[3],a[1]/a[3],a[2]/a[3]],f=[b[0]/b[3],b[1]/b[3],b[2]/b[3]];let d=[f[0]-o[0],f[1]-o[1],f[2]-o[2]];const l=Math.hypot(...d);d=d.map(v=>v/l);return{o,d}}
 pick(o,d){let best=null,bt=1e9;for(const n of this.tapTargets){if(!n.visible||!n.tap)continue;let vis=true;for(let p=n.parent;p;p=p.parent)if(!p.visible)vis=false;if(!vis)continue;
   const c=n.wpos();const oc=[o[0]-c[0],o[1]-c[1],o[2]-c[2]];const b=oc[0]*d[0]+oc[1]*d[1]+oc[2]*d[2];const cc=oc[0]**2+oc[1]**2+oc[2]**2-n.pickR*n.pickR;const h=b*b-cc;
   if(h<0)continue;const t=-b-Math.sqrt(h);if(t>0&&t<bt){bt=t;best=n}}return best}
 _tap(cx,cy){if(!this.vp)return;const {o,d}=this.ray(cx,cy);const n=this.pick(o,d);if(n){n.tap(n);return}
  if(d[1]<-.01){const t=-o[1]/d[1];const g=[o[0]+d[0]*t,0,o[2]+d[2]*t];if(this.onTapGround&&this.onTapGround(g)===false)return;if(this.player&&this.o.tapWalk!==false){this.walkTo=g;this.burst([g[0],.05,g[2]],{n:10,col:'#FFFFFF',speed:1.5,g:0,life:.5,size:.18})}}}
 _ui(){const ui=this.ui;
  if(this.o.joystick!==false){const j=document.createElement('div');j.className='k3d-joy';j.innerHTML='<i></i>';ui.appendChild(j);const knob=j.firstChild;let id=null,c=null;
   j.addEventListener('pointerdown',e=>{id=e.pointerId;const r=j.getBoundingClientRect();c={x:r.left+r.width/2,y:r.top+r.height/2,R:r.width/2};j.setPointerCapture(id);mv(e);e.stopPropagation()});
   const mv=e=>{if(e.pointerId!==id)return;let dx=(e.clientX-c.x)/c.R,dy=(e.clientY-c.y)/c.R;const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}this.joy={x:dx,y:dy};knob.style.transform=`translate(${dx*60}%,${dy*60}%)`};
   j.addEventListener('pointermove',mv);const end=e=>{if(e.pointerId!==id)return;id=null;this.joy={x:0,y:0};knob.style.transform=''};j.addEventListener('pointerup',end);j.addEventListener('pointercancel',end)}
  const bar=document.createElement('div');bar.className='k3d-bar';ui.appendChild(bar);this.bar=bar;
  this.button('⛶','Full screen',()=>{const on=!this.host.classList.contains('k3d-full');this.host.classList.toggle('k3d-full',on);document.documentElement.classList.toggle('k3d-lock',on);
   if(on&&this.host.requestFullscreen)this.host.requestFullscreen().catch(()=>{});if(!on&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});setTimeout(this._resize,60)});
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&this.host.classList.contains('k3d-full')){this.host.classList.remove('k3d-full');document.documentElement.classList.remove('k3d-lock');setTimeout(this._resize,60)}});
  this.button('＋','Zoom in',()=>{this.cam.dist=K.clamp(this.cam.dist*.8,this.cam.minD,this.cam.maxD)});
  this.button('－','Zoom out',()=>{this.cam.dist=K.clamp(this.cam.dist*1.25,this.cam.minD,this.cam.maxD)});
  if(navigator.xr&&navigator.xr.isSessionSupported){navigator.xr.isSessionSupported('immersive-vr').then(ok=>{if(ok)this.button('VR','Enter VR headset mode',()=>this.enterVR(),'k3d-vrbtn')}).catch(()=>{})}
 }
 button(label,title,fn,cls){const b=document.createElement('button');b.type='button';b.className='k3d-btn'+(cls?' '+cls:'');b.textContent=label;b.title=title;b.setAttribute('aria-label',title);b.addEventListener('click',e=>{e.stopPropagation();fn(b)});this.bar.appendChild(b);return b}
 /* ---------- WebXR ---------- */
 async enterVR(){const gl=this.gl;try{const s=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor']});this.xrs=s;await gl.makeXRCompatible();
   s.updateRenderState({baseLayer:new XRWebGLLayer(s,gl)});let ref;try{ref=await s.requestReferenceSpace('local-floor')}catch(_){ref=await s.requestReferenceSpace('local')}this.xrRef=ref;
   s.addEventListener('select',ev=>{const pose=ev.frame.getPose(ev.inputSource.targetRaySpace,ref);if(!pose)return;const m=this._rigInv(),mm=pose.transform.matrix;
    const o=M4.xf(M4.inv(m),[mm[12],mm[13],mm[14],1]);const dd=M4.xf(M4.inv(m),[-mm[8],-mm[9],-mm[10],0]);const l=Math.hypot(dd[0],dd[1],dd[2]);const d=[dd[0]/l,dd[1]/l,dd[2]/l];
    const n=this.pick([o[0],o[1],o[2]],d);if(n)n.tap(n);else if(d[1]<-.01&&this.player){const t=-o[1]/d[1];this.walkTo=[o[0]+d[0]*t,0,o[2]+d[2]*t]}});
   s.addEventListener('end',()=>{this.xrs=null;const loop=t=>{if(this.xrs)return;requestAnimationFrame(loop);if(!this.visible&&!this.forceRun)return;this._frame(t)};requestAnimationFrame(loop)});
   const xl=(t,fr)=>{if(!this.xrs)return;s.requestAnimationFrame(xl);this._xrFrame(t,fr)};s.requestAnimationFrame(xl);
  }catch(e){alert('VR mode could not start on this device.')}}
 _rigInv(){const p=this.player?this.player.root.p:[0,0,0];const y=this.cam.yaw;const c=Math.cos(y),s=Math.sin(y);
  const R=new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]);R[12]=-(c*p[0]+s*p[2]);R[13]=0;R[14]=-(-s*p[0]+c*p[2]);return R}
 _xrFrame(t,fr){const gl=this.gl,s=this.xrs;const pose=fr.getViewerPose(this.xrRef);const dt=Math.max(0,Math.min(.05,(t-this.last)/1000||.016));this.last=t;
  for(const src of s.inputSources){const gp=src.gamepad;if(gp&&gp.axes.length>=4){const ax=gp.axes[2],ay=gp.axes[3];if(src.handedness==='left'||s.inputSources.length===1){this.joy={x:Math.abs(ax)>.15?ax:0,y:Math.abs(ay)>.15?ay:0}}else if(Math.abs(ax)>.6){if(!this._snap){this.cam.yaw-=Math.sign(ax)*Math.PI/6;this._snap=true}}else this._snap=false}}
  this._update(dt,true);if(!pose)return;const L=s.renderState.baseLayer;gl.bindFramebuffer(gl.FRAMEBUFFER,L.framebuffer);gl.clearColor(...this.skyBot,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const rig=this._rigInv();if(this.player)this.player.root.visible=false;
  for(const v of pose.views){const vp=L.getViewport(v);gl.viewport(vp.x,vp.y,vp.width,vp.height);const view=M4.mul(v.transform.inverse.matrix,rig);const inv=M4.inv(view);
   this._draw(M4.mul(v.projectionMatrix,view),[inv[12],inv[13],inv[14]],vp.height)}
  if(this.player)this.player.root.visible=true}
 /* ---------- frame ---------- */
 _update(dt,vr){this.time+=dt;const T=this.time;
  const pl=this.player;
  if(pl&&!this.paused){let ix=0,iz=0;const k=this.keys;if(k['w']||k['arrowup'])iz-=1;if(k['s']||k['arrowdown'])iz+=1;if(k['a']||k['arrowleft'])ix-=1;if(k['d']||k['arrowright'])ix+=1;
   ix+=this.joy.x;iz+=this.joy.y;let mvx=0,mvz=0;const l=Math.hypot(ix,iz);
   if(l>.08){this.walkTo=null;const c=Math.cos(this.cam.yaw),s=Math.sin(this.cam.yaw);const nx=ix/Math.max(l,1),nz=iz/Math.max(l,1);mvx=nx*c+nz*s;mvz=-nx*s+nz*c}
   else if(this.walkTo){const dx=this.walkTo[0]-pl.root.p[0],dz=this.walkTo[2]-pl.root.p[2];const d=Math.hypot(dx,dz);if(d<.25)this.walkTo=null;else{mvx=dx/d;mvz=dz/d}}
   const m=Math.hypot(mvx,mvz);const sp=this.speed*(k['shift']?1.6:1)*(pl.speedMul||1);
   if(m>.01){const nx=pl.root.p[0]+mvx*sp*dt,nz=pl.root.p[2]+mvz*sp*dt;const res=this.resolve(nx,nz,pl.rad||.45);pl.root.p[0]=res[0];pl.root.p[2]=res[1];
    const want=Math.atan2(mvx,mvz);let dr=want-pl.root.r[1];dr=Math.atan2(Math.sin(dr),Math.cos(dr));pl.root.r[1]+=dr*Math.min(1,dt*12);pl.moving=Math.min(1,m)}else pl.moving=0}
  for(const e of this.entities)e(dt,T);
  if(this.onUpdate)this.onUpdate(dt,T);
  // particles
  if(this.rainOn&&this.player){const o=this.rainO||{};for(let i=0;i<(o.rate||6);i++){const p=this.player.root.p;this.parts.push({p:[p[0]+K.rand(-14,14),K.rand(8,12),p[2]+K.rand(-14,14)],v:[0,-16,0],c:K.hex(o.col||'#9FD8F5'),a:.7,life:.9,t:0,s:.09,g:0})}}
  for(let i=this.parts.length-1;i>=0;i--){const q=this.parts[i];q.t+=dt;if(q.t>q.life||q.p[1]<-.2){this.parts.splice(i,1);continue}q.v[1]-=q.g*dt;q.p[0]+=q.v[0]*dt;q.p[1]+=q.v[1]*dt;q.p[2]+=q.v[2]*dt}
  // camera
  const c=this.cam;if(pl&&c.mode==='follow'){const p=pl.root.p;c.target=[K.lerp(c.target[0],p[0],Math.min(1,dt*6)),K.lerp(c.target[1],p[1]+(pl.eye||1.4),Math.min(1,dt*6)),K.lerp(c.target[2],p[2],Math.min(1,dt*6))]}
  const cp=Math.cos(c.pitch);c.eye=[c.target[0]+Math.sin(c.yaw)*cp*c.dist,c.target[1]+Math.sin(c.pitch)*c.dist,c.target[2]+Math.cos(c.yaw)*cp*c.dist];
  if(!vr&&this.o.camCollide!==false){const tx=c.target[0],tz=c.target[2],dx=c.eye[0]-tx,dz=c.eye[2]-tz,L=Math.hypot(dx,dz);if(L>.01){let best=1;for(const k of this.colliders){if(k.off||k.r===undefined||k.cam===false||(k.cam!==true&&k.r<1))continue;const fx=tx-k.x,fz=tz-k.z;const a=dx*dx+dz*dz,b=2*(fx*dx+fz*dz),cc=fx*fx+fz*fz-(k.r+.3)*(k.r+.3);const h=b*b-4*a*cc;if(h<0||cc<0)continue;const t=(-b-Math.sqrt(h))/(2*a);if(t>0&&t<best)best=t}
   if(best<1){const s=Math.max(.25,best-.05);c.eye=[tx+dx*s,c.target[1]+(c.eye[1]-c.target[1])*Math.max(s,.6),tz+dz*s]}}}
  if(c.eye[1]<.4)c.eye[1]=.4;
  if(c.shake>0){c.shake=Math.max(0,c.shake-dt);const a=c.shake*.35;c.eye=c.eye.map(v=>v+K.rand(-a,a))}
 }
 resolve(x,z,r){for(const c of this.colliders){if(c.off)continue;if(c.r!==undefined){const dx=x-c.x,dz=z-c.z,d=Math.hypot(dx,dz),m=c.r+r;if(d<m&&d>1e-4){x=c.x+dx/d*m;z=c.z+dz/d*m}}
   else{const nx=K.clamp(x,c.x0,c.x1),nz=K.clamp(z,c.z0,c.z1);const dx=x-nx,dz=z-nz,d=Math.hypot(dx,dz);if(d<r){if(d>1e-4){x=nx+dx/d*r;z=nz+dz/d*r}else{const L=[x-c.x0,c.x1-x,z-c.z0,c.z1-z];const mi=L.indexOf(Math.min(...L));if(mi===0)x=c.x0-r;else if(mi===1)x=c.x1+r;else if(mi===2)z=c.z0-r;else z=c.z1+r}}}}
  const d=Math.hypot(x,z);if(d>this.bounds){x*=this.bounds/d;z*=this.bounds/d}return[x,z]}
 _frame(t){const dt=Math.max(0,Math.min(.05,(t-this.last)/1000||.016));this.last=t;this._update(dt);
  const gl=this.gl;gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,this.cv.width,this.cv.height);
  const proj=M4.persp(this.cam.fov*Math.PI/180,this.W/this.H,.1,400);const view=M4.look(this.cam.eye,this.cam.target,[0,1,0]);this.vp=M4.mul(proj,view);
  gl.clearColor(...this.skyBot,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);this._draw(this.vp,this.cam.eye,this.cv.height);this._bubbles(dt)}
 _mat(n,pm){M4.trs(n.p,n.r,n.s,n.m);if(pm)M4.mul(pm,n.m,n.m);for(const k of n.kids)this._mat(k,n.m)}
 _draw(vp,eye,H){const gl=this.gl;this._mat(this.root,null);
  // sky
  const S=this.S;gl.useProgram(S.p);gl.disable(gl.DEPTH_TEST);gl.uniform3fv(S.u.uTop,this.skyTop);gl.uniform3fv(S.u.uBot,this.skyBot);gl.uniformMatrix4fv(S.u.uIVP,false,M4.inv(vp));
  gl.uniform3fv(S.u.uCam,eye);gl.uniform1f(S.u.uStars,this.stars);gl.uniform1f(S.u.uTime,this.time);gl.bindVertexArray(this.skyVAO);gl.drawArrays(gl.TRIANGLES,0,3);gl.enable(gl.DEPTH_TEST);
  const P=this.P,u=P.u;gl.useProgram(P.p);gl.uniformMatrix4fv(u.uVP,false,vp);gl.uniform3fv(u.uL,this.light);gl.uniform3fv(u.uEye,eye);gl.uniform3fv(u.uFogC,this.fogC);gl.uniform2fv(u.uFog,this.fog);
  gl.uniform3fv(u.uAmb,this.amb);const sp=this.spot;gl.uniform1f(u.uSpot,sp&&sp.on?sp.cos:0);if(sp&&sp.on){gl.uniform3fv(u.uSpP,sp.p);gl.uniform3fv(u.uSpD,sp.d);gl.uniform1f(u.uDark,sp.dark||.12)}gl.uniform1f(u.uDot,this.dot*this.dpr);gl.uniform1f(u.uTime,this.time);
  const opaque=[],trans=[],blobs=[];const walk=(n,vis)=>{if(!n.visible)return;if(n.geo){const g=this.geo(n.geo);
    const wr=g.r*Math.max(Math.abs(n.m[0])+Math.abs(n.m[1])+Math.abs(n.m[2]),Math.abs(n.m[4])+Math.abs(n.m[5])+Math.abs(n.m[6]),Math.abs(n.m[8])+Math.abs(n.m[9])+Math.abs(n.m[10]));
    if(Math.hypot(eye[0]-n.m[12],eye[1]-n.m[13],eye[2]-n.m[14])<wr*.95&&!n.noSkip){}else{const c=M4.xf(vp,[n.m[12],n.m[13],n.m[14],1]);if(c[3]>-wr&&Math.abs(c[0])<c[3]+wr*2.5&&Math.abs(c[1])<c[3]+wr*2.5)(n.alpha<1||n.tex&&n.tr?trans:opaque).push([n,g,c[3]])}}
   if(n.blob)blobs.push(n);for(const k of n.kids)walk(k)};walk(this.root);
  gl.enable(gl.CULL_FACE);gl.disable(gl.BLEND);
  for(const [n,g] of opaque){if(n.bill)this._billboard(n,eye);gl.uniformMatrix4fv(u.uM,false,n.m);gl.bindVertexArray(g.vao);
   if(n.outline&&n.mode===0){gl.cullFace(gl.FRONT);gl.uniform1f(u.uMode,2);gl.uniform1f(u.uAlpha,1);gl.uniform1f(u.uOut,.035*n.outline);gl.drawElements(gl.TRIANGLES,g.n,gl.UNSIGNED_SHORT,0)}
   gl.uniform1f(u.uOut,0);this._matU(n);if(n.ds)gl.disable(gl.CULL_FACE);else{gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK)}gl.drawElements(gl.TRIANGLES,g.n,gl.UNSIGNED_SHORT,0);gl.enable(gl.CULL_FACE)}
  // blob shadows
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-2,-2);gl.bindVertexArray(this.blobGeo.vao);
  gl.uniform1f(u.uMode,1);gl.uniform3fv(u.uCol,[.05,.05,.12]);gl.uniform1f(u.uUseTex,0);gl.uniform1f(u.uOut,0);gl.uniform1f(u.uEmis,1);
  for(const n of blobs){const p=n.wpos();const h=Math.max(0,p[1]);gl.uniform1f(u.uAlpha,K.clamp(.28-h*.05,.06,.28));const s=n.blob*(1+h*.08);
   gl.uniformMatrix4fv(u.uM,false,M4.trs([p[0],(n.blobY||0)+.02,p[2]],[0,0,0],[s*2,1,s*2]));gl.drawElements(gl.TRIANGLES,this.blobGeo.n,gl.UNSIGNED_SHORT,0)}
  gl.disable(gl.POLYGON_OFFSET_FILL);
  trans.sort((a,b)=>b[2]-a[2]);gl.disable(gl.CULL_FACE);
  for(const [n,g] of trans){if(n.bill)this._billboard(n,eye);gl.uniformMatrix4fv(u.uM,false,n.m);gl.bindVertexArray(g.vao);gl.uniform1f(u.uOut,0);this._matU(n);gl.drawElements(gl.TRIANGLES,g.n,gl.UNSIGNED_SHORT,0)}
  gl.depthMask(true);
  // particles
  if(this.parts.length){const n=this.parts.length,a=new Float32Array(n*8);for(let i=0;i<n;i++){const q=this.parts[i],o=i*8,f=1-q.t/q.life;a[o]=q.p[0];a[o+1]=q.p[1];a[o+2]=q.p[2];a[o+3]=q.c[0];a[o+4]=q.c[1];a[o+5]=q.c[2];a[o+6]=q.a*Math.min(1,f*2);a[o+7]=q.s}
   const PP=this.PP;gl.useProgram(PP.p);gl.uniformMatrix4fv(PP.u.uVP,false,vp);gl.uniform1f(PP.u.uH,H*.9);gl.bindVertexArray(this.pVAO);gl.bindBuffer(gl.ARRAY_BUFFER,this.pBuf);gl.bufferData(gl.ARRAY_BUFFER,a,gl.DYNAMIC_DRAW);
   gl.depthMask(false);gl.drawArrays(gl.POINTS,0,n);gl.depthMask(true)}
  gl.disable(gl.BLEND);gl.bindVertexArray(null)}
 _matU(n){const gl=this.gl,u=this.P.u;gl.uniform3fv(u.uCol,n.col);gl.uniform1f(u.uMode,n.mode);gl.uniform1f(u.uAlpha,n.alpha);gl.uniform1f(u.uEmis,n.emis);
  if(n.tex){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,n.tex);gl.uniform1i(u.uTex,0);gl.uniform1f(u.uUseTex,1)}else gl.uniform1f(u.uUseTex,0)}
 _billboard(n,eye){const p=[n.m[12],n.m[13],n.m[14]];if(n.billOff){const dx=eye[0]-p[0],dy=eye[1]-p[1],dz=eye[2]-p[2],l=Math.hypot(dx,dy,dz)||1;p[0]+=dx/l*n.billOff;p[1]+=dy/l*n.billOff;p[2]+=dz/l*n.billOff}const y=Math.atan2(eye[0]-p[0],eye[2]-p[2]);const s=[Math.hypot(n.m[0],n.m[1],n.m[2]),Math.hypot(n.m[4],n.m[5],n.m[6]),Math.hypot(n.m[8],n.m[9],n.m[10])];M4.trs(p,[0,y,0],s,n.m)}
 project(p){if(!this.vp)return null;const c=M4.xf(this.vp,[p[0],p[1],p[2],1]);if(c[3]<=.1)return null;return{x:(c[0]/c[3]*.5+.5)*this.W,y:(1-(c[1]/c[3]*.5+.5))*this.H,d:c[3]}}
 _bubbles(dt){for(let i=this.bubs.length-1;i>=0;i--){const b=this.bubs[i];b.t+=dt;if(b.t>b.life){b.el.classList.add('out');const el=b.el;setTimeout(()=>el.remove(),300);this.bubs.splice(i,1);continue}
   const p=b.node.wpos();const s=this.project([p[0],p[1]+b.off,p[2]]);if(!s){b.el.style.opacity=0;continue}b.el.style.opacity=1;b.el.style.transform=`translate(${s.x}px,${s.y}px) translate(-50%,-100%)`}}
}
K.World=World;

/* ---------------- canvas helpers ---------------- */
K.sign=(w,text,o={})=>w.canvasTex(o.w||512,o.h||256,(x,W,H)=>{x.fillStyle=o.bg||'#FFF6DC';x.fillRect(0,0,W,H);x.lineWidth=14;x.strokeStyle=o.border||'#000';x.strokeRect(7,7,W-14,H-14);
 if(o.dots!==false){x.fillStyle='rgba(0,0,0,.08)';for(let yy=6;yy<H;yy+=12)for(let xx=(yy/12%2)*6;xx<W;xx+=12){x.beginPath();x.arc(xx,yy,2.2,0,TAU);x.fill()}}
 const lines=String(text).split('\n');let fs=o.fs||Math.min(H*.7/lines.length,W*1.6/Math.max(...lines.map(l=>l.length)));x.font=`${o.weight||'400'} ${fs}px ${o.font||'Bangers, Impact, "Arial Black", sans-serif'}`;
 x.textAlign='center';x.textBaseline='middle';lines.forEach((l,i)=>{const y=H/2+(i-(lines.length-1)/2)*fs*1.05;if(o.stroke){x.lineWidth=fs*.14;x.strokeStyle='#000';x.lineJoin='round';x.strokeText(l,W/2,y)}x.fillStyle=o.color||'#E8242A';x.fillText(l,W/2,y)})});
K.drawFace=(x,W,H,o={})=>{/* cartoon face on a transparent canvas: skin disc + eyes + smile */
 x.clearRect(0,0,W,H);x.fillStyle=o.skin||'#F5C9A0';x.beginPath();x.ellipse(W/2,H/2,W*.48,H*.48,0,0,TAU);x.fill();
 const eyeY=H*.44,ex=W*.19,er=W*.075;const eye=(cx)=>{x.fillStyle='#fff';x.beginPath();x.ellipse(cx,eyeY,er,er*1.2,0,0,TAU);x.fill();x.lineWidth=W*.018;x.strokeStyle='#111';x.stroke();
  x.fillStyle=o.eyes||'#3D6FB6';x.beginPath();x.arc(cx,eyeY+er*.15,er*.62,0,TAU);x.fill();x.fillStyle='#111';x.beginPath();x.arc(cx,eyeY+er*.15,er*.3,0,TAU);x.fill();
  x.fillStyle='#fff';x.beginPath();x.arc(cx+er*.25,eyeY-er*.2,er*.2,0,TAU);x.fill()};
 eye(W/2-ex);eye(W/2+ex);x.strokeStyle='#111';x.lineWidth=W*.028;x.lineCap='round';
 x.beginPath();x.moveTo(W/2-ex-er,eyeY-er*1.7);x.quadraticCurveTo(W/2-ex,eyeY-er*2.2,W/2-ex+er,eyeY-er*1.7);x.moveTo(W/2+ex-er,eyeY-er*1.7);x.quadraticCurveTo(W/2+ex,eyeY-er*2.2,W/2+ex+er,eyeY-er*1.7);x.stroke();
 x.fillStyle='rgba(229,40,122,.28)';x.beginPath();x.ellipse(W*.26,H*.62,W*.07,H*.04,0,0,TAU);x.ellipse(W*.74,H*.62,W*.07,H*.04,0,0,TAU);x.fill();
 x.beginPath();x.moveTo(W*.36,H*.66);x.quadraticCurveTo(W/2,H*(o.frown?.6:.8),W*.64,H*.66);x.stroke();
 x.beginPath();x.moveTo(W/2,H*.5);x.lineTo(W*.48,H*.58);x.stroke()};

/* ---------------- characters ---------------- */
/* Build a jointed comic person from primitives. Returns {root,parts,update(dt),pose,setFace}.
   o: skin, shirt, pants, shoes, hair, hairStyle(short|spiky|ponytail|bob|long|bald|bun), eyes, h (height scale), girth, cape, mask, gi(bool), belt */
K.person=(w,o={})=>{const sk=o.skin||'#F5C9A0',sh=o.shirt||'#1FA7E0',pa=o.pants||'#2448A8',shoe=o.shoes||'#222',H=o.h||1,G=o.girth||1;
 const root=K.group({blob:.45*G});root.blobY=0;const hips=K.group({p:[0,.95*H,0]});root.add(hips);
 const torso=K.group({p:[0,.05,0]});hips.add(torso);
 const body=K.mesh('cyl',[.26*G,.21*G,.62*H,16],sh,{p:[0,.36*H,0]});torso.add(body);
 const belly=K.mesh('sphere',[.24*G],sh,{p:[0,.1*H,0],s:[1,.55,.85]});torso.add(belly);
 const pelvis=K.mesh('sphere',[.22*G],pa,{p:[0,-.02,0],s:[1.05,.6,.8]});hips.add(pelvis);
 if(o.belt)torso.add(K.mesh('cyl',[.235*G,.235*G,.07,16],o.belt,{p:[0,.1*H,0]}));
 const neck=K.mesh('cyl',[.07,.08,.12,10],sk,{p:[0,.72*H,0]});torso.add(neck);
 const head=K.group({p:[0,.92*H,0]});torso.add(head);
 const skull=K.mesh('sphere',[.2*(o.headS||1)],sk,{s:[1,1.08,1]});head.add(skull);
 head.add(K.mesh('sphere',[.05],sk,{p:[-.195,0,0],s:[.6,1,.8]}),K.mesh('sphere',[.05],sk,{p:[.195,0,0],s:[.6,1,.8]}));
 // face plate (texture)
 const faceC=document.createElement('canvas');faceC.width=faceC.height=256;const fx=faceC.getContext('2d');fx.save();fx.translate(64,0);fx.scale(.5,1);K.drawFace(fx,256,256,{skin:sk,eyes:o.eyes,frown:o.frown});fx.restore();
 const faceTex=w.tex(faceC);const face=K.mesh('sphere',[.2*(o.headS||1),20,14],'#ffffff',{tex:faceTex,mode:1,outline:0,s:[.93,1.02,.5],p:[0,-.005,.117]});face.tr=true;face.alpha=.999;head.add(face);
 const hc=o.hair||'#8A5A2B',hs=o.hairStyle||'short';
 if(hs!=='bald'){const cap=K.mesh('sphere',[.212*(o.headS||1)],hc,{p:[0,.035,-.012],s:[1.03,.95,1.04]});head.add(cap);
  cap.clip=true;/* hair cap sits mostly behind/above; face disc is in front */
  if(hs==='spiky'){for(let i=0;i<6;i++){const a=i/6*TAU;head.add(K.mesh('cyl',[0,.06,.14,8],hc,{p:[Math.sin(a)*.1,.2,Math.cos(a)*.1-.03],r:[Math.cos(a)*.6,0,-Math.sin(a)*.6]}))}}
  if(hs==='ponytail'){const pt=K.group({p:[0,.1,-.2]});pt.add(K.mesh('sphere',[.09],hc,{p:[0,-.08,-.06],s:[.8,1.7,.8]}));head.add(pt);head.add(K.mesh('torus',[.045,.02,10,6],o.acc||'#FFD91A',{p:[0,.1,-.2],r:[1.2,0,0]}));root.pony=pt}
  if(hs==='bob'||hs==='long'){head.add(K.mesh('cyl',[.2,.24,hs==='long'?.42:.24,16],hc,{p:[0,hs==='long'?-.14:-.04,-.05],s:[1.05,1,.9]}))}
  if(hs==='bun')head.add(K.mesh('sphere',[.09],hc,{p:[0,.22,-.06]}));
  if(o.bangs!==false)head.add(K.mesh('sphere',[.2],hc,{p:[0,.13,.05],s:[1.02,.42,.9]}))}
 if(o.mask)head.add(K.mesh('cyl',[.205,.205,.07,20,false],o.mask,{p:[0,.035,0],s:[1.02,1,1.02]}));
 const limb=(len,r,col)=>{const j=K.group();j.add(K.mesh('cyl',[r,r*.85,len,10],col,{p:[0,-len/2,0]}));j.add(K.mesh('sphere',[r],col));return j};
 const armC=o.sleeve||sh,armL=.34*H;
 const mkArm=s=>{const sh_=K.group({p:[s*.3*G,.62*H,0]});const up=limb(armL,.075,armC);sh_.add(up);const el=K.group({p:[0,-armL,0]});up.add(el);const lo=limb(armL*.95,.065,o.forearm||(o.gloves?armC:sk));el.add(lo);
  const hand=K.mesh('sphere',[.075],o.gloves||sk,{p:[0,-armL*.98,0],s:[1,1.1,1]});lo.add(hand);torso.add(sh_);return{sh:sh_,el,hand}};
 const legL=.46*H;const mkLeg=s=>{const hp=K.group({p:[s*.12*G,0,0]});const th=limb(legL,.1*G,pa);hp.add(th);const kn=K.group({p:[0,-legL,0]});th.add(kn);const sh_=limb(legL*.98,.085,o.shin||pa);kn.add(sh_);
  const foot=K.mesh('box',[.15,.1,.28],shoe,{p:[0,-legL*.98,.06]});sh_.add(foot);hips.add(hp);return{hp,kn,foot}};
 const L={armL:mkArm(-1),armR:mkArm(1),legL:mkLeg(-1),legR:mkLeg(1)};
 if(o.cape){const cape=K.mesh('box',[.5*G,.9*H,.03],o.cape,{p:[0,.2*H,-.2*G],r:[.12,0,0]});torso.add(cape);root.cape=cape}
 const P={root,hips,torso,head,skull,face,faceC,faceTex,...L,t:Math.random()*10,moving:0,act:null,actT:0,rad:.42*G,eye:1.45*H,H,speedMul:1};
 P.setFace=img=>{const x=faceC.getContext('2d');x.clearRect(0,0,256,256);x.save();x.beginPath();x.ellipse(128,128,61,122,0,0,TAU);x.clip();x.drawImage(img,67,6,122,244);x.restore();w.updateTex(faceTex,faceC)};
 P.play=(name,dur)=>{P.act=name;P.actT=0;P.actD=dur||.45};
 P.update=(dt)=>{P.t+=dt*(P.moving?9*(P.speedMul||1):2);const m=P.moving,t=P.t;const sw=Math.sin(t)*.75*m;
  L.legL.hp.r[0]=sw;L.legR.hp.r[0]=-sw;L.legL.kn.r[0]=Math.max(0,-Math.sin(t))*.9*m;L.legR.kn.r[0]=Math.max(0,Math.sin(t))*.9*m;
  L.armL.sh.r[0]=-sw*.8;L.armR.sh.r[0]=sw*.8;L.armL.el.r[0]=-.25-.3*m;L.armR.el.r[0]=-.25-.3*m;L.armL.sh.r[2]=-.08;L.armR.sh.r[2]=.08;
  hips.p[1]=.95*H+Math.abs(Math.cos(t))*.05*m+(m?0:Math.sin(t*.5)*.008);torso.r[0]=.06*m;torso.r[1]=0;head.r[1]=0;head.r[0]=0;
  if(root.cape)root.cape.r[0]=.12+m*.5+Math.sin(t*1.3)*.05;if(root.pony)root.pony.r[0]=Math.sin(t)*.25*m;
  if(P.act){P.actT+=dt;const k=Math.min(1,P.actT/P.actD),e=Math.sin(k*Math.PI);K.POSES[P.act]&&K.POSES[P.act](P,e,k);if(P.actT>=P.actD)P.act=null}
  if(P.hold&&!P.act&&K.POSES[P.hold])K.POSES[P.hold](P,1,1)};
 return P};
/* action poses: e = 0..1..0 intensity */
K.POSES={
 wave(P,e){P.armR.sh.r[2]=2.6*e+.08;P.armR.sh.r[0]=0;P.armR.el.r[0]=-.2;P.armR.el.r[2]=Math.sin(P.actT*18)*.5*e},
 jab(P,e){P.armL.sh.r[0]=-1.55*e;P.armL.el.r[0]=-.1;P.torso.r[1]=.35*e},
 cross(P,e){P.armR.sh.r[0]=-1.6*e;P.armR.el.r[0]=-.05;P.torso.r[1]=-.5*e},
 front(P,e){P.legR.hp.r[0]=-1.5*e;P.legR.kn.r[0]=(1-e)*1.2;P.torso.r[0]=-.15*e},
 round(P,e){P.legL.hp.r[0]=-1.1*e;P.legL.hp.r[2]=-.9*e;P.legL.kn.r[0]=.3*(1-e);P.torso.r[2]=-.35*e;P.torso.r[1]=.7*e},
 block(P,e){P.armL.sh.r[0]=-1.2*e;P.armR.sh.r[0]=-1.2*e;P.armL.el.r[0]=-1.9*e;P.armR.el.r[0]=-1.9*e;P.armL.sh.r[2]=-.25*e;P.armR.sh.r[2]=.25*e},
 guard(P,e){P.armL.sh.r[0]=-.9*e;P.armR.sh.r[0]=-.7*e;P.armL.el.r[0]=-1.9*e;P.armR.el.r[0]=-2.1*e;P.legL.hp.r[0]=-.25*e;P.legR.hp.r[0]=.3*e;P.legL.kn.r[0]=.25*e;P.legR.kn.r[0]=.3*e;P.hips.p[1]-=.04*e},
 dodge(P,e){P.torso.r[2]=.55*e;P.hips.p[1]-=.22*e;P.legL.kn.r[0]=.9*e;P.legR.kn.r[0]=.9*e},
 bow(P,e){P.torso.r[0]=.75*e;P.head.r[0]=.2*e},
 cheer(P,e){P.armL.sh.r[2]=-2.7*e;P.armR.sh.r[2]=2.7*e;P.armL.el.r[0]=-.1;P.armR.el.r[0]=-.1;P.hips.p[1]+=Math.abs(Math.sin(P.actT*10))*.2*e},
 hit(P,e){P.torso.r[0]=-.35*e;P.head.r[0]=-.3*e;P.hips.p[1]-=.05*e},
 jump(P,e){P.hips.p[1]+=.9*e;P.legL.kn.r[0]=1.2*e;P.legR.kn.r[0]=1.2*e;P.armL.sh.r[2]=-1.6*e;P.armR.sh.r[2]=1.6*e},
 dance(P,e){P.armL.sh.r[2]=-1.4-Math.sin(P.actT*9)*.8;P.armR.sh.r[2]=1.4+Math.cos(P.actT*9)*.8;P.hips.p[1]+=Math.abs(Math.sin(P.actT*9))*.12;P.torso.r[1]=Math.sin(P.actT*5)*.5},
 sit(P,e){P.legL.hp.r[0]=-1.5*e;P.legR.hp.r[0]=-1.5*e;P.legL.kn.r[0]=1.5*e;P.legR.kn.r[0]=1.5*e;P.hips.p[1]-=.45*e}
};

/* simple critter builders */
K.critter=(w,kind,col,o={})=>{const g=K.group({blob:.4*(o.s||1)});const S=o.s||1;const c2=o.col2||'#FFFFFF';
 const eyes=(y,z,sp,r)=>{[-1,1].forEach(s=>{g.add(K.mesh('sphere',[r],'#FFFFFF',{p:[s*sp,y,z]}),K.mesh('sphere',[r*.55],'#111111',{p:[s*sp,y,z+r*.6],outline:0}),K.mesh('sphere',[r*.2],'#FFFFFF',{p:[s*sp+r*.15,y+r*.2,z+r*.95],outline:0,mode:1}))})};
 if(kind==='duck'){g.add(K.mesh('sphere',[.35*S],col,{p:[0,.35*S,0],s:[1,.85,1.2]}),K.mesh('sphere',[.22*S],col,{p:[0,.72*S,.18*S]}),K.mesh('cyl',[.05*S,.1*S,.2*S,10],'#FF9A1A',{p:[0,.68*S,.4*S],r:[Math.PI/2,0,0]}));eyes(.78*S,.33*S,.09*S,.05*S)}
 else if(kind==='bunny'){g.add(K.mesh('sphere',[.34*S],col,{p:[0,.36*S,0],s:[1,1.05,1]}),K.mesh('sphere',[.24*S],col,{p:[0,.82*S,.05*S]}),K.mesh('sphere',[.08*S],'#FFFFFF',{p:[0,.3*S,-.33*S]}));
  [-1,1].forEach(s=>g.add(K.mesh('sphere',[.07*S],col,{p:[s*.1*S,1.12*S,0],s:[.8,3,.6]}),K.mesh('sphere',[.045*S],'#FF8FB8',{p:[s*.1*S,1.12*S,.035*S],s:[.7,2.6,.3],outline:0})));eyes(.86*S,.24*S,.09*S,.05*S);g.add(K.mesh('sphere',[.035*S],'#FF6FA8',{p:[0,.78*S,.28*S]}))}
 else if(kind==='cat'){g.add(K.mesh('sphere',[.3*S],col,{p:[0,.32*S,0],s:[1,.9,1.25]}),K.mesh('sphere',[.24*S],col,{p:[0,.72*S,.18*S]}));
  [-1,1].forEach(s=>g.add(K.mesh('cyl',[0,.08*S,.16*S,4],col,{p:[s*.13*S,.95*S,.16*S]})));g.add(K.mesh('cyl',[.04*S,.05*S,.5*S,8],col,{p:[0,.5*S,-.4*S],r:[-.7,0,0]}));eyes(.76*S,.38*S,.09*S,.055*S);g.add(K.mesh('sphere',[.03*S],'#FF6FA8',{p:[0,.7*S,.42*S]}))}
 else if(kind==='fish'){g.add(K.mesh('sphere',[.3*S],col,{p:[0,0,0],s:[.6,.8,1.2]}),K.mesh('cyl',[0,.25*S,.3*S,4],col,{p:[0,0,-.45*S],r:[Math.PI/2,0,0],s:[.3,1,1]}));eyes(.08*S,.2*S,.13*S,.06*S)}
 else if(kind==='dino'){g.add(K.mesh('sphere',[.4*S],col,{p:[0,.5*S,0],s:[.9,1,1.2]}),K.mesh('sphere',[.26*S],col,{p:[0,1.0*S,.35*S],s:[1,.9,1.2]}),K.mesh('cyl',[.05*S,.18*S,.7*S,10],col,{p:[0,.4*S,-.6*S],r:[-1.2,0,0]}));
  for(let i=0;i<4;i++)g.add(K.mesh('cyl',[0,.07*S,.14*S,4],c2,{p:[0,.95*S-i*.18*S,.05*S-i*.2*S],r:[-.3,0,0]}));[-1,1].forEach(s=>g.add(K.mesh('cyl',[.1*S,.09*S,.3*S,10],col,{p:[s*.2*S,.15*S,0]})));eyes(1.1*S,.58*S,.1*S,.06*S)}
 return g};

/* ---------------- world kit (reusable props) ---------------- */
K.kit={
 tree(w,o={}){const g=K.group({blob:o.blob===undefined?1.1*(o.s||1):o.blob});const s=o.s||1;g.add(K.mesh('cyl',[.18*s,.26*s,1.6*s,10],o.trunk||'#8B5A2B',{p:[0,.8*s,0]}));
  const c=o.col||'#5BC236';[[0,2.1,0,1],[.55,1.75,.2,.72],[-.5,1.8,-.15,.75],[.1,2.65,-.1,.7]].forEach(([x,y,z,r])=>g.add(K.mesh('sphere',[r*s,14,10],c,{p:[x*s,y*s,z*s]})));return g},
 pine(w,o={}){const g=K.group({blob:.9});const s=o.s||1;g.add(K.mesh('cyl',[.14*s,.2*s,.8*s,8],o.trunk||'#6B4226',{p:[0,.4*s,0]}));[0,1,2].forEach(i=>g.add(K.mesh('cyl',[0,(1.1-i*.28)*s,1.2*s,12],o.col||'#2E8B57',{p:[0,(1.2+i*.7)*s,0]})));return g},
 cloud(w,o={}){const g=K.group();const s=o.s||1;[[0,0,0,1],[.9,-.15,.1,.75],[-.9,-.1,0,.8],[.35,.45,0,.7],[-.4,.35,.1,.6]].forEach(([x,y,z,r])=>g.add(K.mesh('sphere',[r*s,14,10],o.col||'#FFFFFF',{p:[x*s,y*s,z*s],emis:.55,outline:.7})));return g},
 flower(w,col,o={}){const g=K.group();const s=o.s||1;g.add(K.mesh('cyl',[.04*s,.05*s,1*s,6],'#3F9B2E',{p:[0,.5*s,0]}));g.add(K.mesh('sphere',[.12*s],'#3F9B2E',{p:[.14*s,.4*s,0],s:[1.6,.4,.8],outline:.5}));
  const head=K.group({p:[0,1.05*s,0],r:[.35,0,0]});g.add(head);for(let i=0;i<6;i++){const a=i/6*TAU;head.add(K.mesh('sphere',[.17*s,12,8],col,{p:[Math.cos(a)*.2*s,0,Math.sin(a)*.2*s],s:[1,.35,1]}))}
  head.add(K.mesh('sphere',[.12*s,12,8],o.center||'#FFD91A',{p:[0,.03*s,0],s:[1,.6,1]}));g.head=head;return g},
 signpost(w,text,o={}){const g=K.group();g.add(K.mesh('cyl',[.08,.08,2.2,8],'#8B5A2B',{p:[0,1.1,0]}));const tex=K.sign(w,text,{w:512,h:256,bg:o.bg||'#FFF6DC',color:o.color||'#E8242A',stroke:o.stroke});
  const b=K.mesh('box',[2.2,1.1,.12],o.frame||'#8B5A2B',{p:[0,2.3,0]});g.add(b);g.add(K.mesh('quad',[2.05,1],'#ffffff',{tex,mode:1,outline:0,p:[0,2.3,.065]}),K.mesh('quad',[2.05,1],'#ffffff',{tex,mode:1,outline:0,p:[0,2.3,-.065],r:[0,Math.PI,0]}));return g},
 rock(w,o={}){return K.mesh('sphere',[o.r||.6,10,7],o.col||'#9AA3A6',{s:[1,.6,.85],p:[0,(o.r||.6)*.25,0]})},
 letterTex(w,ch,o={}){return w.canvasTex(256,256,(x,W,H)=>{x.clearRect(0,0,W,H);x.font=`${o.fs||190}px Bangers, Impact, "Arial Black", sans-serif`;x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=22;x.strokeStyle='#000';x.strokeText(ch,W/2,H/2+10);x.fillStyle=o.col||'#fff';x.fillText(ch,W/2,H/2+10)})}
};
window.K3D=K;
})();
