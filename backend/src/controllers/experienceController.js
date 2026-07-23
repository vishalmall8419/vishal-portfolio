const { Experience } = require("../models");
const createCrudController = require("./crudControllerFactory");

module.exports = createCrudController(Experience, {
  searchFields: ["title", "company"],
  orderBy: "order",
});
