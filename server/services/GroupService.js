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
        groupObj.url = "groupurl";
        groupObj.ownerId = requestObj.userId;
        return resolve(groupObj);
    })
}

module.exports = {
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
                Group.create(groupInput)
                .then((createdGroup)=> {
                    // user.addProject(project, { through: { status: 'started' }})
                    User.findOne({where: {id: req.userId}})
                    .then((user)=>{
                        user.addGroup(createdGroup)
                        .then((result1)=>{
                            console.log("Group added to map");
                            return resolve(createdGroup)})
                        })
                        .catch((err)=>{
                            console.error("User vs group map failed, ", err);
                            return reject(err);
                        })
                    })
                    .catch((err)=>{
                        console.error("User not found with userid ", err);
                        return reject(err);
                    })

                .catch(err=>{
                    console.error("Error creating group: ", err);
                    reject(err)});
            })
        });
    }
}