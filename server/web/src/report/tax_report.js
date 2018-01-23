"use strict";

const Queue = require('es-collections').Queue;
const moment = require('moment');

const report = (sellTransaction, buyTransactions) => {
  let reports = [];

  if(sellTransaction.amount === 0) {
    //only fee: don't create a report for it
    return reports;
  }

  for(let buyTransaction of buyTransactions) {
    let report = {
      amount: buyTransaction.used,
      buyDate: buyTransaction.date,
      buyPrice: buyTransaction.used * buyTransaction.exchangeRatio,
      sellDate: sellTransaction.date,
      sellPrice: buyTransaction.used * sellTransaction.exchangeRatio,
      short: moment(buyTransaction.date).add(1, 'year') >= moment(sellTransaction.date),
      currency: buyTransaction.currency,
    };
    report.profit = report.sellPrice - report.buyPrice;

    reports.push(report);
  }

  return reports;
};

const extractBuyTx = (sellTransaction, buyTransactions) => {
  let transactions = [];
  let amount = sellTransaction.amount + sellTransaction.fee;
  let found = false;

  while(!found) {
    let curBuyTx = buyTransactions.peek();
    if(!curBuyTx) {
      console.log('No Transactions available!', amount);
      break;
    }

    let availableAmount = curBuyTx.amount - curBuyTx.spent;
    transactions.push(curBuyTx);

    if(availableAmount >= amount) {
      //the end (this transaction will satisfy the sellTransaction)
      curBuyTx.spent += amount;
      curBuyTx.used = amount;
      found = true;
    }else{
      curBuyTx.used = availableAmount;
      curBuyTx.spent = curBuyTx.amount;
      amount -= availableAmount;
    }

    if(curBuyTx.spent === curBuyTx.amount) {
      //this buy transaction is out sold
      buyTransactions.dequeue();
    }
  }

  return transactions;
};

const fifoReport = (inTx, outTx) => {
  //prepare the report generation
  let inQueue = new Queue();
  let outQueue = new Queue();
  let reports = [];

  for(let tx of inTx) {
    inQueue.enqueue(Object.assign({
      spent: 0
    }, tx));
  }
  for(let tx of outTx) {
    outQueue.enqueue(Object.assign({}, tx));
  }

  //now we can begin
  while (outQueue.size > 0) {
    let curSellTx = outQueue.dequeue();
    let curBuyTxs = extractBuyTx(curSellTx, inQueue);

    reports.push(...report(curSellTx, curBuyTxs));
  }

  return reports;
};

module.exports = fifoReport;