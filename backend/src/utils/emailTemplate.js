// Shared responsive HTML shell for every outbound email (OTP, contact,
// newsletter, blog notifications). Centralizing this means one visual
// identity, and one place to fix a rendering quirk across all emails
// instead of patching each inline template separately.
//
// Kept to table-based layout + inline styles throughout -- this is an email
// client, not a browser: Outlook's Word-based renderer ignores most modern
// CSS (flexbox, grid, external/`<style>` blocks with media queries are
// unreliable), so tables + inline styles are still the only broadly
// compatible approach. The single `@media` block is a progressive
// enhancement for clients that do support it (Apple Mail, Gmail app, most
// mobile clients) and is simply ignored elsewhere without breaking layout.

const BRAND_NAME = process.env.SITE_NAME || "Vishal Mall";
const BRAND_URL = process.env.CLIENT_URL || "#";
const BRAND_PRIMARY = "#6C63FF";
const BRAND_DARK = "#0a0d1c";

const SOCIAL_LINKS = [
  { label: "Portfolio", url: BRAND_URL },
  { label: "GitHub", url: process.env.SOCIAL_GITHUB || null },
  { label: "LinkedIn", url: process.env.SOCIAL_LINKEDIN || null },
].filter((link) => link.url);

const socialLineHtml = () =>
  SOCIAL_LINKS.map(
    (link) => `<a href="${link.url}" style="color:#8a93a6;text-decoration:none;margin:0 8px;">${link.label}</a>`
  ).join("&nbsp;&middot;&nbsp;");

/**
 * @param {object} opts
 * @param {string} opts.preheader - Short hidden preview text shown in inbox lists.
 * @param {string} opts.heading - Main heading shown in the colored header bar.
 * @param {string} opts.bodyHtml - Pre-built inner HTML for the message body (already escaped by the caller).
 */
const renderEmailTemplate = ({ preheader = "", heading, bodyHtml }) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${heading}</title>
<style>
  @media (prefers-color-scheme: dark) {
    .email-bg { background-color: #0a0d1c !important; }
    .email-card { background-color: #12162a !important; }
    .email-text { color: #e7e9f3 !important; }
    .email-muted { color: #9aa3b8 !important; }
  }
  @media (max-width: 600px) {
    .email-container { width: 100% !important; }
    .email-padding { padding: 24px !important; }
  }
</style>
</head>
<body class="email-bg" style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
  <span style="display:none;font-size:1px;color:#f4f4f7;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" class="email-container" width="560" cellpadding="0" cellspacing="0"
          style="width:560px;max-width:92%;background-color:#ffffff;border-radius:14px;overflow:hidden;">

          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND_PRIMARY}, #00e5ff);padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#ffffff;font-size:20px;font-weight:700;">${BRAND_NAME}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="email-card email-padding" style="padding:36px 32px;">
              <h1 class="email-text" style="margin:0 0 16px;font-size:20px;color:#161b2e;">${heading}</h1>
              <div class="email-text" style="font-size:15px;line-height:1.65;color:#3a3f52;">
                ${bodyHtml}
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color:${BRAND_DARK};padding:24px 32px;text-align:center;">
              <p class="email-muted" style="margin:0 0 8px;font-size:12px;color:#9aa3b8;">
                ${socialLineHtml()}
              </p>
              <p style="margin:0;font-size:12px;color:#6b7488;">
                &copy; ${new Date().getFullYear()} ${BRAND_NAME}. This is an automated message — please don't reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

module.exports = { renderEmailTemplate };
