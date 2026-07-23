const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Seo = sequelize.define("Seo", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  page: { type: DataTypes.STRING, allowNull: false, unique: true }, // e.g. "home", "about", "projects"
  metaTitle: { type: DataTypes.STRING, allowNull: true },
  metaDescription: { type: DataTypes.STRING, allowNull: true },
  keywords: { type: DataTypes.STRING, allowNull: true },
  ogTitle: { type: DataTypes.STRING, allowNull: true },
  ogDescription: { type: DataTypes.STRING, allowNull: true },
  ogImage: { type: DataTypes.STRING, allowNull: true },
  twitterCard: { type: DataTypes.STRING, defaultValue: "summary_large_image" },
  canonicalUrl: { type: DataTypes.STRING, allowNull: true },
  noIndex: { type: DataTypes.BOOLEAN, defaultValue: false }, // true -> <meta name="robots" content="noindex, nofollow">
});

module.exports = Seo;
