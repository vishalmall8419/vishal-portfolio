const { Op } = require("sequelize");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { ok, created, noContent } = require("../utils/apiResponse");
const { UPLOAD_DIR } = require("../middleware/upload");
const fs = require("fs");
const path = require("path");

/**
 * Builds { list, getOne, create, update, remove } handlers for a Sequelize
 * model, matching the REST contract the admin frontend's createResource()
 * client already expects (paginated list, JSON body or multipart create/update).
 *
 * @param {Model} model - Sequelize model
 * @param {object} opts
 * @param {string[]} opts.searchFields - columns matched by ?q= free-text search
 * @param {string} opts.orderBy - default sort column (falls back to "order" then "id")
 * @param {string[]} opts.fileFields - body fields that may arrive as uploaded files
 * @param {string[]} opts.jsonFields - body fields that arrive as JSON-stringified arrays/objects (multipart only)
 * @param {(body: object, req: Request) => object} opts.beforeSave - transform payload before create/update
 * @param {(row: Model, meta: {isNew: boolean, previousStatus?: string}, req: Request) => void} opts.afterSave - fire-and-forget side effect after a successful create/update (e.g. emailing subscribers when a blog goes live)
 */
function createCrudController(model, opts = {}) {
  const {
    searchFields = [],
    orderBy = "order",
    fileFields = [],
    jsonFields = [],
    beforeSave = (body) => body,
    afterSave = () => {},
  } = opts;

  const applyFileFields = (req) => {
    if (!req.files && !req.file) return;
    const files = req.files || (req.file ? [req.file] : []);
    fileFields.forEach((field) => {
      const match = Array.isArray(files) ? files.find((f) => f.fieldname === field) : files[field]?.[0];
      if (match) req.body[field] = `/uploads/${match.filename}`;
    });
  };

  const parseJsonFields = (body) => {
    jsonFields.forEach((field) => {
      if (typeof body[field] === "string") {
        try {
          body[field] = JSON.parse(body[field]);
        } catch (_) {
          // comma-separated fallback (matches the frontend's `toFormData` tag encoding)
          body[field] = body[field]
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
    });
    return body;
  };

  const deleteOldFile = (relativePath) => {
    if (!relativePath || !relativePath.startsWith("/uploads/")) return;
    const abs = path.join(UPLOAD_DIR, path.basename(relativePath));
    fs.unlink(abs, () => {}); // best-effort cleanup, never blocks the response
  };

  return {
    list: asyncHandler(async (req, res) => {
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
      const offset = (page - 1) * limit;

      const where = {};
      if (req.query.q && searchFields.length) {
        where[Op.or] = searchFields.map((f) => ({ [f]: { [Op.like]: `%${req.query.q}%` } }));
      }
      if (req.query.status) where.status = req.query.status;

      const order = [[orderBy, "ASC"], ["id", "DESC"]];

      const { rows, count } = await model.findAndCountAll({ where, order, limit, offset });

      ok(res, rows, {
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.max(Math.ceil(count / limit), 1),
        },
      });
    }),

    getOne: asyncHandler(async (req, res) => {
      const row = await model.findByPk(req.params.id);
      if (!row) throw new ApiError(404, "Record not found.");
      ok(res, row);
    }),

    create: asyncHandler(async (req, res) => {
      applyFileFields(req);
      const body = beforeSave(parseJsonFields({ ...req.body }), req);
      const row = await model.create(body);
      created(res, row);
      Promise.resolve(afterSave(row, { isNew: true }, req)).catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`[crud:${model.name}] afterSave hook failed:`, err.message);
      });
    }),

    update: asyncHandler(async (req, res) => {
      const row = await model.findByPk(req.params.id);
      if (!row) throw new ApiError(404, "Record not found.");

      applyFileFields(req);
      const body = beforeSave(parseJsonFields({ ...req.body }), req);
      const previousStatus = row.status;

      fileFields.forEach((field) => {
        if (body[field] && body[field] !== row[field]) deleteOldFile(row[field]);
      });

      await row.update(body);
      ok(res, row);
      Promise.resolve(afterSave(row, { isNew: false, previousStatus }, req)).catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`[crud:${model.name}] afterSave hook failed:`, err.message);
      });
    }),

    remove: asyncHandler(async (req, res) => {
      const row = await model.findByPk(req.params.id);
      if (!row) throw new ApiError(404, "Record not found.");
      fileFields.forEach((field) => deleteOldFile(row[field]));
      await row.destroy();
      noContent(res);
    }),
  };
}

module.exports = createCrudController;
