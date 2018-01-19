import Vue from "vue";
import requestWallet from '../service/wallet';

const state = {
  wallets: [],
  transactionMap: {},
  coins: [],
  currencies: []
};

const getters = {
  transactions(state) {
    let tx = [];
    for(let id in state.transactionMap) {
      tx.push(state.transactionMap[id]);
    }

    tx.sort((tx0, tx1) => {
      return tx0.getTime() - tx1.getTime();
    });

    return tx;
  }
};

const mutations = {
  addWallet(state, wallet) {
    state.wallets.push(wallet);
  },
  addTransaction(state, tx) {
    Vue.set(state.transactionMap, tx._id, tx);
  },
  addCoin(state, coin) {
    state.coins.push(coin);
  },
  addCurrency(state, currency) {
    state.currencies.push(currency);
  }
};

const actions = {
  getFullWallet(ctx, walletId) {
    requestWallet(walletId, fullWallet => {
      ctx.commit('addWallet', fullWallet);

      for(let tx of fullWallet.transactions){
        ctx.commit('addTransaction', tx);
      }
      for(let coin of fullWallet.coins) {
        if(!ctx.state.coins.includes(coin)) {
          ctx.commit('addCoin', coin);
        }
      }
      for(let currency of fullWallet.currencies) {
        if(!ctx.state.currencies.includes(currency)) {
          ctx.commit('currencies', currency);
        }
      }
    });
  }
};

export default {
  state,
  mutations,
  actions,
  getters
}