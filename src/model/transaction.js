"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  date: {
    type: Number,
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

module.exports = mongoose.model('transaction', TransactionSchema);