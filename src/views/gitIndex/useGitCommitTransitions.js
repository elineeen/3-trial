import * as THREE from 'three'
import { Vector3 } from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as d3 from 'd3'
import { ref } from 'vue'
import { MeshLine, MeshLineMaterial } from 'meshline'

export default function useGitCommitTransitions () {
  const distance2OpalRadiusScale = d3.scaleLinear([0, 1,15], [5,10, 15])
  const distance2ImpactRadiusScale=d3.scaleLinear([0,15],[1,2])
  /**
   * 四件事：获取原始数据-》根据原始数据转换成三个向量点-》根据x坐标排序展示顺序-》生成curve实例及对应曲线点阵并返回
   * @returns {Promise<void>}
   */
  const generateOrderedCommitCurveList = async () => {
    let commitList = await d3.json('./gitIndex/github-index.json')
    //排序，靠近x初始位置的优先动画展示
    return commitList
      .map((d) => {
        let { gm, gop } = d
        let srcCoordinate = [gop.lon, gop.lat], targetCoordinate = [gm.lon, gm.lat]
        let [startVector, endVector] = [_transformCoord2Vec(srcCoordinate), _transformCoord2Vec(targetCoordinate)]
        let centerVector = _generateCenter(startVector, endVector)
        return [startVector, centerVector, endVector]
      })
      .sort((el1, el2) => {
        let [startVec1, startVec2] = [el1[0], el2[1]]
        return Math.abs(startVec1.x) > Math.abs(startVec2.x)
      })
      .map(d => {
        let [startVector, centerVector, endVector] = d
        let curvePath = new THREE.QuadraticBezierCurve3(startVector, centerVector, endVector)
        const curvePoints = curvePath.getPoints(200)
        const meshLine = new MeshLine()
        meshLine.setPoints([])
        const material = new MeshLineMaterial({
          color: 'lightGreen',
          lineWidth: .04,
          useAlphaMap: 0,
          resolution: new THREE.Vector2(1920, 1080)
          // opacity:0.5,
          // transparent:true,
        })
        const curveObject = new THREE.Mesh(meshLine, material)
        // curveObject.lookAt.apply(curveObject, centerVector.toArray())
        // curveObject.lookAt.apply(curveObject,[0,0,12])
        return [curveObject, curvePoints]
      })
  }
  /**
   * 坐标系转换，可以参考csdn这篇文章 https://blog.csdn.net/qihoo_tech/article/details/101443066
   * @param coordPair
   * @param radius
   * @returns {Vector3}
   * @private
   */
  const _transformCoord2Vec = (coordPair = [], radius = 5) => {
    return new THREE.Vector3().setFromSphericalCoords(
      radius,
      THREE.MathUtils.degToRad(90 - coordPair[1]),
      THREE.MathUtils.degToRad(90 + coordPair[0])
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
    return new THREE.Vector3().setFromSphericalCoords(curveRadius, (startSph.phi + endSph.phi) / 2, (startSph.theta + endSph.theta) / 2)
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
          impactMaxRadius: 5 * THREE.Math.randFloat(0.5, 0.75),
          impactRatio: 0
        }
      )
    })
    let impactTweenList = uniformImpactNodeList.map((d, i) => {
      return new TWEEN.Tween(d)
        .to({ impactRatio: 1 }, THREE.Math.randInt(2500, 5000))
        .onComplete(() => {
          d.impactRatio = 0
        })
    })
    return [impactTweenList, uniformImpactNodeList]
  }
  const _generateCommitMarkTween = (instance, curvePoints,impactTween) => {
    let markGroup = new THREE.Group()
    let groupEndSpherical = new THREE.Spherical().setFromVector3(curvePoints[0])
    let groupStartSpherical = groupEndSpherical.clone()
    groupStartSpherical.radius = 4.3//magic number 5-0.6
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
      color: 'lightBlue',
      lineWidth: .02,
      useAlphaMap: 0,
    })
    const pointGeo = new THREE.BufferGeometry().setFromPoints([pointDistanceVec])
    const pointMaterial = new THREE.PointsMaterial({ size: .1 })
    const markLineObj = new THREE.Mesh(markLine, lineMaterial)
    const markPointObj = new THREE.Points(pointGeo, pointMaterial)
    markGroup.add(markLineObj, markPointObj)
    markGroup.position.set(new THREE.Vector3().setFromSpherical(groupStartSpherical))
    instance.add(markGroup)

    const elapseTween = new TWEEN.Tween(new THREE.Vector3().setFromSpherical(groupEndSpherical))
      .delay(5000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .to(new THREE.Vector3().setFromSpherical(groupStartSpherical), 3000)
      .onUpdate((positionVec) => {
        markGroup.position.set(positionVec.x, positionVec.y, positionVec.z)
      })
    const extendTween = new TWEEN.Tween(new THREE.Vector3().setFromSpherical(groupStartSpherical))
      .delay(Math.random() * 2000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onStart(()=>{
        if(impactTween){
          impactTween.start();
        }
      })
      .to(new THREE.Vector3().setFromSpherical(groupEndSpherical), 3000)
      .onUpdate((positionVec) => {
        markGroup.position.set(positionVec.x, positionVec.y, positionVec.z)
      })
    extendTween.chain(elapseTween)
    return extendTween
  }
  const _generateCommitLineTween = (instance, curveObject, curvePoints,startImpactTween,endImpactTween) => {
    instance.add(curveObject)
    let tweenObject = { counter: 0 }
    let elapseTween = new TWEEN.Tween({ counter: 0 })
      .delay(5000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .to({ counter: curvePoints.length }, 5000)
      .onUpdate((tweenObject) => {
        let renderPoints = curvePoints.slice(tweenObject.counter - 1, curvePoints.length)
        curveObject.geometry.setPoints(renderPoints)
        curveObject.updateMatrix()
      })
    let extendTween = new TWEEN.Tween(tweenObject)
      .delay(Math.random() * 2000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onStart(()=>{
        if(startImpactTween)
          startImpactTween.start();
      })
      .to({ counter: curvePoints.length }, 5000)
      .onUpdate(() => {
        let renderPoints = curvePoints.slice(0, tweenObject.counter)
        curveObject.geometry.setPoints(renderPoints)
      })
      .onComplete(()=>{
        if(endImpactTween)
          endImpactTween.start();
      })
    extendTween.chain(elapseTween)
    return extendTween
  }
  const generateCompositeCurveTweenList = (instance, curveList = [],impactTweenList=[]) => {
    return curveList.map((d,i) => {
      const [curveObject, curvePoints] = d
      let isMark = curvePoints[0].equals(curvePoints[curvePoints.length - 1])
      return isMark ?
        _generateCommitMarkTween(instance, curvePoints, impactTweenList[i*2]) :
        _generateCommitLineTween(instance, curveObject, curvePoints,impactTweenList[i*2],impactTweenList[i*2+1])
    })
  }
  return {
    generateCommitTweenList
  }
}