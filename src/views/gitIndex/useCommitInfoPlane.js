import * as THREE from 'three'
import { MeshBasicMaterial, Vector3 } from 'three'
import TWEEN from '@tweenjs/tween.js'
import { ref } from 'vue'
export default function useCommitInfoPlane () {
  const _generateTextCanvas = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 670
    canvas.height = 150
    return canvas
  }

  let planeCanvas=_generateTextCanvas();
  let canvasTexture=new THREE.CanvasTexture(planeCanvas)
  let planeInstance=new THREE.Sprite(new THREE.SpriteMaterial({
    map:canvasTexture,
    depthTest:false,
    depthWrite:false,
    fog:false,
  }))
  planeInstance.scale.set(6.7,1.5,1)
  planeInstance.renderOrder=-1

  /**
   * 更新commit画布内容
   * @param info commit meta data
   */
  const updateCanvas = (info={}) => {
    let ctx = planeCanvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, 670, 150)
      ctx.fillStyle='rgba(22,22,22,0.5)'
      ctx.fillRect(0,0,670,150)
      ctx.fillStyle = 'white'
      ctx.font = `${24}px Avenir,Helvetica`
      ctx.fillText(`#${info.pr}\t${info.nwo}`,20,40)
      ctx.fillText( `${info.l}\t* Opened in ${info.uol}`,20,80)
      ctx.fillText( `merged at ${info.ma} in ${info.uml}`,20,120)
      ctx.lineWidth = 5
      canvasTexture.needsUpdate = true
    }
  }
  const initCommitInfoPlane=(instance)=>{
    instance.add(planeInstance);
  };
  const toggleCommitInfoPlane=(flag=true,info='',pos=new THREE.Vector3())=>{
    planeInstance.visible=flag;
    planeInstance.position.set(pos.x,pos.y,6)
    if(info&&flag){
      updateCanvas(info)
    }
  }
  return {
    toggleCommitInfoPlane,
    initCommitInfoPlane,

  }
}