const express = require("express");
const notificationsController = require("../controllers/notificationsController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);
router.get("/", notificationsController.list);
router.get("/unread-count", notificationsController.unreadCount);
router.patch("/read-all", notificationsController.markAllRead);
router.patch("/:id/read", notificationsController.markRead);
router.delete("/:id", notificationsController.remove);

module.exports = router;
