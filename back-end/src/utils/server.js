const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const notFound = require("../middleware/notFound");
const errorHandler = require("../middleware/errorHandler");
const tableRouter = require("../routes/table.router");
const reservationRouter = require("../routes/reservation.router");
const settingsRouter = require("../routes/settings.router");
const adminRouter = require("../routes/admin.router");
const deliveryRouter = require("../routes/delivery.router");
const guesthouseRouter = require("../routes/guesthouse.router");
const createServer = () => {
  const app = express();

  app.use(cors());
  app.use(helmet({ crossOriginResourcePolicy: false })); // middleware for more secure response headers
  app.use(express.json());
  app.use("/api/v1", require("../routes"));
  app.use("/api/v1/tables", tableRouter);
  app.use("/api/v1/reservations", reservationRouter);
  app.use("/api/v1/settings", settingsRouter);
  app.use("/api/v1/deliveries", deliveryRouter);
  app.use("/api/v1/guesthouses", guesthouseRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
};

module.exports = createServer;
