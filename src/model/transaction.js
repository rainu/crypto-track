"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

const normalize = function(currency, amount) {
  switch(currency.toUpperCase()) {
    case 'EUR': return amount * 1E-2;
    case 'BTC': return amount * 1E-8;
    case 'BCH': return amount * 1E-8;
    case 'ETH': return amount * 1E-18;
  }

  return amount;
};

TransactionSchema.methods.normalizedAmount = function() {
  return normalize(this.currency, this.amount);
};
TransactionSchema.methods.normalizedFee = function() {
  if(!this.fee) return undefined;

  return normalize(this.currency, this.fee);
};

module.exports = mongoose.model('transaction', TransactionSchema);