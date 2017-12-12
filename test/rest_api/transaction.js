"use strict";

const assert = require('assert');
const http = require('http');
const HttpStatus = require('http-status-codes');
const request = require('request');
const app = require('../../src/app');
const config = require('../../src/config');
const mongodb = require('../../src/config/database');
const Transaction = require('../../src/service/model/transaction');
const mongoose = require('mongoose');

let server;
let baseUri;

before((done) => {
  server = http.createServer(app).listen();
  app.set('port', server.address().port);

  baseUri = 'http://localhost:' + server.address().port;
  done();
});

after((done) => {
  mongoose.connection.close();
  server.close();
  process.exit(0);
});

describe('Transaction Endpoint', () => {
  it('get a non existing transaction', (done) => {
    request(baseUri + '/api/transaction/_does_not_exists_', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    })
  });

  it('get a non existing transaction', (done) => {
    request(baseUri + '/api/transaction/123', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    })
  });

  it('create a new transaction', (done) => {
    let tx = {
      date: 1312,
      amount: 1308,
      from: 'MIR',
      to: 'DIR',
      fee: 0.123,
      currency: 'EUR',
      description: 'Test Transaktion!',
    };

    request.post({
      url: baseUri + '/api/transaction',
      form: tx
    }, (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.CREATED, resp.statusCode);
      assert(resp.headers.location);

      //check if location is right!
      request.get(baseUri + resp.headers.location, (err, resp, body) => {
        assert(!err);
        assert.equal(HttpStatus.OK, resp.statusCode);
        let parsedBody = JSON.parse(body);

        for (let key of Object.keys(tx)) {
          assert.equal(tx[key], parsedBody[key]);
        }

        done();
      });
    });
  });

  it('delete a non existing transaction', (done) => {
    request.delete(baseUri + '/api/transaction/123', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    });
  });

  it('delete a non existing transaction', (done) => {
    request.delete(baseUri + '/api/transaction/_does_not_exists_', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    });
  });

  it('delete a existing transaction', (done) => {
    let tx = new Transaction({});
    tx.save().then(() => {
      request.delete(baseUri + '/api/transaction/' + tx._id, (err, resp, body) => {
        assert(!err);
        assert.equal(HttpStatus.OK, resp.statusCode);

        done();
      });
    });
  });

});
