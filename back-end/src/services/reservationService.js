const dateTimeValidator = require("../utils/dateAndTimeValidator");
const { readSettings } = require("../utils/settingsReader");
const { sendReservationNotification } = require("../utils/emailSender");
const logger = require("../utils/logger");

/**
 * Returns milliseconds until notifyTimeStr today (server local), or null if already past (send now).
 * notifyTimeStr: "HH:MM" or "HH:MM:SS" (from settings or env NOTIFY_EMAIL_AFTER_TIME).
 */
function getMsUntilNotifyTime(notifyTimeStr) {
  const raw = (notifyTimeStr || process.env.NOTIFY_EMAIL_AFTER_TIME || "11:00").trim();
  const parts = raw.split(/[:\s]+/).map((x) => parseInt(x, 10) || 0);
  const h = parts[0] ?? 11;
  const m = parts[1] ?? 0;
  const s = parts[2] ?? 0;
  const now = new Date();
  const notifyToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, s, 0);
  if (now >= notifyToday) return null;
  return notifyToday - now;
}

/**
 * Send reservation notification now or schedule for notifyEmailAfterTime if before that time.
 * One email per reservation; multiple reservations produce multiple (scheduled) emails.
 */
function scheduleOrSendReservationNotification(details) {
  const { readSettings } = require("../utils/settingsReader");
  const notifyTime = (readSettings().notifyEmailAfterTime || "11:00").trim();
  const ms = getMsUntilNotifyTime(notifyTime);
  if (ms != null && ms > 0) {
    logger.info(`Reservation notification scheduled for ${notifyTime} (in ${Math.round(ms / 1000 / 60)} min)`);
    setTimeout(() => {
      sendReservationNotification(details).catch(() => {});
    }, ms);
  } else {
    sendReservationNotification(details).catch(() => {});
  }
}

/* =========================
   READ
========================= */

/** Display label for menu_req (for reservations list). Known values → label; empty → "?"; anything else → show as-is (free text). */
function menuLabel(menuReq, tableTypeReq) {
  const raw = (menuReq || "").trim();
  const m = raw.toLowerCase();
  if (raw === "" || m === "?") return "?";
  if (m === "raclette_fondue") return "Raclette+Fondue";
  if (m === "raclette") return "Raclette";
  if (m === "fondue") return "Fondue";
  return raw.slice(0, 120);
}

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
    reservation.menu = menuLabel(reservation.menu_req, reservation.table_type_req);
    reservation.contacted_at = reservation.contacted_at ?? null;
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

