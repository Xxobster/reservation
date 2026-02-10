"use strict";

const nodemailer = require("nodemailer");
const logger = require("./logger");

require("dotenv").config();

// Recipients for new reservation notifications
const NOTIFY_EMAILS = [
  "PetuniaSch59@gmail.com",
  "sylvain.atw@gmail.com",
];

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

  const toList = NOTIFY_EMAILS.filter(Boolean);
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

module.exports = { sendReservationNotification };
