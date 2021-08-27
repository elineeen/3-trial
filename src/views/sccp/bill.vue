<template>
  <div class="container">
    <div class="control-block">
      <input class="hidden-input" ref="hiddenInput"  v-model="userInput"/>
      <div v-if="!typeControl">
        loading texture image data...
      </div>
      <div v-else>
        <a href="#" @click="toggleMode($event,'edit')">edit mode</a>
        <a href="#" @click="toggleMode($event,'display')">display mode</a>
      </div>

    </div>
    <Renderer ref="renderer" antialias :orbit-ctrl="{target:orbitTarget}" pointer resize="window" >
      <Camera ref="camera" :lookAt="orbitTarget"  :position="{ z: 10 }"/>
      <Scene ref="scene">
        <AmbientLight></AmbientLight>
        <Group ref="cbillGroup"
               :rotation="rotateCntl"
               :position="orbitTarget"
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
import {Vector3} from "three";
import TWEEN from "@tweenjs/tween.js";
export default {
  setup () {
    //ALL your element refs in template should be exported!!!
    const orbitTarget =reactive(new Vector3(0,0,-10))
    const cbillGroup = ref(null)
    const renderer = ref(null)
    const hiddenInput=ref(null)
    const userInput=ref('');
    const typeControl=ref(null)
    const rotateCntl = reactive({ x: 0, y: 0, z: 0 })
    const isEditMode=computed(()=>typeControl.value==='edit')
    const isDisplayMode=computed(()=>typeControl.value==='display')
    let rayCasterInstance = null
    let focusInstance = null
    let inputInstance = null
    const { plane, createPlaneInstance, instanceMap } = useBillPlane()
    watch(userInput,(newVal)=>{
      if(inputInstance){
        inputInstance.update(newVal)
      }
    })
    watch(typeControl,(newVal,oldVal)=>{
      if(newVal!==oldVal){
        debugger;
        switch (newVal){
          case 'display':{
            transform2Display()
            break;
          }
          case 'edit':{
            transform2Edit()
            break;
          }
        }
      }
    })
    const transform2Display=async ()=>{

    };
    const transform2Edit=()=>{
      return new TWEEN.Tween(rotateCntl)
          .to({x:0,y:0,z:0},500)
          .start()
    }
    const toggleMode=(evt,type)=>{
      evt.preventDefault()
      typeControl.value=type
    };
    const dispatchTextClick=()=>{
      if(focusInstance&&isEditMode.value){
        inputInstance=focusInstance;
        hiddenInput?.value?.focus()
        userInput.value=inputInstance.activate();
      }
    }
    const dispatchTextHover = () => {
      let { pointer } = renderer.value?.three
      if (rayCasterInstance&&isEditMode.value) {
        let intersect = rayCasterInstance.intersect(pointer.positionN, pointer.intersectObjects, false)
        if (intersect.length > 0) {
          let closestNode = intersect[0].object
          if(closestNode!==focusInstance){
              if(focusInstance)
                focusInstance.clear()
              if(inputInstance){
                inputInstance.clear()
                inputInstance=null
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
        instanceList.forEach((instance) => {
          renderer.value.three.addIntersectObject(instance)
        })
      })
      rayCasterInstance = new useRaycaster({ camera: renderer.value.camera })
      window.addEventListener('mousemove', dispatchTextHover)
      window.addEventListener('click', dispatchTextClick)
      renderer.value.onBeforeRender(() => {
        TWEEN.update()
        if(isDisplayMode.value){
          rotateCntl.y += 0.005
        }
      })
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
    }

  },
}
</script>

<style scoped lang="scss">
  .hidden-input{
    position: absolute;
    width: 200px;
    &:focus-visible{
      border:none;
      outline: none;
    }
    border: none;
    background: black;
  }
  .control-block{
    display: flex;
    justify-content: space-around;
    background: black;
    a{
      color: white;
      font-size: 40px;
    }
  }
</style>