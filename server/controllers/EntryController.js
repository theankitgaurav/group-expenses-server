const createError = require('http-errors');

const EntryModel = require('../models/entry');
const GroupModel = require('../models/group');

/**
 * Validates and prepares the entry object
 * 
 * @param {Request} requestObject 
 * @returns EntryModel like Object
 */
const prepareEntryObject = function (requestObject) {
    const entryObject = {
        amount: requestObject.body.amount || '',
        category: requestObject.body.category || '',
        enteredBy: requestObject.body.enteredBy || requestObject.user._id,
        forUser: requestObject.body.forUser || requestObject.user._id,
        updatedBy: requestObject.body.updatedBy || requestObject.user._id
    };
    console.log(JSON.stringify(entryObject));
    return entryObject;
}

module.exports = {
    async getEntries (req, res, next) {
        if(req.group.entries.length > 0) {
            return res.status(200).json({
                "message":`${req.group.entries.length} matching items`,
                "data": req.group.entries
            });
        }
        return res.status(200).json({"message": `No Entry in ${req.group._id}`, "data": []});
    },
    async getEntryById (req, res) {
        return res.status(200).json(req.item);
    },
    async postEntry (req, res, next) {
        try {
            const entryObj = prepareEntryObject(req);
            EntryModel.create(entryObj, function (err, entryInDb) {
                if(err) return next(err);
                GroupModel.findOneAndUpdate(
                    {_id: req.group._id}, 
                    {$push: {entries:entryInDb._id}}, 
                    {new: true}, 
                    function(err, groupInDb) {
                        if(err) return next(createError(500, err));
                        console.log(`New entry saved and group entryList updated successfully.`);
                        return res.status(200).json(entryInDb._id);
                });
            });
        } catch (err) {
            return next(createError(400, "Invalid data sent for new post."));
        }
    },
    async updateEntry (req, res, next){
        // Check if Entry update should be allowed
        // if(req.item.enteredBy._id != req.user._id){
        //     return next(createError(403, `Entry created by one user can't be modified by another.`));
        // }
        const editedEntryObj = prepareEntryObject(req);
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
    },
    async deleteEntryById (req, res, next) {
        // Check if deletion of Entry should be allowed
        // if(req.item.enteredBy._id != req.user._id){
        //     return next(createError(403, `Entry created by other user can't be deleted.`));
        // }
        EntryModel.findOneAndRemove({_id: req.params.itemId}, function(err, entryInDb){
            if(err) return next(err);
            console.log(`Item deletion successful.`);
            return res.status(200).json({message: `Item deletion successful.`, data: entryInDb});
        });
    }
};