const db = require("../db/models");
const { fn, col } = db.sequelize;
const Reservation = db.reservation;
const Customer = db.customer;
const Table = db.table;
const { flattenArrayObjects } = require("../utils/flattenObject");

const findAllReservations = async () => {
  const reservations = await Reservation.findAll({
    attributes: ["id", "resDate", "resTime", "resStatus", "people", "tableId", "table_type_req", "seating_type_req", "durationMin"],
    include: [
      {
        model: Customer,
        attributes: [
          [fn("CONCAT", col("firstName"), " ", col("lastName")), "name"],
          "email",
          "phone",
        ],
      },
    ],
  });
  return flattenArrayObjects(reservations);
};

const findReservationById = async (reservationId) => {
  const reservation = await Reservation.findOne({
    where: {
      id: reservationId,
    },
  });

  return reservation;
};

const findReservationWithCustomer = async (reservationId) => {
  const reservation = await Reservation.findOne({
    where: { id: reservationId },
    include: [{ model: Customer, attributes: ["firstName", "lastName", "email", "phone"] }],
  });
  return reservation;
};

// Check if a customer with the same name and phone already has a reservation on the same day
const findExistingReservationByCustomer = async (firstName, lastName, phone, resDate) => {
  const { QueryTypes } = db.sequelize;
  
  const results = await db.sequelize.query(
    `
    SELECT r.*, c.firstName, c.lastName, c.phone
    FROM Reservations r
    JOIN Customers c ON r.customerId = c.id
    WHERE LOWER(c.firstName) = LOWER(:firstName)
      AND LOWER(c.lastName) = LOWER(:lastName)
      AND c.phone = :phone
      AND r.resDate = :resDate
      AND r.resStatus != 'missed'
    LIMIT 1
    `,
    {
      replacements: {
        firstName,
        lastName,
        phone,
        resDate,
      },
      type: QueryTypes.SELECT,
    }
  );

  return results.length > 0 ? results[0] : null;
};

const createCustomer = async (customerDetails, t = null) => {
  return await Customer.create(
    {
      firstName: customerDetails.firstName,
      lastName: customerDetails.lastName,
      phone: customerDetails.phone,
      email: customerDetails.email,
    },
    {
      transaction: t,
    }
  );
};

const createReservation = async (resDetails) => {
  const {
    resDate,
    resTime,
    people,
    tableId,
    durationMin,
    table_type_req,
    is_private_req,
    seating_type_req,
    ...customerDetails
  } = resDetails;

  const result = await db.sequelize.transaction(async (t) => {
    const customer = await createCustomer(customerDetails, t);

    const reservation = await Reservation.create(
      {
        resDate,
        resTime,
        people,
        customerId: customer.id,
        tableId,
        durationMin,
        table_type_req,
        is_private_req,
        seating_type_req,
      },
      { transaction: t }
    );

    return reservation;
  });

  return result;
};


const updateReservation = async (reservationId, resDetails) => {
  const [result, metadata] = await Reservation.update(resDetails, {
    where: {
      id: reservationId,
    },
  });

  return result;
};

const deleteReservation = async (reservation) => {
  return await reservation.destroy();
};

const setReservationStatus = async (reservation, status) => {
  reservation.resStatus = status;
  return await reservation.save();
};

// Count people in reservations that overlap the given time window (legacy / alternative cap)
const countOverlappingPeople = async (resDate, resTime, durationMin) => {
  const { QueryTypes } = db.sequelize;
  const rows = await db.sequelize.query(
    `
    SELECT COALESCE(SUM(r.people), 0) AS total
    FROM Reservations r
    WHERE r.resStatus != 'missed'
      AND TIMESTAMP(r.resDate, r.resTime)
          < DATE_ADD(TIMESTAMP(:resDate, :resTime), INTERVAL :durationMin MINUTE)
      AND DATE_ADD(TIMESTAMP(r.resDate, r.resTime), INTERVAL r.durationMin MINUTE)
          > TIMESTAMP(:resDate, :resTime)
    `,
    {
      replacements: { resDate, resTime, durationMin },
      type: QueryTypes.SELECT,
    }
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  return row ? Number(row.total) : 0;
};

// Count people starting at the same 30-min slot (for "12 people per half hour" cap)
const countPeopleStartingAt = async (resDate, resTime) => {
  const { QueryTypes } = db.sequelize;
  const t = String(resTime || "").trim();
  const normalized = t.length === 5 ? t + ":00" : t;
  const rows = await db.sequelize.query(
    `
    SELECT COALESCE(SUM(r.people), 0) AS total
    FROM Reservations r
    WHERE r.resStatus != 'missed'
      AND r.resDate = :resDate
      AND TIME(r.resTime) = TIME(:resTime)
    `,
    {
      replacements: { resDate, resTime: normalized },
      type: QueryTypes.SELECT,
    }
  );
  const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
  return row ? Number(row.total) : 0;
};

const setReservationTable = async (reservationId, tableId) => {
  // Get the table to check if it's raclette (shared) or standard (exclusive)
  const table = await Table.findOne({ where: { id: tableId } });
  
  // Only mark table as occupied for standard (private) tables
  // Raclette tables can have multiple reservations sharing seats
  if (table && table.table_type !== 'raclette') {
    await Table.update(
      {
        isOccupied: true,
        reservationId: reservationId,
      },
      {
        where: {
          id: tableId,
        },
      }
    );
  }

  return await Reservation.update(
    {
      resStatus: "seated",
      tableId: tableId,
    },
    {
      where: {
        id: reservationId,
      },
    }
  );
};



module.exports = {
  findAllReservations,
  createReservation,
  updateReservation,
  deleteReservation,
  findReservationById,
  findReservationWithCustomer,
  findExistingReservationByCustomer,
  countOverlappingPeople,
  countPeopleStartingAt,
  setReservationTable,
  setReservationStatus,
};
