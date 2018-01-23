"use strict";

const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const log = require('../../../common/src/log');
const Trade = require('../model/trade');

router.route('/trade/:id')
  .get((req, resp) => {
    Trade.findById(req.params.id).populate('in').populate('out').then(
      (trade) => {
        resp.send({
          _id: trade._id,
          in: {
            _id: trade.in._id,
            date: trade.in.date,
            amount: trade.in.amount,
            from: trade.in.from,
            to: trade.in.to,
            fee: trade.in.fee,
            currency: trade.in.currency,
            description: trade.in.description,
          },
          out: {
            _id: trade.out._id,
            date: trade.out.date,
            amount: trade.out.amount,
            from: trade.out.from,
            to: trade.out.to,
            fee: trade.out.fee,
            currency: trade.out.currency,
            description: trade.out.description,
          },
          description: trade.description,
        });
      },
      (err) => {
        resp.status(HttpStatus.NOT_FOUND);
        resp.end();
      });
  })
  .delete((req, resp) => {
    Trade.findByIdAndRemove(req.params.id).then(
      () => {
        resp.status(HttpStatus.OK);
        resp.end();
      },
      (err) => {
        resp.status(HttpStatus.NOT_FOUND);
        resp.end();
      });
  });

router.route('/trade')
  .post((req, resp) => {
    let trade = new Trade(req.body);
    trade.save().then(
      () => {
        resp.location('/api/trade/' + trade._id);
        resp.status(HttpStatus.CREATED);
        resp.end()
      },
      (err) => {
        log.error('Could not create new trade!', err);

        resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
        resp.end();
      });
  });

module.exports = router;
