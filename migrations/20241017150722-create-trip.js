'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Trips', {
      tripID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      driverID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Drivers',
          key: 'driverID',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      riderID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Riders',
          key: 'riderID',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Ongoing', 'Completed', 'Canceled'),
        defaultValue: 'Pending',
      },
      source: Sequelize.GEOMETRY('POINT'),
      destination: Sequelize.GEOMETRY('POINT'),
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Trips');
  },
};