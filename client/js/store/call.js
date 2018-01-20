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
  },
  openCalls(state){
    let openCalls = [];

    for(let callId of Object.keys(state.calls)){
      let call = state.calls[callId];
      if(!call.hasOwnProperty('finished')) {
        openCalls.push(call);
      }
    }

    return openCalls;
  }
};

const mutations = {
  startCall(state, payload){
    state.waiting++;

    let call = {
      id: payload.id,
      url: payload.url,
      started: new Date(),
    };
    Vue.set(state.calls, call.id, call);
  },
  stopCall(state, payload){
    state.waiting--;

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