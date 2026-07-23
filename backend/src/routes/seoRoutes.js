const express = require("express");
const seoController = require("../controllers/seoController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);
router.get("/", seoController.list);
router.get("/:page", seoController.getByPage);
router.put("/:page", seoController.save);
router.delete("/:page", seoController.remove);

module.exports = router;
