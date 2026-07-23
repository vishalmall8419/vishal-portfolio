const { Op } = require("sequelize");
const { Notification } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { ok, noContent } = require("../utils/apiResponse");

// Admin: paginated notification history (newest first).
const list = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  const offset = (page - 1) * limit;

  const where = {};
  if (req.query.isRead === "false") where.isRead = false;
  if (req.query.isRead === "true") where.isRead = true;
  if (req.query.q) {
    where[Op.or] = ["title", "body"].map((f) => ({ [f]: { [Op.like]: `%${req.query.q}%` } }));
  }

  const { rows, count } = await Notification.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  ok(res, rows, {
    pagination: { page, limit, total: count, totalPages: Math.max(Math.ceil(count / limit), 1) },
  });
});

const unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.count({ where: { isRead: false } });
  ok(res, { count });
});

const markRead = asyncHandler(async (req, res) => {
  const row = await Notification.findByPk(req.params.id);
  if (!row) throw new ApiError(404, "Notification not found.");
  if (!row.isRead) {
    row.isRead = true;
    await row.save();
  }
  ok(res, row);
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.update({ isRead: true }, { where: { isRead: false } });
  ok(res, null);
});

const remove = asyncHandler(async (req, res) => {
  const row = await Notification.findByPk(req.params.id);
  if (!row) throw new ApiError(404, "Notification not found.");
  await row.destroy();
  noContent(res);
});

module.exports = { list, unreadCount, markRead, markAllRead, remove };
