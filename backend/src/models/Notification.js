const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Generic admin-notification record. Any visitor-triggered event that should
// alert the admin (contact form submission today; extensible to more event
// types later, e.g. "new_testimonial") writes one row here.
const Notification = sequelize.define("Notification", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.STRING, allowNull: false, defaultValue: "contact_message" },
  title: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.STRING, allowNull: true },
  // Free-form context for the notification (submitter name/email/phone,
  // IP, user agent, related record id, etc.) — kept as JSON so new event
  // types don't require schema migrations.
  meta: { type: DataTypes.JSON, allowNull: true },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  emailSent: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = Notification;
