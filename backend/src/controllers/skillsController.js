const { Skill } = require("../models");
const createCrudController = require("./crudControllerFactory");

module.exports = createCrudController(Skill, {
  searchFields: ["name", "category"],
  orderBy: "order",
  fileFields: ["icon"],
});
