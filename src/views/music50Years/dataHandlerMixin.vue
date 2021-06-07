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
              ,[500,0]),
          valence2YCoordScale:this.$d3.scaleLinear([0,1],[-15,15]),
          dance2XCoordScale:this.$d3.scaleLinear([0,1],[-20,20])
        }
      }
    }
  },
  methods:{
    /**
     * 使用d3.simulation进行模拟
     * @param nodeList 参考d3 simulation node属性 https://github.com/d3/d3-force/blob/v2.1.1/README.md#simulation_nodes
     * @private
     */
    _centeringPositionSimulation(nodeList){
      return this.$d3.forceSimulation(nodeList)
          // .force("link", this.$d3.forceLink(links).id(d => d.id).distance(0).strength(strength))
          .force("charge", this.$d3.forceManyBody().strength(-3))
          // .force("x", this.$d3.forceX())
          // .force("y", this.$d3.forceY())
          .velocityDecay(0.7)
          .tick(3)
          .stop();
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
      const {timeline2ZoomScale,valence2YCoordScale,dance2XCoordScale}=this.dataAdapterConfig.modelConverting
      Object.keys(filteredSongObj).forEach((key,index)=>{
        let target=filteredSongObj[key];
        //根据scale生成中心点xyz坐标
        let centerVec3=new this.THREE.Vector3(
            dance2XCoordScale(target.dance),
            valence2YCoordScale(target.valence),
            timeline2ZoomScale(new Date(target.releaseDate)));
        const appendAttrs={centerVec3,x:centerVec3.x,y:centerVec3.y,index};
        filteredSongList.push({...this.lodash.cloneDeep(filteredSongObj[key]),...appendAttrs})
      })
      //simulation发散中心点坐标
      this._centeringPositionSimulation(filteredSongList);
      //重置vector
      filteredSongList.forEach((simulatedObj)=>{
        simulatedObj.centerVec3.set(simulatedObj.x,simulatedObj.y,simulatedObj.centerVec3.z)
      })
      return filteredSongList;
      //不用计算发行时间，json数据就是按照新到旧的排序
      // let convertedSongList=filteredSongList.map((data,index)=>{
      //
      // })
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