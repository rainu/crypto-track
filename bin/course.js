#!/usr/bin/env node

/**
 * Module dependencies.
 */

const log = require('../server/src/log');
const config = require('../server/src/config');
const mongodb = require('../server/src/config/database');

const updateDaylieCourse = require('../server/src/job/course/ticker');
const updateHistoricalCourse = require('../server/src/job/course/historical');

const daylieTick = 1000 * 60 * 10; //10min
const historicalTick = 1000 * 60 * 60 * 6; //6h

const daylieJob = () => {
  log.info("Update courses...");

  updateDaylieCourse().then(() => {
    log.info("Update courses ... done!");
    setTimeout(daylieJob, daylieTick);
  }, err => {
    log.error('Error while requesting courses.', err);
    setTimeout(daylieJob, daylieTick);
  });
};

const historicalJob = () => {
  log.info("Update historical courses...");

  updateHistoricalCourse().then(() => {
    log.info("Update historical courses ... done!");
    setTimeout(historicalJob, historicalTick);
  }, err => {
    log.error('Error while requesting historical courses.', err);
    setTimeout(historicalJob, historicalTick);
  });
};

daylieJob();
historicalJob();