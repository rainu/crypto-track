"use strict";

const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const log = require('../log');
const Watch = require('../model/watch');

router.route('/watch/:id')
  .get((req, resp) => {
    Watch.findById(req.params.id).then(
      (tx) => {
        resp.send(tx);
      },
      (err) => {
        resp.status(HttpStatus.NOT_FOUND);
        resp.end();
      });
  })
  .delete((req, resp) => {
    Watch.findByIdAndRemove(req.params.id).then(
      () => {
        resp.status(HttpStatus.OK);
        resp.end();
      },
      (err) => {
        resp.status(HttpStatus.NOT_FOUND);
        resp.end();
      });
  });

router.route('/watch')
  .post((req, resp) => {
    let watch = new Watch(req.body);
    watch.save().then(
      () => {
        resp.location('/api/watch/' + watch._id);
        resp.status(HttpStatus.CREATED);
        resp.end()
      },
      (err) => {
        log.error('Could not create new watch!', err);

        resp.status(HttpStatus.INTERNAL_SERVER_ERROR);
        resp.end();
      });
  });

module.exports = router;
