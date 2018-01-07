"use strict";

const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const log = require('../log');
const Transaction = require('../model/transaction');

router.route('/transaction/:id')
  .get((req, resp) => {
    Transaction.findById(req.params.id).then(
      (tx) => {
        resp.send(tx);
      },
      (err) => {
        resp.status(HttpStatus.NOT_FOUND);
        resp.end();
      });
  })
  .delete((req, resp) => {
    Transaction.findByIdAndRemove(req.params.id).then(
      () => {
        resp.status(HttpStatus.OK);
        resp.end();
      },
      (err) => {
        resp.status(HttpStatus.NOT_FOUND);
        resp.end();
      });
  });

router.route('/transaction')
  .post((req, resp) => {
    let tx = new Transaction(req.body);
    tx.save().then(
      () => {
        resp.location('/api/transaction/' + tx._id);
        resp.status(HttpStatus.CREATED);
        resp.end()
      },
      (err) => {
        log.error('Could not create new transaction!', err);

        resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
        resp.end();
      });
  });

module.exports = router;
