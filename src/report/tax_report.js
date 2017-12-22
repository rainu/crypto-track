"use strict";

const Queue = require('es-collections').Queue;
const moment = require('moment');

const report = (sellTransaction, buyTransactions) => {
  let reports = [];
  let leftAmount = sellTransaction.amount;

  for(let buyTransaction of buyTransactions) {
    let amount = leftAmount > buyTransaction.amount ? buyTransaction.amount : leftAmount;
    leftAmount -= buyTransaction.amount;

    let report = {
      amount: amount,
      buyDate: buyTransaction.date,
      buyPrice: amount * buyTransaction.exchangeRatio,
      sellDate: sellTransaction.date,
      sellPrice: amount * sellTransaction.exchangeRatio,
      short: moment(buyTransaction.date).add(1, 'year') >= moment(sellTransaction.date),
    };
    report.profit = report.sellPrice - report.buyPrice;

    reports.push(report);
  }

  return reports;
};

const extractBuyTx = (sellTransaction, buyTransactions) => {
  let transactions = [];
  let amount = sellTransaction.amount;
  let found = false;

  while(!found) {
    let curBuyTx = buyTransactions.peek();
    transactions.push(curBuyTx);

    if(curBuyTx.amount >= amount) {
      //the end (this transaction will satisfy the sellTransaction)
      curBuyTx.spent += amount;
      found = true;
    }else{
      curBuyTx.spent = curBuyTx.amount;
      amount -= curBuyTx.amount;
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