const express = require("express");
const settingsController = require("../controllers/settingsController");
const { requireAuth } = require("../middleware/auth");
const { settingsUpload } = require("../middleware/cloudinaryUpload");

const router = express.Router();

router.use(requireAuth);
router.get("/", settingsController.get);
router.put("/", settingsController.update);
// Render's filesystem is ephemeral, so these go straight to Cloudinary via
// memory storage (see middleware/cloudinaryUpload.js) instead of disk.
router.put("/profile", settingsUpload.single("avatar"), settingsController.updateProfile);
// Frontend sends the file under a field name matching the :field param
// itself (e.g. fd.append("logo", file)), so we accept any single field here
// and the controller validates it against the URL param.
router.put("/upload/:field", settingsUpload.any(), settingsController.uploadAsset);

module.exports = router;