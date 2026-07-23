const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin } = require("../models");
const { signAccessToken, signRefreshToken } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { ok } = require("../utils/apiResponse");

const REFRESH_COOKIE = "refreshToken";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api/auth",
  maxAge:
    (parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS, 10) || 30) *
    24 *
    60 *
    60 *
    1000,
});

const sanitize = (admin) => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  phone: admin.phone,
  avatar: admin.avatar,
  role: admin.role,
});

const issueSession = async (res, admin) => {
  const token = signAccessToken(admin);
  const refreshToken = signRefreshToken(admin);

  admin.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await admin.save();

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());

  return token;
};

// ================= LOGIN =================

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const admin = await Admin.findOne({
    where: { email },
  });

  if (!admin) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const passwordMatched = await bcrypt.compare(
    password,
    admin.password
  );

  if (!passwordMatched) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = await issueSession(res, admin);

  ok(res, {
    token,
    admin: sanitize(admin),
  });
});
// ================= CURRENT ADMIN =================

const me = asyncHandler(async (req, res) => {
  const admin = await Admin.findByPk(req.adminId);

  if (!admin) {
    throw new ApiError(404, "Admin not found.");
  }

  ok(res, sanitize(admin));
});

// ================= REFRESH TOKEN =================

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];

  if (!refreshToken) {
    throw new ApiError(401, "No refresh token provided.");
  }

  let payload;

  try {
    payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );
  } catch (err) {
    throw new ApiError(401, "Refresh token invalid or expired.");
  }

  const admin = await Admin.findByPk(payload.sub);

  if (
    !admin ||
    !admin.refreshTokenHash ||
    !(await bcrypt.compare(refreshToken, admin.refreshTokenHash))
  ) {
    throw new ApiError(401, "Refresh token no longer valid.");
  }

  const accessToken = await issueSession(res, admin);

  ok(res, {
    token: accessToken,
  });
});

// ================= LOGOUT =================

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];

  if (refreshToken) {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );

      const admin = await Admin.findByPk(payload.sub);

      if (admin) {
        admin.refreshTokenHash = null;
        await admin.save();
      }
    } catch (err) {
      // Ignore invalid token
    }
  }

  res.clearCookie(REFRESH_COOKIE, {
    path: "/api/auth",
  });

  ok(res, null);
});

// ================= CHANGE PASSWORD =================

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findByPk(req.adminId);

  if (!admin) {
    throw new ApiError(404, "Admin not found.");
  }

  const matched = await bcrypt.compare(
    currentPassword,
    admin.password
  );

  if (!matched) {
    throw new ApiError(400, "Current password is incorrect.");
  }

  admin.password = await bcrypt.hash(newPassword, 12);

  await admin.save();

  ok(res, null);
});

// ================= EXPORTS =================

module.exports = {
  login,
  me,
  refresh,
  logout,
  changePassword,
};