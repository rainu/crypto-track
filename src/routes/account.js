"use strict";

const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const log = require('../log');
const Account = require('../model/account');

router.route('/account/:username')
  .get((req, resp) => {
    Account.findOne({username: req.params.username}).populate('wallets').then(
      (account) => {
        if(account) {
          resp.send(account);
        }else{
          resp.status(HttpStatus.NOT_FOUND);
          resp.end();
        }
      },
      (err) => {
        resp.status(HttpStatus.NOT_FOUND);
        resp.end();
      });
  })
  .delete((req, resp) => {
    Account.findOneAndRemove({username: req.params.username}).then(
      (account) => {
        if(account) {
          resp.status(HttpStatus.OK);
          resp.end();
        }else{
          resp.status(HttpStatus.NOT_FOUND);
          resp.end();
        }
      },
      (err) => {
        resp.status(HttpStatus.NOT_FOUND);
        resp.end();
      });
  })
  .post((req, resp) => {
    Account.update({username: req.params.username}, { $push: { wallets: { $each: req.body.wallets } } }).then(
      (account) => {
        resp.status(HttpStatus.OK);
        resp.end();
      },
      (err) => {
        log.error(`Could not update account ${req.params.username}`, err);
        resp.status(HttpStatus.NOT_FOUND);
        resp.end();
      });
  });

router.route('/account')
  .post((req, resp) => {
    let account = new Account(req.body);
    account.save().then(
      () => {
        resp.location('/api/account/' + account.username);
        resp.status(HttpStatus.CREATED);
        resp.end()
      },
      (err) => {
        log.err('Could not create new account!', err);

        resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
        resp.end();
      });
  });

module.exports = router;
