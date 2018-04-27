const express = require('express');
const router = express.Router();
const {passport, isLoggedIn} = require('./../middlewares/passport-local');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.isAuthenticated()) return res.redirect('home');
  return next();
}, function (req, res, next) {
  res.render('index', {
    title: 'Group Expenses'
  });
});

// api endpoints for login, content and logout
router.get("/login", function (req, res, next) {
  if (req.isAuthenticated()) return res.redirect('home');
  return next();
}, function (req, res) {
  res.render("login", {
    title: "Group Expenses | Login"
  });
});

router.post("/login",
  passport.authenticate("local-login", {
    successRedirect: 'home',
    failureRedirect: "/login"
  })
);

router.get('/register', function(req, res, next) {
  res.render("register", {
    title: "Group Expenses | Register"
  });
});

router.post("/register", passport.authenticate("local-signup", {
  successRedirect: "home",
  failureRedirect: "/register"
})
)

router.get("/home", isLoggedIn, function (req, res) {
  res.render("home", {
    title: 'Group Expenses | Home',
    username: 'User'
  })
});

router.get("/logout", function (req, res) {
  req.logout();
  res.send(`
  <html>
    <p>You have been logged out successfully.</p>
    <a href="/">Go home</a>
  </html>
  `);
});

module.exports = router;