'use strict';
module.exports = (sequelize, DataTypes) => {
  var Group = sequelize.define('Group', {
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    ownerId: {
      type: DataTypes.INTEGER,
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