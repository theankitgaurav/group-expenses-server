function authenticationMiddleware () {
    return function (req, res, next) {
      if (req.isAuthenticated()) {
        console.log("is authenticated")
        return next()
      }
      console.log(`Not authenticated.`);
      res.redirect('/')
    }
  }

  module.exports = authenticationMiddleware