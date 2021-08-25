<template>
  <Renderer ref="renderer" antialias resize="window" pointer>
    <Camera :far="550" :fov="50" :aspect="1" ref="camera" :position="interact.cameraPosition" :lookAt="interact.cameraLookatPosition"  />
    <Scene ref="sceneInstance" :background="config.backgroundLoader">
    </Scene>
  </Renderer>
</template>
<script>
import * as THREE from "three";
import DataHandlerMixin from "./dataHandlerMixin.vue";
import {customOrbitControls} from "../../components/util/customOrbitControls";
import useRaycaster from 'troisjs/src/core/useRaycaster'
import TWEEN from "@tweenjs/tween.js";
export default {
  name: "cameraTester",
  mixins:[DataHandlerMixin],
  data(){
    return {
      config:{
        viewPortSpinRatio:this.$d3.scaleLinear([-1,1],[0,1]),
        rank2spriteScaleRatio:this.$d3.scaleLinear([0,1,20],[2,1.5,0.6]),
        backgroundLoader:'black',
        fontLoader:null,
        orbitControlConfig:{
          enableZoom:true,
          // autoRotate:true,
          zoomSpeed:3,
          enablePan:false,
          enableRotate:false,
          minDistance :0,
          maxDistance :2000,
          enableDamping:true,
          dampingFactor:0.25,

          // min
        },
        
      },
      control:{
        orbitControlInstance:null,
        rayCasterInstance:null,
      },
      interact:{
        mousePosition:new THREE.Vector3(),
        cameraPosition:new THREE.Vector3(0,0,2000),
        cameraLookatPosition:new THREE.Vector3(0,0,0),
        zoomPos:2000,
        zoom:500,
        clickEffect:{
          activatedNodeInstanceList:null,
          activatedLineTweenList:null,
        }
      },
      adaptedSongList:[],
    }
  },
  computed:{
    dynamicMousePosition(){

    },
  },
  methods:{
    initOrbitControl(){
      let {renderer}=this.$refs
      const cameraCtrl = new customOrbitControls(renderer.camera, renderer.renderer.domElement)
      if (this.config.orbitControlConfig instanceof Object) {
        Object.entries(this.config.orbitControlConfig).forEach(([key, value]) => {
          cameraCtrl[key] = value
        })
      }
      renderer.onBeforeRender(() => { cameraCtrl.update() })
      return cameraCtrl
    },
    //textGeometry trois也还没有支持emmm
    renderYearText(){
      let yearList=[1968,1969];
      let zoomOffsetList=[1500,500];
      const textMaterial=new this.THREE.MeshBasicMaterial({transparent:true,opacity:0.1})
      const sceneInstance=this.$refs.sceneInstance;
      yearList.forEach((year,index)=>{
        const geometry = new this.THREE.TextGeometry( year+'', {
          size: 40,
          height: 0.1,
          font:this.config.fontLoader,
        });
        geometry.computeBoundingBox();
        const centerOffset = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
        const centerOffsetY = - 0.5 * ( geometry.boundingBox.max.y - geometry.boundingBox.min.y );
        let instance=new this.THREE.Mesh(geometry,textMaterial)
        instance.renderOrder=10;
        instance.position.set(centerOffset,centerOffsetY,zoomOffsetList[index]);
        sceneInstance.add(instance)
      })
    },
    //画图，画点+画线
    renderRelationGraph(graphList){
      const sceneInstance=this.$refs.sceneInstance;
      graphList.forEach((graph)=>{
        //每个图都为一个组，这样可以从每个node的点击事件就可以找到parent的整个拓扑图，从而做到点击动效
        const graphGroup=new this.THREE.Group();
        let [nodeList,linkList]=graph;
        nodeList.pop();
        this.renderLinkList(linkList,graphGroup)
        this.renderNodeList(nodeList,'white',graphGroup);
        sceneInstance.add(graphGroup);
      })
    },
    renderLinkList(linkList,group){
      const material = new this.THREE.LineBasicMaterial({opacity:0.1,transparent:true,depthWrite:false});
      linkList.forEach((link)=>{
        const points = [link.source.position, link.target.position,];
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        let line = new THREE.Line( geometry, material )
        this.$refs.renderer.three.addIntersectObject(line);
        group.add(line)
      })
    },
    //在我写这个demo的时候，trois还没有出sprite组件，所以只能通过原始scene.add方法添加精灵模型
    //后话，结果6月中旬更了，没缘分.jpg
    renderNodeList(nodeList,color='yellow',parentGroup){
      const {sceneInstance,renderer}=this.$refs
      const circleSpriteMaterial=new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load("./musicData/circle.png"),//设置精灵纹理贴图
        color:color,
      });
      const instance=new this.THREE.Sprite(circleSpriteMaterial);
      nodeList.forEach((nodeData)=>{
        let node= instance.clone();
        let rank=nodeData.rank||0
        node.scale.setScalar(this.config.rank2spriteScaleRatio(rank));
        node.userData=this.lodash.cloneDeep(nodeData);
        if(parentGroup){
          parentGroup.add(node)
          renderer.three.addIntersectObject(node);
        }
        else{
          sceneInstance.add(node)
        }
        node.position.copy(nodeData.position)//.copy()
        // let material=new this.THREE.SpriteMaterial()
      })
    },
    //planeGeometry渲染canvas型texture，虽然可以拼凑多个texture但是代码太长太难看了，还是换成planegeometry形式的了
    //最后还是换成sprite了，要不然还得控制plane的lookat朝向
    renderNodeCardList(centerNodeList){
      const sceneInstance=this.$refs.sceneInstance
      const textMaterial=new this.THREE.SpriteMaterial()
      centerNodeList.forEach((songData)=>{
        let cardTexture=this.drawCardCanvas(songData);
        let material=new THREE.SpriteMaterial({map:cardTexture,color:"#ff649f"});
        let cardInstance=new THREE.Sprite(material);
        cardInstance.position.copy(songData.position)
        sceneInstance.add(cardInstance);
        cardInstance.scale.set(21,12,1);
      })
    },
    //生成一个带rank数字的node CanvasTexture
    generateNodeCanvasTexture(nodeData){
      const canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');
      canvas.width = 100;
      canvas.height = 100;
      ctx.beginPath();
      ctx.arc(50, 50, 50, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.font='bold 56px Avenir,Helvetica';
      ctx.fillText(nodeData?.rank, 32.5, 65);
      return new THREE.CanvasTexture(canvas);
    },
    //根据数据画一个2d canvas，
    drawCardCanvas(songData){
      const canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');
      canvas.width = 700;
      canvas.height = 400;
      ctx.fillStyle='white'
      ctx.textBaseline = "top";
      ctx.font=' bold 56px Avenir,Helvetica'
      ctx.fillText(songData.artist, 0, 0);
      ctx.font='80px Avenir,Helvetica'
      ctx.fillText(songData.title, 0, 80);
      ctx.beginPath();
      ctx.arc(50, 220, 50, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.font='bold 56px Avenir,Helvetica'
      ctx.fillText(songData.highestRank, 32.5, 195);
      ctx.font='56px Avenir,Helvetica'
      ctx.fillStyle = 'white';
      ctx.fillText(this.dayjs(songData.releaseDate).format('LL'), 120, 195);
      return new THREE.CanvasTexture(canvas);
    },
    /**
     * 因为three的loader全是cb形式，这里包裹了一层promise回避掉地狱.jpg
     * @returns {Promise<unknown[]>}
     */
    initLoader(){
      this.config.fontLoader= new THREE.FontLoader().load( 'fonts/helvetiker_bold.typeface.json' );
      let fontLoaderPromise= new Promise((resolve)=>{
        new THREE.FontLoader().load( 'fonts/helvetiker_regular.typeface.json',(font)=>{
          this.config.fontLoader=font;
          resolve();
        })
      })
      let backgroundLoaderPromise=new Promise((resolve)=>{
        new THREE.TextureLoader().load( "./backgroundTexture.png" ,(texture)=>{
          texture.wrapT=THREE.RepeatWrapping;
          this.config.backgroundLoader=texture;
          resolve();
        })
      })
      return Promise.all([fontLoaderPromise,backgroundLoaderPromise])
    },
    adjustCameraLookAtPosition(){
      let {renderer} = this.$refs
      let {x,y}=renderer.three.pointer.position
      this.interact.cameraLookatPosition.x=x
      this.interact.cameraLookatPosition.y=-y
    },
    //本来想着是颜色渐变，转念一想直接改透明度他不香吗
    activateGraphLinkEffect(linkInstanceList){
      return linkInstanceList.map((instance)=>{
        const opacityTweenObj={opacity:0.1};
        const tween = new TWEEN.Tween(opacityTweenObj)
            .to({opacity:1}, 400)
            .onUpdate(() => {
              instance.material.opacity=opacityTweenObj.opacity
            })
            .repeat(Infinity)
            .yoyo(true)
            .start();
        return tween
      })
    },
    /**
     * @todo 点击其他位置时消失
     * @param group
     */
    activateGraphNodeEffect(nodeInstanceList){
      // let nodeInstanceList=group.children;
      const sceneInstance=this.$refs.sceneInstance;
      //好像还是应该作为three.group添加好一点，并不会卡生成
      let tempGroup=[]
      let tweenList=nodeInstanceList.map((nodeInstance)=>{
        let {userData}=nodeInstance
        let texture=this.generateNodeCanvasTexture(userData)
        let material=new THREE.SpriteMaterial({map:texture});
        let instance=new THREE.Sprite(material);
        tempGroup.push(instance);
        instance.position.copy(userData.position)
        const scale={x:0.5,y:0.5,z:0.5};
        const tweenExpand = new TWEEN.Tween(scale)
            .easing(TWEEN.Easing.Cubic.Out)
            .to({x:3,y:3}, 400)
            .onUpdate(() => {
              instance.scale.set(scale.x,scale.y,scale.z);
            })
        const tweenShrink = new TWEEN.Tween(scale)
            .easing(TWEEN.Easing.Cubic.Out)
            .to({x:2,y:2}, 400)
            .onUpdate(() => {
              instance.scale.set(scale.x,scale.y,scale.z);
            })
        tweenExpand.chain(tweenShrink)
        return {tweenExpand,instance}
      })
      tweenList.forEach(({tweenExpand,instance},index)=>{
        sceneInstance.add(instance);
        tweenExpand.delay(index*150).start();
      })
      return tempGroup;
    },
    _checkNodeInactivatedNodeInstanceList(node){
      let flag=false,{activatedNodeInstanceList}=this.interact.clickEffect;
      if(activatedNodeInstanceList&&node){
        flag=activatedNodeInstanceList.find((activatedNode)=>{
          return node===activatedNode
        })
      }
      return flag;
    },
    //解除当前生效的点击动效，包含line和node 两部分
    deactivateClickEffects(){
      let {activatedNodeInstanceList,activatedLineTweenList}=this.interact.clickEffect;
      if(activatedNodeInstanceList&&activatedLineTweenList){
        //so this part of code do not work
        // debugger;
        // activatedNodeInstanceList.forEach(node=>{
        //   this.$refs.sceneInstance.remove(node);
        // })

        debugger;
        //directly use removeFromParent api works fine
        activatedNodeInstanceList.forEach(node=>{
          node.removeFromParent();
        })

        activatedLineTweenList.forEach(tween=>{
          TWEEN.remove(tween);
        })
        this.lodash.assign(this.interact.clickEffect,{activatedNodeInstanceList:null,activatedLineTweenList:null});
      }
      // this.activateGraphNodeEffect()
    },
    dispatchRelationExpansion(){
      let {pointer}=this.$refs.renderer.three;
      if(this.control.rayCasterInstance){
        let intersect=this.control.rayCasterInstance.intersect(pointer.positionN,pointer.intersectObjects,false)
        if(intersect.length>0){
          debugger;
          let closestNode=intersect[0].object;
          let isValidResponseNode=closestNode?.parent instanceof this.THREE.Group;
          let isInactivatedNodeInstanceList=this._checkNodeInactivatedNodeInstanceList(closestNode);
          //先判断点击点是否在已有动效group中，再判断是否是可触发动效点，如果是则关闭老特效后触发新动效，如果不是则只关闭老特效
          if(!isInactivatedNodeInstanceList){
            this.deactivateClickEffects();
            if(isValidResponseNode){
              let nodeInstanceList=[],linkInstanceList=[],instanceList=closestNode?.parent?.children;
              instanceList.forEach((instance)=>{
                if(instance instanceof THREE.Line)
                  linkInstanceList.push(instance)
                else if(instance instanceof  THREE.Sprite)
                  nodeInstanceList.push(instance);
              })
              let activatedLineTweenList=this.activateGraphLinkEffect(linkInstanceList)
              let activatedNodeInstanceList =this.activateGraphNodeEffect(nodeInstanceList)
              this.lodash.assign(this.interact.clickEffect,{activatedNodeInstanceList,activatedLineTweenList})
            }
          }
        }
      }

    }
  },
  async mounted() {
    await this.initLoader();
    this.control.orbitControlInstance=this.initOrbitControl()
    //建议使用sprite组件的@click事件，这里是当时用的原生的sprite，所以只能扒拉出来源码的useraycaster来用
    this.control.rayCasterInstance=new useRaycaster({camera:this.$refs.camera?.camera});
    let [centerNodeList,graphList]=await this.initFilteredRelationMapData();
    this.renderNodeCardList(centerNodeList)
    this.renderRelationGraph(graphList)
    this.renderYearText();
    window.addEventListener( 'mousemove', this.adjustCameraLookAtPosition );
    window.addEventListener( 'click', this.dispatchRelationExpansion );
  }
}
</script>

<style scoped>

</style>