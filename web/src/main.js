import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugin/vuetify'
import wrapper from "./components/wrapper.vue";
import store from "./store/index";

Vue.config.productionTip = false


Vue.component("wrapper", wrapper);

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app')


