const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Newsletter = sequelize.define("Newsletter", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  status: {
    type: DataTypes.ENUM("subscribed", "unsubscribed"),
    defaultValue: "subscribed",
  },
  source: {
    // Where the signup came from — the footer form today, room for more
    // entry points (e.g. a dedicated /newsletter page) without a migration.
    type: DataTypes.STRING,
    defaultValue: "footer",
  },
  ip: { type: DataTypes.STRING, allowNull: true },
});

module.exports = Newsletter;
