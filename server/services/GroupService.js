const createError = require('http-errors');
const utils = require('../utils/utils');
const db = require('../db/models/index');
const User = require('../db/models').User;
const Group = require('../db/models').Group;

function validateGroupFormData (requestObj) {
    const groupBody = requestObj.body;
    return new Promise ((resolve, reject)=>{
        if (!groupBody.name || groupBody.name.trim() == '') {
            return reject (createError(403, "Group name can't be empty"))
        };
        let groupObj = {}
        groupObj.name = groupBody.name;
        groupObj.ownerId = requestObj.userId;
        return resolve(groupObj);
    })
}

module.exports = {
    async isUserMemberOfGroup (user, groupId) {
        return new Promise((resolve, reject)=>{
            user.getGroups({where: {id: groupId}})
            .then(association=>{
                return resolve(association !== null); // return true or false based on whether association exists or not
            })
            .catch(err=>{
                console.error('Error fetching user vs group map: ', err);
                return reject(err);
            });
        });
    },
    async isOwner (groupId, userId) {
        Group.findOne({where: {id: groupId}})
        .then((group)=>{
            if (!group) return reject(createError(404, `Group doesn't exist with id: ${groupId}`));
            if (group.ownerId !== userId) return reject(createError(403, `User is not an owner of group with id: ${groupId}`));
            return resolve(group);
        })
    },
    async getGroupsWithFilters(userId, groupId, ...args) {
        let userFilter = {status: "active"};
        let groupFilter = {status: "active"};
        if (!!userId) userFilter.id = userId;
        if (!!groupId) groupFilter.id = groupId;

        return new Promise((resolve, reject)=>{
            User.find({where: userFilter})
            .then((user)=>{
                return user.getGroups({where: groupFilter})
                .then(groups => resolve(groups))
                .catch(error=> reject(error));
            })
            .catch(err => reject(err));
        });
    },
    async getGroupsByUserId (userId) {
        return this.getGroupsWithFilters(userId);
    },
    async getGroupByUserIdAndGroupId (userId, groupId) {
        return new Promise((resolve, reject)=>{
            this.getGroupsWithFilters(userId, groupId)
            .then((groups)=>{
                console.log(`${groups.length} group found for group with id ${groupId} for user with id ${userId}`);
                return resolve(groups[0]);
            })
            .catch((err)=>{
                console.log(`Error fetching group with id ${groupId} for user with id ${userId}`);
                return reject(err);
            })
        })
    },
    createGroup (req) {
        return new Promise((resolve, reject) => {
            validateGroupFormData(req)
            .then(groupInput=>groupInput)
            .catch((err)=>{
                console.error("Invalid group creation form data: ", err);
                reject(err)})
            .then((groupInput)=>{
                // FIXME: Add transaction for creating group and adding to userVsGroupMap
                Group.create(groupInput)
                .then((createdGroup)=> {
                    req.user.addGroup(createdGroup)
                    .then((userGroupMap)=>{
                        return resolve(createdGroup);
                    })
                    .catch((err)=>{
                        console.error("User vs group map failed, ", err);
                        return reject(err);
                    })
                    .catch(err=>{
                        console.error("Error creating group: ", err);
                        reject(err)
                    });                
                })
            });
        });
    }
}