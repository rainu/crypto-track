import { getAccount } from '../service/account';

const state = {
  accountStale: true,
  account: {},
};

const getters = {
};

const mutations = {
  setAccountStale(state, staleState){
    state.accountStale = staleState;
  },
  update(state, payload) {
    state.account = payload;
  }
};

const actions = {
  updateAccount(ctx, username) {
    ctx.commit('setAccountStale', true);

    getAccount(username, account => {
      ctx.commit('update', account);
      let p = [];

      for(let wallet of account.wallets) {
        let promise = ctx.dispatch('wallet/getFullWallet', wallet._id, { root:true });
        p.push(promise);
      }

      //wait for wallets
      Promise.all(p).then(() => {
        p = [];

        for(let coin of ctx.rootState.wallet.coins) {
          let promise = ctx.dispatch('job/add', {
            name: `courseUpdater_${coin}`,
            interval: 60000,
            execute: () => {
              ctx.dispatch('course/update', {
                coin: coin, currency: 'EUR',
              }, { root:true });
            }
          }, { root:true });

          p.push(promise);

          promise = ctx.dispatch('course/updateHistorical', {
            coin: coin, currency: 'EUR',
          }, { root:true });

          p.push(promise);
        }

        //wait for courses
        Promise.all(p).then(() => {
          ctx.commit('setAccountStale', false);
        }, err => {
          ctx.commit('setAccountStale', false);
        });
      }, (err) => {
        ctx.commit('setAccountStale', false);
      });
    });
  }
};

export default {
  state,
  mutations,
  actions,
  getters
}