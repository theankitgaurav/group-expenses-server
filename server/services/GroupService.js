const createError = require('http-errors');
const User = require('../db/models').User;
const Group = require('../db/models').Group;
const Expense = require('../db/models').Expense;

module.exports = {
    createGroup,
    getExpenseCategories,
    getGroupMembers,
    getGroupsByUserId,
    getGroupByUserIdAndGroupId,
    getGroupsWithFilters,
    isUserMemberOfGroup,
}


async function getExpenseCategories(groupId) {
    // The line below return results as : [{category: 'Ration'}, {category: 'Water'}]
    const categoriesObjArr = await Expense.findAll({
        where: [{'group': groupId}], attributes: ['category'], group: 'category'
    });

    // Flattening as a plain array before returning as: ['Ration', 'Water']
    if (!!categoriesObjArr) {
        return categoriesObjArr.map(el=>el.category);
    }
    return [];
};

async function isUserMemberOfGroup (user, groupId) {
    return new Promise((resolve, reject)=>{
        user.getGroups({where: {id: groupId}})
        .then(association=>{
            return resolve(association.length > 0); // return true or false based on whether association exists or not
        })
        .catch(err=>{
            console.error('Error fetching user vs group map: ', err);
            return reject(err);
        });
    });
};

async function getGroupMembers (groupId) {
    const group = await Group.findOne({where: {id: groupId}});
    if (!group) throw new Error(createError(404, `Group doesn't exist with id: ${groupId}`));
    const members = await group.getUsers({where: {status: "active"}});
    console.log('Members: ', members);
    return members;
};

async function getGroupsWithFilters(userId, groupId, ...args) {
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
};

async function getGroupsByUserId (userId) {
    return this.getGroupsWithFilters(userId);
};

async function getGroupByUserIdAndGroupId (userId, groupId) {
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
};

async function createGroup (req) {
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
};

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