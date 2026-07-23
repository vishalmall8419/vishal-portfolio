const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Audit trail for every outbound email attempt -- required so a failed
// send is visible somewhere other than the server console, and so support
// can answer "did the visitor confirmation actually go out?" without
// re-triggering anything.
const EmailLog = sequelize.define("EmailLog", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  to: { type: DataTypes.STRING, allowNull: false },
  subject: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: true }, // e.g. "contact_admin", "contact_visitor", "newsletter_confirm"
  status: {
    type: DataTypes.ENUM("sent", "failed", "skipped"),
    defaultValue: "sent",
  },
  attempts: { type: DataTypes.INTEGER, defaultValue: 1 },
  error: { type: DataTypes.TEXT, allowNull: true },
});

module.exports = EmailLog;
