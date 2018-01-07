"use strict";

const log = require('../log');
const dbService = require('../db_service');
const TradeType = require('../model/trade_type');

const extractTransactions = (wallets, trades) => {
  //here we have to return the equivalent schema which our tax_report needs

  let allTx = {};
  let buyTx = [];
  let sellTx = [];

  for(let wallet of wallets) {
    for (let tx of wallet.inTransactions) {
      allTx[tx._id.toString()] = tx;
    }
    for (let tx of wallet.outTransactions) {
      allTx[tx._id.toString()] = tx;
    }
  }

  //we only interested in trades
  for(let trade of trades) {
    //if the trade contains one tx with FIAT-currencies
    if(allTx[trade.in.toString()].currency === 'EUR'){
      buyTx.push({
        date: allTx[trade.in.toString()].date,
        amount: allTx[trade.out.toString()].normalizedAmount(),
        fee: allTx[trade.in.toString()].normalizedFee(),
        currency: allTx[trade.out.toString()].currency,
        exchangeRatio: allTx[trade.in.toString()].normalizedAmount() / allTx[trade.out.toString()].normalizedAmount(),
      });
    }else if(allTx[trade.out.toString()].currency === 'EUR') {
      sellTx.push({
        date: allTx[trade.in.toString()].date,
        amount: allTx[trade.in.toString()].normalizedAmount(),
        fee: allTx[trade.out.toString()].normalizedFee(),
        currency: allTx[trade.in.toString()].currency,
        exchangeRatio: allTx[trade.out.toString()].normalizedAmount() / allTx[trade.in.toString()].normalizedAmount(),
      });
    }else if(trade.tradeType === TradeType.EXCHANGE){
      if(trade.inValue.currency !== 'EUR' || trade.outValue.currency !== 'EUR') {
        log.warn('Trade counter value is not EUR! Actually only euro is supported!');
        continue;
      }

      //a trade between currencies
      sellTx.push({
        date: allTx[trade.in.toString()].date,
        amount: allTx[trade.in.toString()].normalizedAmount(),
        fee: allTx[trade.in.toString()].normalizedFee(),
        currency: allTx[trade.in.toString()].currency,
        exchangeRatio: trade.inValue.amount / allTx[trade.in.toString()].normalizedAmount(),
      });

      buyTx.push({
        date: allTx[trade.out.toString()].date,
        amount: allTx[trade.out.toString()].normalizedAmount(),
        fee: allTx[trade.out.toString()].normalizedFee(),
        currency: allTx[trade.out.toString()].currency,
        exchangeRatio: trade.outValue.amount / allTx[trade.out.toString()].normalizedAmount(),
      });
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