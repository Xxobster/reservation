"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    const tableName = dialect === "mysql" ? "Tables" : '"Tables"';
    // Set capacity to 6 for tables 2, 3 and 4 (Standard/Private tables)
    await queryInterface.sequelize.query(`
      UPDATE ${tableName}
      SET capacity = 6
      WHERE name LIKE '%Table 2%' OR name LIKE '%Table 3%' OR name LIKE '%Table 4%'
    `);
    // Update display name (4) → (6) so Move dropdown and cards show correct capacity
    await queryInterface.sequelize.query(`
      UPDATE ${tableName}
      SET name = REPLACE(name, ' (4)', ' (6)')
      WHERE (name LIKE '%Table 2%' OR name LIKE '%Table 3%' OR name LIKE '%Table 4%')
        AND name LIKE '% (4)%'
    `);
  },

  async down(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    const tableName = dialect === "mysql" ? "Tables" : '"Tables"';
    await queryInterface.sequelize.query(`
      UPDATE ${tableName}
      SET capacity = 4
      WHERE name LIKE '%Table 2%' OR name LIKE '%Table 3%' OR name LIKE '%Table 4%'
    `);
    await queryInterface.sequelize.query(`
      UPDATE ${tableName}
      SET name = REPLACE(name, ' (6)', ' (4)')
      WHERE (name LIKE '%Table 2%' OR name LIKE '%Table 3%' OR name LIKE '%Table 4%')
        AND name LIKE '% (6)%'
    `);
  },
};
