const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    define: {
      // camelCase in JS, matching column names 1:1 keeps the REST payloads
      // identical to what the existing admin frontend already expects.
      underscored: false,
      timestamps: true,
    },
    // Set DB_SSL=true if the MySQL host requires TLS (some managed
    // providers do). Railway's public proxy generally doesn't need this.
    ...(process.env.DB_SSL === "true"
      ? { dialectOptions: { ssl: { rejectUnauthorized: false } } }
      : {}),
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  }
);

module.exports = sequelize;
