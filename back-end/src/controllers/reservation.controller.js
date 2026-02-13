const reservationService = require("../services/reservationService");
const reservationDAO = require("../DAOs/reservation.dao");
const tableDAO = require("../DAOs/table.dao");
const { sendReservationConfirmationToCustomer } = require("../utils/emailSender");

const getAllHandler = async (req, res) => {
  const reservations = await reservationService.getAllReservations(
    reservationDAO,
    tableDAO
  );

  return res.status(200).json({
    success: true,
    collection: reservations,
  });
};

const registerHandler = async (req, res) => {
  const payload = req.body;

  const result = await reservationService.registerReservation(
    reservationDAO,
    payload,
    tableDAO
  );

  return res.status(201).json({
    success: true,
    message: "Successfully registered the reservation!",
    confirmation: result.confirmation,
  });
};


const editHandler = async (req, res) => {
  const payload = req.body;
  const reservationId = req.params.reservationId;
  const reservation = await reservationService.editReservation(
    reservationId,
    reservationDAO,
    payload
  );

  return res.status(200).json({
    success: true,
    message: "Successfully updated the reservation!",
    item: reservation,
  });
};

const cancelHandler = async (req, res) => {
  const reservationId = req.params.reservationId;
  const reservation = await reservationService.cancelReservation(
    reservationId,
    reservationDAO
  );

  return res.status(200).json({
    success: true,
    message: "Successfully canceled the reservation!",
    item: reservation,
  });
};

const chooseTableHandler = async (req, res) => {
  const reservationId = req.params.reservationId;
  const { tableId } = req.body;

  const info = await reservationService.chooseTable(
    reservationId,
    tableId,
    reservationDAO,
    tableDAO
  );

  return res.status(200).json({
    success: true,
    message: "Successfully chosen your table!",
    item: info,
  });
};

function timeToHHMM(t) {
  if (!t) return "—";
  const s = String(t).trim();
  const match = s.match(/^(\d{1,2}):(\d{2})/);
  if (match) return `${match[1].padStart(2, "0")}:${match[2]}`;
  if (t instanceof Date) return `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
  return s.slice(0, 5);
}

function addMinutesHHMM(startHHMM, minutes) {
  const [h, m] = startHHMM.split(":").map(Number);
  const total = (h || 0) * 60 + (m || 0) + (minutes || 0);
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

const sendConfirmationEmailHandler = async (req, res) => {
  const reservationId = req.params.reservationId;
  const reservation = await reservationDAO.findReservationWithCustomer(reservationId);
  if (!reservation) {
    return res.status(404).json({ success: false, message: "Reservation not found." });
  }
  const customer = reservation.customer || (await reservation.getCustomer?.());
  const email = customer?.email;
  if (!email) {
    return res.status(400).json({ success: false, message: "No email address for this reservation." });
  }

  const tableTypeRaw = String(reservation.table_type_req || "").trim().toLowerCase();
  let tableType = tableTypeRaw;
  let seatingType = String(reservation.seating_type_req || "chairs").toLowerCase();
  if (reservation.tableId) {
    const table = await tableDAO.findTableById(reservation.tableId);
    if (table) {
      tableType = table.table_type || tableTypeRaw;
      seatingType = table.seating_type || seatingType;
    }
  }
  const tableLabel = tableType === "raclette" ? "Raclette" : "Standard";
  const seatingLabel = seatingType === "floor" ? "on cushions" : "on chairs";
  const tableAndSeating = `for a ${tableLabel} table, ${seatingLabel}`;
  const isRaclette = tableType.includes("raclette");

  const resTimeStr = timeToHHMM(reservation.resTime);
  const durationMin = reservation.durationMin != null ? Number(reservation.durationMin) : 60;
  const startTime = resTimeStr;
  const endTime = addMinutesHHMM(resTimeStr, durationMin);
  const resDate = String(reservation.resDate || "").slice(0, 10);
  const firstName = customer.firstName || "Guest";

  await sendReservationConfirmationToCustomer({
    toEmail: email,
    firstName,
    resDate,
    startTime,
    endTime,
    tableAndSeating,
    isRaclette,
  });

  return res.status(200).json({
    success: true,
    message: "Confirmation email sent.",
  });
};

module.exports = {
  getAllHandler,
  registerHandler,
  editHandler,
  cancelHandler,
  chooseTableHandler,
  sendConfirmationEmailHandler,
};
