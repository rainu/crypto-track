"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WalletSchema = new Schema({
  address: {
    type: String,
  },
  description: {
    type: String,
  }
});

WalletSchema.virtual('inTransactions', {
  ref: 'transaction',
  localField: 'address',
  foreignField: 'to',
  justOne: false
});

WalletSchema.virtual('outTransactions', {
  ref: 'transaction',
  localField: 'address',
  foreignField: 'from',
  justOne: false
});

WalletSchema.virtual('currencies').get(function() {
  let result = new Set();

  for(let tx of this.inTransactions) {
    result.add(tx.currency);
  }
  for(let tx of this.outTransactions) {
    result.add(tx.currency);
  }

  return [...result];
});

WalletSchema.methods.getBalance = function(currency) {
  let balance = 0;

  for(let tx of this.inTransactions) {
    if(tx.currency === currency) {
      balance += tx.amount;
      balance -= tx.fee ? tx.fee : 0;
    }
  }
  for(let tx of this.outTransactions) {
    if(tx.currency === currency) {
      balance -= tx.amount;
      balance -= tx.fee ? tx.fee : 0;
    }
  }

  return balance;
};

module.exports = mongoose.model('wallet', WalletSchema);