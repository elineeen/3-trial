<template>
  <div ref="tester">
    <Renderer ref="renderer" antialias orbit-ctrl pointer resize="window">
      <Camera ref="camera" :position="{ z: 10 }"/>
      <Scene ref="scene">
        <PointLight :position="{ y: 50, z: 50 ,x:25}"/>
        <Group ref="cbillGroup"
               :position="{x:0,y:0,z:-10}"
               :scale="{x:0.25,y:0.25,z:0.25}">
        </Group>
      </Scene>
    </Renderer>
  </div>

</template>

<script>
import { onMounted, reactive, ref } from 'vue'
import useBillPlane from './useBillPlane'
import * as THREE from 'three'
import useRaycaster from 'troisjs/src/core/useRaycaster'

export default {
  setup () {
    const cbillGroup = ref(null)
    const renderer = ref(null)
    const camera = ref(null)
    const rotateCntl = reactive({ x: 0, y: 0, z: 0 })
    let rayCasterInstance = null
    let focusInstance = null
    const { plane, createPlaneInstance, instanceMap } = useBillPlane()
    const dispatchRelationExpansion = () => {
      let { pointer } = renderer.value?.three
      if (rayCasterInstance) {
        let intersect = rayCasterInstance.intersect(pointer.positionN, pointer.intersectObjects, false)
        if (intersect.length > 0) {
          let closestNode = intersect[0].object
          if(closestNode!==focusInstance){
              if(focusInstance)
                focusInstance.clear()
              focusInstance = instanceMap.get(closestNode.parent)
              focusInstance?.focus()
          }
        } else if (focusInstance) {
          focusInstance.clear()
          focusInstance = null
        }
      }

    }
    onMounted(() => {
      createPlaneInstance(cbillGroup.value).then((instanceList) => {
        instanceList.forEach((instance) => {
          renderer.value.three.addIntersectObject(instance)
        })
      })
      rayCasterInstance = new useRaycaster({ camera: renderer.value.camera })
      window.addEventListener('mousemove', dispatchRelationExpansion)
      renderer.value.onBeforeRender(() => {
        rotateCntl.y += 0.005
      })
    })
    return {
      plane,
      renderer,
      createPlaneInstance,
      cbillGroup,
      rotateCntl
    }

  },
}
</script>

<style scoped>

</style>