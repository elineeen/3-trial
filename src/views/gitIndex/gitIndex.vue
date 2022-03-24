<template>
  <div>
    <Renderer ref="renderer"
              :orbit-ctrl="{enableRotate:false}"
              pointer resize="window">
      <Camera :far="20" :fov="50" :position="{ x:0, y:5, z:12 }"/>
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
        <FXAAPass></FXAAPass>
        <UnrealBloomPass :strength=".8"/>
      </EffectComposer>
    </Renderer>
  </div>
</template>

<script>
import { onMounted, reactive, ref } from 'vue'
import usePointGlobePlane from './usePointGlobePlane'
import TWEEN from '@tweenjs/tween.js'
import useRaycaster from 'troisjs/src/core/useRaycaster'
import useCommitInfoPlane from './useCommitInfoPlane'

export default {
  name: 'gitIndex',
  setup () {
    let rayCasterInstance = null
    let rotateSpeed=ref(0.001)
    const { initCompositeGlobePlane } = usePointGlobePlane()
    const { initCommitInfoPlane,toggleCommitInfoPlane } = useCommitInfoPlane()
    const scene = ref(null)
    const parentGroup = ref(null)
    const renderer = ref(null)
    const rotateCntl = reactive({ x: 0, y: Math.PI / 3, z: 0 })
    const dispatchO3DHover = () => {
      let { pointer } = renderer.value?.three
        let intersect = rayCasterInstance.intersect(pointer.positionN, pointer.intersectObjects, false)

        if (intersect.length > 0) {
          let closestNode = intersect[0].object;
          if(closestNode?.userData){
            rotateSpeed.value=0;
            toggleCommitInfoPlane(true,closestNode?.userData,pointer.positionV3)
          }
        }
        else {
          rotateSpeed.value=0.001;
          toggleCommitInfoPlane(false)
        }
    }
    onMounted(async () => {
      initCommitInfoPlane(scene.value)
      let sphereInstance=parentGroup.value?.o3d?.children[0]
      let planeInstance=await initCompositeGlobePlane(parentGroup.value)
      //需要将响应实例加入trois的intersect中
      parentGroup.value?.o3d?.children.forEach(o3d=>{

        if(o3d.children.length>0){
          renderer.value.three.addIntersectObject(o3d.children[0])
          o3d.children.forEach(d=> renderer.value.three.addIntersectObject(d))
        }
        //meshline精度太差了，关了
        // else
        //   renderer.value.three.addIntersectObject(o3d)
      })
      //remove sphere listener
      renderer.value.three.removeIntersectObject(sphereInstance)
      //remove world map point matrix listener
      renderer.value.three.removeIntersectObject(planeInstance)
      renderer.value.onBeforeRender(() => {
        TWEEN.update()
        rotateCntl.y += rotateSpeed.value
      })
      rayCasterInstance = new useRaycaster({ camera: renderer.value.camera })
      window.addEventListener('mousemove', dispatchO3DHover)
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