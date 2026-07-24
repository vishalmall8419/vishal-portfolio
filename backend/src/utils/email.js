const nodemailer = require("nodemailer");

// Single shared transporter, created lazily so a missing SMTP config doesn't
// crash the app at boot — it only matters when an email actually needs to
// go out (contact notification, login OTP).
let transporter = null;

const isConfigured = () => !!process.env.SMTP_HOST;

// Without explicit timeouts, nodemailer/Node's socket has no bound at all —
// if the SMTP host is unreachable, the port is filtered by the network, or
// the TLS/greeting handshake stalls, the connection hangs indefinitely
// instead of failing. That hang was propagating all the way up through
// sendMail() -> issueOtp() -> the /auth/login request, which is why the
// login endpoint could hang forever with no error. These bound every phase
// of the SMTP handshake so a bad connection fails in ~10s instead of never.
const SMTP_CONNECTION_TIMEOUT_MS = 10_000; // time to establish the TCP connection
const SMTP_GREETING_TIMEOUT_MS = 10_000; // time to wait for the SMTP greeting after connecting
const SMTP_SOCKET_TIMEOUT_MS = 15_000; // inactivity timeout once the connection is open

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports (STARTTLS)
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
    connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
    greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
    socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
    // Force IPv4. Node's DNS resolver may hand nodemailer an IPv6 address
    // for smtp-relay.brevo.com, and unlike a browser, nodemailer does not
    // retry on the other address family if that connection stalls — it
    // just times out. Pinning the family rules this out as a variable, so
    // any further "Connection timeout" can only be explained by the actual
    // network path (e.g. the hosting provider's outbound SMTP policy), not
    // by IPv6 resolution.
    family: 4,
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