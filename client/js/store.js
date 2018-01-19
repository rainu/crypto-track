import Vue from 'vue';
import Vuex from 'vuex';

import call from './store/call';
import job from './store/job';
import course from './store/course';
import account from './store/account';
import wallet from './store/wallet';
import taxReport from './store/taxReport';

Vue.use(Vuex);

export const store = new Vuex.Store({
  modules: {
    call: {
      namespaced: true,
      ...call
    },
    job: {
      namespaced: true,
      ...job
    },
    course: {
      namespaced: true,
      ...course
    },
    account: {
      namespaced: true,
      ...account
    },
    wallet: {
      namespaced: true,
      ...wallet
    },
    taxReport: {
      namespaced: true,
      ...taxReport
    }
  }
});