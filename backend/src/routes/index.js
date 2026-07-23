const express = require("express");
const buildCrudRouter = require("./buildCrudRouter");

const authRoutes = require("./authRoutes");
const messagesRoutes = require("./messagesRoutes");
const newsletterRoutes = require("./newsletterRoutes");
const seoRoutes = require("./seoRoutes");
const themeRoutes = require("./themeRoutes");
const settingsRoutes = require("./settingsRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const publicRoutes = require("./publicRoutes");
const notificationsRoutes = require("./notificationsRoutes");
const galleryRoutes = require("./galleryRoutes");

const projectsController = require("../controllers/projectsController");
const blogsController = require("../controllers/blogsController");
const servicesController = require("../controllers/servicesController");
const skillsController = require("../controllers/skillsController");
const educationController = require("../controllers/educationController");
const experienceController = require("../controllers/experienceController");
const certificatesController = require("../controllers/certificatesController");
const achievementsController = require("../controllers/achievementsController");
const testimonialsController = require("../controllers/testimonialsController");

const router = express.Router();

// --- Public, unauthenticated (consumed by the portfolio frontend) ---------
// Namespaced under /public so it never collides with the admin-only routes
// below that share the same resource names (e.g. admin GET /projects needs
// auth + drafts + pagination; public GET /public/projects is published-only).
router.use("/public", publicRoutes);

router.use("/auth", authRoutes);

// --- Admin-only content management (all behind requireAuth internally) --
router.use("/projects", buildCrudRouter(projectsController, ["image"]));
router.use("/blogs", buildCrudRouter(blogsController, ["coverImage"]));
router.use("/services", buildCrudRouter(servicesController, ["image", "icon"]));
router.use("/skills", buildCrudRouter(skillsController, ["icon"]));
router.use("/education", buildCrudRouter(educationController));
router.use("/experience", buildCrudRouter(experienceController));
router.use("/certificates", buildCrudRouter(certificatesController, ["image"]));
router.use("/achievements", buildCrudRouter(achievementsController, ["image"]));
router.use("/testimonials", buildCrudRouter(testimonialsController, ["photo"]));
router.use("/gallery", galleryRoutes);

router.use("/messages", messagesRoutes);
router.use("/newsletter", newsletterRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/seo", seoRoutes);
router.use("/theme", themeRoutes);
router.use("/settings", settingsRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;
