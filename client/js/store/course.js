import Vue from 'vue';
import { getCourse, getHistoricalCourse } from "../service/course";

const state = {
  ticker: {},
  historical: {},
};

const getters = {
};

const mutations = {
  updateCourse(state, payload){
    Vue.set(state.ticker, payload.symbol, payload.course);
  },
  updateHistoricalCourse(state, payload){
    Vue.set(state.historical, payload.symbol, payload.courses);
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
  updateHistorical(ctx, payload) {
    return new Promise((resolve, reject) => {
      const coin = payload.coin.toUpperCase();
      const currency = payload.currency.toUpperCase();
      const symbol = coin + currency;

      getHistoricalCourse(coin, currency, (courses) => {
        courses.reverse();
        ctx.commit('updateHistoricalCourse', {
          symbol: symbol,
          courses: courses,
        });

        resolve();
      })
    });
  }
};

export default {
  state,
  mutations,
  actions,
  getters
}