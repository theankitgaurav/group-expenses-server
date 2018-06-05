const env = require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Allow the app to use CORS
app.use(cors())
// set secure HTTP headers
app.use(helmet());

// view engine setup
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// setup db connection
let db_uri = process.env.DB_URI;
let db_name = process.env.DB_DATABASE;
// if(app.get('env') == 'development') {
//   db_uri = 'mongodb://localhost:27017/Group-Expenses-Dev';
//   db_name = 'Group-Expenses-Dev';
// }
mongoose.connect(db_uri);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("DB connection OK.");
});


// Routers assigned here
// const apiRouter = require('./routes/api');
// app.use('/api', apiRouter);
const apiRouter = require('./routes/v2/api');
app.use('/', apiRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404, 'The resource you are looking for does not exist'));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err.message || 'Internal error.');
});

module.exports = app;
