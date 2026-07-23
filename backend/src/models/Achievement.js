const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Achievement = sequelize.define("Achievement", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true },
  image: { type: DataTypes.STRING, allowNull: true }, // thumbnail
  category: { type: DataTypes.STRING, allowNull: true },
  date: { type: DataTypes.DATEONLY, allowNull: true },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  briefDescription: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true }, // full description
  gallery: { type: DataTypes.JSON, defaultValue: [] }, // extra gallery image paths/URLs
});

module.exports = Achievement;
