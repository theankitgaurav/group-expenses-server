const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const {passport, isLoggedIn} = require('./../auth/passport-local');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({'message': 'Hi stranger.'})
});

// api endpoints for login, content and logout
router.get("/login", function (req, res, next) {
  if (req.isAuthenticated()) return res.status(200).json({"message": "Login Success.", "data": req.user});
  return next();
}, function (req, res) {
  return res.status(301).json({"message": "Login Required", "data": null});
});

router.post("/login",
  passport.authenticate("local-login", {
    successRedirect: '/home',
    failureRedirect: "/login"
  })
);

router.get('/register', function(req, res, next) {
  return res.status(301).json("User registration required.");
});

router.post("/register", passport.authenticate("local-signup", {
  successRedirect: "/home",
  failureRedirect: "/register"
})
)

router.get("/home", function(req, res, next) {
    if (req.isAuthenticated) return next();
    return next(createError(401, "You need to be logged in first."));
  }, function (req, res) {
  return res.status(200).json({"message": "Login Success.", "data": req.user});
});

router.get("/logout", function (req, res) {
  req.logout();
  return res.status(200).send("Logout success");
});

module.exports = router;