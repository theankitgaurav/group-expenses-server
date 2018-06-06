'use strict';
var Sequelize = require('sequelize');
const User = require('./User')

module.exports = (sequelize, DataTypes) => {
  var Group = sequelize.define('Group', {
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    ownerId: {
      type: DataTypes.INTEGER, // FIXME: Should be foreign key restrained
      references: {
        model: 'User',
        key: 'id'
      }
    },
    isPrivate: {type: DataTypes.BOOLEAN, defaultValue: true},
    status: {type: DataTypes.STRING, defaultValue: "active"}
  }, {});
  Group.associate = function(models) {
    Group.belongsToMany(models.User, {through: "UserVsGroup", foreignKey: "groupId", otherKey: "userId"});
  };
  
  return Group;
};