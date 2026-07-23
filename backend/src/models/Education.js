const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Education = sequelize.define("Education", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  institute: { type: DataTypes.STRING, allowNull: false },
  degree: { type: DataTypes.STRING, allowNull: false },
  session: { type: DataTypes.STRING, allowNull: true },
  marks: { type: DataTypes.STRING, allowNull: true },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  description: { type: DataTypes.TEXT, allowNull: true },
});

module.exports = Education;
