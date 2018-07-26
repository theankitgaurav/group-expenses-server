'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addConstraint('Users', ['email'], {
      type: 'unique',
      name: 'email_unique_constraint'
    });
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeConstraint('Users', 'email_unique_constraint');
  }
};
