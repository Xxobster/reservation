const db = require("../db/models");
const { QueryTypes } = db.sequelize;   // ✅ REQUIRED
const Table = db.table;
const Reservation = db.reservation;

const findAllTables = async (filterDate = null, filterTime = null) => {
  // Use provided date/time or default to now
  const now = new Date();
  const targetDate = filterDate || now.toISOString().split('T')[0];
  const targetTime = filterTime || now.toTimeString().split(' ')[0].substring(0, 5);

  // Get all tables with bookedSeats (seated) and reservedSeats (any reservation) for the slot
  const targetTimeNorm = targetTime.length === 5 ? targetTime + ":00" : targetTime;
  const tables = await db.sequelize.query(
    `
    SELECT t.*,
           COALESCE(
             (SELECT SUM(r.people)
              FROM Reservations r
              WHERE r.tableId = t.id
                AND r.resStatus = 'seated'
                AND r.resDate = :targetDate
                AND TIME(r.resTime) <= TIME(:targetTimeNorm)
                AND ADDTIME(TIME(r.resTime), SEC_TO_TIME(r.durationMin * 60)) > TIME(:targetTimeNorm)
             ), 0
           ) AS bookedSeats,
           COALESCE(
             (SELECT SUM(r.people)
              FROM Reservations r
              WHERE r.tableId = t.id
                AND r.resStatus != 'missed'
                AND r.resDate = :targetDate
                AND TIME(r.resTime) <= TIME(:targetTimeNorm)
                AND ADDTIME(TIME(r.resTime), SEC_TO_TIME(r.durationMin * 60)) > TIME(:targetTimeNorm)
             ), 0
           ) AS reservedSeats
    FROM Tables t
    WHERE t.name NOT LIKE '%Damien burlot%'
    ORDER BY t.name ASC
    `,
    {
      replacements: {
        targetDate,
        targetTimeNorm,
      },
      type: QueryTypes.SELECT,
    }
  );

  return tables;
};

const createTable = async ({ name, capacity }) => {
  return await Table.create({
    name: name,
    capacity: capacity,
  });
};

const findTableById = async (id) => {
  return await Table.findOne({
    where: {
      id: id,
    },
  });
};

const updateTable = async (table, payload) => {
  return await table.update(payload);
};

const freeTable = async (reservationDAO, table) => {
  const reservationId = table.reservationId;

  await updateTable(table, {
    isOccupied: false,
    reservationId: null,
  });

  if (reservationId) {
    const reservation = await reservationDAO.findReservationById(reservationId);
    if (reservation) {
      await reservationDAO.setReservationStatus(reservation, "missed");
    }
  }
};


const findAvailableTable = async ({
  resDate,
  resTime,
  durationMin,
  people,
  table_type_req,
  seating_type_req,
}) => {
  // For RACLETTE tables: use shared seating logic
  if (table_type_req === "raclette") {
    return await findAvailableRacletteTable({
      resDate,
      resTime,
      durationMin,
      people,
    });
  }

  // STANDARD (private) tables: exclusive use — no overlapping reservations on the same table.
  // If e.g. T2 has 1 person at 4pm (90 min), next availability for T2 is 5:30pm (start + duration).
  // For Standard + Chairs: include T7 (bookable as standard or raclette), priority T1 → T8 → T7
  const isStandardChairs = table_type_req === "standard" && seating_type_req === "chairs";
  const tableCondition = isStandardChairs
    ? `(t.table_type = 'standard' OR t.name LIKE '%Table 7%') AND t.seating_type = 'chairs'`
    : `t.table_type = :table_type AND t.seating_type = :seating_type`;

  const orderClause = isStandardChairs
    ? `ORDER BY CASE WHEN t.name LIKE '%Table 1%' THEN 1 WHEN t.name LIKE '%Table 8%' THEN 2 WHEN t.name LIKE '%Table 7%' THEN 3 ELSE 4 END, t.capacity ASC, t.id ASC`
    : `ORDER BY t.capacity ASC, t.id ASC`;

  const resTimeNorm = (resTime && resTime.length === 5) ? resTime + ":00" : resTime;
  const replacements = {
    resDate,
    resTime: resTimeNorm,
    duration: durationMin,
    people,
    table_type: table_type_req,
    seating_type: seating_type_req,
  };

  const results = await db.sequelize.query(
    `
    SELECT t.*
    FROM Tables t
    WHERE ${tableCondition}
      AND t.capacity >= :people
      AND t.name NOT LIKE '%Damien burlot%'
      AND NOT EXISTS (
        SELECT 1
        FROM Reservations r
        WHERE r.tableId = t.id
          AND r.resStatus != 'missed'
          AND TIMESTAMP(r.resDate, r.resTime)
              < DATE_ADD(TIMESTAMP(:resDate, :resTime), INTERVAL :duration MINUTE)
          AND DATE_ADD(TIMESTAMP(r.resDate, r.resTime), INTERVAL r.durationMin MINUTE)
              > TIMESTAMP(:resDate, :resTime)
      )
    ${orderClause}
    LIMIT 1
    `,
    {
      replacements,
      type: QueryTypes.SELECT,
    }
  );

  return results.length ? results[0] : null;
};

// Raclette tables (T5, T6, T7): shared by SEATS. Time reservation is per seat.
// bookedSeats = sum of people from reservations that OVERLAP the requested window.
// First table in order T5 → T6 → T7 with (capacity - bookedSeats) >= people is assigned.
// E.g. 4p at 6pm and 2p at 7pm on T5 (120 min): at 8pm the 4 seats free → next 4p at 8pm;
// at 9pm the 2 seats free → next 2p at 9pm.
const findAvailableRacletteTable = async ({
  resDate,
  resTime,
  durationMin,
  people,
}) => {
  const resTimeNorm = (resTime && resTime.length === 5) ? resTime + ":00" : resTime;
  const racletteTables = await db.sequelize.query(
    `
    SELECT t.*,
           COALESCE(
             (SELECT SUM(r.people)
              FROM Reservations r
              WHERE r.tableId = t.id
                AND r.resStatus != 'missed'
                AND TIMESTAMP(r.resDate, r.resTime)
                    < DATE_ADD(TIMESTAMP(:resDate, :resTime), INTERVAL :duration MINUTE)
                AND DATE_ADD(TIMESTAMP(r.resDate, r.resTime), INTERVAL r.durationMin MINUTE)
                    > TIMESTAMP(:resDate, :resTime)
             ), 0
           ) AS bookedSeats
    FROM Tables t
    WHERE t.table_type = 'raclette'
      AND (t.name LIKE '%Table 5%' OR t.name LIKE '%Table 6%' OR t.name LIKE '%Table 7%')
    ORDER BY 
      CASE 
        WHEN t.name LIKE '%Table 5%' THEN 1
        WHEN t.name LIKE '%Table 6%' THEN 2
        WHEN t.name LIKE '%Table 7%' THEN 3
        ELSE 4
      END
    `,
    {
      replacements: {
        resDate,
        resTime: resTimeNorm,
        duration: durationMin,
      },
      type: QueryTypes.SELECT,
    }
  );

  for (const table of racletteTables) {
    const availableSeats = table.capacity - table.bookedSeats;
    if (availableSeats >= people) {
      return table;
    }
  }

  return null;
};

module.exports = {
  findAllTables,
  createTable,
  findTableById,
  updateTable,
  freeTable,
  findAvailableTable,
};



