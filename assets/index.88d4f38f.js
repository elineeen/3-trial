var yt=Object.defineProperty,_t=Object.defineProperties;var wt=Object.getOwnPropertyDescriptors;var Fe=Object.getOwnPropertySymbols;var bt=Object.prototype.hasOwnProperty,Pt=Object.prototype.propertyIsEnumerable;var Ge=(n,o,e)=>o in n?yt(n,o,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[o]=e,Q=(n,o)=>{for(var e in o||(o={}))bt.call(o,e)&&Ge(n,e,o[e]);if(Fe)for(var e of Fe(o))Pt.call(o,e)&&Ge(n,e,o[e]);return n},fe=(n,o)=>_t(n,wt(o));import{r as _,o as U,c as q,a as y,V as D,T as ae,C as J,b as ve,F as ie,d as he,w as A,E as He,e as C,M as F,f as G,Q as Be,g as z,S as W,B as Ye,L as Xe,h as re,i as se,j as ce,k as xe,R as zt,u as ge,G as Ze,l as N,P as ye,m as le,n as _e,p as K,q as we,s as Tt,t as pe,v as qe,x as We,y as de,z as Et,A as Ct,D as Ke,H as ee,I as Qe,J as Je,K as St,N as et,O as Lt,U as Mt,W as It,X as kt,Y as At,Z as Nt,_ as Rt,$ as Ot,a0 as Dt,a1 as jt,a2 as tt,a3 as $t,a4 as Vt,a5 as Ut,a6 as Ft,a7 as Gt,a8 as Ht,a9 as Bt,aa as Yt}from"./vendor.6e7dd3a3.js";const Xt=function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const d of r)if(d.type==="childList")for(const s of d.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function e(r){const d={};return r.integrity&&(d.integrity=r.integrity),r.referrerpolicy&&(d.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?d.credentials="include":r.crossorigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function i(r){if(r.ep)return;r.ep=!0;const d=e(r);fetch(r.href,d)}};Xt();var H=(n,o)=>{for(const[e,i]of o)n[e]=i;return n};const Zt={};function qt(n,o,e,i,r,d){const s=_("router-view");return U(),q("div",null,[y(s)])}var Wt=H(Zt,[["render",qt]]);const ot=`
       vec4 permute(vec4 x){return mod(((x*34.)+1.)*x,289.);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}

        float snoise(vec3 v){
            const vec2 C=vec2(1./6.,1./3.);
            const vec4 D=vec4(0.,.5,1.,2.);
            
            // First corner
            vec3 i=floor(v+dot(v,C.yyy));
            vec3 x0=v-i+dot(i,C.xxx);
            
            // Other corners
            vec3 g=step(x0.yzx,x0.xyz);
            vec3 l=1.-g;
            vec3 i1=min(g.xyz,l.zxy);
            vec3 i2=max(g.xyz,l.zxy);
            
            //  x0 = x0 - 0. + 0.0 * C
            vec3 x1=x0-i1+1.*C.xxx;
            vec3 x2=x0-i2+2.*C.xxx;
            vec3 x3=x0-1.+3.*C.xxx;
            
            // Permutations
            i=mod(i,289.);
            vec4 p=permute(permute(permute(
                i.z+vec4(0.,i1.z,i2.z,1.))
                +i.y+vec4(0.,i1.y,i2.y,1.))
                +i.x+vec4(0.,i1.x,i2.x,1.));
                
                // Gradients
                // ( N*N points uniformly over a square, mapped onto an octahedron.)
                float n_=1./7.;// N=7
                vec3 ns=n_*D.wyz-D.xzx;
                
                vec4 j=p-49.*floor(p*ns.z*ns.z);//  mod(p,N*N)
                
                vec4 x_=floor(j*ns.z);
                vec4 y_=floor(j-7.*x_);// mod(j,N)
                
                vec4 x=x_*ns.x+ns.yyyy;
                vec4 y=y_*ns.x+ns.yyyy;
                vec4 h=1.-abs(x)-abs(y);
                
                vec4 b0=vec4(x.xy,y.xy);
                vec4 b1=vec4(x.zw,y.zw);
                
                vec4 s0=floor(b0)*2.+1.;
                vec4 s1=floor(b1)*2.+1.;
                vec4 sh=-step(h,vec4(0.));
                
                vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
                vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
                
                vec3 p0=vec3(a0.xy,h.x);
                vec3 p1=vec3(a0.zw,h.y);
                vec3 p2=vec3(a1.xy,h.z);
                vec3 p3=vec3(a1.zw,h.w);
                
                //Normalise gradients
                vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
                p0*=norm.x;
                p1*=norm.y;
                p2*=norm.z;
                p3*=norm.w;
                
                // Mix final noise value
                vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
                m=m*m;
                return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),
                dot(p2,x2),dot(p3,x3)));
            }
            
            vec3 snoiseVec3(vec3 x){
                    return vec3(snoise(vec3(x)*2.-1.),
                    snoise(vec3(x.y-19.1,x.z+33.4,x.x+47.2))*2.-1.,
                    snoise(vec3(x.z+74.2,x.x-124.5,x.y+99.4)*2.-1.)
                );
            }
        
        vec3 curlNoise(vec3 p){
            const float e=.1;
            vec3 dx=vec3(e,0.,0.);
            vec3 dy=vec3(0.,e,0.);
            vec3 dz=vec3(0.,0.,e);
            
            vec3 p_x0=snoiseVec3(p-dx);
            vec3 p_x1=snoiseVec3(p+dx);
            vec3 p_y0=snoiseVec3(p-dy);
            vec3 p_y1=snoiseVec3(p+dy);
            vec3 p_z0=snoiseVec3(p-dz);
            vec3 p_z1=snoiseVec3(p+dz);
            
            float x=p_y1.z-p_y0.z-p_z1.y+p_z0.y;
            float y=p_z1.x-p_z0.x-p_x1.z+p_x0.z;
            float z=p_x1.y-p_x0.y-p_y1.x+p_y0.x;
            
            const float divisor=1./(2.*e);
            return normalize(vec3(x,y,z)*divisor);
        }



        uniform float uTime;
        uniform float uProgress;
        varying vec2 vUv;
        varying vec3 vColor;
        attribute float size;
        attribute vec3 customColor;
        void main(){
            vColor = customColor;
            vec3 noise=curlNoise(vec3(position.x*.02,position.y*.008,uTime*.05));
            vec3 distortion=vec3(position.x*2.,position.y,1.)*noise*uProgress;
            vec3 newPos=position+distortion;
            vec4 modelPosition=modelMatrix*vec4(newPos,1.);
            vec4 viewPosition=viewMatrix*modelPosition;
            vec4 projectedPosition=projectionMatrix*viewPosition;
            gl_Position=projectedPosition;
            gl_PointSize=2.;
          
            vUv=uv;
        }
        `,Kt=`
       vec4 permute(vec4 x){return mod(((x*34.)+1.)*x,289.);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}

        float snoise(vec3 v){
            const vec2 C=vec2(1./6.,1./3.);
            const vec4 D=vec4(0.,.5,1.,2.);
            
            // First corner
            vec3 i=floor(v+dot(v,C.yyy));
            vec3 x0=v-i+dot(i,C.xxx);
            
            // Other corners
            vec3 g=step(x0.yzx,x0.xyz);
            vec3 l=1.-g;
            vec3 i1=min(g.xyz,l.zxy);
            vec3 i2=max(g.xyz,l.zxy);
            
            //  x0 = x0 - 0. + 0.0 * C
            vec3 x1=x0-i1+1.*C.xxx;
            vec3 x2=x0-i2+2.*C.xxx;
            vec3 x3=x0-1.+3.*C.xxx;
            
            // Permutations
            i=mod(i,289.);
            vec4 p=permute(permute(permute(
                i.z+vec4(0.,i1.z,i2.z,1.))
                +i.y+vec4(0.,i1.y,i2.y,1.))
                +i.x+vec4(0.,i1.x,i2.x,1.));
                
                // Gradients
                // ( N*N points uniformly over a square, mapped onto an octahedron.)
                float n_=1./7.;// N=7
                vec3 ns=n_*D.wyz-D.xzx;
                
                vec4 j=p-49.*floor(p*ns.z*ns.z);//  mod(p,N*N)
                
                vec4 x_=floor(j*ns.z);
                vec4 y_=floor(j-7.*x_);// mod(j,N)
                
                vec4 x=x_*ns.x+ns.yyyy;
                vec4 y=y_*ns.x+ns.yyyy;
                vec4 h=1.-abs(x)-abs(y);
                
                vec4 b0=vec4(x.xy,y.xy);
                vec4 b1=vec4(x.zw,y.zw);
                
                vec4 s0=floor(b0)*2.+1.;
                vec4 s1=floor(b1)*2.+1.;
                vec4 sh=-step(h,vec4(0.));
                
                vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
                vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
                
                vec3 p0=vec3(a0.xy,h.x);
                vec3 p1=vec3(a0.zw,h.y);
                vec3 p2=vec3(a1.xy,h.z);
                vec3 p3=vec3(a1.zw,h.w);
                
                //Normalise gradients
                vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
                p0*=norm.x;
                p1*=norm.y;
                p2*=norm.z;
                p3*=norm.w;
                
                // Mix final noise value
                vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
                m=m*m;
                return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),
                dot(p2,x2),dot(p3,x3)));
            }
            
            vec3 snoiseVec3(vec3 x){
                    return vec3(snoise(vec3(x)*2.-1.),
                    snoise(vec3(x.y-19.1,x.z+33.4,x.x+47.2))*2.-1.,
                    snoise(vec3(x.z+74.2,x.x-124.5,x.y+99.4)*2.-1.)
                );
            }
        
        vec3 curlNoise(vec3 p){
            const float e=.1;
            vec3 dx=vec3(e,0.,0.);
            vec3 dy=vec3(0.,e,0.);
            vec3 dz=vec3(0.,0.,e);
            
            vec3 p_x0=snoiseVec3(p-dx);
            vec3 p_x1=snoiseVec3(p+dx);
            vec3 p_y0=snoiseVec3(p-dy);
            vec3 p_y1=snoiseVec3(p+dy);
            vec3 p_z0=snoiseVec3(p-dz);
            vec3 p_z1=snoiseVec3(p+dz);
            
            float x=p_y1.z-p_y0.z-p_z1.y+p_z0.y;
            float y=p_z1.x-p_z0.x-p_x1.z+p_x0.z;
            float z=p_x1.y-p_x0.y-p_y1.x+p_y0.x;
            
            const float divisor=1./(2.*e);
            return normalize(vec3(x,y,z)*divisor);
        }



        uniform float uTime;
        uniform float uProgress;
        varying vec2 vUv;
        varying vec3 vColor;
        attribute float size;
        attribute vec3 customColor;
        void main(){
            vColor = customColor;
            vec3 noise=curlNoise(vec3(position.x*.02,position.y*.008,position.z*.05));
            vec3 distortion=vec3(position.x,position.y,position.z)*noise*uProgress;
            vec3 newPos=position+distortion;
            vec4 modelPosition=modelMatrix*vec4(newPos,1.);
            vec4 viewPosition=viewMatrix*modelPosition;
            vec4 projectedPosition=projectionMatrix*viewPosition;
            gl_Position=projectedPosition;
            gl_PointSize=2.;
          
            vUv=uv;
        }
        `,nt=`
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec2 uResolution;
        uniform sampler2D pointTexture;
    
        varying vec2 vUv;
        uniform vec3 color;
        varying vec3 vColor;  
        void main(){
            gl_FragColor = vec4( color * vColor, 1.0 );
        }
    `,at=Object.freeze({uTime:{value:0},uMouse:{value:new D(0,0)},uResolution:{value:new D(600,600)},uProgress:{value:0},uTexture:{value:new ae().load("/wp5723479.png")},color:{value:new J(16777215)}}),Qt=`
vec4 permute(vec4 x){return mod(((x*34.)+1.)*x,289.);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}

float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);
    const vec4 D=vec4(0.,.5,1.,2.);
    
    // First corner
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    
    // Other corners
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    
    //  x0 = x0 - 0. + 0.0 * C
    vec3 x1=x0-i1+1.*C.xxx;
    vec3 x2=x0-i2+2.*C.xxx;
    vec3 x3=x0-1.+3.*C.xxx;
    
    // Permutations
    i=mod(i,289.);
    vec4 p=permute(permute(permute(
                i.z+vec4(0.,i1.z,i2.z,1.))
                +i.y+vec4(0.,i1.y,i2.y,1.))
                +i.x+vec4(0.,i1.x,i2.x,1.));
                
                // Gradients
                // ( N*N points uniformly over a square, mapped onto an octahedron.)
                float n_=1./7.;// N=7
                vec3 ns=n_*D.wyz-D.xzx;
                
                vec4 j=p-49.*floor(p*ns.z*ns.z);//  mod(p,N*N)
                
                vec4 x_=floor(j*ns.z);
                vec4 y_=floor(j-7.*x_);// mod(j,N)
                
                vec4 x=x_*ns.x+ns.yyyy;
                vec4 y=y_*ns.x+ns.yyyy;
                vec4 h=1.-abs(x)-abs(y);
                
                vec4 b0=vec4(x.xy,y.xy);
                vec4 b1=vec4(x.zw,y.zw);
                
                vec4 s0=floor(b0)*2.+1.;
                vec4 s1=floor(b1)*2.+1.;
                vec4 sh=-step(h,vec4(0.));
                
                vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
                vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
                
                vec3 p0=vec3(a0.xy,h.x);
                vec3 p1=vec3(a0.zw,h.y);
                vec3 p2=vec3(a1.xy,h.z);
                vec3 p3=vec3(a1.zw,h.w);
                
                //Normalise gradients
                vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
                p0*=norm.x;
                p1*=norm.y;
                p2*=norm.z;
                p3*=norm.w;
                
                // Mix final noise value
                vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
                m=m*m;
                return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),
                dot(p2,x2),dot(p3,x3)));
            }
            
            vec3 snoiseVec3(vec3 x){
                return vec3(snoise(vec3(x)*2.-1.),
                snoise(vec3(x.y-19.1,x.z+33.4,x.x+47.2))*2.-1.,
                snoise(vec3(x.z+74.2,x.x-124.5,x.y+99.4)*2.-1.)
            );
        }
        
        vec3 curlNoise(vec3 p){
            const float e=.1;
            vec3 dx=vec3(e,0.,0.);
            vec3 dy=vec3(0.,e,0.);
            vec3 dz=vec3(0.,0.,e);
            
            vec3 p_x0=snoiseVec3(p-dx);
            vec3 p_x1=snoiseVec3(p+dx);
            vec3 p_y0=snoiseVec3(p-dy);
            vec3 p_y1=snoiseVec3(p+dy);
            vec3 p_z0=snoiseVec3(p-dz);
            vec3 p_z1=snoiseVec3(p+dz);
            
            float x=p_y1.z-p_y0.z-p_z1.y+p_z0.y;
            float y=p_z1.x-p_z0.x-p_x1.z+p_x0.z;
            float z=p_x1.y-p_x0.y-p_y1.x+p_y0.x;
            
            const float divisor=1./(2.*e);
            return normalize(vec3(x,y,z)*divisor);
        }
        
        uniform float uTime;
        uniform float uProgress;
        varying vec2 vUv;
        
        void main(){
            vec3 noise=curlNoise(vec3(position.x*.02,position.y*.008,uTime*.05));
            vec3 distortion=vec3(position.x*2.,position.y,1.)*noise*uProgress;
            vec3 newPos=position+distortion;
            vec4 modelPosition=modelMatrix*vec4(newPos,1.);
            vec4 viewPosition=viewMatrix*modelPosition;
            vec4 projectedPosition=projectionMatrix*viewPosition;
            gl_Position=projectedPosition;
            gl_PointSize=2.;
            
            vUv=uv;
        }
`,Jt=`
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;

varying vec2 vUv;

void main(){
    vec4 color=texture2D(uTexture,vUv);
    if(color.r<.1&&color.g<.1&&color.b<.1){
        discard;
    }
    gl_FragColor=color;
}
`;const eo={name:"polygonExplosion",data(){return{curlNoise2DVertexShader:ot,curlNoiseFragmentShader:nt,curlNoiseUniforms:at,curl3DNoiseVertexShader:Kt,config:{noiseValueTransitionScale:this.$d3.scaleLinear([0,1],[0,3]),clock:new ve}}},mounted(){const n=this.$refs.renderer,o=this.$refs.box.mesh;o.position.set(0,0,-200);const e=o.geometry.getAttribute("position"),i=[],r=new J("skyblue");for(let d=0,s=e.count;d<s;d++)r.toArray(i,d*3);o.geometry.setAttribute("customColor",new ie(i,3)),n.onBeforeRender(()=>{o.rotation.x+=.01}),setTimeout(()=>{this.dispatchActivateExplosionEffect(o)},2e3)},methods:{async dispatchActivateExplosionEffect(n){debugger;let o=n;await this.$d3.transition("activate-explosion").duration(3e3).tween("render",()=>e=>{o.material.uniforms.uProgress.value=this.config.noiseValueTransitionScale(e)}).transition("shrink-explosion").tween("render",()=>e=>{o.material.uniforms.uProgress.value=this.config.noiseValueTransitionScale(1-e)}).end();debugger}}};function to(n,o,e,i,r,d){const s=_("Camera"),c=_("PointLight"),v=_("BoxGeometry"),l=_("ShaderMaterial"),m=_("Points"),a=_("Scene"),u=_("Renderer");return U(),he(u,{ref:"renderer",antialias:"",resize:"window","orbit-ctrl":""},{default:A(()=>[y(s,{position:{z:10}}),y(a,null,{default:A(()=>[y(c,{position:{y:50,z:50,x:25}}),y(m,{onClick:d.dispatchActivateExplosionEffect,ref:"box",rotation:{y:Math.PI/4,z:Math.PI/4}},{default:A(()=>[y(v,{width:100,height:100,depth:100,widthSegments:100,heightSegments:100,depthSegments:100}),y(l,{props:{vertexShader:r.curl3DNoiseVertexShader,uniforms:r.curlNoiseUniforms,fragmentShader:r.curlNoiseFragmentShader}},null,8,["props"])]),_:1},8,["onClick","rotation"])]),_:1})]),_:1},512)}var oo=H(eo,[["render",to]]);const no={name:"planeExplosion",data(){return{particleExplodeFragmentShader:Jt,particleExplodeVertexShader:Qt,curlNoiseUniforms:at,curlNoise2DVertexShader:ot,curlNoiseFragmentShader:nt,config:{noiseValueTransitionScale:this.$d3.scaleLinear([0,1],[0,3]),clock:new ve}}},mounted(){this.$refs.renderer;const n=this.$refs.box.mesh;n.position.set(0,0,-1e3);const o=n.geometry.getAttribute("position"),e=[],i=new J;for(let r=0,d=o.count;r<d;r++)i.setHSL(.01+.1*(r/d),1,.5),i.toArray(e,r*3);n.geometry.setAttribute("customColor",new ie(e,3)),setTimeout(()=>{this.dispatchActivateExplosionEffect(n)},2e3)},methods:{async dispatchActivateExplosionEffect(n){let o=n;await this.$d3.transition("activate-explosion").duration(3e3).tween("render",()=>e=>{o.material.uniforms.uProgress.value=this.config.noiseValueTransitionScale(e),o.material.uniforms.uTime.value=this.config.clock.getElapsedTime()}).transition("shrink-explosion").tween("render",()=>e=>{o.material.uniforms.uProgress.value=this.config.noiseValueTransitionScale(1-e),o.material.uniforms.uTime.value=this.config.clock.getElapsedTime()}).end()}}};function ao(n,o,e,i,r,d){const s=_("Camera"),c=_("PointLight"),v=_("PlaneGeometry"),l=_("ShaderMaterial"),m=_("Points"),a=_("Scene"),u=_("Renderer");return U(),q("div",null,[y(u,{ref:"renderer",antialias:"",resize:"window","orbit-ctrl":""},{default:A(()=>[y(s,{position:{z:10}}),y(a,null,{default:A(()=>[y(c,{position:{y:50,z:50,x:25}}),y(m,{onClick:d.dispatchActivateExplosionEffect,ref:"box"},{default:A(()=>[y(v,{width:1770,height:1e3,widthSegments:50,heightSegments:50}),y(l,{props:{vertexShader:r.particleExplodeVertexShader,uniforms:r.curlNoiseUniforms,fragmentShader:r.particleExplodeFragmentShader}},null,8,["props"])]),_:1},8,["onClick"])]),_:1})]),_:1},512)])}var io=H(no,[["render",ao]]);const ro={name:"data-handler-mixin",data(){return{rawData:{filteredSongList:[],filteredSongObj:{},fullRankingList:[],fullSongList:[]},dataAdapterConfig:{modelConverting:{timeline2ZoomScale:this.$d3.scaleLinear([new Date("1968-01-01"),new Date("1970-01-01")],[2e3,0]),valence2YCoordScale:this.$d3.scaleLinear([0,1],[-15,15]),dance2XCoordScale:this.$d3.scaleLinear([0,1],[-30,30]),relationPoint2CenteringDistanceScale:this.$d3.scaleLinear([1,20],[0,5])}}}},methods:{_rankingGraphPositionSimulation(n){return n.forEach(o=>{let[e,i]=o;this.$d3.forceSimulation(e).force("link",this.$d3.forceLink(i)).force("charge",this.$d3.forceManyBody().strength(r=>r.customStrength||2.3)).force("x",this.$d3.forceX()).force("y",this.$d3.forceY()).velocityDecay(.7).tick(3).stop(),e.forEach(r=>{r.position.set(r.x,r.y,r.position.z)})}),n},_centeringPositionSimulation(n){return this.$d3.forceSimulation(n).force("charge",this.$d3.forceManyBody().strength(-10)).force("x",this.$d3.forceX()).force("y",this.$d3.forceY()).velocityDecay(.5).tick(10).stop(),n.forEach(o=>{o.position.set(o.x,o.y,o.position.z)}),n},async _initRawData(){let[n,o]=await Promise.all([this.$d3.json("./musicData/50-jahre-filtered.json"),this.$d3.json("./musicData/50-jahre.json")]),e=n==null?void 0:n.songs;Object.keys(n==null?void 0:n.songs).forEach(r=>{e[r].rankList=[]});let i=o==null?void 0:o.entries;this.lodash.assign(this.rawData,{fullRankingList:i,filteredSongObj:e})},_aggregateSongModal(){let{filteredSongObj:n,fullRankingList:o}=this.rawData;o.forEach(a=>{let u=a==null?void 0:a.song;if(n[u]){let f=n[u];f.rankList.push(a),f.highestRank=f.highestRank?Math.min(a.rank,f.highestRank):a.rank,f.releaseDate=a.date}});let e=[];const{timeline2ZoomScale:i,valence2YCoordScale:r,dance2XCoordScale:d,relationPoint2CenteringDistanceScale:s}=this.dataAdapterConfig.modelConverting;Object.keys(n).forEach((a,u)=>{let f=n[a],p=new this.THREE.Vector3(d(f.dance),r(f.valence),i(new Date(f.releaseDate)));const x={position:p,x:p.x,y:p.y,index:u};e.push(Q(Q({},this.lodash.cloneDeep(n[a])),x))});let c=this._centeringPositionSimulation(e);const v=this.$d3.scaleLinear([1,20],[-2.5,-4]);let l=c.map((a,u)=>{let{rankList:f,position:p}=a,x=Math.atan2(a.valence,a.dance),h=f.map((T,E)=>{let b=s(T.rank),S=Math.random()*Math.PI/2-Math.PI/4,M=S+x,[I,R]=[b*Math.cos(M),b*Math.sin(M)],X=new this.THREE.Vector3(p.x+I,p.y+R,i(new Date(T.date)));return fe(Q({},T),{id:`graph-${u}-${E}`,position:X,x:p.x,y:p.y,customStrength:v(T.rank)})}),g=[];return h.forEach((T,E)=>{E>=1&&g.push({source:E-1,target:E})}),[[...h,fe(Q({},a),{fx:a.x,fy:a.y})],g]}),m=this._rankingGraphPositionSimulation(l);return[c,m]},async initFilteredRelationMapData(){return await this._initRawData(),this._aggregateSongModal()}}};function so(n,o,e,i,r,d){return null}var co=H(ro,[["render",so]]);const te=function(n,o){o===void 0&&console.warn('THREE.customOrbitControls: The second parameter "domElement" is now mandatory.'),o===document&&console.error('THREE.customOrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.'),this.object=n,this.domElement=o,this.enabled=!0,this.target=new C,this.minDistance=0,this.maxDistance=2e3,this.minZoom=0,this.maxZoom=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:F.ROTATE,MIDDLE:F.DOLLY,RIGHT:F.PAN},this.touches={ONE:G.ROTATE,TWO:G.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this.getPolarAngle=function(){return l.phi},this.getAzimuthalAngle=function(){return l.theta},this.listenToKeyEvents=function(t){t.addEventListener("keydown",Oe),this._domElementKeyEvents=t},this.saveState=function(){e.target0.copy(e.target),e.position0.copy(e.object.position),e.zoom0=e.object.zoom},this.reset=function(){e.target.copy(e.target0),e.object.position.copy(e.position0),e.object.zoom=e.zoom0,e.object.updateProjectionMatrix(),e.dispatchEvent(i),e.update(),c=s.NONE},this.update=function(){var t=new C,w=new Be().setFromUnitVectors(n.up,new C(0,1,0)),L=w.clone().invert(),k=new C,B=new Be,Z=2*Math.PI;return function(){z.update();var Ue=e.object.position;t.copy(Ue).sub(e.target),t.applyQuaternion(w),l.setFromVector3(t),e.autoRotate&&c===s.NONE&&I(S()),e.enableDamping?(l.theta+=m.theta*e.dampingFactor,l.phi+=m.phi*e.dampingFactor):(l.theta+=m.theta,l.phi+=m.phi);var $=e.minAzimuthAngle,V=e.maxAzimuthAngle;return isFinite($)&&isFinite(V)&&($<-Math.PI?$+=Z:$>Math.PI&&($-=Z),V<-Math.PI?V+=Z:V>Math.PI&&(V-=Z),$<=V?l.theta=Math.max($,Math.min(V,l.theta)):l.theta=l.theta>($+V)/2?Math.max($,l.theta):Math.min(V,l.theta)),l.phi=Math.max(e.minPolarAngle,Math.min(e.maxPolarAngle,l.phi)),l.makeSafe(),l.radius=e.maxDistance*e.scale,l.radius=Math.max(e.minDistance,Math.min(e.maxDistance,l.radius)),e.enableDamping===!0?e.target.addScaledVector(a,e.dampingFactor):e.target.add(a),t.setFromSpherical(l),t.applyQuaternion(L),Ue.copy(e.target).add(t),e.object.updateProjectionMatrix(),e.enableDamping===!0?(m.theta*=1-e.dampingFactor,m.phi*=1-e.dampingFactor,a.multiplyScalar(1-e.dampingFactor)):(m.set(0,0,0),a.set(0,0,0)),u||k.distanceToSquared(e.object.position)>v||8*(1-B.dot(e.object.quaternion))>v?(e.dispatchEvent(i),k.copy(e.object.position),B.copy(e.object.quaternion),u=!1,!0):!1}}(),this.dispose=function(){e.domElement.removeEventListener("contextmenu",Ve),e.domElement.removeEventListener("pointerdown",Ae),e.domElement.removeEventListener("wheel",Re),e.domElement.removeEventListener("touchstart",De),e.domElement.removeEventListener("touchend",$e),e.domElement.removeEventListener("touchmove",je),e.domElement.ownerDocument.removeEventListener("pointermove",ue),e.domElement.ownerDocument.removeEventListener("pointerup",me),e._domElementKeyEvents!==null&&e._domElementKeyEvents.removeEventListener("keydown",Oe)},this.scale=1;var e=this,i={type:"change"},r={type:"start"},d={type:"end"},s={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},c=s.NONE,v=1e-6,l=new W;new W;var m=new W,a=new C,u=!1,f=new D,p=new D,x=new D,h=new D,g=new D,P=new D,T=new D,E=new D,b=new D;function S(){return 2*Math.PI/60/60*e.autoRotateSpeed}function M(){return Math.pow(.95,e.zoomSpeed)}function I(t){m.theta-=t}function R(t){m.phi-=t}var X=function(){var t=new C;return function(L,k){t.setFromMatrixColumn(k,0),t.multiplyScalar(-L),a.add(t)}}(),oe=function(){var t=new C;return function(L,k){e.screenSpacePanning===!0?t.setFromMatrixColumn(k,1):(t.setFromMatrixColumn(k,0),t.crossVectors(e.object.up,t)),t.multiplyScalar(L),a.add(t)}}(),j=function(){var t=new C;return function(L,k){var B=e.domElement;if(e.object.isPerspectiveCamera){var Z=e.object.position;t.copy(Z).sub(e.target);var ne=t.length();ne*=Math.tan(e.object.fov/2*Math.PI/180),X(2*L*ne/B.clientHeight,e.object.matrix),oe(2*k*ne/B.clientHeight,e.object.matrix)}else e.object.isOrthographicCamera?(X(L*(e.object.right-e.object.left)/e.object.zoom/B.clientWidth,e.object.matrix),oe(k*(e.object.top-e.object.bottom)/e.object.zoom/B.clientHeight,e.object.matrix)):(console.warn("WARNING: customOrbitControls.js encountered an unknown camera type - pan disabled."),e.enablePan=!1)}}();function O(t){e.object.isPerspectiveCamera?Pe(e.scale/t):e.object.isOrthographicCamera?(e.object.zoom=Math.max(e.minZoom,Math.min(e.maxZoom,e.object.zoom*t)),e.object.updateProjectionMatrix(),u=!0):(console.warn("WARNING: customOrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),e.enableZoom=!1)}function Pe(t){if(t>1||t<0)return;const w={scale:e.scale};return new z.Tween(w).to({scale:t},800).easing(z.Easing.Cubic.Out).onUpdate(()=>{e.scale=w.scale}).start()}function ze(t){e.object.isPerspectiveCamera?Pe(e.scale*t):e.object.isOrthographicCamera?(e.object.zoom=Math.max(e.minZoom,Math.min(e.maxZoom,e.object.zoom/t)),e.object.updateProjectionMatrix(),u=!0):(console.warn("WARNING: customOrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),e.enableZoom=!1)}function Te(t){f.set(t.clientX,t.clientY)}function st(t){T.set(t.clientX,t.clientY)}function Ee(t){h.set(t.clientX,t.clientY)}function ct(t){p.set(t.clientX,t.clientY),x.subVectors(p,f).multiplyScalar(e.rotateSpeed);var w=e.domElement;I(2*Math.PI*x.x/w.clientHeight),R(2*Math.PI*x.y/w.clientHeight),f.copy(p),e.update()}function lt(t){E.set(t.clientX,t.clientY),b.subVectors(E,T),b.y>0?O(M()):b.y<0&&ze(M()),T.copy(E),e.update()}function pt(t){g.set(t.clientX,t.clientY),P.subVectors(g,h).multiplyScalar(e.panSpeed),j(P.x,P.y),h.copy(g),e.update()}function dt(t){t.deltaY<0?ze(M()):t.deltaY>0&&O(M()),e.update()}function ut(t){var w=!1;switch(t.code){case e.keys.UP:j(0,e.keyPanSpeed),w=!0;break;case e.keys.BOTTOM:j(0,-e.keyPanSpeed),w=!0;break;case e.keys.LEFT:j(e.keyPanSpeed,0),w=!0;break;case e.keys.RIGHT:j(-e.keyPanSpeed,0),w=!0;break}w&&(t.preventDefault(),e.update())}function Ce(t){if(t.touches.length==1)f.set(t.touches[0].pageX,t.touches[0].pageY);else{var w=.5*(t.touches[0].pageX+t.touches[1].pageX),L=.5*(t.touches[0].pageY+t.touches[1].pageY);f.set(w,L)}}function Se(t){if(t.touches.length==1)h.set(t.touches[0].pageX,t.touches[0].pageY);else{var w=.5*(t.touches[0].pageX+t.touches[1].pageX),L=.5*(t.touches[0].pageY+t.touches[1].pageY);h.set(w,L)}}function Le(t){var w=t.touches[0].pageX-t.touches[1].pageX,L=t.touches[0].pageY-t.touches[1].pageY,k=Math.sqrt(w*w+L*L);T.set(0,k)}function mt(t){e.enableZoom&&Le(t),e.enablePan&&Se(t)}function ft(t){e.enableZoom&&Le(t),e.enableRotate&&Ce(t)}function Me(t){if(t.touches.length==1)p.set(t.touches[0].pageX,t.touches[0].pageY);else{var w=.5*(t.touches[0].pageX+t.touches[1].pageX),L=.5*(t.touches[0].pageY+t.touches[1].pageY);p.set(w,L)}x.subVectors(p,f).multiplyScalar(e.rotateSpeed);var k=e.domElement;I(2*Math.PI*x.x/k.clientHeight),R(2*Math.PI*x.y/k.clientHeight),f.copy(p)}function Ie(t){if(t.touches.length==1)g.set(t.touches[0].pageX,t.touches[0].pageY);else{var w=.5*(t.touches[0].pageX+t.touches[1].pageX),L=.5*(t.touches[0].pageY+t.touches[1].pageY);g.set(w,L)}P.subVectors(g,h).multiplyScalar(e.panSpeed),j(P.x,P.y),h.copy(g)}function ke(t){var w=t.touches[0].pageX-t.touches[1].pageX,L=t.touches[0].pageY-t.touches[1].pageY,k=Math.sqrt(w*w+L*L);E.set(0,k),b.set(0,Math.pow(E.y/T.y,e.zoomSpeed)),O(b.y),T.copy(E)}function vt(t){e.enableZoom&&ke(t),e.enablePan&&Ie(t)}function ht(t){e.enableZoom&&ke(t),e.enableRotate&&Me(t)}function Ae(t){if(e.enabled!==!1)switch(t.pointerType){case"mouse":case"pen":xt(t);break}}function ue(t){if(e.enabled!==!1)switch(t.pointerType){case"mouse":Ne(t);case"pen":Ne(t);break}}function me(t){switch(t.pointerType){case"mouse":case"pen":gt();break}}function xt(t){t.preventDefault(),e.domElement.focus?e.domElement.focus():window.focus();var w;switch(t.button){case 0:w=e.mouseButtons.LEFT;break;case 1:w=e.mouseButtons.MIDDLE;break;case 2:w=e.mouseButtons.RIGHT;break;default:w=-1}switch(w){case F.DOLLY:if(e.enableZoom===!1)return;st(t),c=s.DOLLY;break;case F.ROTATE:if(t.ctrlKey||t.metaKey||t.shiftKey){if(e.enablePan===!1)return;Ee(t),c=s.PAN}else{if(e.enableRotate===!1)return;Te(t),c=s.ROTATE}break;case F.PAN:if(t.ctrlKey||t.metaKey||t.shiftKey){if(e.enableRotate===!1)return;Te(t),c=s.ROTATE}else{if(e.enablePan===!1)return;Ee(t),c=s.PAN}break;default:c=s.NONE}c!==s.NONE&&(e.domElement.ownerDocument.addEventListener("pointermove",ue),e.domElement.ownerDocument.addEventListener("pointerup",me),e.dispatchEvent(r))}function Ne(t){if(e.enabled!==!1)switch(t.preventDefault(),c){case s.ROTATE:if(e.enableRotate===!1)return;ct(t);break;case s.DOLLY:if(e.enableZoom===!1)return;lt(t);break;case s.PAN:if(e.enablePan===!1)return;pt(t);break}}function gt(t){e.domElement.ownerDocument.removeEventListener("pointermove",ue),e.domElement.ownerDocument.removeEventListener("pointerup",me),e.enabled!==!1&&(e.dispatchEvent(d),c=s.NONE)}function Re(t){e.enabled===!1||e.enableZoom===!1||c!==s.NONE&&c!==s.ROTATE||(t.preventDefault(),e.dispatchEvent(r),dt(t),e.dispatchEvent(d))}function Oe(t){e.enabled===!1||e.enablePan===!1||ut(t)}function De(t){if(e.enabled!==!1){switch(t.preventDefault(),t.touches.length){case 1:switch(e.touches.ONE){case G.ROTATE:if(e.enableRotate===!1)return;Ce(t),c=s.TOUCH_ROTATE;break;case G.PAN:if(e.enablePan===!1)return;Se(t),c=s.TOUCH_PAN;break;default:c=s.NONE}break;case 2:switch(e.touches.TWO){case G.DOLLY_PAN:if(e.enableZoom===!1&&e.enablePan===!1)return;mt(t),c=s.TOUCH_DOLLY_PAN;break;case G.DOLLY_ROTATE:if(e.enableZoom===!1&&e.enableRotate===!1)return;ft(t),c=s.TOUCH_DOLLY_ROTATE;break;default:c=s.NONE}break;default:c=s.NONE}c!==s.NONE&&e.dispatchEvent(r)}}function je(t){if(e.enabled!==!1)switch(t.preventDefault(),c){case s.TOUCH_ROTATE:if(e.enableRotate===!1)return;Me(t),e.update();break;case s.TOUCH_PAN:if(e.enablePan===!1)return;Ie(t),e.update();break;case s.TOUCH_DOLLY_PAN:if(e.enableZoom===!1&&e.enablePan===!1)return;vt(t),e.update();break;case s.TOUCH_DOLLY_ROTATE:if(e.enableZoom===!1&&e.enableRotate===!1)return;ht(t),e.update();break;default:c=s.NONE}}function $e(t){e.enabled!==!1&&(e.dispatchEvent(d),c=s.NONE)}function Ve(t){e.enabled!==!1&&t.preventDefault()}e.domElement.addEventListener("contextmenu",Ve),e.domElement.addEventListener("pointerdown",Ae),e.domElement.addEventListener("wheel",Re),e.domElement.addEventListener("touchstart",De),e.domElement.addEventListener("touchend",$e),e.domElement.addEventListener("touchmove",je),this.update()};te.prototype=Object.create(He.prototype);te.prototype.constructor=te;var be=function(n,o){te.call(this,n,o),this.screenSpacePanning=!1,this.mouseButtons.LEFT=F.PAN,this.mouseButtons.RIGHT=F.ROTATE,this.touches.ONE=G.PAN,this.touches.TWO=G.DOLLY_ROTATE};be.prototype=Object.create(He.prototype);be.prototype.constructor=be;const lo={name:"cameraTester",mixins:[co],data(){return{config:{viewPortSpinRatio:this.$d3.scaleLinear([-1,1],[0,1]),rank2spriteScaleRatio:this.$d3.scaleLinear([0,1,20],[2,1.5,.6]),backgroundLoader:"black",fontLoader:null,orbitControlConfig:{enableZoom:!0,zoomSpeed:3,enablePan:!1,enableRotate:!1,minDistance:0,maxDistance:2e3,enableDamping:!0,dampingFactor:.25}},control:{orbitControlInstance:null,rayCasterInstance:null},interact:{mousePosition:new C,cameraPosition:new C(0,0,2e3),cameraLookatPosition:new C(0,0,0),zoomPos:2e3,zoom:500,clickEffect:{activatedNodeInstanceList:null,activatedLineTweenList:null}},adaptedSongList:[]}},computed:{dynamicMousePosition(){}},methods:{initOrbitControl(){let{renderer:n}=this.$refs;const o=new te(n.camera,n.renderer.domElement);return this.config.orbitControlConfig instanceof Object&&Object.entries(this.config.orbitControlConfig).forEach(([e,i])=>{o[e]=i}),n.onBeforeRender(()=>{o.update()}),o},renderYearText(){let n=[1968,1969],o=[1500,500];const e=new this.THREE.MeshBasicMaterial({transparent:!0,opacity:.1}),i=this.$refs.sceneInstance;n.forEach((r,d)=>{const s=new this.THREE.TextGeometry(r+"",{size:40,height:.1,font:this.config.fontLoader});s.computeBoundingBox();const c=-.5*(s.boundingBox.max.x-s.boundingBox.min.x),v=-.5*(s.boundingBox.max.y-s.boundingBox.min.y);let l=new this.THREE.Mesh(s,e);l.renderOrder=10,l.position.set(c,v,o[d]),i.add(l)})},renderRelationGraph(n){const o=this.$refs.sceneInstance;n.forEach(e=>{const i=new this.THREE.Group;let[r,d]=e;r.pop(),this.renderLinkList(d,i),this.renderNodeList(r,"white",i),o.add(i)})},renderLinkList(n,o){const e=new this.THREE.LineBasicMaterial({opacity:.1,transparent:!0,depthWrite:!1});n.forEach(i=>{const r=[i.source.position,i.target.position],d=new Ye().setFromPoints(r);let s=new Xe(d,e);this.$refs.renderer.three.addIntersectObject(s),o.add(s)})},renderNodeList(n,o="yellow",e){const{sceneInstance:i,renderer:r}=this.$refs,d=new re({map:new ae().load("./musicData/circle.png"),color:o}),s=new this.THREE.Sprite(d);n.forEach(c=>{let v=s.clone(),l=c.rank||0;v.scale.setScalar(this.config.rank2spriteScaleRatio(l)),v.userData=this.lodash.cloneDeep(c),e?(e.add(v),r.three.addIntersectObject(v)):i.add(v),v.position.copy(c.position)})},renderNodeCardList(n){const o=this.$refs.sceneInstance;new this.THREE.SpriteMaterial,n.forEach(e=>{let i=this.drawCardCanvas(e),r=new re({map:i,color:"#ff649f"}),d=new se(r);d.position.copy(e.position),o.add(d),d.scale.set(21,12,1)})},generateNodeCanvasTexture(n){const o=document.createElement("canvas");let e=o.getContext("2d");return o.width=100,o.height=100,e.beginPath(),e.arc(50,50,50,0,2*Math.PI,!1),e.fillStyle="white",e.fill(),e.fillStyle="black",e.font="bold 56px Avenir,Helvetica",e.fillText(n==null?void 0:n.rank,32.5,65),new ce(o)},drawCardCanvas(n){const o=document.createElement("canvas");let e=o.getContext("2d");return o.width=700,o.height=400,e.fillStyle="white",e.textBaseline="top",e.font=" bold 56px Avenir,Helvetica",e.fillText(n.artist,0,0),e.font="80px Avenir,Helvetica",e.fillText(n.title,0,80),e.beginPath(),e.arc(50,220,50,0,2*Math.PI,!1),e.fillStyle="white",e.fill(),e.fillStyle="black",e.font="bold 56px Avenir,Helvetica",e.fillText(n.highestRank,32.5,195),e.font="56px Avenir,Helvetica",e.fillStyle="white",e.fillText(this.dayjs(n.releaseDate).format("LL"),120,195),new ce(o)},initLoader(){this.config.fontLoader=new xe().load("fonts/helvetiker_bold.typeface.json");let n=new Promise(e=>{new xe().load("fonts/helvetiker_regular.typeface.json",i=>{this.config.fontLoader=i,e()})}),o=new Promise(e=>{new ae().load("./backgroundTexture.png",i=>{i.wrapT=zt,this.config.backgroundLoader=i,e()})});return Promise.all([n,o])},adjustCameraLookAtPosition(){let{renderer:n}=this.$refs,{x:o,y:e}=n.three.pointer.position;this.interact.cameraLookatPosition.x=o,this.interact.cameraLookatPosition.y=-e},activateGraphLinkEffect(n){return n.map(o=>{const e={opacity:.1};return new z.Tween(e).to({opacity:1},400).onUpdate(()=>{o.material.opacity=e.opacity}).repeat(1/0).yoyo(!0).start()})},activateGraphNodeEffect(n){const o=this.$refs.sceneInstance;let e=[];return n.map(r=>{let{userData:d}=r,s=this.generateNodeCanvasTexture(d),c=new re({map:s}),v=new se(c);e.push(v),v.position.copy(d.position);const l={x:.5,y:.5,z:.5},m=new z.Tween(l).easing(z.Easing.Cubic.Out).to({x:3,y:3},400).onUpdate(()=>{v.scale.set(l.x,l.y,l.z)}),a=new z.Tween(l).easing(z.Easing.Cubic.Out).to({x:2,y:2},400).onUpdate(()=>{v.scale.set(l.x,l.y,l.z)});return m.chain(a),{tweenExpand:m,instance:v}}).forEach(({tweenExpand:r,instance:d},s)=>{o.add(d),r.delay(s*150).start()}),e},_checkNodeInactivatedNodeInstanceList(n){let o=!1,{activatedNodeInstanceList:e}=this.interact.clickEffect;return e&&n&&(o=e.find(i=>n===i)),o},deactivateClickEffects(){let{activatedNodeInstanceList:n,activatedLineTweenList:o}=this.interact.clickEffect;if(n&&o){debugger;n.forEach(e=>{e.removeFromParent()}),o.forEach(e=>{z.remove(e)}),this.lodash.assign(this.interact.clickEffect,{activatedNodeInstanceList:null,activatedLineTweenList:null})}},dispatchRelationExpansion(){var o;let{pointer:n}=this.$refs.renderer.three;if(this.control.rayCasterInstance){let e=this.control.rayCasterInstance.intersect(n.positionN,n.intersectObjects,!1);if(e.length>0){debugger;let i=e[0].object,r=(i==null?void 0:i.parent)instanceof this.THREE.Group;if(!this._checkNodeInactivatedNodeInstanceList(i)&&(this.deactivateClickEffects(),r)){let s=[],c=[];((o=i==null?void 0:i.parent)==null?void 0:o.children).forEach(a=>{a instanceof Xe?c.push(a):a instanceof se&&s.push(a)});let l=this.activateGraphLinkEffect(c),m=this.activateGraphNodeEffect(s);this.lodash.assign(this.interact.clickEffect,{activatedNodeInstanceList:m,activatedLineTweenList:l})}}}}},async mounted(){var e;await this.initLoader(),this.control.orbitControlInstance=this.initOrbitControl(),this.control.rayCasterInstance=new ge({camera:(e=this.$refs.camera)==null?void 0:e.camera});let[n,o]=await this.initFilteredRelationMapData();this.renderNodeCardList(n),this.renderRelationGraph(o),this.renderYearText(),window.addEventListener("mousemove",this.adjustCameraLookAtPosition),window.addEventListener("click",this.dispatchRelationExpansion)}};function po(n,o,e,i,r,d){const s=_("Camera"),c=_("Scene"),v=_("Renderer");return U(),he(v,{ref:"renderer",antialias:"",resize:"window",pointer:""},{default:A(()=>[y(s,{far:550,fov:50,aspect:1,ref:"camera",position:r.interact.cameraPosition,lookAt:r.interact.cameraLookatPosition},null,8,["position","lookAt"]),y(c,{ref:"sceneInstance",background:r.config.backgroundLoader},null,8,["background"])]),_:1},512)}var uo=H(lo,[["render",po]]);async function mo(n,o){const e=Object.freeze({HOVER:1<<0,ACTIVATE:1<<1,INITIAL:1<<2,UPDATE:1<<3}),i="click to input something",r=16;await(async()=>new Promise(l=>{new xe().load("fonts/gentilis_regular.typeface.json",m=>{l()})}))();const s=(l,m="click to input something")=>{const a=document.createElement("canvas");let u=a.getContext("2d");return a.width=l.w*10,a.height=l.h*10,u.fillStyle="black",u.textBaseline="top",u.font=`${r}px Avenir,Helvetica`,u.fillText(m,r/2,a.height/2-r/2),a},c=(l,m,a,u,f)=>{let p=l.getContext("2d");p&&(p.clearRect(0,0,u.w*10,u.h*10),p.fillStyle="black",p.textBaseline="top",p.font=`${r}px Avenir,Helvetica`,p.textAlign="center",p.textBaseline="middle",p.fillText(a,l.width/2,l.height/2),p.lineWidth=5,p.strokeStyle=f,p.strokeRect(0,0,l.width,l.height),m.needsUpdate=!0)};return{createTextSelectorInstance:(l,m,a,u,f=!1)=>{const p=new Ze;let x=N("");p.position.set(l,m,0);let h={x:l,y:m,w:a,h:u},g=s(h),P=new ce(g),T={geometry:new ye(a,u),material:new le({transparent:!0,opacity:.3,map:P,side:_e})},E=new K(T.geometry,T.material);f&&E.rotateY(Math.PI);let b=N(e.INITIAL);const S=we(()=>Object.freeze({[e.HOVER]:"green",[e.ACTIVATE]:"red",[e.INITIAL]:"white",[e.UPDATE]:"black"})[b.value]||"white");return Tt(()=>{c(g,P,x.value||i,h,S.value)}),o.set(p,{focus:()=>{b.value=e.HOVER},clear:()=>{b.value=e.INITIAL},activate:()=>(b.value=e.ACTIVATE,x.value),update:M=>{x.value=M}}),p.add(E),n.add(p),E}}}function fo(){const n=N(null),o=[],e=new WeakMap,i=[[-13.4,13.4,21,2.2],[-13.4,11.4,21,2.2],[-13.4,9.4,21,2.2],[-13.4,7.4,21,2.2],[21.4,13.4,21,2.2],[21.4,11.4,21,2.2],[21.4,9.4,21,2.2],[21.4,7.4,21,2.2],[-7,5.8,58,2.2,!0],[-7,7.8,58,2.2,!0],[-7,9.8,58,2.2,!0],[-7,11.8,58,2.2,!0],[-7,.7,58,2.2,!0],[-7,-1.3,58,2.2,!0],[-7,-3.3,58,2.2,!0],[-7,-5.3,58,2.2,!0],[-7,-10.5,58,2.2,!0],[-7,-12.5,58,2.2,!0],[-7,-14.5,58,2.2,!0],[-7,-16.5,58,2.2,!0]],r=s=>new Promise((c,v)=>{new ae().load(s,l=>{c(l)},void 0,l=>{v(l)})});return{plane:n,createPlaneInstance:async s=>{let c=new ye(108,80),[v,l]=await Promise.all([r("./cbill/bill-back.png"),r("./cbill/bill-front.png")]),m=new le({map:v,side:_e,depthWrite:!1}),a=new le({map:l,side:_e,depthWrite:!1}),u=new K(c.clone(),a),f=new K(c.clone(),m);u.position.set(0,0,0),f.position.set(0,0,0),f.geometry.rotateY(Math.PI),s.add(u),s.add(f);const p=await mo(s,e);return i.forEach(x=>{o.push(p.createTextSelectorInstance.apply(p,x))}),o},instanceMap:e}}const vo={setup(){const n=pe(new C(0,0,-10)),o=N(null),e=N(null),i=N(null),r=N(""),d=N(null),s=pe({x:0,y:0,z:0}),c=pe({x:0,y:0,z:10}),v=we(()=>d.value==="edit"),l=we(()=>d.value==="display");let m=null,a=null,u=null;const{plane:f,createPlaneInstance:p,instanceMap:x}=fo();qe(r,b=>{u&&u.update(b)}),qe(d,(b,S)=>{if(b!==S)switch(b){case"display":{h();break}case"edit":{g();break}}});const h=async()=>{},g=()=>{s.y=s.y%(Math.PI*2);const b=new z.Tween(s).to({x:0,y:0,z:0},500).start(),S=new z.Tween(e.value.three.camera.position).to({x:0,y:0,z:10},500).start();return[b,S]},P=(b,S)=>{b.preventDefault(),d.value=S},T=()=>{var b;a&&v.value&&(u=a,(b=i==null?void 0:i.value)==null||b.focus(),r.value=u.activate())},E=()=>{var S;let{pointer:b}=(S=e.value)==null?void 0:S.three;if(m&&v.value){let M=m.intersect(b.positionN,b.intersectObjects,!1);if(M.length>0){let I=M[0].object;I!==a&&(a&&a.clear(),u&&(u.clear(),u=null),a=x.get(I.parent),a==null||a.focus())}else a&&(a.clear(),a=null)}};return We(()=>{p(o.value).then(b=>{var S,M;d.value="display",b.forEach(I=>{e.value.three.addIntersectObject(I)}),(M=(S=e==null?void 0:e.value)==null?void 0:S.three)==null||M.cameraCtrl.saveState(),e.value.onBeforeRender(()=>{z.update(),l.value&&(s.y+=.005)})}),m=new ge({camera:e.value.camera}),window.addEventListener("mousemove",E),window.addEventListener("click",T)}),{plane:f,renderer:e,createPlaneInstance:p,cbillGroup:o,rotateCntl:s,userInput:r,hiddenInput:i,toggleMode:P,orbitTarget:n,typeControl:d,cameraPosCntl:c}}},ho={class:"container"},xo={class:"control-block"},go={key:0},yo={key:1,class:"control-block"};function _o(n,o,e,i,r,d){const s=_("Camera"),c=_("AmbientLight"),v=_("Group"),l=_("Scene"),m=_("Renderer");return U(),q("div",ho,[de("div",xo,[Et(de("input",{ref:"hiddenInput","onUpdate:modelValue":o[0]||(o[0]=a=>i.userInput=a),class:"hidden-input"},null,512),[[Ct,i.userInput]]),i.typeControl?(U(),q("div",yo,[de("a",{href:"#",onClick:o[1]||(o[1]=a=>i.toggleMode(a,"edit"))},"edit mode"),de("a",{href:"#",onClick:o[2]||(o[2]=a=>i.toggleMode(a,"display"))},"display mode")])):(U(),q("div",go," loading texture image data... "))]),y(m,{ref:"renderer","orbit-ctrl":{target:i.orbitTarget},antialias:"",pointer:"",resize:"window"},{default:A(()=>[y(s,{ref:"camera",lookAt:i.orbitTarget,position:i.cameraPosCntl},null,8,["lookAt","position"]),y(l,{ref:"scene"},{default:A(()=>[y(c),y(v,{ref:"cbillGroup",position:i.orbitTarget,rotation:i.rotateCntl,scale:{x:.25,y:.25,z:.25}},null,8,["position","rotation","scale"])]),_:1},512)]),_:1},8,["orbit-ctrl"])])}var wo=H(vo,[["render",_o],["__scopeId","data-v-6da58860"]]);function bo(){const n=Ke([0,15],[5,12]),o=Ke([0,15],[1,2]),e=async()=>(await Lt("./gitIndex/github-index-0929.json")).map(a=>{let{gm:u,gop:f}=a,p=[f.lon,f.lat],x=[u.lon,u.lat],[h,g]=[i(p),i(x)],P=r(h,g);return[h,P,g,a]}).sort((a,u)=>{let[f,p]=[a[0],u[1]];return Math.abs(f.x)>Math.abs(p.x)}).map(a=>{let[u,f,p,x]=a;const g=new Mt(u,f,p).getPoints(100),P=new Qe;P.setPoints([]);const T=new Je({color:"lightGreen",lineWidth:.05,useAlphaMap:0}),E=new K(P,T);return E.userData=x,E.raycast=It,[E,g,x]}),i=(m=[],a=5)=>new C().setFromSphericalCoords(a,ee.degToRad(90-m[1]),ee.degToRad(180+m[0])),r=(m,a)=>{let u=n(m.distanceTo(a)),[f,p]=[new W().setFromVector3(m),new W().setFromVector3(a)],x=Math.abs(f.theta-p.theta)>Math.PI,h=p.theta;return x&&(h<0?h=Math.PI*2+h:h=Math.PI*-2+h),new C().setFromSphericalCoords(u,(f.phi+p.phi)/2,(f.theta+h)/2)},d=async(m,a=N([]))=>{let u=await e(),[f,p]=s(u),x=l(m,u,f);return a.value=p,x},s=m=>{let a=[];return m.forEach((f,p)=>{const[,x]=f;let h=x[0],g=x[x.length-1];a.push({impactPosition:h,impactMaxRadius:o(h.distanceTo(g)),impactRatio:0},{impactPosition:g,impactMaxRadius:o(h.distanceTo(g)),impactRatio:0})}),[a.map((f,p)=>new z.Tween(f).to({impactRatio:1},ee.randInt(1e3,1500)).onComplete(()=>{f.impactRatio=0})),a]},c=(m,a,u,f)=>{let p=new Ze,x=new W().setFromVector3(u[0]),h=x.clone();h.radius=4.3;let g=x.clone();g.radius=.5;let P=x.clone();P.radius=.6;let T=new C().setFromSpherical(P),E=new C().setFromSpherical(g);const b=new Qe;b.setPoints([new C(0,0,0),E]);const S=new Je({color:"blue",lineWidth:.03,useAlphaMap:0}),M=new Ye().setFromPoints([T]),I=new St({size:.2}),R=new K(b,S);R.userData=a;const X=new et(M,I);p.add(R,X),p.position.set(new C().setFromSpherical(h)),m.add(p);const oe=new z.Tween(new C().setFromSpherical(x)).delay(5e3).to(new C().setFromSpherical(h),3e3).onStart(()=>{R.userData.enableDisplayCommit=!1}).onUpdate(O=>{p.position.set(O.x,O.y,O.z)}),j=new z.Tween(new C().setFromSpherical(h)).delay(Math.random()*2e3).onStart(()=>{f&&f.start()}).to(new C().setFromSpherical(x),3e3).onUpdate(O=>{p.position.set(O.x,O.y,O.z)}).onComplete(()=>{R.userData.enableDisplayCommit=!0});return j.chain(oe),j},v=(m,a,u,f,p)=>{m.add(a);let x={counter:0},h=new z.Tween({counter:0}).delay(5e3).easing(z.Easing.Cubic.InOut).to({counter:u.length},2500).onStart(()=>{a.userData.enableDisplayCommit=!1}).onUpdate(P=>{let T=u.slice(P.counter-1,u.length);a.geometry.setPoints(T)}),g=new z.Tween(x).delay(Math.random()*2e3).onStart(()=>{f&&f.start()}).to({counter:u.length},2500).onUpdate(()=>{let P=u.slice(0,x.counter);a.geometry.setPoints(P)}).onComplete(()=>{a.userData.enableDisplayCommit=!0,p.start()});return g.chain(h),g},l=(m,a=[],u=[])=>a.map((f,p)=>{const[x,h,g]=f;return h[0].equals(h[h.length-1])?c(m,g,h,u[p*2]):v(m,x,h,u[p*2],u[p*2+1])});return{generateCommitTweenList:d}}function Po(){const n=new Image,[o,e]=[360,181],i=[],r=N([]);let{generateCommitTweenList:d}=bo();const s=()=>new Promise(l=>{n.src="./gitIndex/globalMap.png",n.onload=()=>{l()}}),c=async l=>{let m=0,a=await d(l,r);Nt(()=>{m=m>=a.length?m%a.length+3:m+3,a.slice(m-3,m).forEach(f=>f.start())},1e3)};return{initCompositeGlobePlane:async l=>{await s();let m=document.createElement("canvas");m.width=o,m.height=e;let a=m.getContext("2d"),u=new kt;a.drawImage(n,0,0,o,e),a.fillStyle="white";let f=a.getImageData(0,0,o,e).data;for(let g=0;g<e;g++)for(let P=0;P<o;P++){let T=(o*g+P)*4+3;if(f[T]>128){let b=new C().setFromSphericalCoords(5,ee.degToRad(g),ee.degToRad(P)),S=b.toArray();u.lookAt(b),u.updateMatrix();let M=.03,I=new ye(M,M);I.applyMatrix4(u.matrix),I.translate.apply(I,S);let R=new Array(4).fill(S).flat();I.setAttribute("center",new ie(R,3)),i.push(I)}}await c(l);let p=At(i,!0),x=new le({color:6697898,onBeforeCompile:g=>{let P=r.value.length;g.uniforms.impacts={value:r.value},g.vertexShader=`
      	struct impact {
          vec3 impactPosition;
          float impactMaxRadius;
          float impactRatio;
        };
      	uniform impact impacts[${r.value.length}];

        attribute vec3 center;
        attribute float scale;

        varying float vFinalStep;

        ${g.vertexShader}
      `.replace("#include <begin_vertex>",`#include <begin_vertex>
        float finalStep = 0.0;
        for (int i = 0; i < ${P};i++){

          float dist = distance(center, impacts[i].impactPosition);
          float curRadius = impacts[i].impactMaxRadius * impacts[i].impactRatio;
          float sstep = smoothstep(0., curRadius, dist) - smoothstep(curRadius - ( 0.25 * impacts[i].impactRatio ), curRadius, dist);
          sstep *= 1. - impacts[i].impactRatio;
          finalStep += sstep;

        }
        finalStep = clamp(finalStep, 0., 1.);
        vFinalStep = finalStep;
        transformed = (position - center) * mix(1., scale * 1.25, finalStep) + center; // scale on wave
        transformed += normal * finalStep * 0.125; // lift on wave
        `),g.fragmentShader=`
        varying float vFinalStep;
        ${g.fragmentShader}
        `.replace("vec4 diffuseColor = vec4( diffuse, opacity );",`
        if (length(vUv - 0.5) > 0.5) discard; // make points circular
        vec3 grad = mix(vec3(1, 0.75, 1), vec3(0, 1, 1), clamp(length(vUv - 0.5) / 0.5, 0., 1.)); // circular gradient
        vec3 col = mix(diffuse, grad, vFinalStep); // color on wave
        vec4 diffuseColor = vec4( col , opacity ); 
        `)}});x.defines={USE_UV:""};const h=new K(p,x);return l.add(h),h}}}function zo(){let o=(()=>{const c=document.createElement("canvas");return c.width=670,c.height=150,c})(),e=new ce(o),i=new se(new re({map:e,depthTest:!1,depthWrite:!1,fog:!1}));i.scale.set(6.7,1.5,1),i.renderOrder=-1;const r=(c={})=>{let v=o.getContext("2d");v&&(v.clearRect(0,0,670,150),v.fillStyle="rgba(22,22,22,0.5)",v.fillRect(0,0,670,150),v.fillStyle="white",v.font=`${24}px Avenir,Helvetica`,v.fillText(`#${c.pr}	${c.nwo}`,20,40),v.fillText(`${c.l}	* Opened in ${c.uol}`,20,80),v.fillText(`merged at ${c.ma} in ${c.uml}`,20,120),v.lineWidth=5,e.needsUpdate=!0,console.dir("canvas updated"))};return{toggleCommitInfoPlane:(c=!0,v="",l=new C)=>{i.visible=c,i.position.set(l.x,l.y,6),v&&c&&r(v)},initCommitInfoPlane:c=>{c.add(i)}}}const To={name:"gitIndex",setup(){let n=null,o=N(.001);const{initCompositeGlobePlane:e}=Po(),{initCommitInfoPlane:i,toggleCommitInfoPlane:r}=zo(),d=N(null),s=N(null),c=N(null),v=pe({x:0,y:Math.PI/3,z:0}),l=()=>{var u,f;let{pointer:m}=(u=c.value)==null?void 0:u.three,a=n.intersect(m.positionN,m.intersectObjects,!1);if(a.length>0){let p=a[0].object;((f=p==null?void 0:p.userData)==null?void 0:f.enableDisplayCommit)&&(o.value=0,r(!0,p==null?void 0:p.userData,m.positionV3))}else o.value=.001,r(!1)};return We(async()=>{var u,f,p,x;i(d.value);let m=(f=(u=s.value)==null?void 0:u.o3d)==null?void 0:f.children[0],a=await e(s.value);(x=(p=s.value)==null?void 0:p.o3d)==null||x.children.forEach(h=>{h.children.length>0||c.value.three.addIntersectObject(h)}),c.value.three.removeIntersectObject(m),c.value.three.removeIntersectObject(a),c.value.onBeforeRender(()=>{z.update(),v.y+=o.value}),n=new ge({camera:c.value.camera}),window.addEventListener("mousemove",l)}),{scene:d,renderer:c,parentGroup:s,rotateCntl:v}}};function Eo(n,o,e,i,r,d){const s=_("Camera"),c=_("PointLight"),v=_("SphereGeometry"),l=_("PhongMaterial"),m=_("Mesh"),a=_("Group"),u=_("Scene"),f=_("RenderPass"),p=_("FXAAPass"),x=_("UnrealBloomPass"),h=_("EffectComposer"),g=_("Renderer");return U(),q("div",null,[y(g,{ref:"renderer","orbit-ctrl":{enableRotate:!1},pointer:"",resize:"window"},{default:A(()=>[y(s,{far:20,fov:50,position:{x:0,y:5,z:12}}),y(u,{ref:"scene"},{default:A(()=>[y(c,{ref:"light1",intensity:.3,position:{x:-35,y:35,z:-10},color:"#0E09DC"},null,8,["intensity"]),y(c,{ref:"light2",intensity:.3,position:{x:-25,y:25,z:-10},color:"#1CD1E1"},null,8,["intensity"]),y(c,{ref:"light3",intensity:.3,position:{x:-15,y:15,z:-10},color:"#18C02C"},null,8,["intensity"]),y(c,{ref:"light4",intensity:.3,position:{x:-5,y:5,z:-10},color:"#ee3bcf"},null,8,["intensity"]),y(c,{ref:"light5",intensity:1,position:{x:-9,y:11,z:-15},color:"white"},null,512),y(a,{ref:"parentGroup",rotation:i.rotateCntl},{default:A(()=>[y(m,null,{default:A(()=>[y(v,{heightSegments:25,radius:5,widthSegments:25}),y(l,{props:{emissive:"#043a8a",emissiveIntensity:.3},color:"white"},null,8,["props"])]),_:1})]),_:1},8,["rotation"])]),_:1},512),y(h,null,{default:A(()=>[y(f),y(p),y(x,{strength:.8})]),_:1})]),_:1},512)])}var Co=H(To,[["render",Eo]]);const it=`
uniform vec3 color;
uniform vec3 diffuse;
uniform float opacity;

#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {
	#include <clipping_planes_fragment>

	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );

	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>

	outgoingLight = diffuseColor.rgb;

	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
  gl_FragColor = vec4( color * vColor, 1.0 );
  
}
`,rt=`
vec4 permute(vec4 x){return mod(((x*34.)+1.)*x,289.);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}

float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);
    const vec4 D=vec4(0.,.5,1.,2.);
    
    // First corner
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    
    // Other corners
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    
    //  x0 = x0 - 0. + 0.0 * C
    vec3 x1=x0-i1+1.*C.xxx;
    vec3 x2=x0-i2+2.*C.xxx;
    vec3 x3=x0-1.+3.*C.xxx;
    
    // Permutations
    i=mod(i,289.);
    vec4 p=permute(permute(permute(
        i.z+vec4(0.,i1.z,i2.z,1.))
        +i.y+vec4(0.,i1.y,i2.y,1.))
        +i.x+vec4(0.,i1.x,i2.x,1.));
        
        // Gradients
        // ( N*N points uniformly over a square, mapped onto an octahedron.)
        float n_=1./7.;// N=7
        vec3 ns=n_*D.wyz-D.xzx;
        
        vec4 j=p-49.*floor(p*ns.z*ns.z);//  mod(p,N*N)
        
        vec4 x_=floor(j*ns.z);
        vec4 y_=floor(j-7.*x_);// mod(j,N)
        
        vec4 x=x_*ns.x+ns.yyyy;
        vec4 y=y_*ns.x+ns.yyyy;
        vec4 h=1.-abs(x)-abs(y);
        
        vec4 b0=vec4(x.xy,y.xy);
        vec4 b1=vec4(x.zw,y.zw);
        
        vec4 s0=floor(b0)*2.+1.;
        vec4 s1=floor(b1)*2.+1.;
        vec4 sh=-step(h,vec4(0.));
        
        vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
        vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
        
        vec3 p0=vec3(a0.xy,h.x);
        vec3 p1=vec3(a0.zw,h.y);
        vec3 p2=vec3(a1.xy,h.z);
        vec3 p3=vec3(a1.zw,h.w);
        
        //Normalise gradients
        vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
        p0*=norm.x;
        p1*=norm.y;
        p2*=norm.z;
        p3*=norm.w;
        
        // Mix final noise value
        vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
        m=m*m;
        return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),
        dot(p2,x2),dot(p3,x3)));
    }
    
    vec3 snoiseVec3(vec3 x){
            return vec3(snoise(vec3(x)*2.-1.),
            snoise(vec3(x.y-19.1,x.z+33.4,x.x+47.2))*2.-1.,
            snoise(vec3(x.z+74.2,x.x-124.5,x.y+99.4)*2.-1.)
        );
    }

vec3 curlNoise(vec3 p){
    const float e=.1;
    vec3 dx=vec3(e,0.,0.);
    vec3 dy=vec3(0.,e,0.);
    vec3 dz=vec3(0.,0.,e);
    
    vec3 p_x0=snoiseVec3(p-dx);
    vec3 p_x1=snoiseVec3(p+dx);
    vec3 p_y0=snoiseVec3(p-dy);
    vec3 p_y1=snoiseVec3(p+dy);
    vec3 p_z0=snoiseVec3(p-dz);
    vec3 p_z1=snoiseVec3(p+dz);
    
    float x=p_y1.z-p_y0.z-p_z1.y+p_z0.y;
    float y=p_z1.x-p_z0.x-p_x1.z+p_x0.z;
    float z=p_x1.y-p_x0.y-p_y1.x+p_y0.x;
    
    const float divisor=1./(2.*e);
    return normalize(vec3(x,y,z)*divisor);
}

uniform float size;
uniform float scale;

#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>


uniform float uTime;
uniform float uProgress;
varying vec2 vUv;
attribute vec3 customColor;
void main(){


	#include <color_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	vec3 noise=curlNoise(vec3(transformed.x*.02,transformed.y*.008,transformed.z*.05));
	vec3 distortion=vec3(transformed.x,transformed.y,transformed.z)*noise*uProgress*3.;
	transformed=transformed+distortion;
	#include <project_vertex>
	#ifdef USE_SIZEATTENUATION

		bool isPerspective = isPerspectiveMatrix( projectionMatrix );

		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );

	#endif

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
  vColor = customColor;

  gl_PointSize=2.;
  vUv=uv;
}
`,So=`
uniform vec3 color;
uniform vec3 diffuse;
uniform float opacity;

#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {
	#include <clipping_planes_fragment>

	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );

	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>

	outgoingLight = diffuseColor.rgb;

	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
  gl_FragColor = vec4( color * vColor, 1.0 );
	

}
`,Lo=`
uniform float size;
uniform float scale;

#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform float uTime;
uniform float uProgress;
varying vec2 vUv;
attribute vec3 customColor;
void main(){
	#include <color_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>

	gl_PointSize = size;

	#ifdef USE_SIZEATTENUATION

		bool isPerspective = isPerspectiveMatrix( projectionMatrix );

		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );

	#endif

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
	vColor = customColor;
}
`,Mo=Object.freeze({uTime:{value:0},uProgress:{value:0},color:{value:new J(16777215)}});const Io={name:"particleMorph",data(){return{config:{noiseValueTransitionScale:this.$d3.scaleLinear([0,1],[0,3]),clock:new ve},tweenInstance:null}},mounted(){const n=this.$refs.renderer;let o=this.initBoxGeo();const e=new Rt({vertexColors:!0,vertexShader:rt,uniforms:Mo,fragmentShader:it});let i=new et(o,e);i.position.set(0,0,-300),i.rotation.y=Math.PI/4,this.$refs.scene.add(i);const r=i.geometry.getAttribute("position"),d=[],s=new J("skyblue");for(let v=0,l=r.count;v<l;v++)s.toArray(d,v*3);i.geometry.setAttribute("customColor",new ie(d,3)),n.onBeforeRender(()=>{i.rotation.x+=.01,z.update()}),this.initMorphTween(i).start()},methods:{initMorphTween(n){let o=new z.Tween(n.material.uniforms.uProgress).delay(2e3).to({value:1},3e3),e=new z.Tween(n.material.uniforms.uProgress).delay(2e3).to({value:1},3e3),i=new z.Tween(n.material.uniforms.uProgress).delay(2e3).to({value:0},3e3),r=new z.Tween(n.morphTargetInfluences).delay(2e3).to({0:0,1:1},3e3),d=new z.Tween(n.morphTargetInfluences).delay(2e3).to({0:1,1:0},3e3).onComplete(()=>{o.start()});return o.chain(r,i),r.chain(e),e.chain(d,i),o},initGUICtrl(n){const o=new Ot,e={renderShader:"noiseShader",reset:()=>this.resetInstanceTween(n),title:"morphShader"};o.remember(e),o.add(e,"title");const i=o.add(e,"renderShader",["noiseShader","basicShader"]);o.add(e,"reset"),i.onChange(r=>{r==="basicShader"?(n.material.vertexShader=Lo,n.material.fragmentShader=So):(n.material.vertexShader=rt,n.material.fragmentShader=it),n.material.needsUpdate=!0,this.resetInstanceTween()})},resetInstanceTween(n){n.material.uniforms.uProgress=0,n.morphTargetInfluences={0:1,1:0},z.removeAll(),this.tweenInstance.start()},initBoxGeo(){let n=[new Dt(150,150,150,100,100,100),new jt(80,40,40,80)],o=n.map((i,r)=>{const d=i.getAttribute("position"),s=`target${r}`;return d.name=s,d}),e=n[0];return e.morphAttributes.position=o,e}}};function ko(n,o,e,i,r,d){const s=_("Camera"),c=_("PointLight"),v=_("Scene"),l=_("Renderer");return U(),he(l,{ref:"renderer",antialias:"","orbit-ctrl":"",resize:"window"},{default:A(()=>[y(s,{position:{z:10}}),y(v,{ref:"scene"},{default:A(()=>[y(c,{position:{y:50,z:50,x:25}})]),_:1},512)]),_:1},512)}var Ao=H(Io,[["render",ko]]),No=[{path:"/polygonExplosion",component:oo},{path:"/planeExplosion",component:io},{path:"/cameraTester",component:uo},{path:"/cbill",component:wo},{path:"/gitIndex",component:Co},{path:"/morph",component:Ao}];tt.extend($t);const Ro=Vt({history:Ut(),routes:No}),Y=Ft(Wt);Y.use(Ro);Y.use(Gt);Y.mount("#app");Y.config.globalProperties.THREE=Ht;Y.config.globalProperties.$d3=Bt;Y.config.globalProperties.dayjs=tt;Y.config.globalProperties.lodash=Yt;
