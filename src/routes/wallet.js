"use strict";

const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const log = require('../log');
const Wallet = require('../model/wallet');
const WalletFactory = require('../model/wallet_factory');

router.route('/wallet/:id')
  .get((req, resp) => {
    Wallet.findById(req.params.id).then(
      (wallet) => {
        resp.send(wallet);
      },
      (err) => {
        resp.status(HttpStatus.NOT_FOUND);
        resp.end();
      });
    })
  .delete((req, resp) => {
    Wallet.findByIdAndRemove(req.params.id).then(
      () => {
        resp.status(HttpStatus.OK);
        resp.end();
      },
      (err) => {
        resp.status(HttpStatus.NOT_FOUND);
        resp.end();
      });
  });

router.route('/wallet/:id/full')
  .get((req, resp) => {
    Wallet.findById(req.params.id).populate('outTransactions').populate('inTransactions').then(
      (wallet) => {
        let fullWallet = {
          _id: wallet._id,
          address: wallet.address,
          description: wallet.description,
          transactions: [...wallet.inTransactions, ...wallet.outTransactions],
          balance: {},
        };
        for(let currency of wallet.currencies){
          fullWallet.balance[currency] = wallet.getBalance(currency);
        }

        resp.send(fullWallet);
      },
      (err) => {
        resp.status(HttpStatus.NOT_FOUND);
        resp.end();
      });
  });

router.route('/wallet')
  .post((req, resp) => {
    let wallet = new Wallet(req.body);
    wallet.save().then(
      () => {
        resp.location('/api/wallet/' + wallet._id);
        resp.status(HttpStatus.CREATED);
        resp.end()
      },
      (err) => {
        log.error('Could not create new wallet!', err);

        resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
        resp.end();
      });
  });

module.exports = router;
