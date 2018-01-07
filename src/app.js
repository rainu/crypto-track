"use strict";

let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');

let app = express();

app.use(require('morgan')('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/', require('./routes/transaction'));
app.use('/api/', require('./routes/trade'));
app.use('/api/', require('./routes/wallet'));
app.use('/api/', require('./routes/watch'));
app.use('/api/', require('./routes/account'));
app.use('/api/', require('./routes/import'));
app.use('/api/', require('./routes/backup'));
app.use('/api/', require('./routes/report'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
