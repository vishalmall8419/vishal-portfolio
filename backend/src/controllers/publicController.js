const {
  Project,
  Blog,
  Service,
  Skill,
  Education,
  Experience,
  Certificate,
  Achievement,
  Testimonial,
  Gallery,
  Settings,
  Theme,
  Seo,
} = require("../models");
const { Op } = require("sequelize");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { ok } = require("../utils/apiResponse");

// Read-only, unauthenticated endpoints consumed by the public portfolio
// (frontend/src/pages/*). Only published/active rows are exposed; draft
// content stays admin-only via the /api/projects etc. authenticated routes.

const projects = asyncHandler(async (req, res) => {
  const rows = await Project.findAll({ where: { status: "published" }, order: [["order", "ASC"], ["id", "DESC"]] });
  ok(res, rows);
});

const projectBySlug = asyncHandler(async (req, res) => {
  const row = await Project.findOne({ where: { slug: req.params.slug, status: "published" } });
  if (!row) throw new ApiError(404, "Project not found.");
  row.views += 1;
  await row.save();
  ok(res, row);
});

const blogs = asyncHandler(async (req, res) => {
  const rows = await Blog.findAll({ where: { status: "published" }, order: [["publishedAt", "DESC"]] });
  ok(res, rows);
});

const blogBySlug = asyncHandler(async (req, res) => {
  const row = await Blog.findOne({ where: { slug: req.params.slug, status: "published" } });
  if (!row) throw new ApiError(404, "Blog post not found.");
  row.views += 1;
  await row.save();
  ok(res, row);
});

const services = asyncHandler(async (req, res) => {
  const rows = await Service.findAll({ where: { status: "active" }, order: [["order", "ASC"]] });
  ok(res, rows);
});

const skills = asyncHandler(async (req, res) => {
  const rows = await Skill.findAll({ order: [["order", "ASC"]] });
  ok(res, rows);
});

const education = asyncHandler(async (req, res) => {
  const rows = await Education.findAll({ order: [["order", "ASC"]] });
  ok(res, rows);
});

const experience = asyncHandler(async (req, res) => {
  const rows = await Experience.findAll({ order: [["order", "ASC"]] });
  ok(res, rows);
});

const certificates = asyncHandler(async (req, res) => {
  const rows = await Certificate.findAll({ order: [["order", "ASC"]] });
  ok(res, rows);
});

const certificateBySlug = asyncHandler(async (req, res) => {
  const row = await Certificate.findOne({ where: { slug: req.params.slug } });
  if (!row) throw new ApiError(404, "Certificate not found.");
  ok(res, row);
});

const achievements = asyncHandler(async (req, res) => {
  const rows = await Achievement.findAll({ order: [["order", "ASC"]] });
  ok(res, rows);
});

const achievementBySlug = asyncHandler(async (req, res) => {
  const row = await Achievement.findOne({ where: { slug: req.params.slug } });
  if (!row) throw new ApiError(404, "Achievement not found.");
  ok(res, row);
});

const testimonials = asyncHandler(async (req, res) => {
  const rows = await Testimonial.findAll({ where: { status: "published" }, order: [["order", "ASC"]] });
  ok(res, rows);
});

const gallery = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 12, 100);
  const offset = (page - 1) * limit;

  const where = { status: "Active" };
  if (req.query.category && req.query.category !== "all") where.category = req.query.category;
  if (req.query.q) {
    where[Op.or] = [
      { title: { [Op.like]: `%${req.query.q}%` } },
      { shortDescription: { [Op.like]: `%${req.query.q}%` } },
    ];
  }
  if (req.query.featured !== undefined) where.featured = req.query.featured === "true";

  const { rows, count } = await Gallery.findAndCountAll({
    where,
    order: [["displayOrder", "ASC"], ["id", "DESC"]],
    limit,
    offset,
  });

  ok(res, rows, {
    pagination: { page, limit, total: count, totalPages: Math.max(Math.ceil(count / limit), 1) },
  });
});

const galleryCategories = asyncHandler(async (req, res) => {
  const rows = await Gallery.findAll({
    where: { status: "Active" },
    attributes: [[Gallery.sequelize.fn("DISTINCT", Gallery.sequelize.col("category")), "category"]],
    order: [["category", "ASC"]],
  });
  ok(res, rows.map((r) => r.category).filter(Boolean));
});

const galleryBySlug = asyncHandler(async (req, res) => {
  const row = await Gallery.findOne({ where: { slug: req.params.slug, status: "Active" } });
  if (!row) throw new ApiError(404, "Gallery item not found.");

  const related = await Gallery.findAll({
    where: { category: row.category, status: "Active", id: { [Op.ne]: row.id } },
    order: [["displayOrder", "ASC"]],
    limit: 4,
  });

  ok(res, { ...row.toJSON(), related });
});

const settings = asyncHandler(async (req, res) => {
  const [row] = await Settings.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
  ok(res, row);
});

const theme = asyncHandler(async (req, res) => {
  const [row] = await Theme.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
  ok(res, row);
});

const seoByPage = asyncHandler(async (req, res) => {
  const row = await Seo.findOne({ where: { page: req.params.page } });
  ok(res, row || null); // frontend should fall back to sane defaults when null
});

// Single aggregated payload for the /resume page. Pulls from the same
// tables every other public endpoint already reads (no schema changes) so
// the resume stays 100% dynamic and in sync with the rest of the CMS
// content an admin manages elsewhere. One round trip instead of seven.
const resume = asyncHandler(async (req, res) => {
  const [settingsRow] = await Settings.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });

  const [
    experienceRows,
    educationRows,
    skillRows,
    certificateRows,
    achievementRows,
    projectRows,
  ] = await Promise.all([
    Experience.findAll({ order: [["order", "ASC"]] }),
    Education.findAll({ order: [["order", "ASC"]] }),
    Skill.findAll({ order: [["order", "ASC"]] }),
    Certificate.findAll({ order: [["order", "ASC"]] }),
    Achievement.findAll({ order: [["order", "ASC"]] }),
    Project.findAll({
      where: { status: "published" },
      order: [["order", "ASC"], ["id", "DESC"]],
      limit: 6,
    }),
  ]);

  ok(res, {
    settings: settingsRow,
    experience: experienceRows,
    education: educationRows,
    skills: skillRows,
    certificates: certificateRows,
    achievements: achievementRows,
    projects: projectRows,
  });
});

module.exports = {
  projects,
  projectBySlug,
  blogs,
  blogBySlug,
  services,
  skills,
  education,
  experience,
  certificates,
  certificateBySlug,
  achievements,
  achievementBySlug,
  testimonials,
  gallery,
  galleryCategories,
  galleryBySlug,
  settings,
  theme,
  seoByPage,
  resume,
};
