const slugify = require("slugify");
const { Project } = require("../models");
const createCrudController = require("./crudControllerFactory");

const withSlug = (body) => {
  if (body.title) body.slug = slugify(body.title, { lower: true, strict: true });
  if (typeof body.featured === "string") body.featured = body.featured === "true";
  return body;
};

module.exports = createCrudController(Project, {
  searchFields: ["title", "category", "shortDescription"],
  orderBy: "order",
  fileFields: ["image"],
  jsonFields: ["technologies"],
  beforeSave: withSlug,
});
