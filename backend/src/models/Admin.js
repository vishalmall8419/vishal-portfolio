const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Admin = sequelize.define("Admin", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false }, // bcrypt hash, never returned to client
  phone: { type: DataTypes.STRING, allowNull: true },
  avatar: { type: DataTypes.STRING, allowNull: true },
  role: { type: DataTypes.ENUM("owner", "editor"), defaultValue: "owner" },
  refreshTokenHash: { type: DataTypes.STRING, allowNull: true }, // hash of current valid refresh token (rotation)
});

module.exports = Admin;
