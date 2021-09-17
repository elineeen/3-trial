<template>
  <div>
    <Renderer ref="renderer" antialias resize="window" orbit-ctrl>
      <Camera :position="{ x:0, y:5, z:10 }" :fov="50" :far="50" />
      <Scene ref="scene">

      </Scene>
    </Renderer>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import usePointGlobePlane from './usePointGlobePlane'

export default {
  name: 'gitIndex',
  setup () {
    const {initCompositeGlobePlane}=usePointGlobePlane();
    const scene=ref(null)
    onMounted(async ()=>{
      debugger;
      await initCompositeGlobePlane(scene.value);
    })
    return {
      scene
    }
  }
}
</script>

<style scoped>

</style>