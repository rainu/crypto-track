import Vue from 'vue'

const state = {
  calls: {},
  waiting: 0,
};

const getters = {
  nextCallId(state){
    return Object.keys(state.calls).length;
  },
  hasOpenCalls(state){
    return state.waiting > 0;
  }
};

const mutations = {
  startCall(state, payload){
    let call = {
      id: payload.id,
      url: payload.url,
      started: new Date(),
    };
    Vue.set(state.calls, call.id, call);
  },
  stopCall(state, payload){
    Vue.set(state.calls[payload.id], 'finished', new Date());
    Vue.set(state.calls[payload.id], 'error', payload.error);
  }
};

const actions = {
};

export default {
  state,
  mutations,
  actions,
  getters
}