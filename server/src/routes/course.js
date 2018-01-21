"use strict";

const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const log = require('../log');
const Course = require('../model/course');
const CourseType = require('../model/course_type');

router.route('/course/ticker/:symbol')
  .get((req, resp) => {

    Course.findOne({symbol: req.params.symbol, type: CourseType.TICKER}).then(
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

router.route('/course/historical/:symbol')
  .get((req, resp) => {

    Course.find({symbol: req.params.symbol, type: CourseType.HISTORY}).then(
        (courses) => {
          if(courses) {
            resp.send(courses);
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
