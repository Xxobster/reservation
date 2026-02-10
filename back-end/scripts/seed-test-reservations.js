/**
 * Seed test reservations for 2pm: 6p Raclette T5, 6p Raclette T6, 2p Standard T1, 4p Standard T4, 3p Standard T7.
 * Uses random names and phones. Table logic is NOT applied here (we assign tableId manually).
 * Run from back-end: node scripts/seed-test-reservations.js
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const db = require("../src/db/models");
const reservationDAO = require("../src/DAOs/reservation.dao");
const tableDAO = require("../src/DAOs/table.dao");

const FIRST_NAMES = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason",
  "Isabella", "William", "Mia", "James", "Charlotte", "Benjamin", "Amelia",
];
const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Wilson", "Anderson", "Taylor", "Thomas",
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomPhone() {
  return "41" + String(Math.floor(100000000 + Math.random() * 899999999));
}
function randomCustomer() {
  const first = randomItem(FIRST_NAMES);
  const last = randomItem(LAST_NAMES);
  const phone = randomPhone();
  const email = `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(Math.random() * 100)}@test.com`;
  return { firstName: first, lastName: last, phone, email };
}

async function findTableIdByName(sequelize, namePattern) {
  const rows = await sequelize.query(
    "SELECT id FROM `Tables` WHERE name LIKE :pattern LIMIT 1",
    { replacements: { pattern: namePattern }, type: db.sequelize.QueryTypes.SELECT }
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  return row ? row.id : null;
}

async function run() {
  const resDate = "2026-02-15";
  const resTime = "14:00:00"; // 2pm
  const racletteDuration = 120;
  const standardDuration = 90;

  const t5 = await findTableIdByName(db.sequelize, "%Table 5%");
  const t6 = await findTableIdByName(db.sequelize, "%Table 6%");
  const t1 = await findTableIdByName(db.sequelize, "%Table 1%");
  const t4 = await findTableIdByName(db.sequelize, "%Table 4%");
  const t7 = await findTableIdByName(db.sequelize, "%Table 7%");

  const missing = [];
  if (!t5) missing.push("Table 5");
  if (!t6) missing.push("Table 6");
  if (!t1) missing.push("Table 1");
  if (!t4) missing.push("Table 4");
  if (!t7) missing.push("Table 7");
  if (missing.length) {
    console.error("Missing tables:", missing.join(", "));
    process.exit(1);
  }

  const bookings = [
    { people: 6, tableId: t5, table_type_req: "raclette", seating_type_req: "chairs", durationMin: racletteDuration },
    { people: 6, tableId: t6, table_type_req: "raclette", seating_type_req: "chairs", durationMin: racletteDuration },
    { people: 2, tableId: t1, table_type_req: "standard", seating_type_req: "chairs", durationMin: standardDuration },
    { people: 4, tableId: t4, table_type_req: "standard", seating_type_req: "chairs", durationMin: standardDuration },
    { people: 3, tableId: t7, table_type_req: "standard", seating_type_req: "chairs", durationMin: standardDuration },
  ];

  for (const b of bookings) {
    const customer = randomCustomer();
    const res = await reservationDAO.createReservation({
      resDate,
      resTime,
      people: b.people,
      tableId: b.tableId,
      durationMin: b.durationMin,
      table_type_req: b.table_type_req,
      is_private_req: true,
      seating_type_req: b.seating_type_req,
      ...customer,
    });
    await reservationDAO.setReservationTable(res.id, b.tableId);
    console.log(`Created: ${b.people}p ${b.table_type_req} → table id ${b.tableId} (${customer.firstName} ${customer.lastName}, ${customer.phone})`);
  }

  console.log("Done. 5 test reservations created for 2pm on", resDate);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
