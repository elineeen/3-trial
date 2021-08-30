<template>
  <div class="container">
    <div class="control-block">
      <input ref="hiddenInput" v-model="userInput" class="hidden-input"/>
      <div v-if="!typeControl">
        loading texture image data...
      </div>
      <div v-else class="control-block">
        <a href="#" @click="toggleMode($event,'edit')">edit mode</a>
        <a href="#" @click="toggleMode($event,'display')">display mode</a>
      </div>
    </div>
    <Renderer ref="renderer" :orbit-ctrl="{target:orbitTarget}" antialias pointer resize="window">
      <Camera ref="camera" :lookAt="orbitTarget" :position="cameraPosCntl"/>
      <Scene ref="scene">
        <AmbientLight></AmbientLight>
        <Group ref="cbillGroup"
               :position="orbitTarget"
               :rotation="rotateCntl"
               :scale="{x:0.25,y:0.25,z:0.25}">
        </Group>
      </Scene>
    </Renderer>
  </div>

</template>

<script>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import useBillPlane from './useBillPlane'
import useRaycaster from 'troisjs/src/core/useRaycaster'
import { Vector3 } from 'three'
import TWEEN from '@tweenjs/tween.js'

export default {
  setup () {
    //ALL your element refs in template should be exported!!!
    const orbitTarget = reactive(new Vector3(0, 0, -10))
    const cbillGroup = ref(null)
    const renderer = ref(null)
    const hiddenInput = ref(null)
    const userInput = ref('')
    const typeControl = ref(null)
    const rotateCntl = reactive({ x: 0, y: 0, z: 0 })
    const cameraPosCntl= reactive({ x: 0, y: 0, z: 10 })
    const isEditMode = computed(() => typeControl.value === 'edit')
    const isDisplayMode = computed(() => typeControl.value === 'display')
    let rayCasterInstance = null
    let focusInstance = null
    let inputInstance = null
    const { plane, createPlaneInstance, instanceMap } = useBillPlane()
    watch(userInput, (newVal) => {
      if (inputInstance) {
        inputInstance.update(newVal)
      }
    })
    watch(typeControl, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        switch (newVal) {
          case 'display': {
            transform2Display()
            break
          }
          case 'edit': {
            transform2Edit()
            break
          }
        }
      }
    })
    const transform2Display = async () => {

    }
    /**
     * 转换票面位置、调整相机位置至初始正面位置
     * @returns {(Tween<UnwrapNestedRefs<{x: number, y: number, z: number}>>|Tween<UnwrapNestedRefs<{x: number, y: number, z: number}>>)[]}
     */
    const transform2Edit = () => {
      //如果转了多圈则位移变为1圈
      rotateCntl.y=rotateCntl.y % (Math.PI * 2);
      const billTransform=new TWEEN.Tween(rotateCntl)
          .to({ x: 0, y: 0, z: 0 }, 500)
          .start()
      const cameraTransform=new TWEEN.Tween(renderer.value.three.camera.position)
          //这是个大概是个trois的bug，虽然响应式传入了但是camera的position并没有回传
          .to({  x: 0, y: 0, z: 10 }, 500)
          .start()
      return [billTransform,cameraTransform]
    }
    const toggleMode = (evt, type) => {
      evt.preventDefault()
      typeControl.value = type
    }
    /**
     * 控制一个隐藏的input进行内容输入和对应text位置字段变化
     */
    const dispatchTextClick = () => {
      if (focusInstance && isEditMode.value) {
        inputInstance = focusInstance
        hiddenInput?.value?.focus()
        userInput.value = inputInstance.activate()
      }
    }
    const dispatchTextHover = () => {
      let { pointer } = renderer.value?.three
      if (rayCasterInstance && isEditMode.value) {
        let intersect = rayCasterInstance.intersect(pointer.positionN, pointer.intersectObjects, false)
        if (intersect.length > 0) {
          let closestNode = intersect[0].object
          if (closestNode !== focusInstance) {
            if (focusInstance)
              focusInstance.clear()
            if (inputInstance) {
              inputInstance.clear()
              inputInstance = null
            }
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
        typeControl.value = 'display'
        //需要手动将交叉物体放入trois renderer中，用于光追判断hover/click事件
        instanceList.forEach((instance) => {
          renderer.value.three.addIntersectObject(instance)
        })
        //
        renderer?.value?.three?.cameraCtrl.saveState();
        renderer.value.onBeforeRender(() => {
          TWEEN.update()
          // console.dir(renderer?.value?.three?.cameraCtrl.position)
          if (isDisplayMode.value) {
            rotateCntl.y += 0.005
          }
        })
      })
      rayCasterInstance = new useRaycaster({ camera: renderer.value.camera })
      window.addEventListener('mousemove', dispatchTextHover)
      window.addEventListener('click', dispatchTextClick)

    })
    return {
      plane,
      renderer,
      createPlaneInstance,
      cbillGroup,
      rotateCntl,
      userInput,
      hiddenInput,
      toggleMode,
      orbitTarget,
      typeControl,
      cameraPosCntl
    }

  },
}
</script>

<style lang="scss" scoped>
.hidden-input {
  position: absolute;
  width: 200px;

  &:focus-visible {
    border: none;
    outline: none;
  }

  border: none;
  background: black;
}

.control-block {
  width: 100%;
  display: flex;
  justify-content: space-around;
  background: black;

  a, div {
    margin-top: 20px;
    color: white;
    font-size: 40px;
  }
}
</style>