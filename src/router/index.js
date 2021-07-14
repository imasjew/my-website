import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/pages/Login'
import Layout from '@/pages/Layout'
import Dashboard from '@/pages/routes/Dashboard'
import Shopping from '@/pages/routes/shopping/Shopping'
import Music from '@/pages/routes/music/Music'
import MusicList from '@/pages/routes/music/Musiclist'
import MusicLyric from '@/pages/routes/music/MusicLyric'
import Game from '@/pages/routes/game/Game'
import Errorpage from '@/pages/errorpage'
import accountService from "@/service/account.service";
import VueRouter from 'vue-router'

Vue.use(Router)

// 新版vue-router避免重复点击路由时报错
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

function isLoggedIn() {
  //   return localStorage.getItem('username') !== null;
  return accountService.getToken();
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
        {
          path: 'music', name: 'music', component: Music,
          children: [
            { path: '', redirect: 'musiclist' },
            { path: 'musiclist', name: 'musiclist', component: MusicList },
            { path: 'musiclyric', name: 'musiclyric', component: MusicLyric },
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

router.beforeEach(async (to, from, next) => {
  if (!isLoggedIn() && to.name !== 'login' && to.name !== 'errorpage') {
    next({ name: 'errorpage' })
  }
  else next()
})

export default router
