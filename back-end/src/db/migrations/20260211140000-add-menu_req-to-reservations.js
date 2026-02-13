"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Reservations", "menu_req", {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "fondue",
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("Reservations", "menu_req");
  },
};
