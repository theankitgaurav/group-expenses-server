var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/secure', (req, res, next)=>{
  res.send("You are in a secure area now.");
})

module.exports = router;
