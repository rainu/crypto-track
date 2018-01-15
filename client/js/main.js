import './lib/css'
import './lib/script'

import Vue from 'vue'
import {fnumber, number, euro, date} from './filter'
import VueGoodTable from 'vue-good-table';
import Box from '../components/general/Box'
import App from '../components/App.vue'

import {GridLayout, GridItem} from 'vue-grid-layout'

Vue.use(VueGoodTable);

Vue.filter('fnumber', fnumber);
Vue.filter('number', number);
Vue.filter('euro', euro);
Vue.filter('date', date);

Vue.component('box', Box);
Vue.component('grid-layout', GridLayout);
Vue.component('grid-item', GridItem);

new Vue({
  el: '#app',
  components: { App }
});