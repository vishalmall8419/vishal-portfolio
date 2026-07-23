const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Skill = sequelize.define("Skill", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  icon: { type: DataTypes.STRING, allowNull: true },
  proficiency: { type: DataTypes.INTEGER, defaultValue: 50, validate: { min: 0, max: 100 } },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = Skill;
