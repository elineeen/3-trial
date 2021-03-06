import * as THREE from 'three'
import { Vector3 } from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as d3 from 'd3'
import { ref } from 'vue'
import { MeshLine, MeshLineMaterial,MeshLineRaycast } from 'meshline'

export default function useGitCommitTransitions () {
  const distance2OpalRadiusScale = d3.scaleLinear([0,  15], [5,  12])
  const distance2ImpactRadiusScale = d3.scaleLinear([0, 15], [1, 2])
  /**
   * 四件事：获取原始数据-》根据原始数据转换成三个向量点-》根据x坐标排序展示顺序-》生成curve实例及对应曲线点阵并返回
   * @returns {Promise<void>}
   */
  const generateOrderedCommitCurveList = async () => {
    // let commitList = await d3.json('./gitIndex/github-index.json')
    // let commitList = await d3.json('./gitIndex/github-index-tester.json')
    let commitList = await d3.json('./gitIndex/github-index-0929.json')
    //排序，靠近x初始位置的优先动画展示
    return commitList
      .map((d) => {
        let { gm, gop } = d
        //lon x轴 lat y轴
        let srcCoordinate = [gop.lon, gop.lat], targetCoordinate = [gm.lon, gm.lat]
        let [startVector, endVector] = [_transformCoord2Vec(srcCoordinate), _transformCoord2Vec(targetCoordinate)]
        let centerVector = _generateCenter(startVector, endVector)
        return [startVector, centerVector, endVector,d]
      })
      .sort((el1, el2) => {
        let [startVec1, startVec2] = [el1[0], el2[1]]
        return Math.abs(startVec1.x) > Math.abs(startVec2.x)
      })
      .map(d => {
        let [startVector, centerVector, endVector,rawData] = d
        let curvePath = new THREE.QuadraticBezierCurve3(startVector, centerVector, endVector)
        const curvePoints = curvePath.getPoints(100)
        const meshLine = new MeshLine()
        meshLine.setPoints([])
        const material = new MeshLineMaterial({
          color: 'lightGreen',
          lineWidth: .05,
          useAlphaMap: 0,
        })
        const curveObject = new THREE.Mesh(meshLine, material)
        curveObject.userData=rawData;
        return [curveObject, curvePoints,rawData]
      })
  }
  /**
   * 坐标系转换，可以简单参考csdn这篇文章 https://blog.csdn.net/qihoo_tech/article/details/101443066 (感觉里面有些写的不大对
   * @param coordPair [lon,lat]
   * @param radius
   * @returns {Vector3}
   * @private
   */
  const _transformCoord2Vec = (coordPair = [], radius = 5) => {
    return new THREE.Vector3().setFromSphericalCoords(
      radius,
      THREE.MathUtils.degToRad(90 - coordPair[1]),
      //图片像素设置theta 为0时是-180度，即西经180
      THREE.MathUtils.degToRad(180 + coordPair[0])
    )
  }
  /**
   *
   * 两个向量获取弧线中点，这里增高了中点球坐标半径以作为二次贝塞尔曲线的中点
   * @param startVec
   * @param endVec
   * @returns {Vector3}
   * @private
   */
  const _generateCenter = (startVec, endVec) => {
    let curveRadius = distance2OpalRadiusScale(startVec.distanceTo(endVec))
    let [startSph, endSph] = [new THREE.Spherical().setFromVector3(startVec), new THREE.Spherical().setFromVector3(endVec)]
    //大于180度时需要换对称中心点
    let adjustFlag=Math.abs(startSph.theta-endSph.theta)>Math.PI
    let endThetaAdjust=endSph.theta
    if(adjustFlag){
      if(endThetaAdjust<0)
        endThetaAdjust=Math.PI*2+endThetaAdjust
      else
        endThetaAdjust=Math.PI*-2+endThetaAdjust
    }
    return new THREE.Vector3().setFromSphericalCoords(curveRadius,
      (startSph.phi + endSph.phi) / 2,
      (startSph.theta + endThetaAdjust) / 2)
  }
  /**
   * 生成一个复合的commit tween list 包括曲线处理、mark处理和impact设置
   *
   * @todo 这块nodeList和tween得想办法解耦
   * @param instance
   * @returns {Promise<Tween<{counter: number}>[]>}
   */
  const generateCommitTweenList = async (instance, impactNodeRef = ref([])) => {
    let curveList = await generateOrderedCommitCurveList()
    let [impactTweenList, uniformImpactNodeList] = generateImpactTweenList(curveList)
    let compositeTweenList = generateCompositeCurveTweenList(instance, curveList, impactTweenList)
    //解耦啊解耦
    impactNodeRef.value = uniformImpactNodeList
    return compositeTweenList
  }
  /**
   * 生成冲击效果tween,只改变量，效果由shader完成
   * @param curveList
   * @returns {[Tween<*>[], *[]]}
   */
  const generateImpactTweenList = (curveList) => {
    let uniformImpactNodeList = []
    curveList.forEach((d, i) => {
      const [, curvePoints] = d
      let startImpactVec = curvePoints[0], endImpactVec = curvePoints[curvePoints.length - 1]
      //这里面暂时不做成pair形式，要不然shader uniform里传入后里面处理很麻烦,所以现在uniformImpactNodeList一定是2的倍数，暂不考虑边界处理
      uniformImpactNodeList.push(
        {
          impactPosition: startImpactVec,
          impactMaxRadius: distance2ImpactRadiusScale(startImpactVec.distanceTo(endImpactVec)),
          impactRatio: 0,
        },
        {
          impactPosition: endImpactVec,
          impactMaxRadius: distance2ImpactRadiusScale(startImpactVec.distanceTo(endImpactVec)),
          impactRatio: 0
        }
      )
    })
    let impactTweenList = uniformImpactNodeList.map((d, i) => {
      return new TWEEN.Tween(d)
        .to({ impactRatio: 1 }, THREE.Math.randInt(1000, 1500))
        .onComplete(() => {
          d.impactRatio = 0
        })
    })
    return [impactTweenList, uniformImpactNodeList]
  }
  /**
   * 生成一个mark动画，这里不仅生成tween，还重新生成mark的mesh
   * @param instance
   * @param rawData 由于这里不适用原来的曲线obj3D，所以需要重新复写一遍userData值,我写的真烂.jpg
   * @param curvePoints 曲线点数组，其实只需要起点
   * @param impactTween 对应冲击动画
   * @returns {Tween<Vector3>}
   * @private
   */
  const _generateCommitMarkTween = (instance,rawData, curvePoints, impactTween) => {
    let markGroup = new THREE.Group()
    let groupEndSpherical = new THREE.Spherical().setFromVector3(curvePoints[0])
    let groupStartSpherical = groupEndSpherical.clone()
    groupStartSpherical.radius = 4.3//magic number 5-0.6-0.1pointsize
    let lineEndSpherical = groupEndSpherical.clone()
    lineEndSpherical.radius = 0.5
    let pointSpherical = groupEndSpherical.clone()
    pointSpherical.radius = 0.6
    let pointDistanceVec = new THREE.Vector3().setFromSpherical(pointSpherical)
    let lineDistanceVec = new THREE.Vector3().setFromSpherical(lineEndSpherical)
    const markLine = new MeshLine()
    markLine.setPoints([
      new THREE.Vector3(0, 0, 0),
      lineDistanceVec
    ])
    const lineMaterial = new MeshLineMaterial({
      color: 'blue',
      lineWidth: .03,
      useAlphaMap: 0,
    })
    const pointGeo = new THREE.BufferGeometry().setFromPoints([pointDistanceVec])
    const pointMaterial = new THREE.PointsMaterial({ size: .2 })
    const markLineObj = new THREE.Mesh(markLine, lineMaterial)

    markLineObj.userData=rawData
    const markPointObj = new THREE.Points(pointGeo, pointMaterial)
    markPointObj.userData=rawData
    markGroup.add(markLineObj, markPointObj)
    markGroup.position.set(new THREE.Vector3().setFromSpherical(groupStartSpherical))
    instance.add(markGroup)

    const elapseTween = new TWEEN.Tween(new THREE.Vector3().setFromSpherical(groupEndSpherical))
      .delay(5000)
      .to(new THREE.Vector3().setFromSpherical(groupStartSpherical), 3000)
      .onStart(()=>{
        markLineObj.userData.enableDisplayCommit=false;
      })
      .onUpdate((positionVec) => {
        markGroup.position.set(positionVec.x, positionVec.y, positionVec.z)
      })
    const extendTween = new TWEEN.Tween(new THREE.Vector3().setFromSpherical(groupStartSpherical))
      .delay(Math.random() * 2000)
      .onStart(() => {
        if (impactTween) {
          impactTween.start()
        }
      })
      .to(new THREE.Vector3().setFromSpherical(groupEndSpherical), 3000)
      .onUpdate((positionVec) => {
        markGroup.position.set(positionVec.x, positionVec.y, positionVec.z)
      })
      .onComplete(()=>{
        markLineObj.userData.enableDisplayCommit=true;
      })
    extendTween.chain(elapseTween)
    return extendTween
  }
  /**
   * commit线动画生成
   * @param instance 父实例
   * @param curveObject curve实例
   * @param curvePoints curve点
   * @param startImpactTween 穿插的冲击动效
   * @param endImpactTween
   * @returns {Tween<{counter: number}>}
   * @private
   */
  const _generateCommitLineTween = (instance, curveObject, curvePoints, startImpactTween, endImpactTween) => {
    instance.add(curveObject)
    let tweenObject = { counter: 0 }
    let elapseTween = new TWEEN.Tween({ counter: 0 })
      .delay(5000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .to({ counter: curvePoints.length }, 2500)
      .onStart(()=>{
        curveObject.userData.enableDisplayCommit=false;
      })
      .onUpdate((tweenObject) => {
        let renderPoints = curvePoints.slice(tweenObject.counter - 1, curvePoints.length)
        curveObject.geometry.setPoints(renderPoints)
      })
    let extendTween = new TWEEN.Tween(tweenObject)
      .delay(Math.random() * 2000)
      .onStart(() => {
        if (startImpactTween)
          startImpactTween.start()
      })
      .to({ counter: curvePoints.length }, 2500)
      .onUpdate(() => {
        let renderPoints = curvePoints.slice(0, tweenObject.counter)
        curveObject.geometry.setPoints(renderPoints)
      })
      .onComplete(() => {
        curveObject.userData.enableDisplayCommit=true;
        endImpactTween.start()
      })
    extendTween.chain(elapseTween)
    return extendTween
  }
  const generateCompositeCurveTweenList = (instance, curveList = [], impactTweenList = []) => {
    return curveList.map((d, i) => {
      const [curveObject, curvePoints,rawData] = d
      let isMark = curvePoints[0].equals(curvePoints[curvePoints.length - 1])
      return isMark ?
        _generateCommitMarkTween(instance, rawData,curvePoints, impactTweenList[i * 2]) :
        _generateCommitLineTween(instance, curveObject, curvePoints, impactTweenList[i * 2], impactTweenList[i * 2 + 1])
    })
  }
  return {
    generateCommitTweenList
  }
}