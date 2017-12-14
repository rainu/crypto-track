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

WalletSchema.virtual('balance').get(function() {
  let balance = 0;

  for(let tx of this.inTransactions) {
    balance += tx.amount;
  }
  for(let tx of this.outTransactions) {
    balance -= tx.amount;
  }

  return balance;
});

module.exports = mongoose.model('wallet', WalletSchema);