"use strict";

const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const log = require('../../../common/src/log');
const Account = require('../model/account');
const WalletFactory = require('../model/wallet_factory');

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

router.route('/account/:username/wallet/exchange/:exchange')
  .post((req, resp) => {
    Account.findOne({username: req.params.username}).populate('wallets').then(
      (account) => {
        if(account) {
          let wallet = WalletFactory.exchange(req.params.username, req.params.exchange);
          wallet.save().then(
            () => {
              account.wallets.push(wallet);
              account.save().then(() => {
                resp.location('/api/wallet/' + wallet._id);
                resp.status(HttpStatus.CREATED);
                resp.end()
              }, (err) => {
                log.error('Could not link new wallet to account!', err);

                resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
                resp.end();
              });
            },
            (err) => {
              log.error('Could not create new wallet!', err);

              resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
              resp.end();
            });
        }else{
          resp.status(HttpStatus.NOT_FOUND);
          resp.end();
        }
      },
      (err) => {
        resp.status(HttpStatus.NOT_FOUND);
        resp.end();
      });
  });

router.route('/account')
  .get((req, resp) => {
    Account.find({}).then(accounts => {
      let accountNames = [];
      for(let account of accounts) {
        accountNames.push(account.username);
      }
      resp.send(accountNames);
    }, err => {
      resp.status(HttpStatus.NOT_FOUND);
      resp.end();
    });
  })
  .post((req, resp) => {
    let account = new Account(req.body);
    account.save().then(
      () => {
        let fiatWallet = WalletFactory.compensation(account.username);
        fiatWallet.save().then(
          () => {
            account.wallets.push(fiatWallet);
            account.save().then(
              () => {
                resp.location('/api/account/' + account.username);
                resp.status(HttpStatus.CREATED);
                resp.end()
              },
              (err) => {
                log.error('Could not create link between new wallet for new account!', err);

                resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
                resp.end();
              }
            );
          },
          (err) => {
            log.error('Could not create new wallet for new account!', err);

            resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
            resp.end();
          }
        );
      },
      (err) => {
        log.error('Could not create new account!', err);

        resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
        resp.end();
      });
  });

module.exports = router;