const normalizePhone = (phone) => {
  if (phone == null || typeof phone !== "string") return phone;
  return phone.replace(/[\s.\-()]/g, "");
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

const TIME_SLOTS = [
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00"
];

const MAX_PEOPLE_PER_SLOT = 12;

// Normalize time to "HH:MM" for slot index (handles "14:00", "14:00:00", or "2:00 PM")
const toSlotKey = (resTime) => {
  const s = String(resTime || "").trim();
  if (s.length >= 5 && /^\d{1,2}:\d{2}/.test(s)) {
    const [h, m] = s.split(":").map(Number);
    if (h != null && m != null) {
      const isPm = /pm/i.test(s);
      const isAm = /am/i.test(s);
      let hour = h;
      if (isPm && h < 12) hour = h + 12;
      else if (isAm && h === 12) hour = 0;
      else if (!isPm && !isAm && h < 24) hour = h; // already 24h
      return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
  }
  return s.substring(0, 5);
};

// Return the slot string exactly 30 minutes after the given "HH:MM" (within opening hours), or null if past 21:00
const add30Min = (slotKey) => {
  const [h, m] = slotKey.split(":").map(Number);
  let nextM = (m ?? 0) + 30;
  let nextH = h ?? 0;
  if (nextM >= 60) {
    nextM = 0;
    nextH += 1;
  }
  if (nextH > 21 || (nextH === 21 && nextM > 0)) return null;
  return `${String(nextH).padStart(2, "0")}:${String(nextM).padStart(2, "0")}`;
};

// Find next available time slot for a given configuration
const findNextAvailableTime = async (tableDAO, params) => {
  const { resDate, resTime, durationMin, people, table_type_req, seating_type_req } = params;
  const key = toSlotKey(resTime);
  const startIndex = TIME_SLOTS.indexOf(key);
  
  for (let i = startIndex + 1; i < TIME_SLOTS.length; i++) {
    const slot = TIME_SLOTS[i];
    const table = await tableDAO.findAvailableTable({
      resDate,
      resTime: slot,
      durationMin,
      people,
      table_type_req,
      seating_type_req,
    });
    if (table) return slot;
  }
  return null;
};

// Find next 30-min slot that has capacity (≤12 people starting at that slot). Used for cap-error message.
// Always check the slot 30 min after the requested time first (e.g. 2pm -> 2:30pm), then continue in order.
const findNextSlotWithCapacityOnly = async (reservationDAO, params) => {
  const { resDate, resTime, people } = params;
  const key = toSlotKey(resTime);
  const numPeople = Number(people) || 0;
  // First candidate: exactly 30 minutes after requested (e.g. 14:00 -> 14:30)
  const firstNext = add30Min(key);
  if (firstNext && TIME_SLOTS.includes(firstNext)) {
    const count = await reservationDAO.countPeopleStartingAt(resDate, firstNext);
    if (count + numPeople <= MAX_PEOPLE_PER_SLOT) return firstNext;
  }
  // Then scan from the slot after requested
  const startIndex = TIME_SLOTS.indexOf(key);
  for (let i = startIndex + 1; i < TIME_SLOTS.length; i++) {
    const slot = TIME_SLOTS[i];
    const peopleStartingAtSlot = await reservationDAO.countPeopleStartingAt(resDate, slot);
    if (peopleStartingAtSlot + numPeople <= MAX_PEOPLE_PER_SLOT) return slot;
  }
  return null;
};

// Find next time slot where capacity cap (12 people per start slot) and table availability are OK
const findNextSlotWithCapacity = async (reservationDAO, tableDAO, params) => {
  const { resDate, resTime, durationMin, people, table_type_req, seating_type_req } = params;
  const key = toSlotKey(resTime);
  const startIndex = TIME_SLOTS.indexOf(key);
  for (let i = startIndex + 1; i < TIME_SLOTS.length; i++) {
    const slot = TIME_SLOTS[i];
    const peopleStartingAtSlot = await reservationDAO.countPeopleStartingAt(resDate, slot);
    if (peopleStartingAtSlot + people > MAX_PEOPLE_PER_SLOT) continue;
    const table = await tableDAO.findAvailableTable({
      resDate,
      resTime: slot,
      durationMin,
      people,
      table_type_req,
      seating_type_req,
    });
    if (table) return slot;
  }
  return null;
};

function formatTimeForMessage(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

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
  if (payload.phone != null) payload.phone = normalizePhone(payload.phone);
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

  // 0️⃣ CAP: max 12 people per 30-min start slot (per half hour)
  const peopleAtThisStart = await reservationDAO.countPeopleStartingAt(
    payload.resDate,
    payload.resTime
  );
  // Ensure numeric comparison (payload.people can be string from JSON/form)
  const requestedPeople = Number(payload.people);
  if (peopleAtThisStart + requestedPeople > MAX_PEOPLE_PER_SLOT) {
    // Suggest next slot that has capacity (≤12 per half-hour), not the next slot with a free table
    const nextSlot = await findNextSlotWithCapacityOnly(reservationDAO, {
      resDate: payload.resDate,
      resTime: payload.resTime,
      people: payload.people,
    });
    const nextStr = nextSlot
      ? formatTimeForMessage(nextSlot)
      : "none for this date";
    throw {
      status: 400,
      message: `Not possible to make a reservation at this time. Maximum 12 people per half hour. Next available time is ${nextStr}.`,
    };
  }

  // 1️⃣ CHECK AVAILABILITY - Don't create reservation if no table available
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

  // 2️⃣ Table is available - Create reservation (single table only). Leave status pending until arrival.
  let reservation = await reservationDAO.createReservation(payload);
  await reservationDAO.setReservationTableIdOnly(reservation.id, tableResult.id);
  reservation = await reservationDAO.findReservationById(reservation.id);

  const latestSettings = readSettings();
  const confirmDuration = tableType === "raclette"
    ? (latestSettings.reservationDurationRacletteMin ?? 120)
    : (latestSettings.reservationDurationStandardMin ?? 60);

  // Table display: same as reservations page – base name + (number of people), not table capacity
  const tableBaseName = (tableResult.name || "").replace(/\s*\(\d+\)\s*$/, "");
  const tableDisplayName = tableBaseName ? `${tableBaseName} (${payload.people})` : tableResult.name;

  const confirmation = {
    resDate: payload.resDate,
    resTime: payload.resTime,
    durationMin: Number(confirmDuration),
    people: payload.people,
    tableType: String(tableType).toLowerCase(),
    seatingType: tableResult.seating_type || seatingType,
    tableName: tableResult.name,
  };

  scheduleOrSendReservationNotification({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    resDate: payload.resDate,
    resTime: payload.resTime,
    people: payload.people,
    tableType: confirmation.tableType,
    seatingType: confirmation.seatingType,
    tableName: tableDisplayName,
    durationMin: confirmation.durationMin,
  });

  return {
    reservation,
    confirmation,
  };
};

/* =========================
   EDIT
========================= */

const checkDurationMin = (durationMin) => {
  const d = Number(durationMin);
  if (!Number.isInteger(d) || d < 15 || d > 480) {
    throw {
      status: 400,
      message: "Duration must be between 15 and 480 minutes.",
    };
  }
};

const editReservation = async (reservationId, reservationDAO, payload) => {
  const reservation = await reservationDAO.findReservationById(reservationId);
  if (!reservation)
    throw {
      status: 404,
      message: "Reservation not found!",
    };

  // No time/date limitations when editing (admin can change to past or any time)
  if (payload.durationMin != null) checkDurationMin(payload.durationMin);
  if (payload.people != null) {
    const p = Number(payload.people);
    if (!Number.isInteger(p) || p < 1 || p > 20) {
      throw { status: 400, message: "Number of people must be between 1 and 20." };
    }
  }

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
   MANUAL RESERVATION (ADMIN)
========================= */

const createManualReservation = async (reservationDAO, tableDAO, payload) => {
  const tableId = payload.tableId != null ? parseInt(payload.tableId, 10) : null;
  if (!tableId || !Number.isInteger(tableId)) {
    throw { status: 400, message: "Please select a table." };
  }

  const table = await tableDAO.findTableById(tableId);
  if (!table) {
    throw { status: 404, message: "Table not found." };
  }

  const settings = readSettings();
  const durationRacletteMin = settings.reservationDurationRacletteMin ?? 120;
  const durationStandardMin = settings.reservationDurationStandardMin ?? 60;
  const tableType = table.table_type || "standard";
  let durationMin;
  if (payload.durationMin != null && payload.durationMin !== "") {
    durationMin = Math.max(15, Math.min(480, parseInt(payload.durationMin, 10) || 60));
  } else if (payload.endTime && payload.resTime) {
    const [sh, sm] = String(payload.resTime).trim().substring(0, 5).split(":").map(Number);
    const [eh, em] = String(payload.endTime).trim().substring(0, 5).split(":").map(Number);
    durationMin = Math.max(15, Math.min(480, ((eh || 0) * 60 + (em || 0)) - ((sh || 0) * 60 + (sm || 0))));
  } else {
    durationMin = tableType === "raclette" ? durationRacletteMin : durationStandardMin;
  }

  const now = new Date();
  const todayStr = dateTimeValidator.asDateString(now);
  const resDate = (payload.resDate && String(payload.resDate).trim()) || todayStr;
  let resTime = (payload.resTime && String(payload.resTime).trim()) || "12:00";
  if (resTime.length === 5) resTime = resTime + ":00";
  resTime = resTime.substring(0, 8);
  const people = Math.max(1, Math.min(20, parseInt(payload.people, 10) || 1));

  const firstName = (payload.firstName && String(payload.firstName).trim()) || "Walk-in";
  const lastName = (payload.lastName && String(payload.lastName).trim()) || "Guest";
  let phone = (payload.phone && String(payload.phone).trim());
  if (!phone || !/^\+?[1-9]/.test(phone)) phone = "+1" + String(Date.now()).slice(-9).padStart(9, "0");
  phone = normalizePhone(phone) || "+1000000000";
  const email = (payload.email && String(payload.email).trim()) || "walkin-" + Date.now() + "@local.dev";
  const menu_req = (payload.menu_req != null && String(payload.menu_req).trim() !== "")
    ? String(payload.menu_req).trim()
    : "";

  const resPayload = {
    resDate,
    resTime: resTime.substring(0, 5),
    people,
    tableId,
    durationMin,
    table_type_req: tableType,
    is_private_req: table.is_private !== false,
    seating_type_req: table.seating_type || "chairs",
    menu_req,
    firstName,
    lastName,
    phone,
    email,
  };

  const reservation = await reservationDAO.createReservation(resPayload);
  await reservationDAO.setReservationTableIdOnly(reservation.id, tableId);
  return reservationDAO.findReservationById(reservation.id);
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
  createManualReservation,
};
