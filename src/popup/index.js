import Vue from 'vue'
import 'bulma-fluent/bulma.sass'

import Vuetify from "vuetify";



import App from './App.vue'
Vue.use(Vuetify);

// eslint-disable-next-line
new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  render: h => h(App),
})
