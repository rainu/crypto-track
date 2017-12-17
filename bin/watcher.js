#!/usr/bin/env node

/**
 * Module dependencies.
 */

const log = require('../src/log');
const config = require('../src/config');
const mongodb = require('../src/config/database');
const Watch = require('../src/model/watch');

const Jobs = {
  BTC: require('../src/job/bitcoin'),
  ETH: require('../src/job/ethereum'),
};

let loadedWatches = {};

const spawnWatch = (watchId) => {
  let watch = loadedWatches[watchId];

  log.info("Spawn Watch-Job for '" + watch.chain + "' at address '" + watch.address + "'.");
  Jobs[watch.chain](watch.address, watch.in, watch.out).then(() => {
    log.info("Job for '" + watch.chain + "' at address '" + watch.address + "' was successfully done.");
    setTimeout(() => {
      spawnWatch(watch);
    }, config.cron.respawn.time);
  }, (err) => {
    log.error("Error while executing the job for '" + watch.chain + "' at address '.", err);
    setTimeout(() => {
      spawnWatch(watch);
    }, config.cron.respawn.time);
  });
};

const findWatches = () => {
  Watch.find().then((watches) => {
    log.info("Read " + watches.length + " watches.");

    for(let watch of watches) {
      if (watch.chain in Jobs) {
        let id = watch._id.toString();
        let newWatch = !(id in loadedWatches);
        loadedWatches[id] = watch;

        if (newWatch) {
          //new watch detected
          spawnWatch(id);
        }
      }
    }

    setTimeout(findWatches, config.cron.read.time);
  }, (err) => {
    log.error("Error while reading jobs from database.", err);
    setTimeout(findWatches, config.cron.read.time);
  });
};

//initial call
findWatches();
