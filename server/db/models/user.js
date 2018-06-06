'use strict';
const hashPassword = require('../../utils/utils').hashPassword;

module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    status: {type: DataTypes.STRING, defaultValue: 'active'}
  }, {});

  // Establish many-to-many relationship between user and group
  User.associate = function (models) {
    User.belongsToMany(models.Group, {through: 'UserVsGroup', foreignKey: "userId", otherKey: "groupId"});
  };

  // Hash password before saving user into db
  User.beforeCreate((user, options) => {
    return hashPassword(user.password)
    .then(hashedPw => { user.password = hashedPw; });
  });
  
  return User;
};