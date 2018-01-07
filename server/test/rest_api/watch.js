"use strict";

require('./test_helper');
const assert = require('assert');
const HttpStatus = require('http-status-codes');
const request = require('request');
const Watch = require('../../src/model/watch');

describe('Watch Endpoint', () => {
  it('get a non existing watch', (done) => {
    request(global.baseUri + '/api/watch/_does_not_exists_', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    })
  });

  it('get a non existing watch', (done) => {
    request(global.baseUri + '/api/watch/123', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    })
  });

  it('create a new watch', (done) => {
    let watch = {
      chain: "ETH",
      address: "0x123456789",
      in: true,
      out: true
    };

    request.post({
      url: global.baseUri + '/api/watch',
      form: watch
    }, (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.CREATED, resp.statusCode);
      assert(resp.headers.location);

      //check if location is right!
      request.get(global.baseUri + resp.headers.location, (err, resp, body) => {
        assert(!err);
        assert.equal(HttpStatus.OK, resp.statusCode);
        let parsedBody = JSON.parse(body);

        for (let key of Object.keys(watch)) {
          assert.equal(watch[key], parsedBody[key]);
        }

        done();
      });
    });
  });

  it('delete a non existing watch', (done) => {
    request.delete(global.baseUri + '/api/watch/123', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    });
  });

  it('delete a non existing watch', (done) => {
    request.delete(global.baseUri + '/api/watch/_does_not_exists_', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    });
  });

  it('delete a existing watch', (done) => {
    let tx = new Watch({});
    tx.save().then(() => {
      request.delete(global.baseUri + '/api/watch/' + tx._id, (err, resp, body) => {
        assert(!err);
        assert.equal(HttpStatus.OK, resp.statusCode);

        done();
      });
    });
  });

});
