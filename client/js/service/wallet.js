import axios from './../backend.js';
import {isCurrency} from '../../../server/web/src/model/currency'

const getTxMappings = (wallet) => {
  let coinMapping = {};
  let knownIds = {};

  for(let tx of wallet.transactions){
    if(knownIds[tx._id]) continue;
    else knownIds[tx._id] = true;

    if(!coinMapping.hasOwnProperty(tx.currency)) {
      coinMapping[tx.currency] = [];
    }
    coinMapping[tx.currency].push(tx);
  }

  return coinMapping;
};

const getBalances = (wallet) => {
  let balances = {};
  const txMapping = getTxMappings(wallet);

  for(let coin of Object.keys(txMapping)) {
    let coinTx = txMapping[coin];
    balances[coin] = 0;

    for(let tx of coinTx) {
      if(wallet.address === tx.from) {
        balances[coin] -= tx.amount;
        balances[coin] -= tx.fee ? tx.fee : 0;
      }else {
        balances[coin] += tx.amount;
      }
    }
  }

  return balances;
};

const getCoins = (wallet) => {
  let symbols = [];
  for(let coin of Object.keys(wallet.balances)) {
    if(isCurrency(coin)) continue;

    symbols.push(coin);
  }
  return symbols;
};

const getCurrencies = (wallet) => {
  let symbols = [];
  for(let coin of Object.keys(wallet.balances)) {
    if(!isCurrency(coin)) continue;

    symbols.push(coin);
  }
  return symbols;
};

const getFullWallet = (id, callback) => {
  axios.get(`/wallet/${id}/full`).then(res => {
    res.data.balances = getBalances(res.data);
    res.data.coins = getCoins(res.data);
    res.data.currencies = getCurrencies(res.data);

    callback(res.data);
  });
};

export default getFullWallet;