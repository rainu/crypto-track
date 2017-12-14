"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TradeSchema = new Schema({
  incoming: {
    type: String,
  },
  outgoing: {
    type: String,
  },
  description: {
    type: String,
  },
  ratio: {
    type: Number,
  }
});

module.exports = mongoose.model('trade', TradeSchema);