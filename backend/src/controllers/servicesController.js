const { Service } = require("../models");
const createCrudController = require("./crudControllerFactory");

module.exports = createCrudController(Service, {
  searchFields: ["title", "description"],
  orderBy: "order",
  fileFields: ["image", "icon"],
  jsonFields: ["features"],
});
