#!/usr/bin/env node

/**
 * Module dependencies.
 */

const log = require('../server/src/log');
const config = require('../server/src/config');
const mongodb = require('../server/src/config/database');
const Course = require('../server/src/model/course');
const request = require('../server/src/job/request_repeater');

const URL = 'https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=0';
const tick = 1000 * 60 * 10; //10min

const job = () => {
  log.info("Update courses...");

  request(URL).then((response) => {
    let result = JSON.parse(response.body);

    for(let coin of result) {
      const symbol =  coin.symbol + 'EUR';

      Course.findOneAndUpdate(
        { symbol: symbol },
        {
          symbol: symbol,
          date: new Date(coin.last_updated * 1000),
          course: coin.price_eur * 1,
        },
        { upsert: true}, (err, coinDoc) => {
          if(err){
            log.error("Could not save course!", err);
          } else {
            log.debug("Saved new course!");
          }
        });
    }

    setTimeout(job, tick);
  }, (err) => {
    log.err('Error while requesting courses.', err);
    setTimeout(job, tick);
  });
};

job();