const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Project = sequelize.define("Project", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true },
  image: { type: DataTypes.STRING, allowNull: true },
  shortDescription: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM("draft", "published"), defaultValue: "draft" },
  liveUrl: { type: DataTypes.STRING, allowNull: true },
  githubUrl: { type: DataTypes.STRING, allowNull: true },
  technologies: { type: DataTypes.JSON, defaultValue: [] },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = Project;
