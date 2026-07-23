const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

// Run after an array of express-validator checks; turns failures into a
// single consistent 400 ApiError instead of each route handling it manually.
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  next(new ApiError(400, "Validation failed.", errors.array().map((e) => ({ field: e.path, message: e.msg }))));
};
