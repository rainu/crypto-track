"use strict";

let path = require('path');
let fs = require('fs');
const router = require('express').Router();

router.route('/version')
  .get((req, resp) => {
    resp.set('Content-Type', 'application/json');
    fs.createReadStream(path.join(__dirname, '../../../public/version'))
    .pipe(resp);
  });

module.exports = router;
