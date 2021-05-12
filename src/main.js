// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import httpService from './service/http.service.js'
Vue.use(ElementUI);
Vue.use(httpService);

Vue.config.productionTip = false

// 使用Moment插件提供全局时间过滤器
Vue.filter('formateDate',function(value){
  let minutes = Math.floor((value % (60 * 60)) / 60);
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  let seconds = Math.round((value) % (60));
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  return minutes + ":" + seconds;
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  render: h => h(App)
})
