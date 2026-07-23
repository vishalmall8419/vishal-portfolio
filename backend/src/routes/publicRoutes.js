const express = require("express");
const publicController = require("../controllers/publicController");
const messagesController = require("../controllers/messagesController");
const newsletterController = require("../controllers/newsletterController");
const githubController = require("../controllers/githubController");
const aiController = require("../controllers/aiController");
const { contactLimiter, newsletterLimiter, aiLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.get("/projects", publicController.projects);
router.get("/projects/:slug", publicController.projectBySlug);
router.get("/blogs", publicController.blogs);
router.get("/blogs/:slug", publicController.blogBySlug);
router.get("/services", publicController.services);
router.get("/skills", publicController.skills);
router.get("/education", publicController.education);
router.get("/experience", publicController.experience);
router.get("/certificates", publicController.certificates);
router.get("/certificates/:slug", publicController.certificateBySlug);
router.get("/achievements", publicController.achievements);
router.get("/achievements/:slug", publicController.achievementBySlug);
router.get("/testimonials", publicController.testimonials);
router.get("/gallery", publicController.gallery);
router.get("/gallery/categories", publicController.galleryCategories);
router.get("/gallery/:slug", publicController.galleryBySlug);
router.get("/resume", publicController.resume);
router.get("/settings", publicController.settings);
router.get("/theme", publicController.theme);
router.get("/seo/:page", publicController.seoByPage);
router.post("/contact", contactLimiter, messagesController.submit);
router.post("/newsletter/subscribe", newsletterLimiter, newsletterController.subscribe);
router.get("/github", githubController.profile);
router.get("/github/repos/:repo/readme", githubController.readme);
router.get("/ai/config", aiController.config);
router.post("/ai/ask", aiLimiter, aiController.ask);

module.exports = router;
