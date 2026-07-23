const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimit");

const router = express.Router();

// Direct Login (No OTP)
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

router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

router.get(
  "/me",
  requireAuth,
  authController.me
);

router.put(
  "/change-password",
  requireAuth,
  [
    body("currentPassword").notEmpty(),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters."),
  ],
  validate,
  authController.changePassword
);

module.exports = router;