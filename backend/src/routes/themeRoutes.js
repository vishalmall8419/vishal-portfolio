const express = require("express");
const themeController = require("../controllers/themeController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);
router.get("/", themeController.get);
router.put("/", themeController.update);

module.exports = router;
