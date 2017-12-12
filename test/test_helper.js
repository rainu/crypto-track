"use strict";

const mongoose = require('mongoose');
const config = require('../src/config');

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

// beforeEach((done) => {
//   const { users, comments, blogposts } = mongoose.connection.collections;
//   users.drop(() => {
//     comments.drop(() => {
//       blogposts.drop(() => {
//         done();
//       });
//     });
//   });
// });