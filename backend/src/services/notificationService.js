const { Notification } = require("../models");
const { sendMail, escapeHtml } = require("../utils/email");
const { renderEmailTemplate } = require("../utils/emailTemplate");

// Fixed recipient for contact-form alerts, per spec. Overridable via env so
// this doesn't have to be a code change if the inbox ever moves.
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "vishal.mall02@outlook.com";
const OWNER_NAME = process.env.ADMIN_NAME || "Vishal Mall";

const clientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.ip || req.connection?.remoteAddress || null;
};

const buildAdminContactEmail = (message, { ip, userAgent, date, time }) => {
  const row = (label, value) =>
    `<tr><td style="padding:6px 12px;color:#666;font-weight:600;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:6px 12px;color:#333;">${escapeHtml(value || "N/A")}</td></tr>`;

  const bodyHtml = `
    <p style="margin:0 0 16px;">You have a new message from your portfolio's contact form.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #eee;font-size:14px;">
      ${row("Name", message.name)}
      ${row("Email", message.email)}
      ${row("Phone", message.phone)}
      ${row("Subject", message.subject)}
      ${row("Message", message.message)}
      ${row("Date", date)}
      ${row("Time", time)}
      ${row("IP Address", ip)}
      ${row("Device / Browser", userAgent)}
    </table>
  `;

  const html = renderEmailTemplate({
    preheader: `New message from ${message.name}`,
    heading: "New Contact Form Submission",
    bodyHtml,
  });

  const text = [
    "New Contact Form Submission",
    `Name: ${message.name || "N/A"}`,
    `Email: ${message.email || "N/A"}`,
    `Phone: ${message.phone || "N/A"}`,
    `Subject: ${message.subject || "N/A"}`,
    `Message: ${message.message || "N/A"}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `IP Address: ${ip || "N/A"}`,
    `User Agent: ${userAgent || "N/A"}`,
  ].join("\n");

  return { html, text };
};

const buildVisitorConfirmationEmail = (message) => {
  const firstName = (message.name || "there").split(" ")[0];

  const bodyHtml = `
    <p style="margin:0 0 14px;">Hello ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 14px;">Thank you for contacting me. Your message has been received successfully.</p>
    <p style="margin:0 0 14px;">I'll get back to you as soon as possible.</p>
    <p style="margin:24px 0 0;">Regards,<br />${escapeHtml(OWNER_NAME)}</p>
  `;

  const html = renderEmailTemplate({
    preheader: "Your message has been received.",
    heading: "Thanks for reaching out!",
    bodyHtml,
  });

  const text = [
    `Hello ${firstName},`,
    "",
    "Thank you for contacting me. Your message has been received successfully.",
    "I'll get back to you as soon as possible.",
    "",
    `Regards,`,
    OWNER_NAME,
  ].join("\n");

  return { html, text };
};

/**
 * Called right after a Message row is created from the public Contact form.
 * 1) Saves a Notification row (drives the admin bell / unread count / history).
 * 2) Emails the full submission (with IP/user-agent/date/time) to the admin inbox.
 * 3) Emails the visitor a confirmation that their message was received.
 * Both emails are fire-and-forget -- a slow/broken SMTP server must never
 * fail or delay the visitor's contact-form submission, and one email
 * failing must never block the other from being attempted.
 */
const notifyNewContactMessage = async (message, req) => {
  const ip = clientIp(req);
  const userAgent = req.headers["user-agent"] || null;
  const now = new Date();

  const notification = await Notification.create({
    type: "contact_message",
    title: `New message from ${message.name}`,
    body: message.subject || (message.message || "").slice(0, 120),
    meta: {
      messageId: message.id,
      name: message.name,
      email: message.email,
      phone: message.phone,
      subject: message.subject,
      ip,
      userAgent,
    },
  });

  const { html: adminHtml, text: adminText } = buildAdminContactEmail(message, {
    ip,
    userAgent,
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
  });

  sendMail({
    to: ADMIN_NOTIFY_EMAIL,
    subject: `New Contact Form Message — ${message.name}`,
    html: adminHtml,
    text: adminText,
    category: "contact_admin",
  })
    .then(async (result) => {
      if (!result?.skipped) {
        notification.emailSent = true;
        await notification.save();
      }
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[notificationService] Failed to email admin about new message:", err.message);
    });

  if (message.email) {
    const { html: visitorHtml, text: visitorText } = buildVisitorConfirmationEmail(message);
    sendMail({
      to: message.email,
      subject: "Thanks for reaching out!",
      html: visitorHtml,
      text: visitorText,
      category: "contact_visitor",
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[notificationService] Failed to email visitor confirmation:", err.message);
    });
  }

  return notification;
};

module.exports = { notifyNewContactMessage, ADMIN_NOTIFY_EMAIL };
