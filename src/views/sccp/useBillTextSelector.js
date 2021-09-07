import { computed, ref, watchEffect } from 'vue'
import * as THREE from 'three'

/**
 *
 * @param groupInstance
 * @param map 该weakmap用于赋值，<实例元素，自定义功能>的二元组，用于最外层事件判断时获取功能函数
 * @returns {Promise<{createTextSelectorInstance: (function(*=, *=, *=, *=, *=): Mesh)}>}
 */
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
  /**
   * 一个更新画布的函数，参数写的贼多，但是又不想放函数体里贼难看.jpg
   * @param canvas 画布示例
   * @param groupInstance group实例，需要调用里面needupdate变量手动进行更新
   * @param text 渲染文字
   * @param placementSetting 位置，xywh
   * @param borderColor 边框颜色
   */
  const updateCanvas = (canvas, groupInstance, text, placementSetting, borderColor) => {
    let ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, placementSetting.w * 10, placementSetting.h * 10)
      ctx.fillStyle = 'black'
      ctx.textBaseline = 'top'
      ctx.font = `${fontSize}px Avenir,Helvetica`
      ctx.textAlign='center';
      ctx.textBaseline='middle'
      ctx.fillText(text, canvas.width /2, canvas.height / 2)
      ctx.lineWidth = 5
      ctx.strokeStyle = borderColor
      ctx.strokeRect(0, 0, canvas.width, canvas.height)
      groupInstance.needsUpdate = true
    }
  }
  /**
   *
   * @param x
   * @param y
   * @param w
   * @param h
   * @param isBackSide 是否是背面信息
   * @returns {Mesh}
   */
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
    createTextSelectorInstance
  }
}