'use strict';
module.exports = (sequelize, DataTypes) => {
  var Group = sequelize.define('Group', {
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    status: DataTypes.STRING
  }, {});
  Group.associate = function(models) {
    // associations can be defined here
  };
  return Group;
};