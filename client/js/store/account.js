import { getAccount } from '../service/account';

const state = {
  account: {},
};

const getters = {
};

const mutations = {
  update(state, payload) {
    state.account = payload;
  }
};

const actions = {
  getAccount(ctx, username) {
    getAccount(username, account => {
      ctx.commit('update', account);
    });
  }
};

export default {
  state,
  mutations,
  actions,
  getters
}