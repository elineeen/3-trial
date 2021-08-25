import { ref, computed ,onMounted } from 'vue'
import * as THREE from 'three'
import useBillTextSelector from './useBillTextSelector'
export default function useBillPlane() {
  const plane = ref(null)
  const instanceList=[];
  const instanceMap=new WeakMap();
  const inputPlacementPositionList=[
    [-13.4, 13.4, 21, 2.2],
    [-13.4, 11.4, 21, 2.2],
    [-13.4, 9.4, 21, 2.2],
    [-13.4, 7.4, 21, 2.2],
    [21.4, 13.4, 21, 2.2],
    [21.4, 11.4, 21, 2.2],
    [21.4, 9.4, 21, 2.2],
    [21.4, 7.4, 21, 2.2],
  ];
  const createPlaneInstance=async (instance) => {
    let geometry = new THREE.PlaneGeometry(108, 80); //矩形平面
    let backPlaneMaterial = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load("./cbill/bill-back.png"),//设置精灵纹理贴图
      side: THREE.DoubleSide,
      depthWrite: false
    })
    let frontPlaneMaterial = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load("./cbill/bill-front.png"),//设置精灵纹理贴图
      side: THREE.FrontSide,
      depthWrite: false
    }); //材质对象Material
// 设置几何体的材质索引(对于PlaneGeometry而言所有Face3的材质索引默认0)
    let frontPlaneMesh = new THREE.Mesh(geometry.clone(), frontPlaneMaterial); //网格模型对象Mesh
    let backPlaneMesh = new THREE.Mesh(geometry.clone(), backPlaneMaterial); //网格模型对象Mesh
    frontPlaneMesh.position.set(0, 0, 0)
    backPlaneMesh.position.set(0, 0, 0)
    backPlaneMesh.geometry.rotateY(Math.PI)
    instance.add(frontPlaneMesh);
    instance.add(backPlaneMesh);

    // instanceList.push(frontPlaneMesh);
    // instanceList.push(backPlaneMesh);
    const selectorFactory = await useBillTextSelector(instance,instanceMap);
    inputPlacementPositionList.forEach((args)=>{
      instanceList.push(selectorFactory.createTextSelectorInstance.apply(selectorFactory, args));
    })
    return instanceList;
  };

  // onMounted(createPlaneInstance)

  return {
    plane,
    createPlaneInstance,
    instanceMap
  }
}