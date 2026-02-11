const fs = require("fs");
const path = require("path");
const db = require("../db/models");
const { Op } = require("sequelize");
const { readSettings } = require("../utils/settingsReader");

const GUESTHOUSES_PATH = path.resolve(__dirname, "../../data/guesthouses.json");

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

const createHandler = async (req, res) => {
  const body = req.body || {};
  const settings = readSettings();
  const guesthouse = String(body.guesthouse || "").trim();
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
  const feeGuesthouseLAK =
    typeof body.feeGuesthouseLAK === "number" && body.feeGuesthouseLAK >= 0
      ? body.feeGuesthouseLAK
      : (settings.deliveryFeeGuesthouseLAK != null ? settings.deliveryFeeGuesthouseLAK : 30000);

  const deliveredAt = body.deliveredAt ? new Date(body.deliveredAt) : new Date();
  if (Number.isNaN(deliveredAt.getTime())) {
    return res.status(400).json({ success: false, message: "invalid deliveredAt" });
  }

  const lat = body.lat != null && typeof body.lat === "number" ? body.lat : null;
  const lng = body.lng != null && typeof body.lng === "number" ? body.lng : null;

  const delivery = await db.delivery.create({
    guesthouse,
    roomNumber: body.roomNumber != null ? String(body.roomNumber).trim() : null,
    deliveredAt,
    feeGuesthouseLAK,
    lat,
    lng,
    customerName: body.customerName != null ? String(body.customerName).trim() : null,
    customerPhone: body.customerPhone != null ? String(body.customerPhone).trim() : null,
    notes: body.notes != null ? String(body.notes).trim() : null,
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

module.exports = {
  createHandler,
  getByGuesthouseHandler,
  deleteHandler,
  patchHandler,
};
