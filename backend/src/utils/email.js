const nodemailer = require("nodemailer");
const dns = require("dns");

// Single shared transporter, created lazily so a missing SMTP config doesn't
// crash the app at boot.
let transporter = null;

const isConfigured = () => !!process.env.SMTP_HOST;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === "true",

    // Force IPv4 to avoid ENETUNREACH IPv6 errors
    family: 4,

    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,

    tls: {
      rejectUnauthorized: false,
    },

    requireTLS: true,

    dnsLookup: (hostname, options, callback) => {
      dns.lookup(hostname, { family: 4 }, callback);
    },
  });

  return transporter;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Lazily required to avoid a require-cycle.
const getEmailLogModel = () => require("../models").EmailLog;

const logAttempt = async ({
  to,
  subject,
  category,
  status,
  attempts,
  error,
}) => {
  try {
    const EmailLog = getEmailLogModel();

    await EmailLog.create({
      to,
      subject,
      category,
      status,
      attempts,
      error: error || null,
    });
  } catch (logErr) {
    console.error("[email] Failed to write EmailLog:", logErr.message);
  }
};

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

const sendMail = async ({ to, subject, html, text, category }) => {
  if (!isConfigured()) {
    console.warn(
      `[email] SMTP not configured — skipped email "${subject}" to ${to}.`
    );

    await logAttempt({
      to,
      subject,
      category,
      status: "skipped",
      attempts: 0,
    });

    return { skipped: true };
  }

  const from =
    process.env.SMTP_FROM ||
    `"Portfolio Admin" <${process.env.SMTP_USER || "no-reply@localhost"}>`;

  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const result = await getTransporter().sendMail({
        from,
        to,
        subject,
        html,
        text,
      });

      await logAttempt({
        to,
        subject,
        category,
        status: "sent",
        attempts: attempt,
      });

      return result;
    } catch (err) {
      lastError = err;

      console.error(
        `[email] Send attempt ${attempt}/${MAX_ATTEMPTS} failed:`,
        err.message
      );

      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  await logAttempt({
    to,
    subject,
    category,
    status: "failed",
    attempts: MAX_ATTEMPTS,
    error: lastError.message,
  });

  throw lastError;
};

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));

module.exports = {
  sendMail,
  isConfigured,
  escapeHtml,
};