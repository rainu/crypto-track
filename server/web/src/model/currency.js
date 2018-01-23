"use strict";

const currencies = {
  'EUR': true,
  'USD': true,
};

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
  isCurrency(currency) {
    return currencies.hasOwnProperty(currency.toUpperCase());
  },
  isCoin(currency) {
    return !isCurrency(currency);
  }
};