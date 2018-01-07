"use strict";

const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const log = require('../log');
const Account = require('../model/account');
const TxFinder = require('../report/tx_finder');
const TaxReporter = require('../report/tax_report');

router.route('/report/:username')
  .get((req, resp) => {
    Account.findOne({username: req.params.username}).then(
      (account) => {
        if(account) {
          TxFinder(account.username).then((allTransactions) => {
            let completeReport = [];
            for(let currency of Object.keys(allTransactions)) {
              let transactions = allTransactions[currency];
              let report = TaxReporter(transactions.in, transactions.out);
              completeReport.push(...report);
            }
            completeReport.sort((a, b) => a.sellDate - b.sellDate);

            resp.send(completeReport);
          }, (err) => {
            log.error('Could not find transactions!', err);
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

module.exports = router;
