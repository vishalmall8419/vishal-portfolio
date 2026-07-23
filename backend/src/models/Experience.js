const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Experience = sequelize.define("Experience", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  company: { type: DataTypes.STRING, allowNull: true },
  year: { type: DataTypes.STRING, allowNull: true }, // free text, e.g. "2024 - Present"
  description: { type: DataTypes.TEXT, allowNull: true },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = Experience;
