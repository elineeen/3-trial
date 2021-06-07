import { createApp } from 'troisjs'
import App from './App.vue'
import routes from './router'
import {createRouter,createWebHashHistory} from 'vue-router'
import { TroisJSVuePlugin } from 'troisjs';
import * as d3 from 'd3';
import _ from 'lodash';
import * as THREE from "three";
const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes, // `routes: routes` 的缩写
})
const app=createApp(App)
app.use(router);
app.use(TroisJSVuePlugin);
app.mount('#app')
app.config.globalProperties.THREE=THREE;
app.config.globalProperties.$d3=d3;
app.config.globalProperties.lodash=_;

