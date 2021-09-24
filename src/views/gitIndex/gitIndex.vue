<template>
  <div>
    <Renderer ref="renderer" :orbit-ctrl="{enableRotate:false}" resize="window">
      <Camera :far="50" :fov="50" :position="{ x:0, y:5, z:12 }"/>
      <Scene ref="scene">
        <PointLight ref="light1" :intensity="0.3" :position="{ x: -35, y: 35, z: -10 }" color="#0E09DC"/>
        <PointLight ref="light2" :intensity="0.3" :position="{ x: -25, y: 25, z: -10 }" color="#1CD1E1"/>
        <PointLight ref="light3" :intensity="0.3" :position="{ x: -15, y: 15, z: -10 }" color="#18C02C"/>
        <PointLight ref="light4" :intensity="0.3" :position="{ x: -5, y: 5, z: -10 }" color="#ee3bcf"/>
        <PointLight ref="light5" :intensity="1" :position="{ x: -9, y: 11, z: -15 }" color="white"/>
        <Group ref="parentGroup" :rotation="rotateCntl">
          <Mesh>
            <SphereGeometry :heightSegments="25" :radius="5" :widthSegments="25"></SphereGeometry>
            <PhongMaterial :props="{  emissive:'#043a8a',emissiveIntensity:0.3}" color="white"/>
          </Mesh>
        </Group>
      </Scene>
      <EffectComposer>
        <RenderPass/>
        <UnrealBloomPass :strength=".8"/>
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
    const { initCompositeGlobePlane } = usePointGlobePlane()
    const scene = ref(null)
    const parentGroup = ref(null)
    const renderer = ref(null)
    const rotateCntl = reactive({ x: 0, y: Math.PI / 3, z: 0 })

    onMounted(async () => {
      await initCompositeGlobePlane(parentGroup.value)
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