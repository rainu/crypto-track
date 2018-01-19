import requestReport from '../service/report';

const state = {
  report: [],
};

const getters = {
};

const mutations = {
  add(state, reportEntry) {
    state.report.push(reportEntry);
  }
};

const actions = {
  getReport(ctx, accountname) {
    requestReport(accountname, reportEntry => {
      ctx.commit('add', reportEntry);
    });
  }
};

export default {
  state,
  mutations,
  actions,
  getters
}