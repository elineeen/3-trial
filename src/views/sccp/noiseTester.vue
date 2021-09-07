<template>
  <Renderer ref="renderer" resize :pointer="{ onMove: updateTilt }">
    <Camera :position="{ y: -20, z: 10 }" :look-at="{ x: 0, y: 0, z: 0 }" />
    <Scene background="#ffffff">
      <AmbientLight  color="#ffffff" />
      <PointLight ref="light" :position="{ y: 0, z: 20 }" />
      <Mesh>
        <BoxGeometry></BoxGeometry>
        <BasicMaterial :props="{map:}">

        </BasicMaterial>

      </Mesh>
<!--      <InstancedMesh ref="imesh" :count="NUM_INSTANCES" :position="{ y: 20, z: 10 }">-->
<!--        <BoxGeometry :size="SIZE" />-->
<!--        <PhongMaterial :props="{ vertexColors: true }" />-->
<!--      </InstancedMesh>-->
    </Scene>
    <EffectComposer>
      <RenderPass />
      <FXAAPass />
      <ZoomBlurPass></ZoomBlurPass>
    </EffectComposer>
  </Renderer>
</template>

<script>
import { InstancedBufferAttribute, Object3D } from 'three';
import {
  AmbientLight,
  BoxGeometry,
  Camera,
  EffectComposer,
  FXAAPass,
  InstancedMesh,
  PhongMaterial,
  PointLight,
  Renderer,
  RenderPass,
  Scene,
  TiltShiftPass,
    ZoomBlurPass
} from 'troisjs';
// import SimplexNoise from 'troisjs/src/simplex-noise';
// const simplex = new SimplexNoise();
export default {
  components: {
    AmbientLight,
    BoxGeometry,
    Camera,
    EffectComposer,
    FXAAPass,
    InstancedMesh,
    PhongMaterial,
    PointLight,
    Renderer,
    RenderPass,
    Scene,
    TiltShiftPass,
  },
  data() {
    return {

    };
  },
  computed: {
  },
  mounted() {
  },
  methods: {
  },
};
</script>

<style scoped>

</style>