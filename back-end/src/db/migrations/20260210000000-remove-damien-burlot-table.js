"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect === "mysql") {
      await queryInterface.sequelize.query(`
        UPDATE Reservations r
        INNER JOIN \`Tables\` t ON r.tableId = t.id
        SET r.tableId = NULL
        WHERE t.name = 'Damien burlot'
      `);
    } else {
      const [rows] = await queryInterface.sequelize.query(
        `SELECT id FROM "Tables" WHERE name = 'Damien burlot'`
      );
      const ids = (rows || []).map((r) => r.id);
      if (ids.length) {
        await queryInterface.sequelize.query(
          `UPDATE "Reservations" SET "tableId" = NULL WHERE "tableId" IN (${ids.join(",")})`
        );
      }
    }
    await queryInterface.bulkDelete("Tables", { name: "Damien burlot" });
  },

  async down() {
    // Migration only removes data; no reversible table recreate
  },
};
