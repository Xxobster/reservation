const dateTimeValidator = require("../utils/dateAndTimeValidator");
const { readSettings } = require("../utils/settingsReader");

/* =========================
   READ
========================= */

const getAllReservations = async (reservationDAO, tableDAO) => {
  const reservations = await reservationDAO.findAllReservations();

  for (const reservation of reservations) {
    if (reservation.tableId) {
      const table = await tableDAO.findTableById(reservation.tableId);

      if (table) {
        // Extract base table name (without the capacity part)
        const baseName = table.name.replace(/\s*\(\d+\)\s*$/, '');
        // Show with number of people booked, not table capacity
        reservation.tableNumber = `${baseName} (${reservation.people})`;
        // Use the reservation's requested table type (for flexible tables like 2-3 used for raclette)
        reservation.tableType = reservation.table_type_req || table.table_type;
        reservation.seatingType = table.seating_type;
      } else {
        reservation.tableNumber = "—";
        reservation.tableType = "—";
        reservation.seatingType = "—";
      }
    } else {
      reservation.tableNumber = "—";
      reservation.tableType = "—";
      reservation.seatingType = "—";
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
  // Normalize HH:MM to HH:MM:00 so "11:00" is not treated as before "11:00:00"
  const t = (resTime && resTime.length === 5) ? resTime + ":00" : resTime;
  if (t > "21:00:00") {
    throw {
      status: 400,
      message: "Reservations cannot be made after 9:00 PM",
    };
  } else if (t < "11:00:00") {
    throw {
      status: 400,
      message: "Reservations cannot be made before 11:00 AM",
    };
  }
};

const checkTimeInterval = (resTime) => {
  // Time must be in 30-minute intervals (XX:00 or XX:30)
  const minutes = resTime.split(':')[1]?.substring(0, 2);
  if (minutes !== '00' && minutes !== '30') {
    throw {
      status: 400,
      message: "Reservations can only be made at 30-minute intervals (e.g., 11:00, 11:30, 12:00)",
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

const checkPartySize = (people) => {
  if (parseInt(people) > 6) {
    throw {
      status: 400,
      message: "⚠️ RESERVATION NOT CONFIRMED\n\nFor reservations of more than 6 people, please contact the owner through WhatsApp on +41 79 391 75 77.",
      isLargeParty: true,
    };
  }
};

/* =========================
   AVAILABILITY HELPERS
========================= */

// Find next available time slot for a given configuration
const findNextAvailableTime = async (tableDAO, params) => {
  const { resDate, resTime, durationMin, people, table_type_req, seating_type_req } = params;
  const timeSlots = [
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30", "21:00"
  ];
  
  // Find slots after the requested time
  const startIndex = timeSlots.indexOf(resTime.substring(0, 5));
  
  for (let i = startIndex + 1; i < timeSlots.length; i++) {
    const slot = timeSlots[i];
    const table = await tableDAO.findAvailableTable({
      resDate,
      resTime: slot,
      durationMin,
      people,
      table_type_req,
      seating_type_req,
    });
    
    if (table && !table.isSplitBooking) {
      return slot;
    }
    if (table && table.isSplitBooking && table.allocations) {
      return slot;
    }
  }
  
  return null;
};

// Check what alternatives are available
const checkAlternatives = async (tableDAO, params) => {
  const { resDate, resTime, durationMin, people, table_type_req, seating_type_req } = params;
  const alternatives = {
    hasFloorSeats: false,
    hasChairSeats: false,
    hasRaclette: false,
    hasStandard: false,
    nextAvailableTime: null,
  };
  
  // Check if floor seats are available for the requested type
  if (seating_type_req === 'chairs') {
    const floorTable = await tableDAO.findAvailableTable({
      resDate,
      resTime,
      durationMin,
      people,
      table_type_req,
      seating_type_req: 'floor',
    });
    alternatives.hasFloorSeats = !!floorTable;
  }
  
  // Check if chair seats are available for the requested type
  if (seating_type_req === 'floor') {
    const chairTable = await tableDAO.findAvailableTable({
      resDate,
      resTime,
      durationMin,
      people,
      table_type_req,
      seating_type_req: 'chairs',
    });
    alternatives.hasChairSeats = !!chairTable;
  }
  
  // Check if other table type is available (use durations from params if passed from registerReservation)
  const durationStandard = params.durationStandardMin ?? 60;
  const durationRaclette = params.durationRacletteMin ?? 120;
  if (table_type_req === 'raclette') {
    const standardTable = await tableDAO.findAvailableTable({
      resDate,
      resTime,
      durationMin: durationStandard,
      people,
      table_type_req: 'standard',
      seating_type_req: 'chairs',
    });
    alternatives.hasStandard = !!standardTable;
  } else {
    const racletteTable = await tableDAO.findAvailableTable({
      resDate,
      resTime,
      durationMin: durationRaclette,
      people,
      table_type_req: 'raclette',
      seating_type_req: 'chairs',
    });
    alternatives.hasRaclette = !!racletteTable;
  }
  
  // Find next available time for the exact requested configuration
  alternatives.nextAvailableTime = await findNextAvailableTime(tableDAO, params);
  
  return alternatives;
};

// Build error message based on what's unavailable
const buildUnavailableMessage = (alternatives, tableType, seatingType) => {
  let message = "❌ RESERVATION NOT POSSIBLE\n\n";
  
  // Check for alternative seating
  if (seatingType === 'chairs' && alternatives.hasFloorSeats) {
    message += `No chair seats available for ${tableType} at this time.\n`;
    message += "✓ Floor seats (on cushions) ARE available.\n\n";
  } else if (seatingType === 'floor' && alternatives.hasChairSeats) {
    message += `No floor seats available for ${tableType} at this time.\n`;
    message += "✓ Chair seats ARE available.\n\n";
  }
  
  // Check for alternative table type
  if (tableType === 'raclette' && !alternatives.hasFloorSeats && alternatives.hasStandard) {
    message += "No raclette seats available at this time.\n";
    message += "✓ Standard tables ARE available.\n\n";
  } else if (tableType === 'standard' && !alternatives.hasChairSeats && !alternatives.hasFloorSeats && alternatives.hasRaclette) {
    message += "No standard tables available at this time.\n";
    message += "✓ Raclette tables ARE available.\n\n";
  }
  
  // Suggest next available time
  if (alternatives.nextAvailableTime) {
    const hour = parseInt(alternatives.nextAvailableTime.split(':')[0]);
    const min = alternatives.nextAvailableTime.split(':')[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    message += `Next available time for your choice: ${displayHour}:${min} ${ampm}`;
  } else {
    message += "No availability for your configuration today.\n";
    message += "Please try a different date or contact us via WhatsApp: +41 79 391 75 77";
  }
  
  return message;
};

/* =========================
   CREATE + AUTO ASSIGN
========================= */

const registerReservation = async (reservationDAO, payload, tableDAO) => {
  isFieldEmpty(payload);
  checkPartySize(payload.people);
  checkTimeInterval(payload.resTime);
  validateTime(new Date(), payload.resDate, payload.resTime);
  checkClosingOpeningTime(payload.resTime);

  // Check for duplicate customer on the same day
  const existingReservation = await reservationDAO.findExistingReservationByCustomer(
    payload.firstName,
    payload.lastName,
    payload.phone,
    payload.resDate
  );

  if (existingReservation) {
    throw {
      status: 400,
      message: "A reservation has already been placed for you. If you want to modify or cancel it, please contact the owner through WhatsApp on +41 79 391 75 77.",
    };
  }

  // Set duration from settings: Raclette and Standard durations (minutes)
  const settings = readSettings();
  const durationRacletteMin = settings.reservationDurationRacletteMin ?? 120;
  const durationStandardMin = settings.reservationDurationStandardMin ?? 60;
  const tableType = payload.table_type_req || "standard";
  const durationMin = tableType === "raclette" ? durationRacletteMin : durationStandardMin;
  payload.durationMin = durationMin;
  const seatingType = payload.seating_type_req || "chairs";

  // 1️⃣ CHECK AVAILABILITY FIRST - Don't create reservation if no table available
  const tableResult = await tableDAO.findAvailableTable({
    resDate: payload.resDate,
    resTime: payload.resTime,
    durationMin: durationMin,
    people: payload.people,
    table_type_req: tableType,
    seating_type_req: seatingType,
  });

  // If no table available, check alternatives and throw error
  if (!tableResult) {
    const alternatives = await checkAlternatives(tableDAO, {
      resDate: payload.resDate,
      resTime: payload.resTime,
      durationMin,
      durationRacletteMin,
      durationStandardMin,
      people: payload.people,
      table_type_req: tableType,
      seating_type_req: seatingType,
    });
    
    const errorMessage = buildUnavailableMessage(alternatives, tableType, seatingType);
    
    throw {
      status: 400,
      message: errorMessage,
      alternatives,
    };
  }

  // 2️⃣ Table is available - Create reservation
  let assignedTables = [];
  
  // Check if this is a split booking across multiple tables
  if (tableResult.isSplitBooking && tableResult.allocations) {
    // Create separate reservations for each table allocation
    for (const allocation of tableResult.allocations) {
      const splitPayload = {
        ...payload,
        people: allocation.seatsToBook,
        durationMin: durationMin,
      };
      
      const splitReservation = await reservationDAO.createReservation(splitPayload);
      await reservationDAO.setReservationTable(splitReservation.id, allocation.table.id);
      
      assignedTables.push({
        table: allocation.table,
        seats: allocation.seatsToBook,
      });
    }
    
    // Return combined confirmation (re-read settings for duration)
    const latestSettings = readSettings();
    const confirmDuration = tableType === "raclette"
      ? (latestSettings.reservationDurationRacletteMin ?? 120)
      : (latestSettings.reservationDurationStandardMin ?? 60);
    const tableNames = assignedTables.map(t => t.table.name).join(' + ');
    return {
      reservation: null,
      confirmation: {
        resDate: payload.resDate,
        resTime: payload.resTime,
        durationMin: Number(confirmDuration),
        people: payload.people,
        tableType: (tableType === 'raclette' ? 'raclette' : 'standard'),
        seatingType: tableResult.seating_type || 'floor',
        tableName: tableNames,
        isSplitBooking: true,
      }
    };
  } else {
    // Single table booking
    let reservation = await reservationDAO.createReservation(payload);
    
    await reservationDAO.setReservationTable(reservation.id, tableResult.id);
    reservation = await reservationDAO.findReservationById(reservation.id);

    // Re-read settings so confirmation duration always matches current admin settings
    const latestSettings = readSettings();
    const confirmDuration = tableType === "raclette"
      ? (latestSettings.reservationDurationRacletteMin ?? 120)
      : (latestSettings.reservationDurationStandardMin ?? 60);

    return {
      reservation,
      confirmation: {
        resDate: payload.resDate,
        resTime: payload.resTime,
        durationMin: Number(confirmDuration),
        people: payload.people,
        tableType: String(tableType).toLowerCase(),
        seatingType: tableResult.seating_type || seatingType,
        tableName: tableResult.name,
      }
    };
  }
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

  // Check if party size fits the table
  if (reservation.people > table.capacity) {
    throw {
      status: 400,
      message: "Reservation's party size is too big for this table!",
    };
  }

  // Free the old table if reservation was already seated elsewhere
  if (reservation.tableId && reservation.tableId !== tableId) {
    const oldTable = await tableDAO.findTableById(reservation.tableId);
    if (oldTable && oldTable.table_type !== 'raclette') {
      await tableDAO.updateTable(oldTable, {
        isOccupied: false,
        reservationId: null,
      });
    }
  }

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
