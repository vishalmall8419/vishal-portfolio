const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

const signAccessToken = (admin) =>
  jwt.sign({ sub: admin.id, role: admin.role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });

const signRefreshToken = (admin) =>
  jwt.sign({ sub: admin.id, type: "refresh" }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: `${process.env.JWT_REFRESH_EXPIRES_DAYS || 30}d`,
  });

// Verifies the "Authorization: Bearer <token>" access token on protected routes.
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(new ApiError(401, "Not authenticated."));

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.adminId = payload.sub;
    next();
  } catch (err) {
    return next(new ApiError(401, "Session expired or invalid token."));
  }
};

module.exports = { signAccessToken, signRefreshToken, requireAuth };
