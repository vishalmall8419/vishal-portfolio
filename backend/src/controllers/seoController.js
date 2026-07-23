const { Seo } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { ok } = require("../utils/apiResponse");

const list = asyncHandler(async (req, res) => {
  const rows = await Seo.findAll({ order: [["page", "ASC"]] });
  ok(res, rows);
});

const getByPage = asyncHandler(async (req, res) => {
  const row = await Seo.findOne({ where: { page: req.params.page } });
  if (!row) throw new ApiError(404, "No SEO settings saved for this page yet.");
  ok(res, row);
});

const save = asyncHandler(async (req, res) => {
  const { page } = req.params;
  const [row] = await Seo.findOrCreate({ where: { page }, defaults: { page, ...req.body } });
  await row.update({ ...req.body, page });
  ok(res, row);
});

const remove = asyncHandler(async (req, res) => {
  const row = await Seo.findOne({ where: { page: req.params.page } });
  if (!row) throw new ApiError(404, "No SEO settings saved for this page.");
  await row.destroy();
  res.status(204).send();
});

module.exports = { list, getByPage, save, remove };
