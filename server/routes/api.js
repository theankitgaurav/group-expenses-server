const express = require("express");
const router = express.Router();
const {passport, isLoggedIn} = require('./../middlewares/passport-local');
const _ = require('lodash');

let items = require('../mocks/items');
let users = require('../mocks/users');

// Middleware to dd the item to request object if itemId matches
router.param("id", (req, res, next)=>{
    var matchedItem = _.find(items, function(o) { return o._id == req.params.id; });
    if (matchedItem == undefined) {
        console.error(`Id: ${req.params.id} did not match any item.`);
        return res.status(400).json(matchedItem);
    }
    req.item = matchedItem;
    return next();
});

router.get("/items", (req, res)=>{
    console.log(`User: ${req.user}`);
    return res.status(200).json(items);    
});

router.get("/items/:id", (req, res)=>{
    return res.status(200).json(req.item);
});

router.post("/items", (req, res)=>{
    var newItem = {_id: items.length+1, detail: req.body.detail};
    items.push(newItem);
    return res.status(200).json(newItem);
});

router.put("/items/:id", (req, res)=>{
    for (let item of items) {
        if (item._id == req.params.id) {
            item.detail = req.body.detail;
            req.item = item;
            return res.status(200).json(item);
        }
    }
});

router.delete("/items/:id", (req, res)=>{
    let newItems = _.remove(items, function(el) { return el._id != req.item._id; });
    items = newItems;
    return res.status(200).json(req.item);
});


module.exports = router;