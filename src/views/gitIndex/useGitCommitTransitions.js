import { globeImgData } from './globeImgData'
import * as THREE from 'three'
import TWEEN from "@tweenjs/tween.js";
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils'
import { Vector3 } from 'three'
export default function useGitCommitTransitions(){
  /**
   * 坐标系转换，可以参考csdn这篇文章 https://blog.csdn.net/qihoo_tech/article/details/101443066
   * @param coordPair
   * @param radius
   * @returns {Vector3}
   * @private
   */
  const _transformCoord2Vec=(coordPair=[],radius=5)=>{
    return new THREE.Vector3().setFromSphericalCoords(
      radius,
      THREE.MathUtils.degToRad(90-coordPair[1]),
      THREE.MathUtils.degToRad(90+coordPair[0])
      )
  }
  /**
   *
   * @param startVec
   * @param endVec
   * @param radius
   * @returns {Vector3}
   * @private
   */
  const _generateCenter=(startVec,endVec,radius=8)=>{
    let [startSph,endSph]=[new THREE.Spherical().setFromVector3(startVec),new THREE.Spherical().setFromVector3(endVec)];
    return new THREE.Vector3().setFromSphericalCoords(radius,(startSph.phi+endSph.phi)/2,(startSph.theta+endSph.theta)/2)
  }
  const generateCommitTween=(instance,commitList=[])=>{
    return commitList.map(d=>{
      let {gm,gop}=d
      let srcCoordinate=[gop.lon,gop.lat],targetCoordinate=[gm.lon,gm.lat]
      let [startVector,endVector]=[_transformCoord2Vec(srcCoordinate),_transformCoord2Vec(targetCoordinate)]
      let centerVector=_generateCenter(startVector,endVector)
      let curvePath=new THREE.QuadraticBezierCurve3(startVector,centerVector,endVector);
      const curvePoints=curvePath.getPoints(200);
      const geometry = new THREE.BufferGeometry().setFromPoints( [curvePoints[0],curvePoints[1]] );
      const material = new THREE.LineBasicMaterial( { color : 'white',linewidth:10 } );
      const curveObject=new THREE.Line( geometry, material );
      curveObject.lookAt.apply(curveObject,centerVector.toArray())
      instance.add(curveObject);
      let tweenObject={ counter:0 }
      return new TWEEN.Tween(tweenObject)
        .easing(TWEEN.Easing.Cubic.InOut)
        .to({ counter:200}, 5000)
        .onUpdate(()=>{
          let renderPoints=curvePoints.slice(0,tweenObject.counter)
          curveObject.geometry.setFromPoints(renderPoints);
          curveObject.updateMatrix()
        })
        .onComplete(()=>{

        })
        .start()
    })
  }
  return {
    generateCommitTween
  }
}