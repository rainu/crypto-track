"use strict";

let path = require('path');
let fs = require('fs');
const HttpStatus = require('http-status-codes');
let config = require('../../../common/src/config');

const router = require('express').Router();

router.route('/version')
  .get((req, resp) => {
    if(!fs.existsSync(path.join(config.server.asset.static, '/version'))){
      resp.status(HttpStatus.NOT_FOUND);
      resp.end();
    }else{
      resp.set('Content-Type', 'application/json');
      fs.createReadStream(path.join(config.server.asset.static, '/version'))
        .pipe(resp);
    }
  });

module.exports = router;
