<template>
  <Renderer ref="renderer" antialias resize="window" pointer>
    <Camera :far="500" :fov="50" :aspect="1" ref="camera" :position="interact.cameraPosition" :lookAt="interact.cameraLookatPosition"  />
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
        rank2spriteScaleRatio:this.$d3.scaleLinear([0,1,20],[2,1.5,0.6]),
        background:'black',
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
        }
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
    //画图，画点+画线
    renderRelationGraph(graphList){
      graphList.forEach((graph)=>{
        let [nodeList,linkList]=graph;
        nodeList.pop();
        this.renderLink(linkList)
        this.renderNode(nodeList,'white');
      })
    },
    renderLink(linkList,color='white'){
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
    renderNode(nodeList,color='yellow'){
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
    initBackGround(){
      let  texture = new THREE.TextureLoader().load( "/3-trial/backgroundTexture.png" );
      texture.wrapT=THREE.RepeatWrapping;
      this.config.background=texture;
    },
    adjustCameraPosition(){
      let {renderer} = this.$refs
      let {x,y}=renderer.three.pointer.position
      this.interact.cameraLookatPosition.x=x
      this.interact.cameraLookatPosition.y=-y
    },
  },
  async mounted() {
    const {renderer,box} = this.$refs
    this.initBackGround();
    this.control.orbitControlInstance=this.initOrbitControl()
    let [centerNodeList,graphList]=await this.initFilteredRelationMapData();
    this.renderNode(centerNodeList)
    this.renderRelationGraph(graphList)
    window.addEventListener( 'mousemove', this.adjustCameraPosition );
    // window.addEventListener( 'wheel', this.adjustZoom );
    renderer.onBeforeRender(() => {
      box.mesh.rotation.x += 0.01
    })
  }
}
</script>

<style scoped>

</style>