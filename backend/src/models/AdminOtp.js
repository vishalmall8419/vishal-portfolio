const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Short-lived OTP codes for the login 2nd factor. Never store the raw code —
// only a bcrypt hash, mirroring how Admin.refreshTokenHash already works.
const AdminOtp = sequelize.define("AdminOtp", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  adminId: { type: DataTypes.INTEGER, allowNull: false },
  purpose: { type: DataTypes.STRING, allowNull: false, defaultValue: "login" },
  otpHash: { type: DataTypes.STRING, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  consumed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  lastSentAt: { type: DataTypes.DATE, allowNull: true },
});

module.exports = AdminOtp;
