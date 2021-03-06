import { ref } from 'vue'
import * as THREE from 'three'
import useBillTextSelector from './useBillTextSelector'

export default function useBillPlane () {
  const plane = ref(null)
  const instanceList = []
  const instanceMap = new WeakMap()
  //对应票面位置，纯手工试出来的.jpg，true对应传给useBillTextSelector的isbackside变量
  const inputPositionList = [
    [-13.4, 13.4, 21, 2.2],
    [-13.4, 11.4, 21, 2.2],
    [-13.4, 9.4, 21, 2.2],
    [-13.4, 7.4, 21, 2.2],
    [21.4, 13.4, 21, 2.2],
    [21.4, 11.4, 21, 2.2],
    [21.4, 9.4, 21, 2.2],
    [21.4, 7.4, 21, 2.2],

    [-7, 5.8, 58, 2.2, true],
    [-7, 7.8, 58, 2.2, true],
    [-7, 9.8, 58, 2.2, true],
    [-7, 11.8, 58, 2.2, true],

    [-7, 0.7, 58, 2.2, true],
    [-7, -1.3, 58, 2.2, true],
    [-7, -3.3, 58, 2.2, true],
    [-7, -5.3, 58, 2.2, true],

    [-7, -10.5, 58, 2.2, true],
    [-7, -12.5, 58, 2.2, true],
    [-7, -14.5, 58, 2.2, true],
    [-7, -16.5, 58, 2.2, true],
  ]
  /**
   * 异步加载纹理
   * @param src
   * @returns {Promise<unknown>}
   */
  const wrappedTextureLoader = (src) => {
    return new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(src, (texture) => {
        resolve(texture)
      }, undefined, (err) => {
        reject(err)
      })
    })
  }
  /**
   *
   * @param instance 外层group实例
   * @returns {Promise<*[]>} 返回需要事件判断的object3D实例
   */
  const createPlaneInstance = async (instance) => {
    let geometry = new THREE.PlaneGeometry(108, 80) //矩形平面
    let [backTexture,frontTexture]=await Promise.all([wrappedTextureLoader('./cbill/bill-back.png'),wrappedTextureLoader('./cbill/bill-front.png')])
    let backPlaneMaterial = new THREE.MeshBasicMaterial({
      map: backTexture,
      side: THREE.FrontSide,
      depthWrite: false
    })
    let frontPlaneMaterial = new THREE.MeshBasicMaterial({
      map: frontTexture,
      side: THREE.FrontSide,
      depthWrite: false
    })
    let frontPlaneMesh = new THREE.Mesh(geometry.clone(), frontPlaneMaterial) //网格模型对象Mesh
    let backPlaneMesh = new THREE.Mesh(geometry.clone(), backPlaneMaterial) //网格模型对象Mesh
    frontPlaneMesh.position.set(0, 0, 0)
    backPlaneMesh.position.set(0, 0, 0)
    backPlaneMesh.geometry.rotateY(Math.PI)
    instance.add(frontPlaneMesh)
    instance.add(backPlaneMesh)
    const selectorFactory = await useBillTextSelector(instance, instanceMap)
    inputPositionList.forEach((args) => {
      instanceList.push(selectorFactory.createTextSelectorInstance.apply(selectorFactory, args))
    })
    return instanceList
  }

  return {
    plane,
    createPlaneInstance,
    instanceMap
  }
}