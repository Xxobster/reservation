const express = require("express");
const router = express.Router();
const tryCatchHandler = require("../middleware/tryCatch");
const httpMethodError = require("../middleware/httpMethodError");
const guesthouseController = require("../controllers/guesthouse.controller");

router
  .route("/")
  .get(tryCatchHandler(guesthouseController.getListHandler))
  .patch(tryCatchHandler(guesthouseController.patchListHandler))
  .all(httpMethodError);

module.exports = router;
