const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Singleton table (always row id = 1) driving the public site's theme tokens.
const Theme = sequelize.define("Theme", {
  id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },
  mode: { type: DataTypes.ENUM("light", "dark", "system"), defaultValue: "dark" },
  primaryColor: { type: DataTypes.STRING, defaultValue: "#6c63ff" },
  secondaryColor: { type: DataTypes.STRING, defaultValue: "#00e5ff" },
  accentColor: { type: DataTypes.STRING, defaultValue: "#7c3aed" },
  fontFamily: { type: DataTypes.STRING, defaultValue: "Inter" },
  animationsEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = Theme;
