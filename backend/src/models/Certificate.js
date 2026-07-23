const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Certificate = sequelize.define("Certificate", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true },
  image: { type: DataTypes.STRING, allowNull: true },
  issuer: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: true },
  issueDate: { type: DataTypes.DATEONLY, allowNull: true },
  credentialUrl: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = Certificate;
