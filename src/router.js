import polygonExplosion from './views/polygonExplosion.vue'
import planeExplosion from './views/planeExplosion.vue'
import cameraTester from './views/music50Years/cameraTester.vue'
import CBill from './views/sccp/bill.vue'
import gitIndex from './views/gitIndex/gitIndex.vue'
export default [
    { path: '/polygonExplosion', component: polygonExplosion },
    { path: '/planeExplosion', component: planeExplosion },
    { path: '/cameraTester', component: cameraTester },
    // { path: '/noiseTester', component: noiseTester },
    { path: '/cbill', component: CBill },
    { path: '/gitIndex', component: gitIndex },
]