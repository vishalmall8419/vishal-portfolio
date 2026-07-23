const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Testimonial = sequelize.define("Testimonial", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  designation: { type: DataTypes.STRING, allowNull: true },
  photo: { type: DataTypes.STRING, allowNull: true },
  rating: { type: DataTypes.INTEGER, defaultValue: 5, validate: { min: 1, max: 5 } },
  status: { type: DataTypes.ENUM("published", "hidden"), defaultValue: "published" },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  review: { type: DataTypes.TEXT, allowNull: false },
});

module.exports = Testimonial;
