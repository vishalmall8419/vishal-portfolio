const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { authLimiter, otpLimiter } = require("../middleware/rateLimit");

const router = express.Router();

// Step 1 of login: email + password. Returns an otpToken instead of a
// session — see authController.login.
router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validate,
  authController.login
);

// Step 2 of login: the emailed OTP code. Only this issues a real session.
router.post(
  "/verify-otp",
  otpLimiter,
  [
    body("otpToken").notEmpty().withMessage("OTP token is required."),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("A valid 6-digit code is required."),
  ],
  validate,
  authController.verifyOtp
);

router.post(
  "/resend-otp",
  otpLimiter,
  [body("otpToken").notEmpty().withMessage("OTP token is required.")],
  validate,
  authController.resendOtp
);

router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);

router.put(
  "/change-password",
  requireAuth,
  [
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters."),
  ],
  validate,
  authController.changePassword
);

module.exports = router;
