import { computed, ref, watch, watchEffect } from 'vue'
import * as THREE from 'three'

export default async function useBillTextSelector (groupInstance, map) {
  let fontLoader = null
  const stateEnumMap = Object.freeze({
    'HOVER': 1 << 0,
    'ACTIVATE': 1 << 1,
    'INITIAL': 1 << 2,
    'UPDATE': 1 << 3
  })
  const defaultText = 'click to input something'
  const fontSize = 16
  /**
   * @returns {Promise<unknown>}
   */
  const initLoader = async () => {
    return new Promise((resolve) => {
      new THREE.FontLoader().load('fonts/gentilis_regular.typeface.json', (font) => {
        fontLoader = font
        resolve()
      })
    })
  }
  await initLoader()
  const _generateTextCanvas = (placementSetting, text = 'click to input something') => {
    const canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')
    canvas.width = placementSetting.w * 10
    canvas.height = placementSetting.h * 10
    ctx.fillStyle = 'black'
    ctx.textBaseline = 'top'
    ctx.font = `${fontSize}px Avenir,Helvetica`
    ctx.fillText(text, fontSize / 2, canvas.height / 2 - fontSize / 2)
    return canvas
  }
  const updateCanvas = (canvas, groupInstance, text, placementSetting,borderColor) => {
    let ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, placementSetting.w * 10, placementSetting.h * 10)
      ctx.fillStyle = 'black'
      ctx.textBaseline = 'top'
      ctx.font = `${fontSize}px Avenir,Helvetica`
      ctx.fillText(text, fontSize / 2, canvas.height / 2 - fontSize / 2)
      ctx.lineWidth = 5
      ctx.strokeStyle = borderColor
      ctx.strokeRect(0, 0, canvas.width, canvas.height)
      groupInstance.needsUpdate = true
    }
  }
  const createTextSelectorInstance = (x, y, w, h, isBackSide = false) => {
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
    watchEffect(()=>{
      updateCanvas(canvasInstance,textureInstance,displayText.value || defaultText,placementSetting,borderColor.value)
    })
    map.set(selector, {
      focus: () => {
        state.value = stateEnumMap.HOVER
      },
      clear: () => {
        state.value = stateEnumMap.INITIAL
      },
      activate:()=>{
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
    createTextSelectorInstance
  }
}