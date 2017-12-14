"use strict";

require('./test_helper');
const assert = require('assert');
const HttpStatus = require('http-status-codes');
const request = require('request');
const Transaction = require('../../src/model/transaction');

describe('Transaction Endpoint', () => {
  it('get a non existing transaction', (done) => {
    request(global.baseUri + '/api/transaction/_does_not_exists_', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    })
  });

  it('get a non existing transaction', (done) => {
    request(global.baseUri + '/api/transaction/123', (err, resp, body) => {
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
      url: global.baseUri + '/api/transaction',
      form: tx
    }, (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.CREATED, resp.statusCode);
      assert(resp.headers.location);

      //check if location is right!
      request.get(global.baseUri + resp.headers.location, (err, resp, body) => {
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
    request.delete(global.baseUri + '/api/transaction/123', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    });
  });

  it('delete a non existing transaction', (done) => {
    request.delete(global.baseUri + '/api/transaction/_does_not_exists_', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    });
  });

  it('delete a existing transaction', (done) => {
    let tx = new Transaction({});
    tx.save().then(() => {
      request.delete(global.baseUri + '/api/transaction/' + tx._id, (err, resp, body) => {
        assert(!err);
        assert.equal(HttpStatus.OK, resp.statusCode);

        done();
      });
    });
  });

});
