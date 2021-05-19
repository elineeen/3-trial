import {
    Matrix4,
    Vector2
} from 'three';


export const defaultVertexShader = `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`


const SAOShader = {
    defines: {
        'NUM_SAMPLES': 7,
        'NUM_RINGS': 4,
        'NORMAL_TEXTURE': 0,
        'DIFFUSE_TEXTURE': 0,
        'DEPTH_PACKING': 1,
        'PERSPECTIVE_CAMERA': 1
    },
    uniforms: {

        'tDepth': { value: null },
        'tDiffuse': { value: null },
        'tNormal': { value: null },
        'size': { value: new Vector2( 512, 512 ) },

        'cameraNear': { value: 1 },
        'cameraFar': { value: 100 },
        'cameraProjectionMatrix': { value: new Matrix4() },
        'cameraInverseProjectionMatrix': { value: new Matrix4() },

        'scale': { value: 1.0 },
        'intensity': { value: 0.1 },
        'bias': { value: 0.5 },

        'minResolution': { value: 0.0 },
        'kernelRadius': { value: 100.0 },
        'randomSeed': { value: 0.0 }
    },
    vertexShader: /* glsl */`
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

    fragmentShader: /* glsl */`
		#include <common>
		varying vec2 vUv;
		#if DIFFUSE_TEXTURE == 1
		uniform sampler2D tDiffuse;
		#endif
		uniform sampler2D tDepth;
		#if NORMAL_TEXTURE == 1
		uniform sampler2D tNormal;
		#endif
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraInverseProjectionMatrix;
		uniform float scale;
		uniform float intensity;
		uniform float bias;
		uniform float kernelRadius;
		uniform float minResolution;
		uniform vec2 size;
		uniform float randomSeed;
		// RGBA depth
		#include <packing>
		vec4 getDefaultColor( const in vec2 screenPosition ) {
			#if DIFFUSE_TEXTURE == 1
			return texture2D( tDiffuse, vUv );
			#else
			return vec4( 1.0 );
			#endif
		}
		float getDepth( const in vec2 screenPosition ) {
			#if DEPTH_PACKING == 1
			return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
			#else
			return texture2D( tDepth, screenPosition ).x;
			#endif
		}
		float getViewZ( const in float depth ) {
			#if PERSPECTIVE_CAMERA == 1
			return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
			#else
			return orthographicDepthToViewZ( depth, cameraNear, cameraFar );
			#endif
		}
		vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {
			float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];
			vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );
			clipPosition *= clipW; // unprojection.
			return ( cameraInverseProjectionMatrix * clipPosition ).xyz;
		}
		vec3 getViewNormal( const in vec3 viewPosition, const in vec2 screenPosition ) {
			#if NORMAL_TEXTURE == 1
			return unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );
			#else
			return normalize( cross( dFdx( viewPosition ), dFdy( viewPosition ) ) );
			#endif
		}
		float scaleDividedByCameraFar;
		float minResolutionMultipliedByCameraFar;
		float getOcclusion( const in vec3 centerViewPosition, const in vec3 centerViewNormal, const in vec3 sampleViewPosition ) {
			vec3 viewDelta = sampleViewPosition - centerViewPosition;
			float viewDistance = length( viewDelta );
			float scaledScreenDistance = scaleDividedByCameraFar * viewDistance;
			return max(0.0, (dot(centerViewNormal, viewDelta) - minResolutionMultipliedByCameraFar) / scaledScreenDistance - bias) / (1.0 + pow2( scaledScreenDistance ) );
		}
		// moving costly divides into consts
		const float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );
		const float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );
		float getAmbientOcclusion( const in vec3 centerViewPosition ) {
			// precompute some variables require in getOcclusion.
			scaleDividedByCameraFar = scale / cameraFar;
			minResolutionMultipliedByCameraFar = minResolution * cameraFar;
			vec3 centerViewNormal = getViewNormal( centerViewPosition, vUv );
			// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
			float angle = rand( vUv + randomSeed ) * PI2;
			vec2 radius = vec2( kernelRadius * INV_NUM_SAMPLES ) / size;
			vec2 radiusStep = radius;
			float occlusionSum = 0.0;
			float weightSum = 0.0;
			for( int i = 0; i < NUM_SAMPLES; i ++ ) {
				vec2 sampleUv = vUv + vec2( cos( angle ), sin( angle ) ) * radius;
				radius += radiusStep;
				angle += ANGLE_STEP;
				float sampleDepth = getDepth( sampleUv );
				if( sampleDepth >= ( 1.0 - EPSILON ) ) {
					continue;
				}
				float sampleViewZ = getViewZ( sampleDepth );
				vec3 sampleViewPosition = getViewPosition( sampleUv, sampleDepth, sampleViewZ );
				occlusionSum += getOcclusion( centerViewPosition, centerViewNormal, sampleViewPosition );
				weightSum += 1.0;
			}
			if( weightSum == 0.0 ) discard;
			return occlusionSum * ( intensity / weightSum );
		}
		void main() {
			float centerDepth = getDepth( vUv );
			if( centerDepth >= ( 1.0 - EPSILON ) ) {
				discard;
			}
			float centerViewZ = getViewZ( centerDepth );
			vec3 viewPosition = getViewPosition( vUv, centerDepth, centerViewZ );
			float ambientOcclusion = getAmbientOcclusion( viewPosition );
			gl_FragColor = getDefaultColor( vUv );
			gl_FragColor.xyz *=  1.0 - ambientOcclusion;
		}`

};
export const customNoiseShaderMap=Object.freeze({
    curlNoise:{
        vertexShader:`
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
        `,
        fragmentShader:`
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
    `
    },
    SAOTester:{
        vertexShader:/* glsl */`
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,
        fragmentShader:`
        #include <common>
		varying vec2 vUv;
		#if DIFFUSE_TEXTURE == 1
		uniform sampler2D tDiffuse;
		#endif
		uniform sampler2D tDepth;
		#if NORMAL_TEXTURE == 1
		uniform sampler2D tNormal;
		#endif
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraInverseProjectionMatrix;
		uniform float scale;
		uniform float intensity;
		uniform float bias;
		uniform float kernelRadius;
		uniform float minResolution;
		uniform vec2 size;
		uniform float randomSeed;
		// RGBA depth
		#include <packing>
		vec4 getDefaultColor( const in vec2 screenPosition ) {
			#if DIFFUSE_TEXTURE == 1
			return texture2D( tDiffuse, vUv );
			#else
			return vec4( 1.0 );
			#endif
		}
		float getDepth( const in vec2 screenPosition ) {
			#if DEPTH_PACKING == 1
			return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
			#else
			return texture2D( tDepth, screenPosition ).x;
			#endif
		}
		float getViewZ( const in float depth ) {
			#if PERSPECTIVE_CAMERA == 1
			return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
			#else
			return orthographicDepthToViewZ( depth, cameraNear, cameraFar );
			#endif
		}
		vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {
			float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];
			vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );
			clipPosition *= clipW; // unprojection.
			return ( cameraInverseProjectionMatrix * clipPosition ).xyz;
		}
		vec3 getViewNormal( const in vec3 viewPosition, const in vec2 screenPosition ) {
			#if NORMAL_TEXTURE == 1
			return unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );
			#else
			return normalize( cross( dFdx( viewPosition ), dFdy( viewPosition ) ) );
			#endif
		}
		float scaleDividedByCameraFar;
		float minResolutionMultipliedByCameraFar;
		float getOcclusion( const in vec3 centerViewPosition, const in vec3 centerViewNormal, const in vec3 sampleViewPosition ) {
			vec3 viewDelta = sampleViewPosition - centerViewPosition;
			float viewDistance = length( viewDelta );
			float scaledScreenDistance = scaleDividedByCameraFar * viewDistance;
			return max(0.0, (dot(centerViewNormal, viewDelta) - minResolutionMultipliedByCameraFar) / scaledScreenDistance - bias) / (1.0 + pow2( scaledScreenDistance ) );
		}
		// moving costly divides into consts
		const float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );
		const float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );
		float getAmbientOcclusion( const in vec3 centerViewPosition ) {
			// precompute some variables require in getOcclusion.
			scaleDividedByCameraFar = scale / cameraFar;
			minResolutionMultipliedByCameraFar = minResolution * cameraFar;
			vec3 centerViewNormal = getViewNormal( centerViewPosition, vUv );
			// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
			float angle = rand( vUv + randomSeed ) * PI2;
			vec2 radius = vec2( kernelRadius * INV_NUM_SAMPLES ) / size;
			vec2 radiusStep = radius;
			float occlusionSum = 0.0;
			float weightSum = 0.0;
			for( int i = 0; i < NUM_SAMPLES; i ++ ) {
				vec2 sampleUv = vUv + vec2( cos( angle ), sin( angle ) ) * radius;
				radius += radiusStep;
				angle += ANGLE_STEP;
				float sampleDepth = getDepth( sampleUv );
				if( sampleDepth >= ( 1.0 - EPSILON ) ) {
					continue;
				}
				float sampleViewZ = getViewZ( sampleDepth );
				vec3 sampleViewPosition = getViewPosition( sampleUv, sampleDepth, sampleViewZ );
				occlusionSum += getOcclusion( centerViewPosition, centerViewNormal, sampleViewPosition );
				weightSum += 1.0;
			}
			if( weightSum == 0.0 ) discard;
			return occlusionSum * ( intensity / weightSum );
		}
		void main() {
			float centerDepth = getDepth( vUv );
			if( centerDepth >= ( 1.0 - EPSILON ) ) {
				discard;
			}
			float centerViewZ = getViewZ( centerDepth );
			vec3 viewPosition = getViewPosition( vUv, centerDepth, centerViewZ );
			float ambientOcclusion = getAmbientOcclusion( viewPosition );
			gl_FragColor = getDefaultColor( vUv );
			gl_FragColor.xyz *=  1.0 - ambientOcclusion;
		}`,
    }
})

export default {customNoiseShaderMap,defaultVertexShader}