const nodemailer = require("nodemailer");

// Single shared transporter, created lazily so a missing SMTP config doesn't
// crash the app at boot — it only matters when an email actually needs to
// go out (contact notification, login OTP).
let transporter = null;

const isConfigured = () => !!process.env.SMTP_HOST;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports (STARTTLS)
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Lazily required to avoid a require-cycle at module-load time (models/index
// never imports utils/email, so this is safe, but requiring it up top would
// run before Sequelize models are fully defined in some boot orders).
const getEmailLogModel = () => require("../models").EmailLog;

const logAttempt = async ({ to, subject, category, status, attempts, error }) => {
  try {
    const EmailLog = getEmailLogModel();
    await EmailLog.create({ to, subject, category, status, attempts, error: error || null });
  } catch (logErr) {
    // The audit log is best-effort — never let a logging failure mask the
    // real send result or crash the caller.
    // eslint-disable-next-line no-console
    console.error("[email] Failed to write EmailLog:", logErr.message);
  }
};

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Sends an email. Never throws to the caller for a *missing config* —
 * it logs a warning instead, so local/dev environments without SMTP set up
 * don't crash the request that triggered the email (contact form, login).
 * Genuine send failures against a configured transport ARE thrown after
 * retries are exhausted, so callers that care (e.g. OTP delivery) can react;
 * fire-and-forget callers (contact/newsletter emails) just let the rejection
 * be logged and swallowed.
 *
 * Every attempt — sent, failed, or skipped — is written to EmailLog so a
 * broken send is visible without grepping server logs.
 */
const sendMail = async ({ to, subject, html, text, category }) => {
  if (!isConfigured()) {
    // eslint-disable-next-line no-console
    console.warn(
      `[email] SMTP not configured — skipped email "${subject}" to ${to}. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS in .env to enable sending.`
    );
    await logAttempt({ to, subject, category, status: "skipped", attempts: 0 });
    return { skipped: true };
  }

  const from = process.env.SMTP_FROM || `"Portfolio Admin" <${process.env.SMTP_USER || "no-reply@localhost"}>`;

  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const result = await getTransporter().sendMail({ from, to, subject, html, text });
      await logAttempt({ to, subject, category, status: "sent", attempts: attempt });
      return result;
    } catch (err) {
      lastError = err;
      // eslint-disable-next-line no-console
      console.error(`[email] Send attempt ${attempt}/${MAX_ATTEMPTS} failed for "${subject}" to ${to}:`, err.message);
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  await logAttempt({ to, subject, category, status: "failed", attempts: MAX_ATTEMPTS, error: lastError.message });
  throw lastError;
};

// Minimal HTML-escaping for values interpolated into email templates —
// these come straight from public, unauthenticated form submissions.
const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));

module.exports = { sendMail, isConfigured, escapeHtml };
