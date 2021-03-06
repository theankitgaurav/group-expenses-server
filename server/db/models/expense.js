'use strict';
var Sequelize = require('sequelize');

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
    group: {
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
    Expense.belongsTo(models.Group, {
      foreignKey: 'group', targetKey: 'id'
    });
  };
  
  return Expense;
};