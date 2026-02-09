const getErrorMessagesByColumn = require("../utils/getErrorMessages");

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      errors: getErrorMessagesByColumn(err.errors),
    });
  }

  const status = Number(err?.status) || 500;
  const message =
    err?.message && String(err.message).trim()
      ? String(err.message)
      : "Something went wrong. Please try again later.";
  return res.status(status).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
