"use strict";

const nodemailer = require("nodemailer");
const logger = require("./logger");
const { readSettings } = require("./settingsReader");

require("dotenv").config();

function getNotifyEmails(settingKey) {
  const raw = readSettings()[settingKey];
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(/[\n,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
}

function getReservationNotifyEmails() {
  return getNotifyEmails("reservationNotifyEmails");
}

function getDeliveryNotifyEmails() {
  return getNotifyEmails("deliveryNotifyEmails");
}

/** Returns ms until HH:MM today (server local), or null if already past. */
function getMsUntilNotifyTime(notifyTimeStr) {
  const raw = (notifyTimeStr || "11:00").trim();
  const parts = raw.split(/[:\s]+/).map((x) => parseInt(x, 10) || 0);
  const h = parts[0] ?? 11;
  const m = parts[1] ?? 0;
  const s = parts[2] ?? 0;
  const now = new Date();
  const notifyToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, s, 0);
  if (now >= notifyToday) return null;
  return notifyToday - now;
}

function formatTimeForEmail(resTime) {
  if (!resTime) return "";
  const str = String(resTime).trim();
  const match = str.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return str;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  else if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Send new reservation notification to configured addresses.
 * @param {Object} details - Reservation details
 * @param {string} details.firstName
 * @param {string} details.lastName
 * @param {string} details.email
 * @param {string} details.phone
 * @param {string} details.resDate
 * @param {string} details.resTime
 * @param {number} details.people
 * @param {string} details.tableType
 * @param {string} details.seatingType
 * @param {string} details.tableName
 * @param {number} details.durationMin
 */
async function sendReservationNotification(details) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@smbistro.com";

  if (!host || !user || !pass) {
    logger.warn("Reservation email not sent: SMTP not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS in .env)");
    return;
  }

  const timeStr = formatTimeForEmail(details.resTime);
  const durationStr = details.durationMin >= 60
    ? `${Math.floor(details.durationMin / 60)}h ${details.durationMin % 60 ? details.durationMin % 60 + "min" : ""}`.trim()
    : `${details.durationMin} min`;

  const subject = `New reservation: ${details.firstName} ${details.lastName} – ${details.resDate} at ${timeStr}`;
  const text = [
    "New reservation received",
    "================================",
    "",
    "Date: " + details.resDate,
    "Time: " + timeStr,
    "Duration: " + durationStr,
    "Number of people: " + details.people,
    "",
    "Customer: " + details.firstName + " " + details.lastName,
    "Email: " + (details.email || "—"),
    "Phone: " + (details.phone || "—"),
    "",
    "Table type: " + (details.tableType || "—"),
    "Seating: " + (details.seatingType || "—"),
    "Table: " + (details.tableName || "—"),
    "",
  ].join("\n");

  const transporter = nodemailer.createTransport({
    host,
    port: port ? parseInt(port, 10) : 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  const toList = getReservationNotifyEmails();
  if (toList.length === 0) return;

  try {
    await transporter.sendMail({
      from,
      to: toList.join(", "),
      subject,
      text,
    });
    logger.info("Reservation notification email sent to " + toList.join(", "));
  } catch (err) {
    logger.error("Failed to send reservation email: " + (err.message || err));
  }
}

/**
 * Send new delivery or pick-up notification to configured addresses.
 * @param {Object} details - (isPickup), guesthouse, roomNumber, customerName, customerPhone, notes, deliveredAt, feeGuesthouseLAK
 */
async function sendDeliveryNotification(details) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@smbistro.com";

  if (!host || !user || !pass) {
    logger.warn("Delivery email not sent: SMTP not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS in .env)");
    return;
  }

  const isPickup = details.isPickup === true;
  const deliveredAt = details.deliveredAt instanceof Date ? details.deliveredAt : new Date(details.deliveredAt);
  const dateStr = deliveredAt.toISOString ? deliveredAt.toISOString().slice(0, 10) : String(details.deliveredAt || "").slice(0, 10);
  const timeStr = deliveredAt.toTimeString ? deliveredAt.toTimeString().slice(0, 5) : "";

  const subject = isPickup
    ? "New pick-up order"
    : `New delivery: ${details.guesthouse || "—"}${details.roomNumber ? " – Room " + details.roomNumber : ""}`;
  const title = isPickup ? "New pick-up order recorded" : "New delivery recorded";
  const lines = [
    title,
    "================================",
    "",
    "Type: " + (isPickup ? "Pick-up at restaurant" : "Delivery"),
    "Date: " + dateStr,
    "Time: " + timeStr,
  ];
  if (!isPickup) {
    lines.push("Guesthouse: " + (details.guesthouse || "—"));
    lines.push("Room: " + (details.roomNumber || "—"));
    lines.push("Fee (guesthouse LAK): " + (details.feeGuesthouseLAK != null ? details.feeGuesthouseLAK : "—"));
  }
  lines.push(
    "",
    "Customer: " + (details.customerName || "—"),
    "Phone: " + (details.customerPhone || "—"),
    "",
    "Notes: " + (details.notes || "—"),
    ""
  );
  const text = lines.join("\n");

  const transporter = nodemailer.createTransport({
    host,
    port: port ? parseInt(port, 10) : 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  const toList = getDeliveryNotifyEmails();
  if (toList.length === 0) return;

  try {
    await transporter.sendMail({
      from,
      to: toList.join(", "),
      subject,
      text,
    });
    logger.info("Delivery notification email sent to " + toList.join(", "));
  } catch (err) {
    logger.error("Failed to send delivery email: " + (err.message || err));
  }
}

/**
 * Send delivery notification now or schedule for notifyDeliveryEmailAfterTime if before that time.
 */
function scheduleOrSendDeliveryNotification(details) {
  const notifyTime = (readSettings().notifyDeliveryEmailAfterTime || "11:00").trim();
  const ms = getMsUntilNotifyTime(notifyTime);
  if (ms != null && ms > 0) {
    logger.info("Delivery notification scheduled for " + notifyTime + " (in " + Math.round(ms / 1000 / 60) + " min)");
    setTimeout(() => {
      sendDeliveryNotification(details).catch(() => {});
    }, ms);
  } else {
    sendDeliveryNotification(details).catch(() => {});
  }
}

/**
 * Build reservation confirmation message body (same as WhatsApp: standard vs raclette).
 * @param {{ firstName: string, resDate: string, startTime: string, endTime: string, tableAndSeating: string, isRaclette: boolean }}
 */
function buildReservationConfirmationMessage({ firstName, resDate, startTime, endTime, tableAndSeating, isRaclette }) {
  const paymentBlock = `We do not accept credit or debit cards. Cash withdrawals are available at Dalom (port), Adam's Bar, Datta Banana Leaf, and other nearby locations, with varying fees.

We also accept Revolut and Wise (5% surcharge), as well as Ezy Kip, Moreta Pay, and Loca Pay (app activation takes up to 24 hours). Payment details are available here: http://smbistro.duckdns.org/img/payments.png`;

  const racletteBlock = isRaclette
    ? "Kindly be aware that our raclette tables are community tables and may therefore be shared with other guests.\n\n"
    : "";

  return `Dear ${firstName || "Guest"},

Thank you for your reservation at S&M Bistro on ${resDate}, from ${startTime} to ${endTime}, ${tableAndSeating}.

${racletteBlock}${paymentBlock}

We look forward to welcoming you.

Warm regards,
The S&M Team`;
}

/**
 * Send reservation confirmation email to the customer (same content as WhatsApp, for when WhatsApp is not possible).
 * @param {{ toEmail: string, firstName: string, resDate: string, startTime: string, endTime: string, tableAndSeating: string, isRaclette: boolean }}
 */
async function sendReservationConfirmationToCustomer(details) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@smbistro.com";

  if (!host || !user || !pass) {
    logger.warn("Reservation confirmation email not sent: SMTP not configured");
    return;
  }
  if (!details.toEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.toEmail)) {
    logger.warn("Reservation confirmation email not sent: invalid or missing customer email");
    return;
  }

  const subject = `Your reservation at S&M Bistro – ${details.resDate} ${details.startTime}`;
  const text = buildReservationConfirmationMessage(details);

  const transporter = nodemailer.createTransport({
    host,
    port: port ? parseInt(port, 10) : 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from,
      to: details.toEmail,
      subject,
      text,
    });
    logger.info("Reservation confirmation email sent to " + details.toEmail);
  } catch (err) {
    logger.error("Failed to send reservation confirmation email: " + (err.message || err));
    throw err;
  }
}

module.exports = { sendReservationNotification, sendDeliveryNotification, scheduleOrSendDeliveryNotification, sendReservationConfirmationToCustomer };
