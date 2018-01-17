"use strict";

require('./test_helper');
const assert = require('assert');
const HttpStatus = require('http-status-codes');
const request = require('request');
const Course = require('../../src/model/course');

describe('Course Endpoint', () => {
  it('get a non existing course', (done) => {
    request(global.baseUri + '/api/course/_does_not_exists_', (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.NOT_FOUND, resp.statusCode);

      done();
    })
  });

  it('get a existing course', (done) => {
    let course = new Course({
      symbol: 'BTCEUR',
      date: new Date(),
      course: 13128.9,
    });

    course.save().then(() => {
      request(global.baseUri + '/api/course/BTCEUR', (err, resp, body) => {
        assert(!err);
        assert.equal(HttpStatus.OK, resp.statusCode);

        done();
      })
    }, (err) => {
      assert.fail(err);
      done();
    });
  });


});
