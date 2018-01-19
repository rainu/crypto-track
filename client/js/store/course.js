import Vue from 'vue';
import { getCourse } from "../service/course";

const state = {
  courses: {}
};

const getters = {
};

const mutations = {
  updateCourse(state, payload){
    Vue.set(state.courses, payload.symbol, payload.course);
  }
};

const actions = {
  update(ctx, payload) {
    const coin = payload.coin.toUpperCase();
    const currency = payload.currency.toUpperCase();
    const symbol = coin + currency;

    getCourse(coin, currency, (course) => {
      ctx.commit('updateCourse', {
        symbol: symbol,
        course: course.course,
      });
    })
  },
};

export default {
  state,
  mutations,
  actions,
  getters
}