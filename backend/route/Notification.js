import express from "express";
import authenticateToken from "../middleware/Auth.js";
import {
  getNotification,
  unreadNotification,
  markNotification,
  readAll,
  deleteNotification,
} from "../controllers/Notification/Notification.js";

const router = express.Router();

router.get("/", authenticateToken, getNotification);
router.get("/unread-count", authenticateToken, unreadNotification);
router.put("/:id/read", authenticateToken, markNotification);
router.put("/read-all", authenticateToken, readAll);
router.put("/:id", authenticateToken, deleteNotification);

export default router;
