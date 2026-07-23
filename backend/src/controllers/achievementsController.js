const slugify = require("slugify");
const { Achievement } = require("../models");
const createCrudController = require("./crudControllerFactory");

const withSlug = (body) => {
  if (body.title) body.slug = slugify(body.title, { lower: true, strict: true });
  return body;
};

module.exports = createCrudController(Achievement, {
  searchFields: ["title", "category", "briefDescription"],
  orderBy: "order",
  fileFields: ["image"],
  jsonFields: ["gallery"],
  beforeSave: withSlug,
});
