const express = require("express");
const router = express.Router();
const {passport, isLoggedIn} = require('./../middlewares/passport-local');
const _ = require('lodash');

let items = require('../mocks/items');
const EntryModel = require('../models/entry');
const GroupModel = require('../models/group');

// Middleware ensuring only authenticated requests can utilize the apis
router.use('/', isLoggedIn);

// Middleware to resolve group id and initialize 
// state for next route
router.use('/group/:groupId/*', (req, res, next) => {
    GroupModel.findOne({_id: req.params.groupId}, function(err, result){
        if(err) {
            console.error(`Group id : ${req.params.groupId} doesn't exist`);
            return res.status(400).json({'message': `Group doesn't exist`, 'data': null});
        }
        req.group = result;
        console.log(`Group ${req.params.groupId} resolved.`);
        return next();
    });
});

// Middleware to add the item to request object if itemId matches
router.param("itemId", (req, res, next)=>{
    EntryModel.findOne({_id: req.params.itemId}, function(err, entryInDb){
        if (err) return handleError(`Entry does not exist in db`, err, next);
        req.item = entryInDb;
        console.log(`Entry ${req.params.itemId} resolved.`);
        return next();
    });
});

router.get("*/items", (req, res, next)=>{
    EntryModel.find(function(err, entriesList){
        if(err) return handleError(`No entries found in db`, err, next);
        return res.status(200).json(entriesList);    
    });
});

router.get("*/items/:itemId", (req, res)=>{
    return res.status(200).json(req.item);
});

router.post("*/items", (req, res, next)=>{
    let entryObj = getEntryObject(req);
    EntryModel.create(entryObj, function (err, entryInDb) {
        if(err) return handleError(`User could not be saved to db`, err, next);
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

router.put("*/items/:itemId", (req, res, next)=>{
    const editedEntryObj = getEntryObject(req);
    EntryModel.findOneAndUpdate(
        {_id: req.item._id},
        {$set: editedEntryObj},
        {new: true},
        function(err, updatedEntryInDb){
            if (err) return handleError(`Entry could not be updated in db.`, err, next);
            console.log(`Entry update successful.`);
            return res.status(200).json({"message":`Entry update successful.`, data: updatedEntryInDb});
        }
    )
});

router.delete("*/items/:itemId", (req, res)=>{
    EntryModel.findOneAndRemove({_id: req.params.itemId}, function(err, entryInDb){
        if(err) return handleError(`Entry could not be deleted frmo DB.`, err, next);
        console.log(`Item deletion successful.`);
        return res.status(200).json({message: `Item deletion successful.`, data: entryInDb});
    });
});

// Function to log the error with business error message and
// call the next router, here the error handling middleware 
function handleError(errorMessage, errorObject, next) {
    console.error(errorMessage, errorObject);
    next(errorObject);
};

// Validates and prepares the entry object
function getEntryObject(requestObject) {
    const entryObject = {
        amount: requestObject.body.amount || '',
        category: requestObject.body.category || '',
        enteredBy: requestObject.body.enteredBy || '',
        forUser: requestObject.body.forUser || '',
        updatedBy: requestObject.body.updatedBy || ''
    };
    console.log(JSON.stringify(entryObject));
    return entryObject;
}

module.exports = router;