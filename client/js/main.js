import './lib/css'
import './lib/script'

import Vue from 'vue'
import VueRouter from 'vue-router';
import { store } from './store.js';
import { routes } from './routes.js';


import {fnumber, number, euro, date} from './filter'
import VueGoodTable from 'vue-good-table';
import Box from '../components/general/Box'
import Error from '../components/general/message/Error'
import Info from '../components/general/message/Info'
import Warning from '../components/general/message/Warning'
import Success from '../components/general/message/Success'
import App from '../components/App.vue'

import {GridLayout, GridItem} from 'vue-grid-layout'

Vue.use(VueRouter);
Vue.use(VueGoodTable);

Vue.filter('fnumber', fnumber);
Vue.filter('number', number);
Vue.filter('euro', euro);
Vue.filter('date', date);

Vue.component('box', Box);
Vue.component('message-error', Error);
Vue.component('message-info', Info);
Vue.component('message-warning', Warning);
Vue.component('message-success', Success);
Vue.component('grid-layout', GridLayout);
Vue.component('grid-item', GridItem);

const router = new VueRouter({
  routes,
  mode: 'history',
});

new Vue({
  el: '#app',
  components: { App },
  router: router,
  store: store,
});