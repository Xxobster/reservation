const dateTimeValidator = require("../utils/dateAndTimeValidator");

/* =========================
   READ
========================= */

const getAllReservations = async (reservationDAO, tableDAO) => {
  const reservations = await reservationDAO.findAllReservations();

  for (const reservation of reservations) {
    if (reservation.tableId) {
      const table = await tableDAO.findTableById(reservation.tableId);

      if (table) {
        reservation.tableLabel = `${table.name} (${table.type})`;
        reservation.tableName = table.name;
        reservation.tableType = table.type;
      } else {
        reservation.tableLabel = "—";
      }
    } else {
      reservation.tableLabel = "—";
    }
  }

  return reservations;
};


/* =========================
   VALIDATION
========================= */

const validateTime = (currDate, resDate, resTime) => {
  if (resDate === dateTimeValidator.asDateString(currDate)) {
    if (resTime < dateTimeValidator.asTimeString(currDate)) {
      throw {
        status: 400,
        message: "ERROR: Given time is in the past!",
      };
    }
  }
};

const checkClosingOpeningTime = (resTime) => {
  if (resTime > "23:00:59") {
    throw {
      status: 400,
      message:
        "Reservation must be made at least an hour before closing time (12:00 AM)",
    };
  } else if (resTime < "11:00:59") {
    throw {
      status: 400,
      message: "You can't make reservation before opening time! (11:00 AM)",
    };
  }
};

const isFieldEmpty = (payload) => {
  if (
    !payload.resDate ||
    !payload.resTime ||
    !payload.people ||
    (!payload.customerId &&
      (!payload.firstName ||
        !payload.lastName ||
        !payload.phone ||
        !payload.email))
  ) {
    throw {
      status: 400,
      message: "Please fill in all required fields!",
    };
  }
};

/* =========================
   CREATE + AUTO ASSIGN
========================= */

const registerReservation = async (reservationDAO, payload, tableDAO) => {
  isFieldEmpty(payload);
  validateTime(new Date(), payload.resDate, payload.resTime);
  checkClosingOpeningTime(payload.resTime);

  // 1️⃣ Create reservation FIRST
  let reservation = await reservationDAO.createReservation(payload);

  // 2️⃣ AUTO ASSIGN TABLE if not provided
  if (payload.tableId === undefined || payload.tableId === null) {
    const table = await tableDAO.findAvailableTable({
      resDate: payload.resDate,
      resTime: payload.resTime,
      durationMin: payload.durationMin || 120,
      people: payload.people,
      table_type_req: payload.table_type_req || "standard",
      is_private_req:
        payload.is_private_req !== undefined ? payload.is_private_req : 1,
    });

    if (table) {
      await reservationDAO.setReservationTable(reservation.id, table.id);

      // reload so tableId is visible
      reservation = await reservationDAO.findReservationById(reservation.id);
    }
  }

  return reservation;
};

/* =========================
   EDIT
========================= */

const editReservation = async (reservationId, reservationDAO, payload) => {
  const reservation = await reservationDAO.findReservationById(reservationId);
  if (!reservation)
    throw {
      status: 404,
      message: "Reservation not found!",
    };

  validateTime(new Date(), payload.resDate, payload.resTime);
  checkClosingOpeningTime(payload.resTime);

  return await reservationDAO.updateReservation(reservationId, payload);
};

/* =========================
   CANCEL
========================= */

const cancelReservation = async (reservationId, reservationDAO) => {
  const reservation = await reservationDAO.findReservationById(reservationId);
  if (reservation) return await reservationDAO.deleteReservation(reservation);

  throw {
    status: 400,
    message: "Given reservation doesn't exist!",
  };
};

/* =========================
   MANUAL TABLE CHOICE
========================= */

const compareResDateToCurrDate = (resDate, currDate) => {
  return resDate > currDate ? 1 : resDate < currDate ? -1 : 0;
};

const chooseTable = async (
  reservationId,
  tableId,
  reservationDAO,
  tableDAO
) => {
  let reservation = await reservationDAO.findReservationById(reservationId);
  if (!reservation) {
    throw {
      status: 404,
      message: "Reservation not found!",
    };
  }

  const table = await tableDAO.findTableById(tableId);
  const currDate = new Date();
  const currDateStr = dateTimeValidator.asDateString(currDate);

  if (compareResDateToCurrDate(reservation.resDate, currDateStr) === 1) {
    throw {
      status: 400,
      message: "Booking a table is only available on the reservation date!",
    };
  }

  if (compareResDateToCurrDate(reservation.resDate, currDateStr) === -1) {
    await reservationDAO.setReservationStatus(reservation, "missed");
  }

  if (compareResDateToCurrDate(reservation.resDate, currDateStr) === 0) {
    const currTimePlus30minsStr = dateTimeValidator.asTimeString(
      new Date(currDate.setMinutes(currDate.getMinutes() - 2))
    );
    if (currTimePlus30minsStr > reservation?.resTime) {
      reservation = await reservationDAO.setReservationStatus(
        reservation,
        "missed"
      );
    }
  }

  if (reservation.resStatus === "seated") {
    throw {
      status: 400,
      message:
        "You've already reserved a table! Please make a new reservation.",
    };
  } else if (reservation.resStatus === "missed") {
    throw {
      status: 400,
      message:
        "You've missed the reservation date and time! Please make a new reservation.",
    };
  }

  if (table.isOccupied)
    throw {
      status: 400,
      message: "Given table is already reserved!",
    };

  if (reservation.people > table.capacity)
    throw {
      status: 400,
      message: "Reservation's party size is too big for this table!",
    };

  return await reservationDAO.setReservationTable(reservationId, tableId);
};

/* =========================
   EXPORTS
========================= */

module.exports = {
  getAllReservations,
  registerReservation,
  editReservation,
  cancelReservation,
  chooseTable,
};
