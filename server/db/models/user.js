'use strict';
const bcrypt = require('bcrypt');


function hashPassword(plainTextPassword) {
  return new Promise(function (resolve, reject) {
    const saltRounds = 10;
    bcrypt.hash(plainTextPassword, saltRounds)
      .then(function (hash) { resolve(hash); })
      .catch((err)=>{ reject(err); });
  })
}

module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    status: {type: DataTypes.STRING, defaultValue: 'active'}
  }, {});
  User.associate = function (models) {
    // associations can be defined here
  };
  // Hash password before saving user into db
  User.beforeCreate((user, options) => {
    return hashPassword(user.password)
    .then(hashedPw => { user.password = hashedPw; });
  });
  return User;
};