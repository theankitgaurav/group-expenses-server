'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    // Returns a promise to correctly handle asynchronicity.
    return queryInterface.addConstraint('Groups', ['ownerId'], {
      type: 'foreign key',
      name: 'FKConstraint_Group_OwnerId_With_User',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: (queryInterface, Sequelize) => {
    // Adds reverting commands here.
    // Returns a promise to correctly handle asynchronicity.
    return queryInterface.removeConstraint('Groups', 'FKConstraint_Group_OwnerId_With_User', {});
  }
};
