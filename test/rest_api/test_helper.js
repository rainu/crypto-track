const http = require('http');
const app = require('../../src/app');
const config = require('../../src/config');
const mongodb = require('../../src/config/database');
const mongoose = require('mongoose');

let server;

before(() => {
  server = http.createServer(app).listen();
  app.set('port', server.address().port);

  global.baseUri = 'http://localhost:' + server.address().port;
});

beforeEach((done) => {
  const { transactions, wallets, trades } = mongoose.connection.collections;
  transactions.drop(() => {
    wallets.drop(() => {
      trades.drop(() => {
        done();
      });
    });
  });
});

after(() => {
  mongoose.connection.close();
  server.close();
  process.exit(0);
});
