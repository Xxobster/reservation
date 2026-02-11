"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Deliveries", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      guesthouse: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      roomNumber: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      feeGuesthouseLAK: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      lat: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      lng: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      customerName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      customerPhone: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Deliveries");
  },
};
