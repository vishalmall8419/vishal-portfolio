const { Op } = require("sequelize");
const { Message } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { ok, created, noContent } = require("../utils/apiResponse");
const { notifyNewContactMessage } = require("../services/notificationService");

// Public: called from the portfolio's Contact form.
const submit = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    throw new ApiError(400, "Name, email, and message are required.");
  }
  const row = await Message.create({ name, email, phone, subject, message });

  // Admin notification (DB record + email to the admin inbox). Never let a
  // notification failure fail the visitor's contact-form submission.
  try {
    await notifyNewContactMessage(row, req);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[messagesController] Failed to create admin notification:", err.message);
  }

  created(res, { id: row.id });
});

// Admin: paginated inbox with search over name/email/subject.
const list = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  const offset = (page - 1) * limit;

  const where = {};
  if (req.query.q) {
    where[Op.or] = ["name", "email", "subject"].map((f) => ({ [f]: { [Op.like]: `%${req.query.q}%` } }));
  }

  const { rows, count } = await Message.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  ok(res, rows, {
    pagination: { page, limit, total: count, totalPages: Math.max(Math.ceil(count / limit), 1) },
  });
});

const getOne = asyncHandler(async (req, res) => {
  const row = await Message.findByPk(req.params.id);
  if (!row) throw new ApiError(404, "Message not found.");
  if (!row.isRead) {
    row.isRead = true;
    await row.save();
  }
  ok(res, row);
});

const unreadCount = asyncHandler(async (req, res) => {
  const count = await Message.count({ where: { isRead: false } });
  ok(res, { count });
});

const toggleRead = asyncHandler(async (req, res) => {
  const row = await Message.findByPk(req.params.id);
  if (!row) throw new ApiError(404, "Message not found.");
  row.isRead = !row.isRead;
  await row.save();
  ok(res, row);
});

const toggleReplied = asyncHandler(async (req, res) => {
  const row = await Message.findByPk(req.params.id);
  if (!row) throw new ApiError(404, "Message not found.");
  row.isReplied = !row.isReplied;
  await row.save();
  ok(res, row);
});

const remove = asyncHandler(async (req, res) => {
  const row = await Message.findByPk(req.params.id);
  if (!row) throw new ApiError(404, "Message not found.");
  await row.destroy();
  noContent(res);
});

module.exports = { submit, list, getOne, unreadCount, toggleRead, toggleReplied, remove };
