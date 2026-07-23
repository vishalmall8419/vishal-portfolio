const rateLimit = require("express-rate-limit");

// Generic API limiter — generous, just to blunt scraping/abuse.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down." },
});

// Tight limiter for auth endpoints to slow down brute-force login attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Try again later." },
});

// Contact form limiter — prevents spam floods on the public endpoint.
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many messages sent. Please try again later." },
});

// Newsletter signup limiter — same spirit as the contact form limiter.
const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many subscribe attempts. Please try again later." },
});

// AI Assistant limiter -- generous since it's just local search, but still
// capped to stop someone from hammering the endpoint.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many questions at once. Please slow down a little." },
});

// OTP verify/resend limiter — blunts brute-forcing the 6-digit login code.
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many OTP attempts. Please try again later." },
});

module.exports = { apiLimiter, authLimiter, contactLimiter, newsletterLimiter, aiLimiter, otpLimiter };
