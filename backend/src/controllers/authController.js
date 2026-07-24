const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin, AdminOtp } = require("../models");
const { signAccessToken, signRefreshToken } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { ok } = require("../utils/apiResponse");
const { sendMail } = require("../utils/email");
const {
  generateOtp,
  hashOtp,
  verifyOtp: compareOtp,
  expiryDate,
  OTP_EXPIRES_MIN,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SEC,
} = require("../utils/otp");

const REFRESH_COOKIE = "refreshToken";
const cookieOptions = (rememberMe = false) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api/auth",
  // Omitting maxAge makes this a session cookie (cleared when the browser
  // closes) -- that's the whole point of an unchecked "Remember Me".
  ...(rememberMe
    ? { maxAge: (parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS, 10) || 30) * 24 * 60 * 60 * 1000 }
    : {}),
});

const OTP_PURPOSE = "login";
// Short-lived token that identifies "this admin already proved their
// password" for the OTP step, without re-exposing the password or issuing
// a real session yet. Signed with its own secret so it can never be
// mistaken for (or reused as) an access/refresh token.
const signOtpToken = (admin) =>
  jwt.sign({ sub: admin.id, purpose: OTP_PURPOSE }, process.env.JWT_OTP_SECRET, {
    expiresIn: `${OTP_EXPIRES_MIN + 5}m`, // a little longer than OTP validity so "expired OTP" is the message the user sees, not "invalid session"
  });

const verifyOtpToken = (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_OTP_SECRET);
    if (payload.purpose !== OTP_PURPOSE) throw new Error("wrong purpose");
    return payload;
  } catch (_) {
    throw new ApiError(401, "OTP session expired. Please log in again.");
  }
};

const otpEmailHtml = (otp) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;">
    <h2 style="color:#111;">Your Admin Login Code</h2>
    <p style="color:#555;">Use the code below to finish signing in. It expires in ${OTP_EXPIRES_MIN} minutes.</p>
    <div style="font-size:32px;font-weight:700;letter-spacing:8px;background:#f5f5f5;padding:16px 24px;border-radius:8px;text-align:center;margin:20px 0;">${otp}</div>
    <p style="color:#999;font-size:13px;">If you didn't try to log in, you can safely ignore this email.</p>
  </div>
