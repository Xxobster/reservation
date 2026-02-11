const express = require("express");
const router = express.Router();
const tryCatchHandler = require("../middleware/tryCatch");
const httpMethodError = require("../middleware/httpMethodError");
const deliveryController = require("../controllers/delivery.controller");

router
  .route("/")
  .post(tryCatchHandler(deliveryController.createHandler))
  .all(httpMethodError);

router
  .route("/by-guesthouse")
  .get(tryCatchHandler(deliveryController.getByGuesthouseHandler))
  .all(httpMethodError);

router
  .route("/:id")
  .delete(tryCatchHandler(deliveryController.deleteHandler))
  .patch(tryCatchHandler(deliveryController.patchHandler))
  .all(httpMethodError);

module.exports = router;
