const multer = require("multer");
const ApiError = require("../utils/ApiError");

// 404 fallback for unmatched routes — must be registered after all routes.
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Central error handler — must be registered last, after all routes/middleware.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error.";
  let details = err.details || null;

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "File too large (max 5MB)." : err.message;
  } else if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
    statusCode = 400;
    details = err.errors?.map((e) => ({ field: e.path, message: e.message }));
    message = "Validation failed.";
  } else if (err.name === "SequelizeForeignKeyConstraintError") {
    statusCode = 409;
    message = "This record is referenced elsewhere and cannot be modified.";
  }

  if (process.env.NODE_ENV !== "production" && statusCode === 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
};

module.exports = { notFound, errorHandler };
