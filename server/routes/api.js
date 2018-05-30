const express = require("express");
const createError = require('http-errors');
const router = express.Router();
const _ = require('lodash');
const EntryController = require('../controllers/EntryController');
const AuthController = require('../controllers/AuthController');

const EntryModel = require('../models/entry');
const GroupModel = require('../models/group');

// Middleware ensuring only authenticated requests can utilize the apis
// router.use('/', isLoggedIn);

// Middleware to resolve group id and initialize 
// state for next route
router.use('/group/:groupId/*', (req, res, next) => {
    GroupModel
    .findOne({_id: req.params.groupId})
    .populate({'path': 'entries', 'select': ['_id', 'category', 'forUser', 'amount', 'forDate']})
    .exec(function(err, groupInDb){
        if(err) return next(createError(500, err));
        if(groupInDb == null) return next(createError(404, `Group doesn't exist`));
        // if(groupInDb.members.indexOf(req.user._id) == -1) return next(createError(403, `Current user not a member of specified group.`));
        req.group = groupInDb;
        return next();
    });
});

// Middleware to add the item to request object if itemId matches
router.param("itemId", (req, res, next)=>{
    EntryModel
    .findOne({_id: req.params.itemId})
    .populate({'path':'enteredBy', 'select': ['_id', 'username']})
    .populate({'path':'forUser', 'select': ['_id', 'username']})
    .populate({'path':'updatedBy', 'select': ['_id', 'username']})
    .exec(function(err, entryInDb){
        if (err) return next(err);
        if(entryInDb == null) return next(createError(404, 'Entry does not exist in db'));
        req.item = entryInDb;
        return next();
    });
});

router.get("/group/:groupId/items", AuthController.isAuthenticated, EntryController.getEntries);
router.get("/group/:groupId/items/:itemId", AuthController.isAuthenticated, EntryController.getEntryById);
router.post("/group/:groupId/items", AuthController.isAuthenticated, EntryController.postEntry);
router.put("/group/:groupId/items/:itemId", AuthController.isAuthenticated, EntryController.updateEntry);
router.delete("/group/:groupId/items/:itemId", AuthController.isAuthenticated, EntryController.deleteEntryById);

router.post("/signup", AuthController.register);
router.post("/signin", AuthController.login);

module.exports = router;