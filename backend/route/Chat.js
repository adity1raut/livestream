import express from 'express';
import { searchUsers, getUserProfile } from '../controllers/Chat/Search.js';
import authenticateToken from '../middleware/Auth.js';
import { getConversations, createOrGetConversation, getMessages, sendMessage }  from "../controllers/Chat/Chat.js";

const router = express.Router();

router.get('/conversations', authenticateToken, getConversations);
router.post('/conversations', authenticateToken, createOrGetConversation);
router.get('/conversations/:conversationId/messages', authenticateToken, getMessages);
router.post('/messages', authenticateToken, sendMessage);
router.get('/search', authenticateToken, searchUsers);
router.get('/:userId', authenticateToken, getUserProfile);

export default router;
