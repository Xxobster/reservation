"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect === "mysql") {
      await queryInterface.sequelize.query(
        "ALTER TABLE Reservations MODIFY COLUMN menu_req VARCHAR(255) NOT NULL DEFAULT 'fondue'"
      );
    } else {
      await queryInterface.changeColumn("Reservations", "menu_req", {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: "fondue",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Reservations", "menu_req", {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "fondue",
    });
  },
};
