"use strict";

const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const Account = require('../model/account');
const WalletFactory = require('../model/wallet_factory');
const importer = {
  bitcoin_de: require('../import/bitcoin_de'),
};

router.route('/account/:username/import/csv/:type')
  .put((req, resp) => {
    if(importer.hasOwnProperty(req.params.type)) {
      Account.findOne({username: req.params.username}).then((account) => {
        if(account) {
          let fiatWallet = WalletFactory.compensation(req.params.username);
          let coinWallet = WalletFactory.exchange(req.params.username, req.params.type);

          importer[req.params.type](fiatWallet.address, coinWallet.address, req).then(() => {
            resp.status(HttpStatus.CREATED);
            resp.end();
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
    } else {
      //no importer available for given type
      resp.status(HttpStatus.NOT_FOUND);
      resp.end();
    }
  });

module.exports = router;
