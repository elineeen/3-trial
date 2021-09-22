<template>
  <div>
    <Renderer ref="renderer" antialias resize="window" orbit-ctrl>
      <Camera :position="{ x:0, y:5, z:15 }" :fov="50" :far="50" />
      <Scene ref="scene">
        <PointLight ref="light1" color="#0E09DC" :intensity="0.3" :position="{ x: -35, y: 35, z: -10 }" />
        <PointLight ref="light2" color="#1CD1E1" :intensity="0.3" :position="{ x: -25, y: 25, z: -10 }" />
        <PointLight ref="light3" color="#18C02C" :intensity="0.3" :position="{ x: -15, y: 15, z: -10 }" />
        <PointLight ref="light4" color="#ee3bcf" :intensity="0.3" :position="{ x: -5, y: 5, z: -10 }" />
        <PointLight ref="light5" color="white" :intensity="2" :position="{ x: -9, y: 11, z: -15 }" />
        <Group ref="parentGroup"     :rotation="rotateCntl">
          <Mesh>
            <SphereGeometry :radius="5" :widthSegments="100" :heightSegments="100"></SphereGeometry>
            <PhongMaterial  :props="{  emissive:'#043a8a',emissiveIntensity:0.3}" color="white"/>
          </Mesh >
        </Group>
      </Scene>
      <EffectComposer>
        <RenderPass />
        <FXAAPass />
        <UnrealBloomPass :strength=".8" />
      </EffectComposer>
    </Renderer>
  </div>
</template>

<script>
import { onMounted, reactive, ref } from 'vue'
import usePointGlobePlane from './usePointGlobePlane'
import TWEEN from '@tweenjs/tween.js'

export default {
  name: 'gitIndex',
  setup () {
    const {initCompositeGlobePlane}=usePointGlobePlane();
    const scene=ref(null)
    const parentGroup=ref(null)
    const renderer=ref(null)
    const rotateCntl=reactive({x:0,y:Math.PI/3,z:0})
    onMounted(async ()=>{
      await initCompositeGlobePlane(parentGroup.value);
      renderer.value.onBeforeRender(() => {
        TWEEN.update()
          rotateCntl.y += 0.001
      })
    })
    return {
      scene,
      renderer,
      parentGroup,
      rotateCntl
    }
  }
}
</script>

<style scoped>

</style>