const express = require("express");
const newsletterController = require("../controllers/newsletterController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);
router.get("/", newsletterController.list);
router.get("/export", newsletterController.exportCsv);
router.patch("/:id/status", newsletterController.toggleStatus);
router.delete("/:id", newsletterController.remove);

module.exports = router;
