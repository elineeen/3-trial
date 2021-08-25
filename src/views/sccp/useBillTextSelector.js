import { onMounted, ref } from 'vue'
import * as THREE from 'three'

export default async function useBillTextSelector(instance,map){
  let fontLoader=null;
  let canvasInstance=null;
  let textureInstance=null;
  const fontSize=20;
  /**
   * @returns {Promise<unknown>}
   */
  const initLoader=async ()=>{
    return new Promise((resolve) => {
      new THREE.FontLoader().load('fonts/gentilis_regular.typeface.json', (font) => {
        fontLoader = font;
        resolve();
      })
    })
  }
  await initLoader()
  const _generateTextCanvas=(placementSetting,text='tester')=>{
    const canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = placementSetting.w*10;
    canvas.height = placementSetting.h*10;
    ctx.fillStyle='black'
    ctx.textBaseline = "top";
    ctx.font=`${fontSize}px Avenir,Helvetica`
    ctx.fillText(text, fontSize/2, canvas.height/2-fontSize/2);
    return canvas;
  };
  const updateCanvas=(canvas,instance,text,placementSetting,border)=>{
    let ctx= canvas.getContext('2d');
    if(ctx){
      ctx.clearRect(0,0,placementSetting.w*10,placementSetting.y*10);
      ctx.fillStyle='black'
      ctx.textBaseline = "top";
      ctx.font=`${fontSize}px Avenir,Helvetica`
      ctx.fillText(text, fontSize/2, canvas.height/2-fontSize/2);
      if(border){
        ctx.lineWidth=5;
        ctx.strokeStyle = 'green';
        // ctx.fillStyle='none';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        debugger;
      }
      instance.needsUpdate=true;
    }
  }
  const createTextSelectorInstance=(x,y,w,h)=>{
    const selector =new THREE.Group();
    let displayText=ref('tester')
    selector.position.set(x,y,0)
    // selector.scale.setScalar(0.2)

    let placementSetting={x,y,w,h}
    let canvasInstance=_generateTextCanvas(placementSetting)
    let textureInstance=new THREE.CanvasTexture(canvasInstance)
    let backGround={geometry:new THREE.PlaneGeometry(w, h),material:new THREE.MeshBasicMaterial({
        transparent:true,
        opacity:0.3,
        map:textureInstance
      })}
    let planeInstance=new THREE.Mesh(backGround.geometry,backGround.material)
    selector.add(planeInstance)
    map.set(selector,{
      focus:()=>{
        updateCanvas(canvasInstance,textureInstance,displayText.value,placementSetting,true)
      },
      clear:()=>{
        debugger;
        updateCanvas(canvasInstance,textureInstance,displayText.value,placementSetting)
      },
      update:()=>{

      }
    })
    instance.add(selector);
    return planeInstance;
    // debugger;
  };
  return {
    createTextSelectorInstance
  }
}