import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Layout from '@/components/Layout'
import Dashboard from '@/components/routes/Dashboard'
import Shopping from '@/components/routes/shopping/Shopping'
import Music from '@/components/routes/music/Music'
import Musiclist from '@/components/routes/music/Musiclist'
import Song from '@/components/routes/music/Song'
import Game from '@/components/routes/game/Game'
import Errorpage from '@/components/errorpage'

import VueRouter from 'vue-router'

Vue.use(Router)

// 新版vue-router避免重复点击路由时报错
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

function isLoggedIn () {
  return localStorage.getItem('username') !== null;
}

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: 'login',
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/home', name: 'layout', component: Layout,
      children: [
        { path: '', redirect: 'shopping' },
        { path: 'dashboard', name: 'dashboard', component: Dashboard },
        { path: 'shopping', name: 'shopping', component: Shopping },
        { path: 'music', name: 'music', component: Music,
          children: [
            { path: '', redirect: 'musiclist' },
            { path: 'musiclist', name: 'musiclist', component: Musiclist },
            { path: 'song', name: 'song', component: Song },
          ]
        },
        { path: 'game', name: 'game', component: Game }
      ]
    },
    {
      path: '/errorpage',
      name: 'errorpage',
      component: Errorpage
    },
  ],
})

router.beforeEach(async(to, from, next) => {
  if (!isLoggedIn() && to.name !== 'login' && to.name !== 'errorpage') {next({ name: 'errorpage' })}
  else next()
})

export default router
