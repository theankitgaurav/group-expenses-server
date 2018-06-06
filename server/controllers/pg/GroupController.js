const createError = require('http-errors');
const utils = require('../../utils/utils');
const GroupService = require('../../services/GroupService');

module.exports = {
    async getGroups (req, res, next) {
        const userId = req.query.userId;
        if (!userId) {
            console.log("userId not provided in getGroups request");
            return next(createError(403, "Incorrect request."));
        }
        
        GroupService.getGroupsByUserId(userId)
        .then((groups)=>{
            return res.status(200).json({
                "message": `${groups.length} groups fetched`,
                "data": groups
            })
        })
        .catch((err)=>{
            console.error(err);
            return next(err);
        });
    }
};

