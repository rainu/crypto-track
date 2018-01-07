"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WatchSchema = new Schema({
  chain: {
    type: String,
  },
  address: {
    type: String,
  },
  in: {
    type: Boolean,
  },
  out: {
    type: Boolean,
  }
});

module.exports = mongoose.model('watch', WatchSchema);