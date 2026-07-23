const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const OTP_LENGTH = 6;
const OTP_EXPIRES_MIN = parseInt(process.env.OTP_EXPIRES_MIN, 10) || 5;
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5;
const OTP_RESEND_COOLDOWN_SEC = parseInt(process.env.OTP_RESEND_COOLDOWN_SEC, 10) || 30;

// Cryptographically secure 6-digit numeric code (000000–999999, zero-padded).
const generateOtp = () => crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");

const hashOtp = (otp) => bcrypt.hash(otp, 10);

const verifyOtp = (otp, hash) => bcrypt.compare(otp, hash);

const expiryDate = () => new Date(Date.now() + OTP_EXPIRES_MIN * 60 * 1000);

module.exports = {
  OTP_LENGTH,
  OTP_EXPIRES_MIN,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SEC,
  generateOtp,
  hashOtp,
  verifyOtp,
  expiryDate,
};
