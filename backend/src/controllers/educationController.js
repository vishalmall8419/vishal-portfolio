const { Education } = require("../models");
const createCrudController = require("./crudControllerFactory");

module.exports = createCrudController(Education, {
  searchFields: ["institute", "degree"],
  orderBy: "order",
});
