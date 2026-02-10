const getErrorMessagesByColumn = require("../utils/getErrorMessages");

function validationSummary(errorsByColumn) {
  const parts = [];
  if (errorsByColumn.email && errorsByColumn.email.length) {
    parts.push("Please enter a valid email address.");
  }
  if (errorsByColumn.phone && errorsByColumn.phone.length) {
    parts.push("Please enter a valid phone number.");
  }
  if (errorsByColumn.firstName && errorsByColumn.firstName.length) {
    parts.push("Please enter a valid first name.");
  }
  if (errorsByColumn.lastName && errorsByColumn.lastName.length) {
    parts.push("Please enter a valid last name.");
  }
  if (parts.length) return parts.join(" ");
  const first = Object.values(errorsByColumn)[0];
  return first && first[0] ? first[0] : "Please check your details and try again.";
}

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const validationErr = err.name === "SequelizeValidationError" ? err : err.original?.name === "SequelizeValidationError" ? err.original : null;
  const errorsArray = validationErr?.errors ?? (Array.isArray(err.errors) ? err.errors : null);
  if (errorsArray && errorsArray.length) {
    const errors = getErrorMessagesByColumn(errorsArray);
    const message = validationSummary(errors);
    return res.status(400).json({
      success: false,
      message,
      errors,
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
