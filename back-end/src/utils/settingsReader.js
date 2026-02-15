const fs = require("fs");
const path = require("path");

const SETTINGS_PATH = path.resolve(__dirname, "../../data/settings.json");

const DEFAULT_SETTINGS = {
  whatsappGeneral: "41793917577",
  whatsappReservations: "41793917577",
  whatsappDelivery: "41793917577",
  reservationsEnabled: true,
  deliveryEnabled: true,
  pickupEnabled: true,
  deliveryStartTime: "11:00",
  deliveryEndTime: "21:00",
  pickupStartTime: "11:00",
  pickupEndTime: "21:00",
  reservationDurationRacletteMin: 120,
  reservationDurationStandardMin: 60,
  notifyEmailAfterTime: "11:00",
  reservationNotifyEmails: "PetuniaSch59@gmail.com, sylvain.atw@gmail.com",
  notifyDeliveryEmailAfterTime: "11:00",
  deliveryNotifyEmails: "PetuniaSch59@gmail.com, sylvain.atw@gmail.com",
  deliveryFeeGuesthouseLAK: 30000,
  deliveryFeeDeliveryPersonLAK: 20000,
  adminPin: "1954",
};

const readSettings = () => {
  try {
    const data = fs.readFileSync(SETTINGS_PATH, "utf8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (err) {
    if (err.code === "ENOENT") {
      return { ...DEFAULT_SETTINGS };
    }
    throw err;
  }
};

module.exports = { readSettings, DEFAULT_SETTINGS };
