"use strict";

require('./test_helper');
const assert = require('assert');
const HttpStatus = require('http-status-codes');
const request = require('request');
const Trade = require('../../src/model/trade');
const Transaction = require('../../src/model/transaction');

describe('Trade Endpoint', () => {
  it('get a non existing trade', (done) => {
    request(global.baseUri + '/api/trade/_does_not_exists_', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    })
  });

  it('get a non existing trade', (done) => {
    request(global.baseUri + '/api/trade/123', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    })
  });

  it('create a new trade', (done) => {
    let tx = [
      new Transaction({
        from: "0x123456789",
        to: "0x000000001",
        amount: 1.23
      }),
      new Transaction({
        from: "0x01010101",
        to: "0x123456789",
        amount: 0.23
      })
    ];

    Promise.all([tx[0].save(), tx[1].save()]).then(() => {
      let trade = {
        in: tx[0]._id.toString(),
        out: tx[1]._id.toString(),
        description: 'Big Trade',
      };

      request.post({
        url: global.baseUri + '/api/trade',
        form: trade
      }, (err, resp, body) => {
        assert(!err);
        assert.equal(HttpStatus.CREATED, resp.statusCode);
        assert(resp.headers.location);

        //check if location is right!
        request.get(global.baseUri + resp.headers.location,
          (err, resp, body) => {
            assert(!err);
            assert.equal(HttpStatus.OK, resp.statusCode);
            let parsedBody = JSON.parse(body);

            assert.equal(parsedBody.description, trade.description);
            assert.equal(parsedBody.in._id, tx[0]._id);
            assert.equal(parsedBody.in.from, tx[0].from);
            assert.equal(parsedBody.in.to, tx[0].to);
            assert.equal(parsedBody.in.amount, tx[0].amount);
            assert.equal(parsedBody.out._id, tx[1]._id);
            assert.equal(parsedBody.out.from, tx[1].from);
            assert.equal(parsedBody.out.to, tx[1].to);
            assert.equal(parsedBody.out.amount, tx[1].amount);
            done();
          });
      });
    });
  });

  it('delete a non existing trade', (done) => {
    request.delete(global.baseUri + '/api/trade/123', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    });
  });

  it('delete a non existing trade', (done) => {
    request.delete(global.baseUri + '/api/trade/_does_not_exists_', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    });
  });

  it('delete a existing trade', (done) => {
    let tx = new Trade({});
    tx.save().then(() => {
      request.delete(global.baseUri + '/api/trade/' + tx._id, (err, resp, body) => {
        assert(!err);
        assert.equal(HttpStatus.OK, resp.statusCode);

        done();
      });
    });
  });

});
