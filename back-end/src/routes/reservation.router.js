const express = require("express");
const router = express.Router();
const tryCatchHandler = require("../middleware/tryCatch");
const httpMethodError = require("../middleware/httpMethodError");
const reservationController = require("../controllers/reservation.controller");

router
  .route("/")
  .get(tryCatchHandler(reservationController.getAllHandler))
  .post(tryCatchHandler(reservationController.registerHandler))
  .all(httpMethodError);

router
  .route("/manual")
  .post(tryCatchHandler(reservationController.createManualHandler))
  .all(httpMethodError);

router
  .route("/:reservationId")
  .patch(tryCatchHandler(reservationController.editHandler))
  .delete(tryCatchHandler(reservationController.cancelHandler))
  .all(httpMethodError);

router
  .route("/:reservationId/send-confirmation-email")
  .post(tryCatchHandler(reservationController.sendConfirmationEmailHandler))
  .all(httpMethodError);

router
  .route("/:reservationId/mark-contacted")
  .post(tryCatchHandler(reservationController.markContactedHandler))
  .all(httpMethodError);

router
  .route("/:reservationId/toggle-arrived")
  .post(tryCatchHandler(reservationController.toggleArrivedHandler))
  .all(httpMethodError);

router
  .route("/choose-table/:reservationId")
  .post(tryCatchHandler(reservationController.chooseTableHandler))
  .all(httpMethodError);

module.exports = router;
