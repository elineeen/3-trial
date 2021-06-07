<template>

</template>

<script>

export default {
  name: "data-handler-mixin",
  data(){
    return {
      rawData:{
          filteredSongList:[],
          filteredSongObj:{},
          fullRankingList:[],
          fullSongList:[],
      },
      dataAdapterConfig:{
        modelConverting:{
          //
          timeline2ZoomScale:this.$d3.scaleLinear([new Date('1968-01-01'),new Date('1970-01-01')]
              ,[2000,0]),
          valence2YCoordScale:this.$d3.scaleLinear([0,1],[-15,15]),
          dance2XCoordScale:this.$d3.scaleLinear([0,1],[-20,20]),
          //1到20名取分量
          relationPoint2CenteringDistanceScale:this.$d3.scaleLinear([1,20],[0,10]),
        }
      }
    }
  },
  methods:{
    _rankingGraphPositionSimulation(graphList){

        // let nestedNodeList=[],nestedLinkList=[];
        // graphList.forEach(singleGraph=>{
        //   nestedNodeList.push(singleGraph[0])
        //   nestedLinkList.push(singleGraph[1])
        // })
      // let [nodeList,linkList]=[nestedNodeList.flat(),nestedLinkList.flat()]
      graphList.forEach(graph=>{
        let [nodeList,linkList]=graph;
        this.$d3.forceSimulation(nodeList)
            .force("link", this.$d3.forceLink(linkList))
            .force("charge", this.$d3.forceManyBody().strength(node=>{
              //关联图的点有自己的斥力，每个中心点设置一个默认为5的引力
              return node.customStrength||2
            }))
            .force("x", this.$d3.forceX())
            .force("y", this.$d3.forceY())
            .velocityDecay(0.7)
            .tick(5)
            .stop();
        nodeList.forEach((node)=>{
          node.position.set(node.x,node.y,node.position.z)
        })
      })
      debugger;
      return graphList;
    },
    /**
     * 使用d3.simulation进行模拟
     * @param nodeList 参考d3 simulation node属性 https://github.com/d3/d3-force/blob/v2.1.1/README.md#simulation_nodes
     * @private
     */
    _centeringPositionSimulation(nodeList){
      this.$d3.forceSimulation(nodeList)
          // .force("link", this.$d3.forceLink(links).id(d => d.id).distance(0).strength(strength))
          .force("charge", this.$d3.forceManyBody().strength(-10))
          .force("x", this.$d3.forceX())
          .force("y", this.$d3.forceY())
          .velocityDecay(0.5)
          .tick(10)
          .stop();
          //重置vector
          nodeList.forEach((simulatedObj)=>{
            simulatedObj.position.set(simulatedObj.x,simulatedObj.y,simulatedObj.position.z)
          })
      return nodeList;
    },
    async _initRawData(){
        let [rawFilteredObj,rawObj]=await Promise.all (
            [
              this.$d3.json('./musicData/50-jahre-filtered.json'),
              this.$d3.json('./musicData/50-jahre.json'),
            ]);
        let filteredSongObj=rawFilteredObj?.songs;
        Object.keys(rawFilteredObj?.songs).forEach((songIndex)=>{
          filteredSongObj[songIndex].rankList=[]
        })
        let fullRankingList=rawObj?.entries
        this.lodash.assign(this.rawData,{fullRankingList,filteredSongObj});
    },
    _aggregateSongModal(){
      let {filteredSongObj,fullRankingList}=this.rawData;
      fullRankingList.forEach((rankData)=>{
          let songIndex=rankData?.song;
          if(filteredSongObj[songIndex]){
            let match=filteredSongObj[songIndex];
            match.rankList.push(rankData);
            match.releaseDate=rankData.date;
          }
      })
      let filteredSongList=[];
      const {timeline2ZoomScale,valence2YCoordScale,dance2XCoordScale,relationPoint2CenteringDistanceScale}=this.dataAdapterConfig.modelConverting
      Object.keys(filteredSongObj).forEach((key,index)=>{
        let target=filteredSongObj[key];
        //根据scale生成中心点xyz坐标
        let position=new this.THREE.Vector3(
            dance2XCoordScale(target.dance),
            valence2YCoordScale(target.valence),
            timeline2ZoomScale(new Date(target.releaseDate)));
        const appendAttrs={position,x:position.x,y:position.y,index};
        filteredSongList.push({...this.lodash.cloneDeep(filteredSongObj[key]),...appendAttrs})
      })
      //simulation发散中心点坐标
      let centeringNodeList=this._centeringPositionSimulation(filteredSongList);

      //生成关联点拓扑图
      const rankingStrengthScale=this.$d3.scaleLinear([1,20],[-2.5,-4])
      let rankingNodeNestingGraphList=centeringNodeList.map((d,i)=>{
        let {rankList,position}=d;
        let relationGraphNodeList= rankList.map((rankData,innerI)=>{
          //距离配旋转生成一个离中心点的随机位置，rank越高离中心点越近
          let offset=relationPoint2CenteringDistanceScale(rankData.rank),randomAngle=Math.random()*Math.PI*2
          let [offsetX,offsetY]=[offset*Math.sin(randomAngle),offset*Math.cos(randomAngle)]
          let relativeNodePosition=new this.THREE.Vector3(position.x+offsetX,position.y+offsetY,timeline2ZoomScale(new Date(rankData.date)));
          return {
            id:`graph-${i}-${innerI}`,
            position:relativeNodePosition,
            x:position.x,
            y:position.y,
            customStrength:rankingStrengthScale(rankData.rank)
          }
        })
        let linkList=[];
        relationGraphNodeList.forEach((node,i)=>{
          if(i>=1)
            linkList.push({source:i-1,target:i})
        })
        //包含生成的关联图和中心点
        let nodeList=[...relationGraphNodeList,{...d,fx:d.x,fy:d.y}]
        return [nodeList,linkList];
      })
      let simulatedGraphList=this._rankingGraphPositionSimulation(rankingNodeNestingGraphList);
      return [centeringNodeList,simulatedGraphList];
    },
    async initFilteredRelationMapData(){
      await  this._initRawData();
      return this._aggregateSongModal()
    },

  }
}
</script>

<style scoped>

</style>