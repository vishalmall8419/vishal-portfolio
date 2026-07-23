const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Service = sequelize.define("Service", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: true },
  icon: { type: DataTypes.STRING, allowNull: true },
  price: { type: DataTypes.STRING, allowNull: true },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM("active", "inactive"), defaultValue: "active" },
  description: { type: DataTypes.TEXT, allowNull: false },
  features: { type: DataTypes.JSON, defaultValue: [] },
});

module.exports = Service;
