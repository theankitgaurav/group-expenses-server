'use strict';
var Sequelize = require('sequelize');
const Group = require('./Group');

module.exports = (sequelize, DataTypes) => {
  var Expense = sequelize.define('Expense', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    category: Sequelize.STRING,
    amount: Sequelize.BIGINT,
    details: Sequelize.STRING,
    groupId: {
      type: Sequelize.INTEGER,
      references: { model: 'Groups', key: 'id' }
    },
    paidBy: {
      type: Sequelize.INTEGER,
      references: { model: 'Users', key: 'id' }
    },
    enteredBy:  {
      type: Sequelize.INTEGER,
      references: { model: 'Users', key: 'id' }
    },
    paidOn: Sequelize.DATE,
    status: {type: Sequelize.STRING, defaultValue: "NORMAL"}
  }, {});

  Expense.associate = function(models) {
    Expense.belongsTo(models.Group);
  };
  
  return Expense;
};