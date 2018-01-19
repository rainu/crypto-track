import Vue from "vue";

const state = {
  jobs: {},
};

const getters = {
};

const mutations = {
  addJob(state, job){
    Vue.set(state.jobs, job.name, job);
  },
  removeJob(state, jobName){
    Vue.delete(state.jobs, jobName);
  },
};

const actions = {
  add(ctx, job) {
    //job already running!
    if(ctx.state.jobs[job.name]) return;

    ctx.commit('addJob', job);
    job.execute();
  }
};

export default {
  state,
  mutations,
  actions,
  getters
}