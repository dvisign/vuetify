import Vue from 'vue'
import App from './App'
import router from './router'
import 'bootstrap'
import * as filters from './util/filter'
import common from './util/common'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import 'mdi-icons/css/materialdesignicons.min.css' // Ensure you are using css-loader
import CryptoJS from 'vue-cryptojs'

Vue.use(Vuetify);
Vue.config.productionTip = false

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.use(common);
Vue.use(CryptoJS);

new Vue({
  el: '#app',
  router,
  vuetify: new Vuetify(),
  render: h => h(App),
  components: { App },
  template: '<App/>'
})