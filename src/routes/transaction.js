let router = require('express').Router();
let log = require('../log');

router.route('/transaction')
  .post(function(req, res) {
    log.info("api!", req.body);

    res.end()
  });

module.exports = router;
