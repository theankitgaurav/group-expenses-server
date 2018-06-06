const createError = require('http-errors');
const utils = require('../utils/utils');
const db = require('../db/models/index');
const User = require('../db/models').User;
const Group = require('../db/models').Group;

module.exports = {


    /**
     *
     *
     * @param {*} userId
     * @returns [] of Groups object
     */
    getGroupsByUserId (userId) {
        Group.find({
            include: [{
                model: User,
                where: { id: Sequelize.col('project.state') }
            }]
        })

    }
}