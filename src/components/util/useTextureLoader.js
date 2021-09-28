import * as THREE from 'three'
import { Vector3 } from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as d3 from 'd3'
import { computed, ref, watchEffect } from 'vue'
export default function useTextureLoader () {
  /**
   *
   * @param x
   * @param y
   * @param w
   * @param h
   * @param isBackSide 是否是背面信息
   * @returns {Mesh}
   */
  const createTextSelectorInstance = (x, y, w, h, infoList=[]) => {
    const selector = new THREE.Group()
    let displayText = ref('')
    selector.position.set(x, y, 0)
    let placementSetting = { x, y, w, h }
    let canvasInstance = _generateTextCanvas(placementSetting)
    let textureInstance = new THREE.CanvasTexture(canvasInstance)
    let backGround = {
      geometry: new THREE.PlaneGeometry(w, h), material: new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.3,
        map: textureInstance,
        //这里不能用backSide，使用backside不旋转的结果是内容反向，backside+旋转结果是变成正面显示反向内容，
        side: THREE.FrontSide
      })
    }
    let planeInstance = new THREE.Mesh(backGround.geometry, backGround.material)
    if (isBackSide)
      planeInstance.rotateY(Math.PI)

    let state = ref(stateEnumMap.INITIAL)
    //根据状态控制边框颜色与显示
    const borderColor = computed(() => {
      const color2StateMap = Object.freeze({
        [stateEnumMap.HOVER]: 'green',
        [stateEnumMap.ACTIVATE]: 'red',
        [stateEnumMap.INITIAL]: 'white',
        [stateEnumMap.UPDATE]: 'black',
      })
      return color2StateMap[state.value] || 'white'
    })
    //watch displaytext\state 二合一
    watchEffect(() => {
      updateCanvas(canvasInstance, textureInstance, displayText.value || defaultText, placementSetting, borderColor.value)
    })
    //传入功能函数,闭包访问内部私有变量，一个简单的状态机
    map.set(selector, {
      focus: () => {
        state.value = stateEnumMap.HOVER
      },
      clear: () => {
        state.value = stateEnumMap.INITIAL
      },
      activate: () => {
        state.value = stateEnumMap.ACTIVATE
        return displayText.value
      },
      update: (text) => {
        displayText.value = text
      },
    })
    selector.add(planeInstance)
    groupInstance.add(selector)
    return planeInstance
  }
  return {

  }
}