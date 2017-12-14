"use strict";

require('./test_helper');
const assert = require('assert');
const HttpStatus = require('http-status-codes');
const request = require('request');
const Wallet = require('../../src/service/model/wallet');
const Transaction = require('../../src/service/model/transaction');

describe('Wallet Endpoint', () => {
  it('get a non existing wallet', (done) => {
    request(global.baseUri + '/api/wallet/_does_not_exists_', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    })
  });

  it('get a non existing wallet', (done) => {
    request(global.baseUri + '/api/wallet/123', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    })
  });

  it('create and get a new wallet', (done) => {
    let wallet = {
      address: "0x123456789",
      description: 'Test Wallet!',
    };

    request.post({
      url: global.baseUri + '/api/wallet',
      form: wallet
    }, (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.CREATED, resp.statusCode);
      assert(resp.headers.location);

      //check if location is right!
      request.get(global.baseUri + resp.headers.location, (err, resp, body) => {
        assert(!err);
        assert.equal(HttpStatus.OK, resp.statusCode);
        let parsedBody = JSON.parse(body);

        for (let key of Object.keys(wallet)) {
          assert.equal(wallet[key], parsedBody[key]);
        }

        done();
      });
    });
  });

  it('get a full wallet', (done) => {
    let tx = [
        new Transaction({
          from: "0x123456789",
          to: "0x987654321",
          amount: 1.23
        }),
        new Transaction({
          from: "0x987654321",
          to: "0x123456789",
          amount: 0.23
        })
    ];
    let wallet = new Wallet({
      address: tx[0].to,
      description: 'Test Wallet!',
    });

    Promise.all([tx[0].save(), tx[1].save(), wallet.save()]).then(() => {
      //check if location is right!
      request.get(global.baseUri + "/api/wallet/" + wallet._id + "/full", (err, resp, body) => {
        assert(!err);
        assert.equal(HttpStatus.OK, resp.statusCode);
        let parsedBody = JSON.parse(body);

        assert.equal(wallet.address, parsedBody.address);
        assert.equal(wallet.description, parsedBody.description);
        assert.equal(2, parsedBody.transactions.length);
        assert.equal(1, parsedBody.balance);

        done();
      });
    });
  });

  it('delete a non existing wallet', (done) => {
    request.delete(global.baseUri + '/api/wallet/123', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    });
  });

  it('delete a non existing wallet', (done) => {
    request.delete(global.baseUri + '/api/wallet/_does_not_exists_', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    });
  });

  it('delete a existing wallet', (done) => {
    let wallet = new Wallet({});
    wallet.save().then(() => {
      request.delete(global.baseUri + '/api/wallet/' + wallet._id, (err, resp, body) => {
        assert(!err);
        assert.equal(HttpStatus.OK, resp.statusCode);

        done();
      });
    });
  });

});
