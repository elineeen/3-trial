import { onMounted, ref } from 'vue'
import * as THREE from 'three'

export default async function useBillTextSelector(instance,map){
  let fontLoader=null;
  let canvasInstance=null;
  let textureInstance=null;
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
  const _generateTextCanvas=(text='tester')=>{
    const canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = 700;
    canvas.height = 400;
    ctx.fillStyle='black'
    ctx.textBaseline = "top";
    ctx.font=' bold 56px Avenir,Helvetica'
    ctx.fillText(text, 0, 0);
    return canvas;
  };
  const updateCanvas=(canvas,instance,text,border)=>{
    let ctx= canvas.getContext('2d');
    if(ctx){
      ctx.clearRect(0,0,700,400);
      ctx.fillStyle='black'
      ctx.textBaseline = "top";
      ctx.font=' bold 56px Avenir,Helvetica'
      ctx.fillText(text, 0, 0);
      if(border){
        ctx.lineWidth=15;
        ctx.strokeStyle = 'green';
        // ctx.fillStyle='none';
        ctx.strokeRect(0, 0, 700, 400);
        debugger;
      }
      instance.needsUpdate=true;
    }
  }
  const createTextSelectorInstance=(x,y,w,h)=>{
    const selector =new THREE.Group();
    let displayText=ref('tester')
    selector.position.set(x,y,instance.position.z)
    let canvasInstance=_generateTextCanvas()
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
        updateCanvas(canvasInstance,textureInstance,displayText.value,true)
      },
      clear:()=>{
        debugger;
        updateCanvas(canvasInstance,textureInstance,displayText.value)
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