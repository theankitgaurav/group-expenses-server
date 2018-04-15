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
      if(!user.isValidPassword(password)) {
        console.log("Invalid password.")
        return done(null, false, {
          "message": "Invalid password."
        })
      }
      return done(null, user);
    })
  }));

// passport local strategy for local-signup, local refers to this app
passport.use('local-signup', new LocalStrategy(
  function (username, password, done) {
    User.findOne({
      username: username
    }, (err, user) => {
      if(err) {
        return done(null, false);
      }
      if(user) {
        console.log(`user found ${user}`);
        return done(null, user);
      }
      const newUser = new User();
      newUser.username = username;
      newUser.password = password;
      newUser.save(function(err) {
        if (err) throw err;
        return done(null, newUser);
      });
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
  res.render("login", {
    title: "Group Expenses | Login"
  });
});
router.post("/login",
  passport.authenticate("local-login", {
    successRedirect: '/content',
    failureRedirect: "/login"
  })
);

router.get('/register', function(req, res, next) {
  res.render("register", {
    title: "Group Expenses | Register"
  });
});

router.post("/register", passport.authenticate("local-signup", {
  successRedirect: "/content",
  failureRedirect: "/signup"
})
)

router.get("/content", isLoggedIn, function (req, res) {
  res.render("home", {
    title: 'Group Expenses | Home',
    username: 'User'
  })
});

router.get("/logout", function (req, res) {
  req.logout();
  res.send("logout success!");
});

module.exports = router;