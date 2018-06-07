const createError = require('http-errors');
const utils = require('../utils/utils');
const db = require('../db/models/index');
const User = require('../db/models').User;
const Group = require('../db/models').Group;

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
    }
}