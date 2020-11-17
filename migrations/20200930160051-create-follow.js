'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('follows', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      block: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0
      },
      id: {
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      friendId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('follows');
  }
};