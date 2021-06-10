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
      },
      interact:{
        mousePosition:new THREE.Vector3(),
        cameraPosition:new THREE.Vector3(0,0,2000),
        cameraLookatPosition:new THREE.Vector3(0,0,0),
        zoomPos:2000,
        zoom:500,
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
      graphList.forEach((graph)=>{
        let [nodeList,linkList]=graph;
        nodeList.pop();
        this.renderLinkList(linkList)
        this.renderNodeList(nodeList,'white');
      })
    },

    renderLinkList(linkList,color='white'){
      const sceneInstance=this.$refs.sceneInstance;
      const material = new this.THREE.LineBasicMaterial({opacity:0.1,transparent:true,depthWrite:false});
      linkList.forEach((link)=>{
        const points = [link.source.position, link.target.position,];
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        let line = new THREE.Line( geometry, material )
        sceneInstance.add(line)
      })
    },
    //在我写这个demo的时候，trois还没有出sprite组件，所以只能通过原始scene.add方法添加精灵模型
    renderNodeList(nodeList,color='yellow'){
      const sceneInstance=this.$refs.sceneInstance
      const circleSpriteMaterial=new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load("./musicData/circle.png"),//设置精灵纹理贴图
        color:color,
      });
      const instance=new this.THREE.Sprite(circleSpriteMaterial);
      nodeList.forEach((nodeData)=>{
        let node= instance.clone();
        let rank=nodeData.rank||0
        node.scale.setScalar(this.config.rank2spriteScaleRatio(rank));
        sceneInstance.add(node)
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
        // let cardGeo=new THREE.PlaneBufferGeometry(70,40)
        let cardInstance=new THREE.Sprite(material);
        cardInstance.position.copy(songData.position)
        sceneInstance.add(cardInstance);
        debugger;
        cardInstance.scale.set(21,12,1);
      })
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
      console.dir(renderer.camera.position.x);
    },
  },
  async mounted() {
    await this.initLoader();
    this.control.orbitControlInstance=this.initOrbitControl()
    let [centerNodeList,graphList]=await this.initFilteredRelationMapData();
    this.renderNodeCardList(centerNodeList)
    this.renderRelationGraph(graphList)
    this.renderYearText();
    window.addEventListener( 'mousemove', this.adjustCameraLookAtPosition );
  }
}
</script>

<style scoped>

</style>