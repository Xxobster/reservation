const express = require("express");
const router = express.Router();
const tryCatchHandler = require("../middleware/tryCatch");
const httpMethodError = require("../middleware/httpMethodError");
const adminController = require("../controllers/admin.controller");

router
  .route("/restart-backend")
  .post(tryCatchHandler(adminController.restartBackendHandler))
  .all(httpMethodError);

module.exports = router;
