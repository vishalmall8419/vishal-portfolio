const slugify = require("slugify");
const { Certificate } = require("../models");
const createCrudController = require("./crudControllerFactory");

const withSlug = (body) => {
  if (body.title) body.slug = slugify(body.title, { lower: true, strict: true });
  return body;
};

module.exports = createCrudController(Certificate, {
  searchFields: ["title", "issuer", "category"],
  orderBy: "order",
  fileFields: ["image"],
  beforeSave: withSlug,
});
