/**
 * One-off script: delete all reservations and free all tables (for fresh testing).
 * Run from back-end: node scripts/clear-reservations.js
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const db = require("../src/db/models");

async function run() {
  const { reservation, table, sequelize } = db;
  const count = await reservation.count();
  await sequelize.query("DELETE FROM Reservations");
  await sequelize.query(
    "UPDATE `Tables` SET isOccupied = 0, reservationId = NULL"
  );
  console.log(`Cleared ${count} reservation(s). All tables freed.`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
