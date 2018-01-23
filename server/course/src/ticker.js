"use strict";

const log = require('../../common/src/log');
const request = require('../../common/src/request_repeater');
const Course = require('../../web/src/model/course');
const CourseType = require('../../web/src/model/course_type');

const URL = 'https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=0';

const doJob = function(){
  return new Promise((resolve, reject) => {

    request(URL).then((response) => {
      let result = JSON.parse(response.body);

      for (let coin of result) {
        const symbol = coin.symbol + 'EUR';

        Course.findOneAndUpdate(
          {symbol: symbol},
          {
            symbol: symbol,
            date: new Date(coin.last_updated * 1000),
            course: coin.price_eur * 1,
            type: CourseType.TICKER,
          },
          {upsert: true}, (err, coinDoc) => {
            if (err) {
              log.error("Could not save course!", err);
            } else {
              log.debug("Saved new course!");
            }
          });
      }

      resolve();
    }, err => {
      reject(err);
    });
  });
};

module.exports = doJob;