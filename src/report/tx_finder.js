"use strict";

const log = require('../log');
const Wallet = require('../model/wallet');
const TradeType = require('../model/trade_type');
const Account = require('../model/account');
const Trade = require('../model/trade');

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
        amount: allTx[trade.out.toString()].amount,
        fee: allTx[trade.in.toString()].fee,
        exchangeRatio: allTx[trade.in.toString()].amount / allTx[trade.out.toString()].amount,
      });
    }else if(allTx[trade.out.toString()].currency === 'EUR') {
      sellTx.push({
        date: allTx[trade.in.toString()].date,
        amount: allTx[trade.in.toString()].amount,
        fee: allTx[trade.out.toString()].fee,
        exchangeRatio: allTx[trade.out.toString()].amount / allTx[trade.in.toString()].amount,
      });
    }else if(trade.tradeType === TradeType.EXCHANGE){
      if(trade.inValue.currency !== 'EUR' || trade.outValue.currency !== 'EUR') {
        log.warn('Trade counter value is not EUR! Actually only euro is supported!');
        continue;
      }

      //a trade between currencies
      sellTx.push({
        date: allTx[trade.in.toString()].date,
        amount: allTx[trade.in.toString()].amount,
        fee: allTx[trade.in.toString()].fee,
        exchangeRatio: trade.inValue.amount / allTx[trade.in.toString()].amount,
      });

      buyTx.push({
        date: allTx[trade.out.toString()].date,
        amount: allTx[trade.out.toString()].amount,
        fee: allTx[trade.out.toString()].fee,
        exchangeRatio: trade.outValue.amount / allTx[trade.out.toString()].amount,
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
    //first we have to find all wallets for the user
   Account.findOne({username: username}).then(
     (account) => {
       //in the wallets we can join th transactions
       Wallet.find({_id: { $in: account.wallets }}).populate('outTransactions').populate('inTransactions').then(
         (wallets) => {
           //now we have the wallets (and transactions) and we can find the trades
           //but first we need to extract all transaction ids
           let txIds = new Set();

           for(let wallet of wallets) {
             for(let tx of wallet.outTransactions) {
               txIds.add(tx._id);
             }
             for(let tx of wallet.inTransactions) {
               txIds.add(tx._id);
             }
           }
           const atxIds = [...txIds];

           Trade.find({
             $or: [{'in': { $in: atxIds }}, {'out': { $in: atxIds }}]
           }).then(
             (trades) => {
               //now we have gather all information for account
               let result = extractTransactions(wallets, trades);
               resolve(result);
             },
             (err) => {
               log.error(`Could not find trades for account ${username}`, err);
               reject(err);
             }
           );
         },
         (err) => {
           log.error(`Could not find wallets for account ${username}`, err);
           reject(err);
         }
       );
     },
     (err) => {
       log.error(`Could not find account by name ${username}`, err);
       reject(err);
     }
   );
  });
};


module.exports = findTransactions;