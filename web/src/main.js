import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugin/vuetify'
import wrapper from "./components/wrapper.vue";
import i18n from "./i18n/index";

import store from "./store/index";

Vue.config.productionTip = false


Vue.component("wrapper", wrapper);


let app =new Vue({
  i18n,
  router,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app')


window.appp = app;
window.vm = Vue;