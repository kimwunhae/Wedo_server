'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('todos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      body: {
        type: Sequelize.TEXT
      },
      filepath: {
        type: Sequelize.STRING
      },
      isclear: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0
      },
      user_id: {
        // allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model : 'users',
          key: 'id'
        }
      },
      share_id: {
        // allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model : 'users',
          key: 'id'
        }
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
    await queryInterface.dropTable('todos');
  }
};