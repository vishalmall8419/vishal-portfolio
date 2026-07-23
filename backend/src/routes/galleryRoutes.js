const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { galleryUpload } = require("../middleware/cloudinaryUpload");
const galleryController = require("../controllers/galleryController");

const router = express.Router();

const fileMiddleware = galleryUpload.fields([
  { name: "image", maxCount: 1 },
  { name: "galleryImages", maxCount: 10 },
]);

router.use(requireAuth);
router.get("/categories", galleryController.categories);
router.get("/", galleryController.list);
router.get("/:id", galleryController.getOne);
router.post("/", fileMiddleware, galleryController.create);
router.put("/:id", fileMiddleware, galleryController.update);
router.delete("/:id", galleryController.remove);

module.exports = router;
