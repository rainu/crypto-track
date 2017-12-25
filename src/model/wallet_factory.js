"use strict";

const Wallet = require('./wallet');

module.exports = {
  exchange: (username, exchange) => {
    return new Wallet({
      address: `_EXCHANGE_${exchange}_${username}`,
      description: `Exchange wallet for ${exchange}`
    });
  },
  compensation: (username) => {
    return new Wallet({
      address: `_COMPENSATION_FIAT_${username}`,
      description: 'Compensation account for fiat currencies.'
    });
  }
};