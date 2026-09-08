const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",

    // TiDB Cloud uses port 4000
    port: Number(process.env.DB_PORT || 4000),

    dialect: "mysql",

    // Show SQL queries only in development
    logging: process.env.NODE_ENV === "development" ? console.log : false,

    define: {
      // Keep database column names in camelCase
      underscored: false,

      // Automatically manage createdAt and updatedAt
      timestamps: true,
    },

    // TiDB Cloud requires a secure TLS connection
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },

    // Database connection pool
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

module.exports = sequelize;
