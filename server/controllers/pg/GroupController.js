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
    },
    async getGroupById (req, res, next) {
        const userId = req.query.userId;
        const groupId = req.params.groupId;

        if (!userId || !groupId) {
            console.error("Incorrect request for userId: " + userId + " groupId: " + groupId);
            return next(createError(403, "Incorrect request"));
        }
        GroupService.getGroupByUserIdAndGroupId(userId, groupId)
        .then((group)=>{
            if (!group) {
                console.error("Zero matching group vs user");
                return next(createError(403, "No matching group vs user"));
            }
            return res.status(200).json({
                "message": `Group ${groupId} fetched`,
                "data": group
            })
        })
        .catch((err)=>{
            console.error("Error fetching group by userId and groupId", err);
            return next(err);
        })
    }
};

