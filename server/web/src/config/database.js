"use strict";

const mongoose = require('mongoose');
const log = require('../../../common/src/log');
const config = require('../../../common/src/config');

const mongoUri = 'mongodb://' + config.mongo.host + ':' + config.mongo.port  + '/' + config.mongo.db;
mongoose.connect(mongoUri, { useMongoClient: true });
mongoose.Promise = global.Promise;

let db = mongoose.connection;
db.on('error', (err) => {
  if(err) {
    log.error('Could not establish mongodb connection! ' + mongoUri, err);
    process.exit(1);
  }else{
    log.info('Establish mongodb connection.');
  }
});

module.exports = db;
