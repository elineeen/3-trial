import { ref, computed ,onMounted } from 'vue'
import * as THREE from 'three'
import useBillTextSelector from './useBillTextSelector'
export default function useBillPlane() {
  const plane = ref(null)
  const instanceList=[];
  const instanceMap=new WeakMap();
  const inputPositionList=[
    [-13.4, 13.4, 21, 2.2],
    [-13.4, 11.4, 21, 2.2],
    [-13.4, 9.4, 21, 2.2],
    [-13.4, 7.4, 21, 2.2],
    [21.4, 13.4, 21, 2.2],
    [21.4, 11.4, 21, 2.2],
    [21.4, 9.4, 21, 2.2],
    [21.4, 7.4, 21, 2.2],

    [-7, 5.8, 58, 2.2,true],
    [-7, 7.8, 58, 2.2,true],
    [-7, 9.8, 58, 2.2,true],
    [-7, 11.8, 58, 2.2,true],

    [-7, 0.7, 58, 2.2,true],
    [-7, -1.3, 58, 2.2,true],
    [-7, -3.3, 58, 2.2,true],
    [-7, -5.3, 58, 2.2,true],

    [-7, -10.5, 58, 2.2,true],
    [-7, -12.5, 58, 2.2,true],
    [-7, -14.5, 58, 2.2,true],
    [-7, -16.5, 58, 2.2,true],
  ];
  //
  const wrappedTextureLoader=(src)=>{
    return new Promise((resolve,reject) => {
      new THREE.TextureLoader().load(src,(texture)=>{
        resolve(texture)
      },undefined,(err)=>{
        reject(err)
      })
    })
  }
  const createPlaneInstance=async (instance) => {
    let geometry = new THREE.PlaneGeometry(108, 80); //矩形平面
    let backPlaneMaterial = new THREE.MeshBasicMaterial({
      map: await wrappedTextureLoader('./cbill/bill-back.png'),
      side: THREE.FrontSide,
      depthWrite: false
    })
    let frontPlaneMaterial = new THREE.MeshBasicMaterial({
      map: await wrappedTextureLoader('./cbill/bill-front.png'),
      side: THREE.FrontSide,
      depthWrite: false
    });
    let frontPlaneMesh = new THREE.Mesh(geometry.clone(), frontPlaneMaterial); //网格模型对象Mesh
    let backPlaneMesh = new THREE.Mesh(geometry.clone(), backPlaneMaterial); //网格模型对象Mesh
    frontPlaneMesh.position.set(0, 0, 0)
    backPlaneMesh.position.set(0, 0, 0)
    backPlaneMesh.geometry.rotateY(Math.PI)
    instance.add(frontPlaneMesh);
    instance.add(backPlaneMesh);
    const selectorFactory = await useBillTextSelector(instance,instanceMap);
    inputPositionList.forEach((args)=>{
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