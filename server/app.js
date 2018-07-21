const errors = require('./utils/errors');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const ErrorHandler = require('./utils/errorHandler');

// Allow the app to use CORS
app.use(cors())
// set secure HTTP headers
app.use(helmet());

// view engine setup
app.use(morgan('common'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Routers assigned here
const apiRouter = require('./routes/api');
app.use('/', apiRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(new errors.NotFoundError());
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  const {statusCode, type, message} = new ErrorHandler().handleError(err);
  res.status(statusCode).json({type, message})
});

module.exports = app;
