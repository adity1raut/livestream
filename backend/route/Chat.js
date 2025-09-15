import express from "express";
import authenticateToken from "../middleware/Auth.js";
import {
  getConversations,
  createOrGetConversation,
  getMessages,
  sendMessage,
  searchUsers,
} from "../controllers/Chat/Chat.js";

const router = express.Router();

router.get("/conversations", authenticateToken, getConversations);
router.post("/conversations", authenticateToken, createOrGetConversation);
router.get(
  "/conversations/:conversationId/messages",
  authenticateToken,
  getMessages,
);
router.post("/messages", authenticateToken, sendMessage);
router.get("/search", authenticateToken, searchUsers);

export default router;
