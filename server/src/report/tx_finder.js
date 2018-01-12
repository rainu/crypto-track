"use strict";

const log = require('../log');
const dbService = require('../db_service');
const TradeType = require('../model/trade_type');
const Currency = require('../model/currency');

const extractTransactions = (wallets, trades) => {
  //here we have to return the equivalent schema which our tax_report needs

  let allTx = {};
  let buyTx = [];
  let sellTx = [];
  let walletAddresses = new Set();

  for(let wallet of wallets) {
    walletAddresses.add(wallet.address);
    for (let tx of wallet.inTransactions) {
      allTx[tx._id.toString()] = tx;
    }
    for (let tx of wallet.outTransactions) {
      allTx[tx._id.toString()] = tx;
    }
  }

  //transfers
  for(let tx of Object.values(allTx)) {
    if(tx.from && tx.to) {
      if(walletAddresses.has(tx.from) && walletAddresses.has(tx.to)){
        sellTx.push({
          date: tx.date,
          amount: 0,
          fee: tx.normalizedFee(),
          currency: tx.currency,
        });
      }
    }
  }

  //trades
  for(let trade of trades) {
    let inTx = allTx[trade.in.toString()];
    let outTx = allTx[trade.out.toString()];
    
    //if the trade contains one tx with FIAT-currencies
    if(inTx.currency === 'EUR'){
      buyTx.push({
        date: inTx.date,
        amount: outTx.normalizedAmount(),
        fee: outTx.normalizedFee(),
        currency: outTx.currency,
        exchangeRatio: inTx.normalizedAmount() / outTx.normalizedAmount(),
      });
    }else if(outTx.currency === 'EUR') {
      sellTx.push({
        date: inTx.date,
        amount: inTx.normalizedAmount(),
        fee: inTx.normalizedFee(),
        currency: inTx.currency,
        exchangeRatio: outTx.normalizedAmount() / inTx.normalizedAmount(),
      });
    }else if(trade.tradeType === TradeType.EXCHANGE){
      if(trade.inValue.currency !== 'EUR' || trade.outValue.currency !== 'EUR') {
        log.warn('Trade counter value is not EUR! Actually only euro is supported!');
        continue;
      }

      //a trade between currencies
      let normalIn = Currency.minToNormal(trade.inValue.amount, trade.inValue.currency);
      let curSellTx = {
        date: inTx.date,
        amount: inTx.normalizedAmount(),
        fee: inTx.normalizedFee(),
        currency: inTx.currency,
        exchangeRatio: normalIn / inTx.normalizedAmount(),
      };

      let normalOut = Currency.minToNormal(trade.outValue.amount, trade.outValue.currency);
      let curBuyTx = {
        date: outTx.date,
        amount: outTx.normalizedAmount(),
        fee: outTx.normalizedFee(),
        currency: outTx.currency,
        exchangeRatio: normalOut / outTx.normalizedAmount(),
      };

      sellTx.push(curSellTx);
      buyTx.push(curBuyTx);
    }else{
      log.warn('Unknown trade type. I don\'t know how to handle it...');
    }
  }

  return {
    in: buyTx.sort((a, b) => a.date - b.date),
    out: sellTx.sort((a, b) => a.date - b.date),
  };
};

const findTransactions = (username) => {
  return new Promise((resolve, reject) => {
    dbService.getCompleteAccount(username).then((data) => {
      let allTx = extractTransactions(data.wallets, data.trades);
      let sortedTx = {};

      for(let tx of allTx.in) {
        if(!sortedTx.hasOwnProperty(tx.currency)){
          sortedTx[tx.currency] = {in: [], out: []};
        }

        sortedTx[tx.currency].in.push(tx);
      }
      for(let tx of allTx.out) {
        if(!sortedTx.hasOwnProperty(tx.currency)){
          sortedTx[tx.currency] = {in: [], out: []};
        }

        sortedTx[tx.currency].out.push(tx);
      }

      resolve(sortedTx);
    }, (err) => {
      reject(err);
    });
  });
};

module.exports = findTransactions;