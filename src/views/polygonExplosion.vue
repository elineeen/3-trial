<template>
    <Renderer ref="renderer" antialias resize="window" orbit-ctrl>
        <Camera :position="{ z: 10 }" />
        <Scene>
            <PointLight :position="{ y: 50, z: 50 ,x:25}" />
            <Points
                    @click="dispatchActivateExplosionEffect" ref="box" :rotation="{ y: Math.PI / 4, z: Math.PI / 4 }">
                <BoxGeometry
                        :width="100"
                        :height="100"
                        :depth="100"
                        :widthSegments="100"
                        :heightSegments="100"
                        :depthSegments="100"
                ></BoxGeometry>
                <ShaderMaterial
                        :props="{
                        vertexShader: curl3DNoiseVertexShader,
                        uniforms: curlNoiseUniforms,
                        fragmentShader: curlNoiseFragmentShader }" />

            </Points>

        </Scene>
    </Renderer>
</template>

<script>
    import * as THREE from 'three'
    import {curlNoiseFragmentShader, curlNoise2DVertexShader,curlNoiseUniforms,curl3DNoiseVertexShader} from "../components/explosion/curlNoiseShader";

    export default {
        name:'polygonExplosion',
        data(){
          return {
              curlNoise2DVertexShader,
              curlNoiseFragmentShader,
              curlNoiseUniforms,
              curl3DNoiseVertexShader,
              config:{
                  noiseValueTransitionScale:this.$d3.scaleLinear([0,1],[0,3]),
                  clock:new THREE.Clock(),
              }
          }
        },
        mounted() {
            const renderer = this.$refs.renderer

            const box = this.$refs.box.mesh
            box.position.set(0,0,-200)
            const positionAttribute = box.geometry.getAttribute( 'position' );
          const colors = []
          const color = new THREE.Color('skyblue')
          for (let i = 0, l = positionAttribute.count; i < l; i++) {
            color.toArray(colors, i * 3)
          }
            box.geometry.setAttribute( 'customColor', new THREE.Float32BufferAttribute( colors, 3 ) );
            renderer.onBeforeRender(() => {
                box.rotation.x += 0.01
            })
            setTimeout(()=>{
                this.dispatchActivateExplosionEffect(box)
            },2000)
        },
        methods:{
            async dispatchActivateExplosionEffect(evt){
                debugger;
               // let instance=evt.intersect.object;
                let instance=evt;
                await this.$d3.transition('activate-explosion')
                    .duration(3000)
                    .tween('render',()=>t=>{
                        instance.material.uniforms.uProgress.value=this.config.noiseValueTransitionScale(t);
                        // instance.material.uniforms.uTime.value=this.config.clock.getElapsedTime();
                    })
                    .transition('shrink-explosion')
                    .tween('render',()=>t=>{
                        instance.material.uniforms.uProgress.value=this.config.noiseValueTransitionScale(1-t);
                        // instance.material.uniforms.uTime.value=this.config.clock.getElapsedTime();
                    })
                    .end();
                debugger;
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
