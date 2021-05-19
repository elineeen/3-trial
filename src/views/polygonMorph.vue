<template>
    <Renderer ref="renderer" antialias resize="window" orbit-ctrl>
        <Camera :position="{ z: 10 }" />
        <Scene>
            <PointLight :position="{ y: 50, z: 50 ,x:25}" />
            <Box @click="dispatchActivateExplosionEffect" ref="box" :rotation="{ y: Math.PI / 4, z: Math.PI / 4 }">
                <LambertMaterial />
            </Box>
        </Scene>
    </Renderer>
</template>

<script>
    // import {SAOShader} from 'three'
    import {curlNoiseFragmentShader, curlNoise2DVertexShader,curNoiseUniforms} from "../components/explosion/curlNoiseShader";

    export default {
        name:'polygonMorph',
        data(){
            return {
                curlNoise2DVertexShader,
                curlNoiseFragmentShader,
                curNoiseUniforms:,
                config:{
                    noiseValueTransitionScale:this.$d3.scaleLinear([0,1],[0,3])
                }
            }
        },
        mounted() {
            const renderer = this.$refs.renderer
            const box = this.$refs.box.mesh
            renderer.onBeforeRender(() => {
                box.rotation.x += 0.01
            })
        },
        methods:{
            dispatchActivateExplosionEffect(evt){
                debugger;
                this.$d3.transition('activate-morph')
                    .duration(3000)
                    .tween('render',()=>t=>{
                        console.dir(evt.intersect.object.material.uniforms.uProgress.value)
                        evt.material.uniforms.uProgress.value=this.config.noiseValueTransitionScale(t);
                        evt.material.uniforms.uTime.value=this.config.noiseValueTransitionScale(t);
                    })
                    .duration(3000)
                    // .tween('render',(t)=>{
                    //     debugger;
                    //     console.dir(evt.intersect.object.material.uniforms.uProgress.value)
                    //     evt.intersect.object.material.uniforms.uProgress.value=this.config.noiseValueTransitionScale(1-t)
                    // })
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
