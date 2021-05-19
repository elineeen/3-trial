<template>
    <div>
        <Renderer ref="renderer" antialias resize="window" orbit-ctrl>
            <Camera :position="{ z: 10 }" />
            <Scene>
                <PointLight :position="{ y: 50, z: 50 ,x:25}" />
                <Points
                        @click="dispatchActivateExplosionEffect" ref="box">
                    <PlaneGeometry
                            :width="1770"
                            :height="1000"
                            :widthSegments="50"
                            :heightSegments="50"
                    >
                    </PlaneGeometry>
                    <!--                <LambertMaterial />-->
                    <ShaderMaterial
                            :props="{
                        vertexShader: particleExplodeVertexShader,
                        uniforms: curlNoiseUniforms,
                        fragmentShader: particleExplodeFragmentShader }" />
                </Points>

            </Scene>
        </Renderer>
<!--        <img src="../assets/wp5723479.png">-->
    </div>

</template>

<script>
    import * as THREE from 'three'
    import {
        curlNoiseUniforms,
        particleExplodeFragmentShader,
        particleExplodeVertexShader,
        curlNoise2DVertexShader,
        curlNoiseFragmentShader
    } from "../components/explosion/curlNoiseShader";

    export default {
        name:'planeExplosion',
        data(){
          return {
              particleExplodeFragmentShader,
              particleExplodeVertexShader,
              curlNoiseUniforms,
              curlNoise2DVertexShader,
              curlNoiseFragmentShader,
              config:{
                  noiseValueTransitionScale:this.$d3.scaleLinear([0,1],[0,3]),
                  clock:new THREE.Clock(),
              }
          }
        },
        // initMaterialTexture(){
        //     const image = document.querySelector("img");
        //     this.image = image;
        //     const texture = new THREE.Texture(image);
        //     texture.needsUpdate = true;
        // },
        mounted() {
            const renderer = this.$refs.renderer

            const box = this.$refs.box.mesh
            box.position.set(0,0,-1000)
            const positionAttribute = box.geometry.getAttribute( 'position' );
            const colors = [];
            const color = new THREE.Color();
            for ( let i = 0, l = positionAttribute.count; i < l; i ++ ) {
                color.setHSL( 0.01 + 0.1 * ( i / l ), 1.0, 0.5 );
                color.toArray( colors, i * 3 );
            }
            box.geometry.setAttribute( 'customColor', new THREE.Float32BufferAttribute( colors, 3 ) );
            // renderer.onBeforeRender(() => {
            //     box.rotation.x += 0.01
            // })
            setTimeout(()=>{
                this.dispatchActivateExplosionEffect(box)
            },2000)
        },
        methods:{
            async dispatchActivateExplosionEffect(evt){
                let instance=evt;
                await this.$d3.transition('activate-explosion')
                    .duration(3000)
                    .tween('render',()=>t=>{
                        instance.material.uniforms.uProgress.value=this.config.noiseValueTransitionScale(t);
                        instance.material.uniforms.uTime.value=this.config.clock.getElapsedTime();
                    })
                    .transition('shrink-explosion')
                    .tween('render',()=>t=>{
                        instance.material.uniforms.uProgress.value=this.config.noiseValueTransitionScale(1-t);
                        instance.material.uniforms.uTime.value=this.config.clock.getElapsedTime();
                    })
                    .end();
            }
        }
    }
</script>

<style>
    body {
        margin: 0;
    }
    canvas {
        display: block;
    }
</style>
