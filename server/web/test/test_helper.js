"use strict";

const mongoose = require('mongoose');
const config = require('../../common/src/config');

mongoose.Promise = global.Promise;

before((done) => {
  const mongoUri = 'mongodb://' + config.mongo.host + ':' + config.mongo.port  + '/' + config.mongo.db;
  mongoose.connect(mongoUri, { useMongoClient: true });
  mongoose.Promise = global.Promise;
  mongoose.connection
  .once('open', () => { done(); })
  .on('error', (error) => {
    console.warn('Warning', error);
  });
});

after(() => {
  mongoose.connection.close();
});
