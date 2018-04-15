const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

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
        return done(null, false, {
          "message": "User not found."
        });
      }
      return done(null, user);
    })
  }));

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Group Expenses'
  });
});

// api endpoints for login, content and logout
router.get("/login", function (req, res, next) {
  if (req.isAuthenticated()) return res.redirect('/content');
  return next();
}, function (req, res) {
  res.send("<p>Please login!</p><form method='post' action='/login'><input type='text' name='username'/><input type='password' name='password'/><button type='submit' value='submit'>Submit</buttom></form>");
});
router.post("/login",
  passport.authenticate("local-login", {
    successRedirect: '/content',
    failureRedirect: "/login"
  })
);

router.get("/content", isLoggedIn, function (req, res) {
  res.send("Congratulations! you've successfully logged in.");
});

router.get("/logout", function (req, res) {
  req.logout();
  res.send("logout success!");
});

module.exports = router;