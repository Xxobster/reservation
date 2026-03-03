#!/usr/bin/env node
/**
 * One-off script to list all tables in the DB (to verify e.g. Table 8 exists).
 * Run from back-end: node scripts/list-tables.js
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { Sequelize } = require("sequelize");

const config = require("../config/config.js")[process.env.NODE_ENV || "development"];
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: config.port,
  logging: false,
});

async function main() {
  try {
    const [rows] = await sequelize.query(
      `SELECT id, name, capacity, isOccupied, table_type, seating_type FROM Tables ORDER BY name ASC`
    );
    console.log("Tables in DB:", rows.length);
    rows.forEach((t) => {
      console.log(`  id=${t.id} name="${t.name}" capacity=${t.capacity} isOccupied=${t.isOccupied} type=${t.table_type || ""} seating=${t.seating_type || ""}`);
    });
    const table8 = rows.find((t) => String(t.name).includes("8"));
    if (table8) {
      console.log("\nTable 8 found:", table8);
    } else {
      console.log("\nNo table with '8' in name found.");
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();
