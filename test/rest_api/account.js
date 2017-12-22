"use strict";

require('./test_helper');
const assert = require('assert');
const HttpStatus = require('http-status-codes');
const request = require('request');
const Wallet = require('../../src/model/wallet');
const Account = require('../../src/model/account');

describe('Account Endpoint', () => {
  it('get a non existing account', (done) => {
    request(global.baseUri + '/api/account/_does_not_exists_', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    })
  });

  it('create and get a new account', (done) => {
    let account = {
      username: "rainu",
    };

    request.post({
      url: global.baseUri + '/api/account',
      form: account
    }, (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.CREATED, resp.statusCode);
      assert(resp.headers.location);

      //check if location is right!
      request.get(global.baseUri + resp.headers.location, (err, resp, body) => {
        assert(!err);
        assert.equal(HttpStatus.OK, resp.statusCode);
        let parsedBody = JSON.parse(body);

        for (let key of Object.keys(account)) {
          assert.equal(account[key], parsedBody[key]);
        }

        done();
      });
    });
  });

  it('delete a non existing account', (done) => {
    request.delete(global.baseUri + '/api/account/_does_not_exists_', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    });
  });

  it('delete a existing account', (done) => {
    let account = new Account({username: 'rainu'});
    account.save().then(() => {
      request.delete(global.baseUri + '/api/account/' + account.username, (err, resp, body) => {
        assert(!err);
        assert.equal(HttpStatus.OK, resp.statusCode);

        done();
      });
    });
  });

  it('link a wallet to an account', (done) => {
    let account = new Account({username: 'rainu'});
    let wallet = new Wallet({address: '0x123456789', description: 'TestWallet!'});

    Promise.all([account.save(), wallet.save()]).then(() => {
      request.post({
        url: global.baseUri + '/api/account/' + account.username,
        form: {
          wallets: [ wallet._id.toString() ]
        }
      }, (err, resp, body) => {
        assert(!err);
        assert.equal(HttpStatus.OK, resp.statusCode);

        request(global.baseUri + '/api/account/' + account.username, (err, resp, body) => {
          assert(!err);
          assert.equal(HttpStatus.OK, resp.statusCode);
          let parsedBody = JSON.parse(body);

          assert.equal(parsedBody.username, account.username);
          assert.equal(parsedBody.wallets.length, 1);
          assert.equal(parsedBody.wallets[0].address, wallet.address);
          assert.equal(parsedBody.wallets[0].description, wallet.description);

          done();
        });
      });
    });
  });

});
