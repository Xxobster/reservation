const fs = require("fs");
const path = require("path");
const { DEFAULT_SETTINGS } = require("../utils/settingsReader");

const SETTINGS_PATH = path.resolve(__dirname, "../../data/settings.json");

const readSettings = () => {
  try {
    const data = fs.readFileSync(SETTINGS_PATH, "utf8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (err) {
    if (err.code === "ENOENT") {
      const dir = path.dirname(SETTINGS_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf8");
      return { ...DEFAULT_SETTINGS };
    }
    throw err;
  }
};

const writeSettings = (settings) => {
  const dir = path.dirname(SETTINGS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf8");
};

const getHandler = (req, res) => {
  const settings = readSettings();
  return res.status(200).json(settings);
};

const patchHandler = (req, res) => {
  const body = req.body || {};
  const allowed = [
    "whatsappGeneral",
    "whatsappReservations",
    "whatsappDelivery",
    "reservationsEnabled",
    "deliveryEnabled",
    "pickupEnabled",
    "deliveryStartTime",
    "deliveryEndTime",
    "pickupStartTime",
    "pickupEndTime",
    "reservationDurationRacletteMin",
    "reservationDurationStandardMin",
    "notifyEmailAfterTime",
    "reservationNotifyEmails",
    "notifyDeliveryEmailAfterTime",
    "deliveryNotifyEmails",
    "deliveryFeeGuesthouseLAK",
    "deliveryFeeDeliveryPersonLAK",
  ];
  const current = readSettings();
  for (const key of allowed) {
    if (body[key] !== undefined) {
      if (["reservationsEnabled", "deliveryEnabled", "pickupEnabled"].includes(key)) {
        current[key] = Boolean(body[key]);
      } else if (key.startsWith("whatsapp")) {
        current[key] = String(body[key]).replace(/\D/g, "") || current[key];
      } else if (key.endsWith("StartTime") || key.endsWith("EndTime") || key === "notifyEmailAfterTime" || key === "notifyDeliveryEmailAfterTime") {
        const v = String(body[key]).trim();
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(v)) current[key] = v.length === 5 ? v : v.substring(0, 5);
      } else if (key === "reservationNotifyEmails" || key === "deliveryNotifyEmails") {
        current[key] = String(body[key] ?? "").trim();
      } else if (key === "reservationDurationRacletteMin" || key === "reservationDurationStandardMin") {
        const n = parseInt(body[key], 10);
        if (!isNaN(n) && n >= 15 && n <= 480) current[key] = n;
      } else if (key === "deliveryFeeGuesthouseLAK" || key === "deliveryFeeDeliveryPersonLAK") {
        const n = parseInt(body[key], 10);
        if (!isNaN(n) && n >= 0 && n <= 10000000) current[key] = n;
      }
    }
  }
  writeSettings(current);
  return res.status(200).json(current);
};

module.exports = {
  getHandler,
  patchHandler,
};
