const express = require("express");
const createError = require('http-errors');
const router = express.Router();
const AuthController = require('../../controllers/pg/AuthController');


// General apis
router.get('/', (req, res, next)=>{
    res.send('Hello world.');
})
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

module.exports = router;