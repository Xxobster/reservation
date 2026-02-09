const express = require("express");
const router = express.Router();
const tryCatchHandler = require("../middleware/tryCatch");
const httpMethodError = require("../middleware/httpMethodError");
const settingsController = require("../controllers/settings.controller");

router
  .route("/")
  .get(tryCatchHandler(settingsController.getHandler))
  .patch(tryCatchHandler(settingsController.patchHandler))
  .all(httpMethodError);

module.exports = router;
