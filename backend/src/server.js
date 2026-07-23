require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("✔ MySQL connection established.");

    // In production, prefer real migrations over alter-sync. This alter:true
    // is convenient for getting this schema running quickly on a fresh DB.
    await sequelize.sync({ alter: process.env.NODE_ENV !== "production" });
    console.log("✔ Database schema synced.");

    app.listen(PORT, () => {
      console.log(`✔ API listening on http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("✘ Failed to start server:", err);
    process.exit(1);
  }
}

start();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled promise rejection:", err);
});
