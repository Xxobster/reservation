const db = require("../db/models");
const { QueryTypes } = db.sequelize;   // ✅ REQUIRED
const Table = db.table;
const Reservation = db.reservation;

const findAllTables = async () => {
  return await Table.findAll({
    include: [
      {
        model: Reservation,
      },
    ],
  });
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
  is_private_req,
}) => {
  const results = await db.sequelize.query(
    `
    SELECT t.*
    FROM Tables t
    WHERE t.table_type = :table_type
      AND t.is_private = :is_private
      AND t.capacity >= :people
      AND NOT EXISTS (
        SELECT 1
        FROM Reservations r
        WHERE r.tableId = t.id
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
        is_private: is_private_req,
      },
      type: QueryTypes.SELECT,
    }
  );

  return results.length ? results[0] : null;
};

module.exports = {
  findAllTables,
  createTable,
  findTableById,
  freeTable,
  findAvailableTable,
};



