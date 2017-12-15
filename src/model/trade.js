"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TradeSchema = new Schema({
  in: {
    type: Schema.Types.ObjectId,
    ref: 'transaction'
  },
  out: {
    type: Schema.Types.ObjectId,
    ref: 'transaction'
  },
  description: {
    type: String,
  }
});

module.exports = mongoose.model('trade', TradeSchema);