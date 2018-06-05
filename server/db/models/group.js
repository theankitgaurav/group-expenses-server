'use strict';
const db = require('../models/index');
const User = require('./User')

console.log('Sequelize: ', db)
module.exports = (sequelize, DataTypes) => {
  var Group = sequelize.define('Group', {
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    ownerId: {
      type: DataTypes.INTEGER,
      references: { model: User, key: 'id', deferrable: db.Sequelize.Deferrable.INITIALLY_IMMEDIATE}
    },
    isPrivate: {type: DataTypes.BOOLEAN, defaultValue: true},
    status: {type: DataTypes.STRING, defaultValue: 'active'}
  }, {});
  Group.associate = function(models) {
    Group.belongsToMany(models.User, {through: 'UserVsGroup'});
  };
  
  return Group;
};