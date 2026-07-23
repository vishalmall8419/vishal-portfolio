const express = require("express");
const messagesController = require("../controllers/messagesController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);
router.get("/", messagesController.list);
router.get("/unread-count", messagesController.unreadCount);
router.get("/:id", messagesController.getOne);
router.patch("/:id/read", messagesController.toggleRead);
router.patch("/:id/replied", messagesController.toggleReplied);
router.delete("/:id", messagesController.remove);

module.exports = router;
