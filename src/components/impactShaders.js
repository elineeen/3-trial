export const impactVertexShader11 = `
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
        `

export const impactVertexShader = `
      	struct impact {
          vec3 impactPosition;
          float impactMaxRadius;
          float impactRatio;
        };
      	uniform impact impacts[606];
        
        attribute vec3 center;
        attribute float scale;
        
        varying float vFinalStep;
        varying vec2 vUv;
        varying vec3 vColor;
        
        varying float vFinalStep;
        attribute float size;
        attribute vec3 customColor;
        void main(){
            
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
        `