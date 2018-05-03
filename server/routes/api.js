const express = require("express");
const router = express.Router();
const {isLoggedIn} = require('./../auth/passport-local');
const _ = require('lodash');

const EntryModel = require('../models/entry');
const GroupModel = require('../models/group');

// Middleware ensuring only authenticated requests can utilize the apis
router.use('/', isLoggedIn);

// Middleware to resolve group id and initialize 
// state for next route
router.use('/group/:groupId/*', (req, res, next) => {
    GroupModel
    .findOne({_id: req.params.groupId})
    .populate({'path': 'entries', 'select': ['_id', 'category', 'forUser', 'amount', 'forDate']})
    .exec(function(err, groupInDb){
        if(err) return next(err);
        if(groupInDb == null) return res.status(400).json({'message': `Group doesn't exist`, 'data': null});
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
        if(entryInDb == null) return res.status(400).json({"message": "Entry does not exist in db", "data": null});
        req.item = entryInDb;
        return next();
    });
});

// Fetch all Entries in a Group
router.get("*/items", (req, res, next)=>{
    if(req.group.entries.length > 0) {
        return res.status(200).json({
            "message":`${req.group.entries.length} matching items`,
            "data": req.group.entries
        });
    }
    return res.status(200).json({"message": `No Entry in ${req.group._id}`, "data": []});
});

// Fetch an existing Entry based on id
router.get("*/items/:itemId", (req, res)=>{
    return res.status(200).json(req.item);
});

// Add a new Entry to a group
router.post("*/items", (req, res, next)=>{
    let entryObj = getEntryObject(req);
    EntryModel.create(entryObj, function (err, entryInDb) {
        if(err) return next(err);
        GroupModel.findOneAndUpdate(
            {_id: req.group._id}, 
            {$push: {entries:entryInDb._id}}, 
            {new: true}, 
            function(err, groupInDb) {
                if(err) return handleError(`Entrylist could not be updated after a new entry was created.`, err, next);
                console.log(`New entry saved and group entryList updated successfully.`);
                return res.status(200).json(entryInDb._id);
        });
    });
});

// Update an existing Entry from a Group
router.put("*/items/:itemId", (req, res, next)=>{
    const editedEntryObj = getEntryObject(req);
    EntryModel.findOneAndUpdate(
        {_id: req.item._id},
        {$set: editedEntryObj},
        {new: true},
        function(err, updatedEntryInDb){
            if (err) return next(err);
            console.log(`Entry update successful.`);
            return res.status(200).json({"message":`Entry update successful.`, data: updatedEntryInDb});
        }
    )
});

// Delete an Entry from a Group
router.delete("*/items/:itemId", (req, res)=>{
    EntryModel.findOneAndRemove({_id: req.params.itemId}, function(err, entryInDb){
        if(err) return next(err);
        console.log(`Item deletion successful.`);
        return res.status(200).json({message: `Item deletion successful.`, data: entryInDb});
    });
});

/**
 * Validates and prepares the entry object
 * 
 * @param {Request} requestObject 
 * @returns EntryModel like Object
 */
function getEntryObject(requestObject) {
    const entryObject = {
        amount: requestObject.body.amount || '',
        category: requestObject.body.category || '',
        enteredBy: requestObject.user._id,
        forUser: requestObject.user._id,
        updatedBy: requestObject.user._id
    };
    console.log(JSON.stringify(entryObject));
    return entryObject;
}

module.exports = router;