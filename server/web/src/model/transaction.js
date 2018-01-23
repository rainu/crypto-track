"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Currency = require('./currency');

const TransactionSchema = new Schema({
  externalId: {
    type: String,
  },
  date: {
    type: Date,
  },
  amount: {
    type: Number,
  },
  from: {
    type: String,
  },
  to: {
    type: String,
  },
  fee: {
    type: Number,
  },
  currency: {
    type: String,
  },
  description: {
    type: String,
  }
});

TransactionSchema.methods.normalizedAmount = function() {
  return Currency.minToNormal(this.amount, this.currency);
};
TransactionSchema.methods.normalizedFee = function() {
  if(!this.fee) return undefined;

  return Currency.minToNormal(this.fee, this.currency);
};

module.exports = mongoose.model('transaction', TransactionSchema);