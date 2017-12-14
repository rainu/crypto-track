"use strict";

const Transaction = require('./model/transaction');

const TransactionService = {
  Add: function (date, amount, currency, description, callback) {
    let tx = new Transaction({
      date: date,
      amount: amount,
      currency: currency,
      description: description
    });

    return tx.save((err) => {
      callback(err, tx);
    });
  },

  Delete: function(id) {
    return Transaction.findByIdAndRemove(id);
  }
};

module.exports = TransactionService;