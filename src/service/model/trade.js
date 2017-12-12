"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WalletSchema = new Schema({
  address: {
    type: String,
  },
  currency: {
    type: String,
  },
  description: {
    type: String,
  }
});

module.exports = mongoose.model('wallet', WalletSchema);