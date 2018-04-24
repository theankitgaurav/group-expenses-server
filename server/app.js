const env = require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const app = express();


// set secure HTTP headers
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client', 'public')));

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

// Required middlewares for Passportjs
app.use(session({
  store: new MongoDBStore(
    {
      uri: db_uri,
      databaseName: db_name,
      collection: 'mySessions'
    }),
  secret: 'ankit secret',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Routers assigned here
const webRouter = require('./routes/web');
const apiRouter = require('./routes/api');
app.use('/', webRouter);
app.use('/api/', apiRouter);

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
  res.render('error');
});

module.exports = app;
