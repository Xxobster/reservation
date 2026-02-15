const fs = require("fs");
const path = require("path");
const db = require("../db/models");
const { Op } = require("sequelize");
const { readSettings } = require("../utils/settingsReader");
const { scheduleOrSendDeliveryNotification } = require("../utils/emailSender");

const GUESTHOUSES_PATH = path.resolve(__dirname, "../../data/guesthouses.json");
const DELIVERY_MENU_PATH = path.resolve(__dirname, "../../data/delivery-menu.json");

const getGuesthouseList = () => {
  try {
    const data = fs.readFileSync(GUESTHOUSES_PATH, "utf8");
    const list = JSON.parse(data);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
};

const PICKUP_GUESTHOUSE = "Pick-up at restaurant";

const createHandler = async (req, res) => {
  const body = req.body || {};
  const settings = readSettings();
  const isPickup = String(body.orderType || "").toLowerCase() === "pickup";
  let guesthouse;
  let roomNumber;
  let feeGuesthouseLAK;

  if (isPickup) {
    guesthouse = PICKUP_GUESTHOUSE;
    roomNumber = null;
    feeGuesthouseLAK = 0;
  } else {
    guesthouse = String(body.guesthouse || "").trim();
    if (!guesthouse) {
      return res.status(400).json({ success: false, message: "guesthouse is required" });
    }
    const allowedList = getGuesthouseList();
    if (allowedList.length > 0 && !allowedList.includes(guesthouse)) {
      return res.status(400).json({
        success: false,
        message: "guesthouse must be one of the names in the guesthouse list. Please select from the dropdown.",
      });
    }
    roomNumber = body.roomNumber != null ? String(body.roomNumber).trim() : null;
    feeGuesthouseLAK =
      typeof body.feeGuesthouseLAK === "number" && body.feeGuesthouseLAK >= 0
        ? body.feeGuesthouseLAK
        : (settings.deliveryFeeGuesthouseLAK != null ? settings.deliveryFeeGuesthouseLAK : 30000);
  }

  const deliveredAt = body.deliveredAt ? new Date(body.deliveredAt) : new Date();
  if (Number.isNaN(deliveredAt.getTime())) {
    return res.status(400).json({ success: false, message: "invalid deliveredAt" });
  }

  const lat = body.lat != null && typeof body.lat === "number" ? body.lat : null;
  const lng = body.lng != null && typeof body.lng === "number" ? body.lng : null;

  const delivery = await db.delivery.create({
    guesthouse,
    roomNumber,
    deliveredAt,
    feeGuesthouseLAK,
    lat,
    lng,
    customerName: body.customerName != null ? String(body.customerName).trim() : null,
    customerPhone: body.customerPhone != null ? String(body.customerPhone).replace(/[\s.\-()]/g, "").trim() : null,
    notes: body.notes != null ? String(body.notes).trim() : null,
  });

  scheduleOrSendDeliveryNotification({
    isPickup,
    guesthouse,
    roomNumber: delivery.roomNumber,
    customerName: delivery.customerName,
    customerPhone: delivery.customerPhone,
    notes: delivery.notes,
    deliveredAt: delivery.deliveredAt,
    feeGuesthouseLAK: delivery.feeGuesthouseLAK,
  });

  return res.status(201).json({
    success: true,
    message: "Delivery recorded",
    item: {
      id: delivery.id,
      guesthouse: delivery.guesthouse,
      deliveredAt: delivery.deliveredAt,
      feeGuesthouseLAK: delivery.feeGuesthouseLAK,
    },
  });
};

const getByGuesthouseHandler = async (req, res) => {
  const startDate = req.query.startDate ? String(req.query.startDate).trim() : null;
  const endDate = req.query.endDate ? String(req.query.endDate).trim() : null;

  const where = {};
  const dateCond = {};
  if (startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    dateCond[Op.gte] = new Date(startDate + "T00:00:00.000Z");
  }
  if (endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    dateCond[Op.lte] = new Date(endDate + "T23:59:59.999Z");
  }
  if (Object.keys(dateCond).length) where.deliveredAt = dateCond;

  const deliveries = await db.delivery.findAll({
    where: Object.keys(where).length ? where : undefined,
    order: [["deliveredAt", "ASC"]],
    raw: true,
  });

  const byGuesthouse = {};
  for (const d of deliveries) {
    const name = d.guesthouse;
    if (!byGuesthouse[name]) {
      byGuesthouse[name] = { guesthouse: name, deliveries: [], totalFeeLAK: 0 };
    }
    const row = {
      id: d.id,
      date: d.deliveredAt,
      feeGuesthouseLAK: d.feeGuesthouseLAK,
      roomNumber: d.roomNumber,
      customerName: d.customerName,
      customerPhone: d.customerPhone,
      isPaid: Boolean(d.isPaid),
    };
    byGuesthouse[name].deliveries.push(row);
    byGuesthouse[name].totalFeeLAK += d.feeGuesthouseLAK;
  }

  const list = Object.values(byGuesthouse);
  list.sort((a, b) => a.guesthouse.localeCompare(b.guesthouse, "en", { sensitivity: "base" }));

  return res.status(200).json({
    success: true,
    guesthouses: list,
  });
};

const deleteHandler = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, message: "invalid id" });
  }
  const delivery = await db.delivery.findByPk(id);
  if (!delivery) {
    return res.status(404).json({ success: false, message: "delivery not found" });
  }
  await delivery.destroy();
  return res.status(200).json({ success: true, message: "delivery deleted" });
};

const patchHandler = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, message: "invalid id" });
  }
  const delivery = await db.delivery.findByPk(id);
  if (!delivery) {
    return res.status(404).json({ success: false, message: "delivery not found" });
  }
  const body = req.body || {};
  if (body.isPaid === true) {
    await delivery.update({ isPaid: true });
  }
  return res.status(200).json({
    success: true,
    item: {
      id: delivery.id,
      isPaid: delivery.isPaid,
    },
  });
};

const readDeliveryMenu = () => {
  try {
    const data = fs.readFileSync(DELIVERY_MENU_PATH, "utf8");
    const menu = JSON.parse(data);
    return Array.isArray(menu) ? menu : [];
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
};

const getMenuHandler = (req, res) => {
  const menu = readDeliveryMenu();
  return res.status(200).json({ success: true, menu });
};

const putMenuHandler = (req, res) => {
  const settings = readSettings();
  const expectedPin = settings.adminPin != null ? String(settings.adminPin) : "";
  const submittedPin = req.body && req.body.adminPin != null ? String(req.body.adminPin) : "";
  if (expectedPin === "" || submittedPin !== expectedPin) {
    return res.status(403).json({ success: false, message: "Invalid or missing admin PIN" });
  }
  const menu = req.body.menu;
  if (!Array.isArray(menu)) {
    return res.status(400).json({ success: false, message: "menu must be an array" });
  }
  const dir = path.dirname(DELIVERY_MENU_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DELIVERY_MENU_PATH, JSON.stringify(menu, null, 2), "utf8");
  return res.status(200).json({ success: true, message: "Menu saved" });
};

module.exports = {
  createHandler,
  getByGuesthouseHandler,
  deleteHandler,
  patchHandler,
  getMenuHandler,
  putMenuHandler,
};
