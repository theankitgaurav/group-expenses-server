const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Entry = require('../models/entry');



var user1 = new User();
user1.username = "Rahul";
user1.password = "gothamissilent";

router.get("/entry/:id", function(req, res, next){
    const newEntry = new Entry();
    newEntry.amount = 100;
    newEntry.quantity = 1;
    newEntry.category = "Ration";
    User.findOne({username: "ankitgaurav"}, function(err, user){
        if(err) return res.json({data: null, status: 404});
        newEntry.enteredBy = user;
        newEntry.updatedBy = user;
    })
    
    return res.json({
        data: newEntry,
        status: 200
    })
})

router.post("/entry", function (req, res, send) {
    
});


























module.exports = router;