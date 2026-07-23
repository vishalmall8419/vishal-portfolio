const express = require("express");
const settingsController = require("../controllers/settingsController");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.use(requireAuth);
router.get("/", settingsController.get);
router.put("/", settingsController.update);
router.put("/profile", upload.single("avatar"), settingsController.updateProfile);
// Frontend sends the file under a field name matching the :field param
// itself (e.g. fd.append("logo", file)), so we accept any single field here
// and the controller validates it against the URL param.
router.put("/upload/:field", upload.any(), settingsController.uploadAsset);

module.exports = router;
