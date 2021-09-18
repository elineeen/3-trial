import * as THREE from 'three'
import { Vector3 } from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as d3 from 'd3'

export default function useGitCommitTransitions(){
  const distance2OpalRadiusScale=d3.scaleLinear([0,15],[5,15])
  /**
   * 四件事：获取原始数据-》根据原始数据转换成三个向量点-》根据x坐标排序展示顺序-》生成curve实例及对应曲线点阵并返回
   * @returns {Promise<void>}
   */
  const generateOrderedCommitCurveList=async ()=>{
    let commitList=await d3.json('./gitIndex/github-index.json')
    //排序，靠近x初始位置的优先动画展示
    //  let p=
       return commitList
      .map((d)=>{
      let {gm,gop}=d;
      let srcCoordinate=[gop.lon,gop.lat],targetCoordinate=[gm.lon,gm.lat]
      let [startVector,endVector]=[_transformCoord2Vec(srcCoordinate),_transformCoord2Vec(targetCoordinate)]
      let centerVector=_generateCenter(startVector,endVector)
      return [startVector,centerVector,endVector]
    })
    // debugger
      .sort((el1,el2)=>{
        let [startVec1,startVec2]=[el1[0],el2[1]];
        return Math.abs(startVec1.x)>Math.abs(startVec2.x)
      // let [startSph1,startSph2]=[new THREE.Spherical().setFromVector3(el1[0]),new THREE.Spherical().setFromVector3(el2[1])];
      // return Math.abs(startSph1.phi-Math.PI)>Math.abs(startSph2.phi-Math.PI)
    })
      .map(d=>{
        let [startVector,centerVector,endVector]=d;
        let curvePath=new THREE.QuadraticBezierCurve3(startVector,centerVector,endVector);
        const curvePoints=curvePath.getPoints(200);
        const geometry = new THREE.BufferGeometry().setFromPoints( [curvePoints[0],curvePoints[1]] );
        const material = new THREE.LineBasicMaterial( { color : 'white',linewidth:10 } );
        const curveObject=new THREE.Line( geometry, material );
        curveObject.lookAt.apply(curveObject,centerVector.toArray())
        return [curveObject,curvePoints]
      })
  }
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
  const _generateCenter=(startVec,endVec)=>{
    let curveRadius=distance2OpalRadiusScale(startVec.distanceTo(endVec))
    let [startSph,endSph]=[new THREE.Spherical().setFromVector3(startVec),new THREE.Spherical().setFromVector3(endVec)];
    return new THREE.Vector3().setFromSphericalCoords(curveRadius,(startSph.phi+endSph.phi)/2,(startSph.theta+endSph.theta)/2)
  }
  const generateCommitTweenList=async (instance)=>{
    let curveList=await generateOrderedCommitCurveList();
    return generateCommitTween(instance,curveList)
  }
  const generateCommitTween=(instance,curveList=[])=>{
    return curveList.map(d=>{
      const [curveObject,curvePoints]=d;
      instance.add(curveObject);
      let tweenObject={ counter:0 }
      let elapseTween=new TWEEN.Tween({ counter:0 })
        .delay(5000)
        .easing(TWEEN.Easing.Cubic.InOut)
        .to({ counter:200}, 5000)
        .onUpdate((tweenObject)=>{
          let renderPoints=curvePoints.slice(tweenObject.counter,200)
          curveObject.geometry.setFromPoints(renderPoints);
          curveObject.updateMatrix()
        })
      let extendTween= new TWEEN.Tween(tweenObject)
        .delay(Math.random()*2000)
        .easing(TWEEN.Easing.Cubic.InOut)
        .to({ counter:200}, 5000)
        .onUpdate(()=>{
          let renderPoints=curvePoints.slice(0,tweenObject.counter)
          curveObject.geometry.setFromPoints(renderPoints);
          curveObject.updateMatrix()
        })
        .onComplete(()=>{
        })
      extendTween.chain(elapseTween);
      return extendTween
    })
  }
  return {
    generateCommitTweenList
  }
}