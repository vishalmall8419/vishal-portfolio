const { Op } = require("sequelize");
const slugify = require("slugify");
const { Gallery } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { ok, created, noContent } = require("../utils/apiResponse");
const {
  uploadBufferToCloudinary,
  uploadManyToCloudinary,
  deleteFromCloudinary,
} = require("../middleware/cloudinaryUpload");

const CLOUDINARY_FOLDER = "portfolio/gallery";

const parseJsonField = (value, fallback) => {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch (_) {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
};

const uniqueSlug = async (title, ignoreId) => {
  const base = slugify(title, { lower: true, strict: true });
  let slug = base;
  let n = 1;
  // Practically always resolves on the first try — title changes on an
  // existing gallery item are rare, and titles are rarely exact duplicates.
  while (
    await Gallery.findOne({
      where: { slug, ...(ignoreId ? { id: { [Op.ne]: ignoreId } } : {}) },
    })
  ) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
};

const list = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 12, 100);
  const offset = (page - 1) * limit;

  const where = {};
  if (req.query.q) {
    where[Op.or] = [
      { title: { [Op.like]: `%${req.query.q}%` } },
      { category: { [Op.like]: `%${req.query.q}%` } },
      { shortDescription: { [Op.like]: `%${req.query.q}%` } },
    ];
  }
  if (req.query.category) where.category = req.query.category;
  if (req.query.status) where.status = req.query.status;
  if (req.query.featured !== undefined) where.featured = req.query.featured === "true";

  const order = [["displayOrder", "ASC"], ["id", "DESC"]];

  const { rows, count } = await Gallery.findAndCountAll({ where, order, limit, offset });

  ok(res, rows, {
    pagination: { page, limit, total: count, totalPages: Math.max(Math.ceil(count / limit), 1) },
  });
});

const getOne = asyncHandler(async (req, res) => {
  const row = await Gallery.findByPk(req.params.id);
  if (!row) throw new ApiError(404, "Gallery item not found.");
  ok(res, row);
});

const create = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.tags !== undefined) body.tags = parseJsonField(body.tags, []);
  if (body.featured !== undefined) body.featured = body.featured === true || body.featured === "true";
  if (body.displayOrder !== undefined) body.displayOrder = Number(body.displayOrder) || 0;

  body.slug = await uniqueSlug(body.title);

  const files = req.files || {};
  if (files.image?.[0]) {
    const uploaded = await uploadBufferToCloudinary(files.image[0].buffer, CLOUDINARY_FOLDER);
    body.image = uploaded.url;
    body.imagePublicId = uploaded.publicId;
  }
  if (files.galleryImages?.length) {
    const uploaded = await uploadManyToCloudinary(files.galleryImages, CLOUDINARY_FOLDER);
    body.galleryImages = uploaded.map((f) => ({ url: f.url, publicId: f.publicId }));
  }

  const row = await Gallery.create(body);
  created(res, row);
});

const update = asyncHandler(async (req, res) => {
  const row = await Gallery.findByPk(req.params.id);
  if (!row) throw new ApiError(404, "Gallery item not found.");

  const body = { ...req.body };
  if (body.tags !== undefined) body.tags = parseJsonField(body.tags, row.tags);
  if (body.featured !== undefined) body.featured = body.featured === true || body.featured === "true";
  if (body.displayOrder !== undefined) body.displayOrder = Number(body.displayOrder) || 0;

  if (body.title && body.title !== row.title) {
    body.slug = await uniqueSlug(body.title, row.id);
  }

  const files = req.files || {};

  if (files.image?.[0]) {
    const uploaded = await uploadBufferToCloudinary(files.image[0].buffer, CLOUDINARY_FOLDER);
    await deleteFromCloudinary(row.imagePublicId);
    body.image = uploaded.url;
    body.imagePublicId = uploaded.publicId;
  }

  // Gallery carousel images: the admin sends the list of images to KEEP
  // (existing ones, as JSON) plus any newly-picked files to add. Anything
  // that was on the row but isn't in "keepGalleryImages" gets deleted from
  // Cloudinary — this is what makes single-image removal from the carousel
  // work, not just whole-item deletion.
  const keep = parseJsonField(req.body.keepGalleryImages, undefined);
  let nextGalleryImages = Array.isArray(keep) ? keep : row.galleryImages || [];

  if (Array.isArray(row.galleryImages)) {
    const keptIds = new Set(nextGalleryImages.map((img) => img.publicId));
    const removed = row.galleryImages.filter((img) => !keptIds.has(img.publicId));
    await Promise.all(removed.map((img) => deleteFromCloudinary(img.publicId)));
  }

  if (files.galleryImages?.length) {
    const uploaded = await uploadManyToCloudinary(files.galleryImages, CLOUDINARY_FOLDER);
    nextGalleryImages = [...nextGalleryImages, ...uploaded.map((f) => ({ url: f.url, publicId: f.publicId }))];
  }

  body.galleryImages = nextGalleryImages;
  delete body.keepGalleryImages;

  await row.update(body);
  ok(res, row);
});

const remove = asyncHandler(async (req, res) => {
  const row = await Gallery.findByPk(req.params.id);
  if (!row) throw new ApiError(404, "Gallery item not found.");

  await deleteFromCloudinary(row.imagePublicId);
  await Promise.all((row.galleryImages || []).map((img) => deleteFromCloudinary(img.publicId)));

  await row.destroy();
  noContent(res);
});

/** Distinct category list — powers the admin's category filter dropdown. */
const categories = asyncHandler(async (req, res) => {
  const rows = await Gallery.findAll({
    attributes: [[Gallery.sequelize.fn("DISTINCT", Gallery.sequelize.col("category")), "category"]],
    order: [["category", "ASC"]],
  });
  ok(res, rows.map((r) => r.category).filter(Boolean));
});

module.exports = { list, getOne, create, update, remove, categories };
