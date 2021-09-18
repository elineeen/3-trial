import { globeImgData } from './globeImgData'
import * as THREE from 'three'
import * as d3 from 'd3';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils'
import useGitCommitTransitions from './useGitCommitTransitions'
export default function usePointGlobePlane(){
  const globalOrthodoxImg = new Image();
  const [globeCanvasWidth,globeCanvasHeight]=[360,181]
  const geometryFragmentList=[]
  let commitList=[]//提交数据
  let {generateCommitTween}=useGitCommitTransitions();
  const _initImgData=()=>{
    return new Promise(resolve => {
      globalOrthodoxImg.src = '/gitIndex/globalMap.png';
      // globalOrthodoxImg.src = globeImgData;
      globalOrthodoxImg.onload = () => {
        resolve();
      };
    })
  }
  const _initCommitList=async ()=>{
    commitList=await d3.json('./gitIndex/github-index.json')
  }
  const _initCommitAnimations=(instance)=>{
    let animationIndex=0;
    return generateCommitTween(instance,commitList.slice(0,10))
    // d3.interval(()=>{
    //   animationIndex=animationIndex<commitList.length?animationIndex+10:animationIndex%commitList.length+10;
    //   let animateCommitList=commitList.slice(animationIndex-10,animationIndex);
    //
    //
    //   // //回收collect态
    //   // this.loopData.renderList=arcList=arcList.filter(d=>d.state!=='collect');
    //   // if(counterIndex>=githubCommits.length-2)
    //   //   counterIndex=counterIndex%githubCommits.length
    //   // counterIndex++;
    //   // let gitCommitObj=githubCommits[counterIndex];
    //   // let {gm,gop}=gitCommitObj
    //   // let srcCoordinate=[gop.lon,gop.lat],targetCoordinate=[gm.lon,gm.lat]
    //   // let geoLines = d3.geoInterpolate(srcCoordinate, targetCoordinate);
    //   //
    //   //
    //   // //state内置 extend=>transfer=>shrink
    //   // arcList.push({srcCoordinate,targetCoordinate,geoLines,t:0,state:'extend'});
    //   // //可以考虑重叠canvas与svg来解决问题？
    //
    // },1000)
  }

  const initCompositeGlobePlane=async (instance)=>{
    await _initImgData()
    await _initCommitList();
    let globeCanvas = document.createElement("canvas");
    globeCanvas.width = globeCanvasWidth;
    globeCanvas.height = globeCanvasHeight;
    let ctx = globeCanvas.getContext("2d");
    let dummyObj = new THREE.Object3D();
    ctx.drawImage(globalOrthodoxImg, 0, 0, globeCanvasWidth, globeCanvasHeight);
    ctx.fillStyle = "white";
    let globeCanvasPixelData = ctx.getImageData(0, 0, globeCanvasWidth, globeCanvasHeight).data;
    for(let y = 0; y < globeCanvasHeight; y++) {
      for (let x = 0; x < globeCanvasWidth; x++) {
        let idx = ( ( globeCanvasWidth * y ) + x ) * 4 + 3;
        let d = globeCanvasPixelData[idx];
        if(d>128){
          let fragmentPositionVector=new THREE.Vector3().setFromSphericalCoords(
            5,
            THREE.MathUtils.degToRad(y),
            THREE.MathUtils.degToRad(x)
          )
          let fragmentPositionArr=fragmentPositionVector.toArray();
          dummyObj.lookAt(fragmentPositionVector);
          dummyObj.updateMatrix();
          let planeSize = 0.03;
          let minSize = 0;
          let geometryFragment = new THREE.PlaneBufferGeometry(planeSize, planeSize) //矩形平面
          geometryFragment.applyMatrix4(dummyObj.matrix)
          geometryFragment.translate.apply(geometryFragment,fragmentPositionArr)
          let geoCenters=new Array(4).fill(fragmentPositionArr).flat()
          geometryFragment.setAttribute('center',new THREE.Float32BufferAttribute(geoCenters,3))
          // geometryFragment.setAttribute("scale", new THREE.Float32BufferAttribute([1,1,1,1], 1));
          geometryFragmentList.push(geometryFragment)
        }
      }
    }
    let compositeGeometries=BufferGeometryUtils.mergeBufferGeometries(geometryFragmentList,true)
    let material=new THREE.MeshBasicMaterial({
      side:THREE.FrontSide,
      color:0x6633aa
    })
    // material.defines = {"USE_UV":""};
    const compositePlaneInstance=new THREE.Mesh(compositeGeometries,material)
    instance.add(compositePlaneInstance);



    _initCommitAnimations(instance);
    return compositePlaneInstance
  }
  return {
    initCompositeGlobePlane
  }

}