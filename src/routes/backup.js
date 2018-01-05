"use strict";

const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const Account = require('../model/account');
const importer = require('../import/backup');

router.route('/account/:username/backup')
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
  });

router.route('/account/backup')
  .put((req, resp) => {
    importer.import(req.body).then(() => {
      resp.status(HttpStatus.CREATED);
      resp.end();
    }, (err) => {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
      resp.end();
    });
  });

module.exports = router;
