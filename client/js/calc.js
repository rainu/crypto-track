import {minToNormal} from '../../server/web/src/model/currency'

/**
 * Calculate the sum of all assets (coins and currencies) in balances by the
 * given courses.
 *
 * @param balances The balances (per coin/wallet)
 * @param courses The current courses
 * @param counterValue The countervalue (currency e.g. EUR)
 * @returns {number}
 */
const totalCoinValue = (balances, courses, counterValue) => {
  let total = 0;
  for(let coin of Object.keys(balances)) {
    let balance = balances[coin];
    let symbol = coin + counterValue.toUpperCase();

    if(courses.hasOwnProperty(symbol)) {
      let course = courses[symbol];
      total += minToNormal(balance, coin) * course;
    }
  }
  return total;
};

/**
 * Calculcate the account value (the value of all coins minus the spent money)
 *
 * @param balances
 * @param courses
 * @param counterValue
 * @returns {*}
 */
const accountValue = (balances, courses, counterValue) => {
  const currency = counterValue.toUpperCase();

  let total = 0;
  for(let coin of Object.keys(balances)) {
    let balance = balances[coin];
    let tag = coin + currency;

    if(courses.hasOwnProperty(tag)) {
      let course = courses[tag];
      total += minToNormal(balance, coin) * course;
    }
  }

  return total + minToNormal(balances[currency], currency);
};

export {
  totalCoinValue, accountValue
}