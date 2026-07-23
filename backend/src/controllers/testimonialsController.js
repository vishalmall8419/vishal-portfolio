const { Testimonial } = require("../models");
const createCrudController = require("./crudControllerFactory");

module.exports = createCrudController(Testimonial, {
  searchFields: ["name", "designation", "review"],
  orderBy: "order",
  fileFields: ["photo"],
});
