"use strict";

const currencyFactors = {
  'EUR': 1E-2,
  'BTC': 1E-8,
  'BCH': 1E-8,
  'ETH': 1E-18,
};

module.exports = {
  minToNormal(amount, currency) {
    currency = currency.toUpperCase();
    if(currencyFactors.hasOwnProperty(currency)) {
      return amount * currencyFactors[currency];
    }

    return amount;
  },
  normalToMin(amount, currency) {
    currency = currency.toUpperCase();
    if(currencyFactors.hasOwnProperty(currency)) {
      return amount / currencyFactors[currency];
    }

    return amount;
  },
};