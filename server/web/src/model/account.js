"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
  username: {
    type: String,
    unique: true
  },
  wallets: [{
    type: Schema.Types.ObjectId,
    ref: 'wallet'
  }]
}, {
  usePushEach: true,
});

module.exports = mongoose.model('account', AccountSchema);