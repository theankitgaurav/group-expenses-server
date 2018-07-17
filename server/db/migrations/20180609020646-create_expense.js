'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Expenses', {
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
      status: {type: Sequelize.STRING, defaultValue: "NORMAL"},
      // Timestamps
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('Expenses');
  }
};

