<template>
  <Renderer ref="renderer" antialias orbit-ctrl resize="window">
    <Camera :position="{ z: 10 }"/>
    <Scene ref="scene">
      <PointLight :position="{ y: 50, z: 50 ,x:25}"/>
    </Scene>
  </Renderer>
</template>

<script>
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import { morphNoiseFragShader, morphShaderUniforms, morphNoiseVertexShader,morphBasicVertexShader,morphBasicFragShader } from '../../components/explosion/morphShader'
import * as dat from 'dat.gui';
export default {
  name: 'particleMorph',
  data () {
    return {
      config: {
        noiseValueTransitionScale: this.$d3.scaleLinear([0, 1], [0, 3]),
        clock: new THREE.Clock(),
      },
      tweenInstance:null,
    }
  },
  mounted () {
    const renderer = this.$refs.renderer
    let boxGeo = this.initBoxGeo()
    const boxMaterial = new THREE.ShaderMaterial({
      vertexColors:true,
      vertexShader: morphNoiseVertexShader,
      uniforms: morphShaderUniforms,
      fragmentShader:morphNoiseFragShader
    })
    let box = new THREE.Points(boxGeo, boxMaterial)
    box.position.set(0, 0, -300)
    box.rotation.y =Math.PI / 4

    this.$refs.scene.add(box)

    const positionAttribute = box.geometry.getAttribute('position')
    const colors = []
    const color = new THREE.Color('skyblue')
    for (let i = 0, l = positionAttribute.count; i < l; i++) {
      color.toArray(colors, i * 3)
    }
    box.geometry.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3))
    renderer.onBeforeRender(() => {
      box.rotation.x += 0.01
      TWEEN.update()
    })
    let morphTween=this.initMorphTween(box)
    morphTween.start()
    // this.initGUICtrl(box)
  },
  methods: {
    initMorphTween(box){
      let particleExplodeTween=new TWEEN.Tween(box.material.uniforms.uProgress)
          .delay(2000)
          .to({ value:1}, 3000)
      let particleExplodeTween2=new TWEEN.Tween(box.material.uniforms.uProgress)
          .delay(2000)
          .to({ value:1}, 3000)
      let particleShrinkTween=
          new TWEEN.Tween(box.material.uniforms.uProgress)
              .delay(2000)
              .to({ value:0}, 3000)
      // let particleShrinkTweenFin=
      //     new TWEEN.Tween(box.material.uniforms.uProgress)
      //         .delay(2000)
      //         .to({ value:0}, 3000)
      //         // .onComplete(()=>{
      //         //   particleExplodeTween.start()
      //         // })
      let cube2RingTween=new TWEEN.Tween(box.morphTargetInfluences)
          .delay(2000)
          .to({ 0: 0, 1: 1 }, 3000)

      let ring2CubeTween=new TWEEN.Tween(box.morphTargetInfluences)
          .delay(2000)
          .to({ 0: 1, 1: 0 }, 3000)
          .onComplete(()=>{
            particleExplodeTween.start()
          })
      particleExplodeTween.chain(cube2RingTween,particleShrinkTween)
      cube2RingTween.chain(particleExplodeTween2)
      particleExplodeTween2.chain(ring2CubeTween,particleShrinkTween)
      return particleExplodeTween
    },
    initGUICtrl(boxInstance){
      const gui = new dat.GUI();
      const options={
        renderShader:'noiseShader',
        reset:()=>{
          return this.resetInstanceTween(boxInstance)
        },
        title:'morphShader',
      }
      gui.remember(options)
      gui.add(options,'title')
      const renderCtrl=gui.add(options, 'renderShader', [ 'noiseShader', 'basicShader' ] );
      gui.add(options,'reset')
      renderCtrl.onChange((value)=>{
        if(value==='basicShader'){
          boxInstance.material.vertexShader=morphBasicVertexShader;
          boxInstance.material.fragmentShader=morphBasicFragShader;
        }
        else{
          boxInstance.material.vertexShader=morphNoiseVertexShader;
          boxInstance.material.fragmentShader=morphNoiseFragShader;
        }
        boxInstance.material.needsUpdate=true;
        this.resetInstanceTween()
      })
    },
    resetInstanceTween(boxInstance){
      boxInstance.material.uniforms.uProgress=0;
      boxInstance.morphTargetInfluences={ 0: 1, 1: 0 };
      TWEEN.removeAll();
      this.tweenInstance.start();
    },
    /**
     * nothing special, just a practice on three morph api changes
     * @returns {BoxGeometry|TorusGeometry}
     */
    initBoxGeo () {
      let morphGeometryList = [
        new THREE.BoxGeometry(150, 150, 150,100,100,100),
        new THREE.TorusGeometry(80,40,40,80),
      ]
      let morphPosList = morphGeometryList.map((geometry, ndx) => {
        const attribute = geometry.getAttribute('position')
        const name = `target${ndx}`
        attribute.name = name
        return attribute
      })
      let boxGeo = morphGeometryList[0]
      boxGeo.morphAttributes.position = morphPosList
      return boxGeo
    },
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
