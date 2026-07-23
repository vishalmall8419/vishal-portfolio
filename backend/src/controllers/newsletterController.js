const { Op } = require("sequelize");
const { Newsletter } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { ok, created, noContent } = require("../utils/apiResponse");
const { sendMail } = require("../utils/email");
const { renderEmailTemplate } = require("../utils/emailTemplate");

const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "vishal.mall02@outlook.com";

const clientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.ip || req.connection?.remoteAddress || null;
};

// Public: called from the footer subscription form.
const subscribe = asyncHandler(async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "Please enter a valid email address.");
  }

  const existing = await Newsletter.findOne({ where: { email } });
  if (existing) {
    if (existing.status === "unsubscribed") {
      existing.status = "subscribed";
      await existing.save();
      sendSubscriptionEmails(existing);
      return ok(res, { id: existing.id }, {}, 200);
    }
    // Already subscribed — treat as a friendly success, not an error, so a
    // visitor re-submitting doesn't see a confusing failure state. No email
    // is re-sent here since nothing actually changed for this address.
    return ok(res, { id: existing.id }, {}, 200);
  }

  const row = await Newsletter.create({
    email,
    source: req.body.source || "footer",
    ip: clientIp(req),
  });
  sendSubscriptionEmails(row);
  created(res, { id: row.id });
});

// Fire-and-forget: a slow/broken SMTP server must never fail or delay the
// visitor's subscribe request, and the subscriber-confirmation and
// admin-notification emails must never block each other.
function sendSubscriptionEmails(subscriber) {
  const confirmHtml = renderEmailTemplate({
    preheader: "You're subscribed!",
    heading: "You're on the list! 🎉",
    bodyHtml: `
      <p style="margin:0 0 14px;">Thanks for subscribing to the newsletter.</p>
      <p style="margin:0 0 14px;">You'll get an email whenever a new post goes live — no spam, unsubscribe anytime.</p>
    `,
  });
  sendMail({
    to: subscriber.email,
    subject: "You're subscribed!",
    html: confirmHtml,
    text: "Thanks for subscribing! You'll get an email whenever a new post goes live.",
    category: "newsletter_confirm",
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[newsletterController] Failed to email subscriber confirmation:", err.message);
  });

  const adminHtml = renderEmailTemplate({
    preheader: `New subscriber: ${subscriber.email}`,
    heading: "New Newsletter Subscriber",
    bodyHtml: `<p style="margin:0;">${subscriber.email} just subscribed (source: ${subscriber.source || "footer"}).</p>`,
  });
  sendMail({
    to: ADMIN_NOTIFY_EMAIL,
    subject: `New newsletter subscriber — ${subscriber.email}`,
    html: adminHtml,
    text: `${subscriber.email} just subscribed (source: ${subscriber.source || "footer"}).`,
    category: "newsletter_admin",
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[newsletterController] Failed to email admin about new subscriber:", err.message);
  });
}

// Admin: paginated subscriber list with search over email.
const list = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  const offset = (page - 1) * limit;

  const where = {};
  if (req.query.q) {
    where.email = { [Op.like]: `%${req.query.q}%` };
  }
  if (req.query.status) {
    where.status = req.query.status;
  }

  const { rows, count } = await Newsletter.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  ok(res, rows, {
    pagination: { page, limit, total: count, totalPages: Math.max(Math.ceil(count / limit), 1) },
  });
});

const toggleStatus = asyncHandler(async (req, res) => {
  const row = await Newsletter.findByPk(req.params.id);
  if (!row) throw new ApiError(404, "Subscriber not found.");
  row.status = row.status === "subscribed" ? "unsubscribed" : "subscribed";
  await row.save();
  ok(res, row);
});

const remove = asyncHandler(async (req, res) => {
  const row = await Newsletter.findByPk(req.params.id);
  if (!row) throw new ApiError(404, "Subscriber not found.");
  await row.destroy();
  noContent(res);
});

// Escapes a single CSV field: wraps in quotes and doubles any inner quotes
// whenever the value contains a comma, quote, or newline.
const csvField = (value) => {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const exportCsv = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;

  const rows = await Newsletter.findAll({ where, order: [["createdAt", "DESC"]] });

  const header = ["Email", "Status", "Source", "Subscribed At"];
  const lines = [header.map(csvField).join(",")];
  for (const row of rows) {
    lines.push(
      [row.email, row.status, row.source, row.createdAt.toISOString()].map(csvField).join(",")
    );
  }
  const csv = lines.join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="newsletter-subscribers.csv"`);
  res.send(csv);
});

module.exports = { subscribe, list, toggleStatus, remove, exportCsv };
