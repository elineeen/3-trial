<template>
  <Renderer ref="renderer" antialias resize="window" pointer>
    <Camera :far="500" ref="camera" :position="interact.cameraPosition"  />
    <Scene ref="sceneInstance" :background="config.background">
      <PointLight :position="{ y: 0, z: 50 ,x:25}" />
      <Box ref="box" :size="1" :position="{ x: 0, y: 0, z: -30 }  " :rotation="{ y: Math.PI / 4, z: Math.PI / 4 }" >
        <LambertMaterial />
      </Box>
      <Box ref="box1" :size="1" :position="{ x: 30, y: 0, z: -30 }  " :rotation="{ y: Math.PI / 4, z: Math.PI / 4 }" >
        <LambertMaterial />
      </Box>
      <Box ref="box2" :size="1" :position="{ x: 30, y: 30, z: -30 }  " :rotation="{ y: Math.PI / 4, z: Math.PI / 4 }" >
        <LambertMaterial />
      </Box>
    </Scene>
  </Renderer>
</template>

<script>
import * as THREE from "three";
import DataHandlerMixin from "./dataHandlerMixin.vue";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {customOrbitControls} from "../../components/util/customOrbitControls";

export default {
  name: "cameraTester",
  mixins:[DataHandlerMixin],
  data(){
    return {
      config:{
        viewPortSpinRatio:this.$d3.scaleLinear([-1,1],[0,1]),
        background:'black',
        orbitControlConfig:{
          enableZoom:true,
          // autoRotate:true,
          zoomSpeed:3,
          enableRotate:true,
          minDistance :0,
          maxDistance :2000,
          enableDamping:true,
          dampingFactor:0.25,

          // min
        }
      },
      interact:{
        mousePosition:new THREE.Vector3(),
        cameraPosition:{
          x: 0,
          y: 0,
          z: 2000
        },
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
  watch:{
    // 'interact.mousePosition':function (newVal){
    //   debugger;object3d
    // }
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
      // obj.cameraCtrl = cameraCtrl
    },
    //画图，画点+画线
    renderRelationGraph(graphList){
      graphList.forEach((graph)=>{
        let [nodeList,linkList]=graph;
        this.renderLink(linkList)
        this.renderNode(nodeList,'white');
      })
    },
    renderLink(linkList,color='white'){
      const sceneInstance=this.$refs.sceneInstance;
      const material = new this.THREE.LineBasicMaterial({opacity:0.1,transparent:true});
      linkList.forEach((link)=>{
        const points = [link.source.position, link.target.position,];
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        let line = new THREE.Line( geometry, material )
        sceneInstance.add(line)
      })
    },
    //在我写这个demo的时候，trois还没有出sprite组件，所以只能通过原始scene.add方法添加精灵模型
    renderNode(nodeList,color='red'){
      const sceneInstance=this.$refs.sceneInstance
      const circleSpriteMaterial=new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load("./musicData/circle.png"),//设置精灵纹理贴图
        color:color,
      });
      const instance=new this.THREE.Sprite(circleSpriteMaterial);
      nodeList.forEach((nodeData)=>{
        let centering= instance.clone();
        sceneInstance.add(centering)
        centering.position.copy(nodeData.position)//.copy()
        // let material=new this.THREE.SpriteMaterial()
      })
    },
    initBackGround(){
      let  texture = new THREE.TextureLoader().load( "/3-trial/backgroundTexture.png" );
      texture.wrapT=THREE.RepeatWrapping;
      this.config.background=texture;
    },
    adjustZoom(event){
      const minzoom = 0;
      const maxzoom = 500;
      let {zoomPos,zoom}=this.interact;
      this.interact.zoom = THREE.MathUtils.clamp( Math.pow( Math.E, zoomPos ), minzoom, maxzoom );
      // this.interact.zoomPos = Math.log( zoom );
      if ( event.deltaY < 0 ) {
        this.interact.zoomPos -= this.config.orbitControlConfig.zoomSpeed;
      } else if ( event.deltaY > 0 ) {
        this.interact.zoomPos += this.config.orbitControlConfig.zoomSpeed;
      }
    },
    adjustCameraPosition(){
      let {renderer} = this.$refs,{zoomPos}=this.interact;
      let {x,y}=renderer.three.pointer.positionN,{width,height}=renderer.size,{viewPortSpinRatio}=this.config;
      this.interact.cameraPosition.x= Math.sin( .25 * Math.PI * ( viewPortSpinRatio(x)- .5 ) )*zoomPos
      this.interact.cameraPosition.y= Math.sin( .25 * Math.PI * ( viewPortSpinRatio(y) - .5 ) )*zoomPos
      this.interact.cameraPosition.z= Math.cos( .5 * Math.PI * ( viewPortSpinRatio(x) - .5 ) )*zoomPos
    },
  },
  async mounted() {
    const {renderer,box} = this.$refs
    this.initBackGround();
    this.initOrbitControl()
    let [centerNodeList,graphList]=await this.initFilteredRelationMapData();
    this.renderNode(centerNodeList)
    this.renderRelationGraph(graphList)
    // window.addEventListener( 'mousemove', this.adjustCameraPosition );
    // window.addEventListener( 'wheel', this.adjustZoom );
    renderer.onBeforeRender(() => {
      box.mesh.rotation.x += 0.01
    })
  }
}
</script>

<style scoped>

</style>