const createError = require('http-errors');
const utils = require('../utils/utils');
const GroupService = require('../services/GroupService');
const errors = require('../utils/errors');

// TODO: Use express-validator for validating and sanitizing user input
// TODO: Avoid sending Request object to the service layer.

module.exports = {
    async getExpenseCategoriesOfGroup(req, res, next) {
      try {
          const groupId = req.params.groupId;
          const isUserMemberOfGroup = await GroupService.isUserMemberOfGroup(req.user, groupId);
          if (!isUserMemberOfGroup) {
              throw new errors.ForbiddenError(`User not a member of group with id: ${groupId}`);
          }           
          const categories = await GroupService.getExpenseCategories(groupId);
          return res.status(200).json({
            "message": `${categories.length} categories fetched`,
            "data": categories
          });
      } catch (err) {
          return next(err);
      }
    },
    async isAuthorized (req, res, next) {
        const groupId = req.params.groupId;
        const user = req.user;

        GroupService.isUserMemberOfGroup(user, groupId)
        .then(isUserMemberOfGroup=>{
            if(!isUserMemberOfGroup) {
                return next(createError(403, 'User not member of group specified'))
            }
            return next();
        })
        .catch(err=>{
            return next(err);
        });
    },
    async isModifiable (req, res, next) {
        const userId = req.user.id;
        const groupId = req.params.groupId;
        
        GroupService.isOwner(groupId, userId)
        .then ((result)=>{
            return next();
        })
        .catch((err)=>{
            return next(err);
        })
    },
    async getGroups (req, res, next) {
        const userId = req.userId;
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
        const userId = req.userId;
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
    },
    async createGroup (req, res, next) {
        GroupService.createGroup(req)
        .then((group)=>{
            return res.status(200).json({
                "msg": `Group ${group.name} created`,
                "data": group
            })
        })
        .catch((err)=>{
            return next(err);
        })
    },
    async deleteGroupById (req, res, next) {
        // TODO: Add implementation below
    }
};

