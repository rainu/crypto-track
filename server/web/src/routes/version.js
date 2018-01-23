"use strict";

let path = require('path');
let fs = require('fs');
let config = require('../../../common/src/config');

const router = require('express').Router();

router.route('/version')
  .get((req, resp) => {
    resp.set('Content-Type', 'application/json');
    fs.createReadStream(path.join(config.server.asset.static, '/version'))
    .pipe(resp);
  });

module.exports = router;
