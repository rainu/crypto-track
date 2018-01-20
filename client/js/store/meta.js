import {getVersion} from "../service/version";

const state = {
  version: '',
  builtDate: 0,
};

const getters = {
};

const mutations = {
  setVersion(state, version){
    state.version = version;
  },
  setBuiltDate(state, date){
    state.builtDate = moment(date);
  }
};

const actions = {
  updateVersion(ctx, payload) {
    getVersion(version => {
      ctx.commit('setVersion', version.version);
      ctx.commit('setBuiltDate', version.date);
    });
  }
};

export default {
  state,
  mutations,
  actions,
  getters
}