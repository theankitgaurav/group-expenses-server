const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const Group = require('../models/group');
const _ = require('lodash');


// passport needs ability to serialize and unserialize users out of session
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// passport local strategy for local-login, local refers to this app
passport.use('local-login', new LocalStrategy(
  function (username, password, done) {
    User.findOne({
      username: username
    }, (err, user) => {
      if (err) {
        return done(err);
      }
      if(!user) return done(null, false, {"message": "User does not exist."})

      user.isValidPassword(password, function(err, isMatch) {
        if (err) {
          console.error(`Password comparison failed`, err);
          return done(null, false, {"message":'Password comparison failed'});
        }
        if (!isMatch) {
          console.log("Invalid password.");
          return done(null, false, {"message": "Invalid password."})
        }
        return done(null, user);
      });
    })
  }));

// passport local strategy for local-signup, local refers to this app
passport.use('local-signup', new LocalStrategy(
  function (username, password, done) {
    User.findOne({
      username: username
    }, (err, user) => {
      if(err) {
        return done(err);
      }
      if(user) {
        console.log(`User already exists.`);
        return done(null, false,  {"message": "User already exists."});
      }
      User.create({username, password}, function(err, newUser){
        if(err) {
          console.log(err);
          return done(null, false, {"message": "User could not be saved into db"});
        }
        return done(null, newUser);
      })
    })
  }));

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = {passport, isLoggedIn};