"use strict";

const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const log = require('../log');
const Course = require('../model/course');

router.route('/course/:symbol')
  .get((req, resp) => {

    Course.findOne({symbol: req.params.symbol}).then(
        (course) => {
          if(course) {
            resp.send(course);
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
