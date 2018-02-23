"use strict";

const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const Account = require('../model/account');
const Transaction = require('../model/transaction');
const Wallet = require('../model/wallet');
const Trade = require('../model/trade');
const importer = require('../import/backup');
const DBService = require('../db_service');

router.route('/backup/:username')
  .get((req, resp) => {
    Account.findOne({username: req.params.username}).then((account) => {
      if(account) {
        importer.export(req.params.username).then((result) => {
          resp.send(result);
        }, (err) => {
          resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
          resp.end();
        });
      }else{
        resp.status(HttpStatus.NOT_FOUND);
        resp.end();
      }
    }, (err) => {
      resp.status(HttpStatus.NOT_FOUND);
      resp.end();
    });
  })
  .put((req, resp) => {
    DBService.getCompleteAccount(req.params.username).then(account => {
      let p = [];

      for(let trade of account.trades){
        p.push(Trade.findByIdAndRemove(trade._id));
      }
      for(let wallet of account.wallets){
        p.push(Transaction.remove({
          $or: [{from: wallet.address}, {to: wallet.address}]
        }));
        p.push(Wallet.findByIdAndRemove(wallet._id));
      }
      p.push(Account.remove({username: req.params.username}));

      Promise.all(p).then((done) => {
        importer.import(req.body).then(() => {
          resp.status(HttpStatus.CREATED);
          resp.end();
        }, (err) => {
          resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
          resp.end();
        });
      }, err => {
        resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
        resp.end();
      });
    }, err => {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
      resp.end();
    });
  });

router.route('/backup')
  .post((req, resp) => {
    importer.import(req.body).then(() => {
      resp.status(HttpStatus.CREATED);
      resp.end();
    }, (err) => {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
      resp.end();
    });
  });

module.exports = router;