`;

// Invalidates any still-usable OTPs for this admin, generates + stores a
// fresh one (hashed), and emails it.
const issueOtp = async (admin) => {
  await AdminOtp.update(
    { consumed: true },
    { where: { adminId: admin.id, purpose: OTP_PURPOSE, consumed: false } }
  );

  const otp = generateOtp();
  await AdminOtp.create({
    adminId: admin.id,
    purpose: OTP_PURPOSE,
    otpHash: await hashOtp(otp),
    expiresAt: expiryDate(),
    lastSentAt: new Date(),
  });

  // Intentionally NOT awaited: the OTP is already generated and persisted
  // above, which is all /auth/login needs to respond successfully. Awaiting
  // the SMTP send here would tie the HTTP response to an external network
  // call — if Brevo (or the network path to it) is slow or unreachable, the
  // whole login request would hang until the platform/browser force-closes
  // it. sendMail() already retries internally and writes every attempt
  // (sent/failed/skipped) to EmailLog, so failures are still fully visible,
  // they just no longer block the response.
  sendMail({
    to: admin.email,
    subject: "Your admin login verification code",
    html: otpEmailHtml(otp),
    text: `Your admin login code is ${otp}. It expires in ${OTP_EXPIRES_MIN} minutes.`,
    category: "admin_otp",
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.error(`[auth] Failed to email OTP to ${admin.email}:`, err.message);
  });
};

const sanitize = (admin) => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  phone: admin.phone,
  avatar: admin.avatar,
  role: admin.role,
});

const issueSession = async (res, admin, rememberMe = false) => {
  const token = signAccessToken(admin);
  const refreshToken = signRefreshToken(admin, rememberMe);
  admin.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await admin.save();
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(rememberMe));
  return token;
};

// Step 1: validate email + password. On success this does NOT log the admin
// in yet — it issues a short-lived otpToken and emails a 6-digit code that
// must be confirmed via /auth/verify-otp before a real session is created.
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ where: { email } });
  // Same error for missing user vs wrong password — avoids leaking which emails exist.
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  await issueOtp(admin);
  const otpToken = signOtpToken(admin);

  ok(res, {
    otpRequired: true,
    otpToken,
    email: admin.email,
    expiresIn: OTP_EXPIRES_MIN * 60,
  });
});

// Step 2: confirm the emailed OTP. Only on success is a real access +
// refresh token session issued — identical shape to the old direct-login
// response, so nothing downstream of a successful login had to change.
const verifyOtp = asyncHandler(async (req, res) => {
  const { otpToken, otp, rememberMe } = req.body;
  if (!otpToken || !otp) throw new ApiError(400, "OTP token and code are required.");

  const payload = verifyOtpToken(otpToken);
  const admin = await Admin.findByPk(payload.sub);
  if (!admin) throw new ApiError(401, "Admin not found.");

  const record = await AdminOtp.findOne({
    where: { adminId: admin.id, purpose: OTP_PURPOSE, consumed: false },
    order: [["createdAt", "DESC"]],
  });

  if (!record) throw new ApiError(401, "No active OTP. Please log in again.");
  if (new Date() > record.expiresAt) {
    record.consumed = true;
    await record.save();
    throw new ApiError(401, "OTP has expired. Please request a new code.");
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    record.consumed = true;
    await record.save();
    throw new ApiError(429, "Too many incorrect attempts. Please request a new code.");
  }

  const valid = await compareOtp(otp, record.otpHash);
  if (!valid) {
    record.attempts += 1;
    await record.save();
    const remaining = Math.max(OTP_MAX_ATTEMPTS - record.attempts, 0);
    throw new ApiError(401, `Incorrect code. ${remaining} attempt(s) remaining.`);
  }

  // Prevent OTP reuse: this exact record can never be used again.
  record.consumed = true;
  await record.save();

  const token = await issueSession(res, admin, rememberMe);
  ok(res, { token, admin: sanitize(admin) });
});

// Resend: invalidates any unused OTP and sends a fresh one, subject to a
// short cooldown so the email endpoint can't be hammered.
const resendOtp = asyncHandler(async (req, res) => {
  const { otpToken } = req.body;
  if (!otpToken) throw new ApiError(400, "OTP token is required.");

  const payload = verifyOtpToken(otpToken);
  const admin = await Admin.findByPk(payload.sub);
  if (!admin) throw new ApiError(401, "Admin not found.");

  const lastRecord = await AdminOtp.findOne({
    where: { adminId: admin.id, purpose: OTP_PURPOSE },
    order: [["createdAt", "DESC"]],
  });
  if (lastRecord?.lastSentAt) {
    const secondsSinceLast = (Date.now() - new Date(lastRecord.lastSentAt).getTime()) / 1000;
    if (secondsSinceLast < OTP_RESEND_COOLDOWN_SEC) {
      throw new ApiError(
        429,
        `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SEC - secondsSinceLast)}s before requesting another code.`
      );
    }
  }

  await issueOtp(admin);
  ok(res, { otpRequired: true, otpToken, email: admin.email, expiresIn: OTP_EXPIRES_MIN * 60 });
});

const me = asyncHandler(async (req, res) => {
  const admin = await Admin.findByPk(req.adminId);
  if (!admin) throw new ApiError(404, "Admin not found.");
  ok(res, sanitize(admin));
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new ApiError(401, "No refresh token provided.");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (_) {
    throw new ApiError(401, "Refresh token invalid or expired.");
  }

  const admin = await Admin.findByPk(payload.sub);
  if (!admin || !admin.refreshTokenHash || !(await bcrypt.compare(token, admin.refreshTokenHash))) {
    throw new ApiError(401, "Refresh token no longer valid.");
  }

  // Rotate: issue a brand new access + refresh token pair on every refresh,
  // carrying forward the same Remember Me persistence the admin originally
  // chose at login (encoded in the old token's "remember" claim).
  const newAccessToken = await issueSession(res, admin, payload.remember);
  ok(res, { token: newAccessToken });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const admin = await Admin.findByPk(payload.sub);
      if (admin) {
        admin.refreshTokenHash = null;
        await admin.save();
      }
    } catch (_) {
      /* token already invalid — nothing to revoke */
    }
  }
  res.clearCookie(REFRESH_COOKIE, {
    path: "/api/auth",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  ok(res, null);
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = await Admin.findByPk(req.adminId);
  if (!(await bcrypt.compare(currentPassword, admin.password))) {
    throw new ApiError(400, "Current password is incorrect.");
  }
  admin.password = await bcrypt.hash(newPassword, 12);
  await admin.save();
  ok(res, null);
});

module.exports = { login, verifyOtp, resendOtp, me, refresh, logout, changePassword };