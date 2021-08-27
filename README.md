# 3-trial
```
 trials with three&trois js
 mainly focus in webgl 3D effects experiments,if u r interested in 2d visiualization,
 you can visit https://github.com/elineeen/d3Trial for more infomation about d3&2d works
 listed demo is ordered by createTime desc
```
## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn dev
```

### Compiles and minifies for production
```
yarn build
```
## try demos online(用的vite默认打包配置，不关心兼容问题，学新技术用什么浏览器自己没点逼数吗)

### [3D editable bill](https://elineeen.github.io/3-trial/#/cbill)
<font color='#f73131'>warning: the texture picture is fairly large(about 2M) 
and i'm not interested in compressing the img, so be patient lol</font>
```
 An original work, resources get from daily work,with editable contents & orbitcontrol.
 I've made my words to do this in vue 3, it was quite confusing in first time and my code seem to be suck,
 but it's fun using compositon api, and i'll keep using this in future 3D work.
 I'm not so satisfied with the state mathcine and how code is arranged,
 so i may take some time to do some refactori``ng on the code & add some annotaions.
```

### [music 50 years demo](https://elineeen.github.io/3-trial/#/cameraTester)
origin:https://50-jahre-hitparade.ch/
```
the original work reminds me of the first intern job in data visulization.
At that time i just added features based on other ppl's work, 
but now i tried to do all this work on my own.
this work is combined with usage of d3 simulation & base canvas api,
i also customized the orbitControl module in order to provide the mouse event & tween effect support.
Learned a lot about camera\sprite\textures during imitating, i may give it a try on v3 compostion api in next work. 
```

### [geometry particle effect](https://elineeen.github.io/3-trial/#/polygonExplosion)
origin:[articles](https://juejin.cn/post/6937458449072521253#heading-10)
       [codePen](https://codepen.io/alphardex/full/vYyVxXO)
```
an article that introduces planeGeometry particle effect really attracts me so i tried to
modify its code to adapt 3d geometries effects
first step to meshes\points,geometries&material, also glsl
```

