const db = require("../db/models");
const { QueryTypes } = db.sequelize;   // ✅ REQUIRED
const Table = db.table;
const Reservation = db.reservation;

const findAllTables = async (filterDate = null, filterTime = null) => {
  // Use provided date/time or default to now
  const now = new Date();
  const targetDate = filterDate || now.toISOString().split('T')[0];
  const targetTime = filterTime || now.toTimeString().split(' ')[0].substring(0, 5);

  // Get all tables with their booked seats count for the specified date/time slot
  // Checks for overlapping reservations based on their duration
  const tables = await db.sequelize.query(
    `
    SELECT t.*,
           COALESCE(
             (SELECT SUM(r.people)
              FROM Reservations r
              WHERE r.tableId = t.id
                AND r.resStatus = 'seated'
                AND r.resDate = :targetDate
                AND TIME(r.resTime) <= TIME(:targetTime)
                AND ADDTIME(TIME(r.resTime), SEC_TO_TIME(r.durationMin * 60)) > TIME(:targetTime)
             ), 0
           ) AS bookedSeats
    FROM Tables t
    ORDER BY t.name ASC
    `,
    {
      replacements: {
        targetDate,
        targetTime,
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

  // For STANDARD tables: use exclusive booking logic
  const results = await db.sequelize.query(
    `
    SELECT t.*
    FROM Tables t
    WHERE t.table_type = :table_type
      AND t.seating_type = :seating_type
      AND t.capacity >= :people
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
    ORDER BY t.capacity ASC, t.id ASC
    LIMIT 1
    `,
    {
      replacements: {
        resDate,
        resTime,
        duration: durationMin,
        people,
        table_type: table_type_req,
        seating_type: seating_type_req,
      },
      type: QueryTypes.SELECT,
    }
  );

  return results.length ? results[0] : null;
};

// Find available raclette table with shared seating
// Priority: Table 5 → Table 6 → Table 7 → Tables 2+3 combined
const findAvailableRacletteTable = async ({
  resDate,
  resTime,
  durationMin,
  people,
}) => {
  // Get raclette tables ordered by priority (name contains 5, 6, 7)
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
        resTime,
        duration: durationMin,
      },
      type: QueryTypes.SELECT,
    }
  );

  // Find first table with enough available seats
  for (const table of racletteTables) {
    const availableSeats = table.capacity - table.bookedSeats;
    if (availableSeats >= people) {
      return table;
    }
  }

  // Fallback: Check if Tables 2+3 combined can accommodate (floor seating only)
  const fallbackResult = await findCombinedFloorTables({
    resDate,
    resTime,
    durationMin,
    people,
  });

  return fallbackResult;
};

// Find combined Tables 2+3 for raclette overflow
const findCombinedFloorTables = async ({
  resDate,
  resTime,
  durationMin,
  people,
}) => {
  // Check available seats on Tables 2 and 3 combined
  const floorTables = await db.sequelize.query(
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
    WHERE (t.name LIKE '%Table 2%' OR t.name LIKE '%Table 3%')
      AND t.seating_type = 'floor'
    ORDER BY t.name ASC
    `,
    {
      replacements: {
        resDate,
        resTime,
        duration: durationMin,
      },
      type: QueryTypes.SELECT,
    }
  );

  if (floorTables.length < 2) return null;

  // Calculate total available seats across Tables 2 and 3
  let totalAvailable = 0;
  const tableSeats = [];

  for (const table of floorTables) {
    const availableSeats = table.capacity - parseInt(table.bookedSeats);
    totalAvailable += availableSeats;
    tableSeats.push({
      table,
      availableSeats,
    });
  }

  // If combined tables have enough seats
  if (totalAvailable >= people) {
    // Check if single table can accommodate
    for (const { table, availableSeats } of tableSeats) {
      if (availableSeats >= people) {
        return {
          ...table,
          table_type: 'raclette',
          is_combined_floor: true,
        };
      }
    }
    
    // Need to split across both tables - return both tables with allocation info
    let remainingPeople = people;
    const allocations = [];
    
    for (const { table, availableSeats } of tableSeats) {
      if (remainingPeople <= 0) break;
      if (availableSeats <= 0) continue;
      
      const seatsToBook = Math.min(availableSeats, remainingPeople);
      allocations.push({
        table: {
          ...table,
          table_type: 'raclette',
          is_combined_floor: true,
        },
        seatsToBook,
      });
      remainingPeople -= seatsToBook;
    }
    
    // Return special object indicating split booking is needed
    if (allocations.length > 1) {
      return {
        isSplitBooking: true,
        allocations,
        table_type: 'raclette',
        seating_type: 'floor',
      };
    } else if (allocations.length === 1) {
      return allocations[0].table;
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



