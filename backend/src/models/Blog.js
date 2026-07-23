const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Blog = sequelize.define("Blog", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true },
  coverImage: { type: DataTypes.STRING, allowNull: true },
  excerpt: { type: DataTypes.STRING, allowNull: true },
  category: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM("draft", "published"), defaultValue: "draft" },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  content: { type: DataTypes.TEXT("long"), allowNull: false },
  metaTitle: { type: DataTypes.STRING, allowNull: true },
  metaDescription: { type: DataTypes.STRING, allowNull: true },
  readTime: { type: DataTypes.INTEGER, defaultValue: 1 },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  publishedAt: { type: DataTypes.DATE, allowNull: true },
});

module.exports = Blog;
