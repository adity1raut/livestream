import jwt from 'jsonwebtoken';
import Message from '../models/Messege.model.js';
import Conversation from '../models/Chat.models.js';
import User from '../models/User.models.js';

const connectedUsers = new Map();

const setupSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token ||
        socket.request.headers?.cookie
          ?.split(';')
          ?.find(c => c.trim().startsWith('token='))
          ?.split('=')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add user info to socket object (matching your HTTP middleware)
      socket.userId = decoded.id; // Using 'id' instead of 'userId' to match your token structure
      socket.user = decoded;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);

      if (error.name === 'TokenExpiredError') {
        return next(new Error('Authentication error: Token expired'));
      }

      if (error.name === 'JsonWebTokenError') {
        return next(new Error('Authentication error: Invalid token'));
      }

      return next(new Error('Authentication error: Server error'));
    }
  });

  io.on('connection', async (socket) => {
    try {
      // Store connected user
      connectedUsers.set(socket.userId, socket.id);

      // Update user's online status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: true,
        lastSeen: new Date()
      });

      console.log(`User ${socket.userId} connected`);

      // Join user's conversation rooms
      const user = await User.findById(socket.userId).populate('conversations');
      user.conversations.forEach(conv => {
        socket.join(conv._id.toString());
      });

      // Handle joining a conversation room
      socket.on('join-conversation', (conversationId) => {
        socket.join(conversationId);
      });

      // Handle leaving a conversation room
      socket.on('leave-conversation', (conversationId) => {
        socket.leave(conversationId);
      });

      // Handle sending messages
      // Handle sending messages
      socket.on('send-message', async (data) => {
        try {
          const { conversationId, content, type = 'text' } = data;

          // Add validation for required fields
          if (!conversationId) {
            socket.emit('error', { message: 'Conversation ID is required' });
            return;
          }

          if (!content || content.trim() === '') {
            socket.emit('error', { message: 'Message content is required' });
            return;
          }

          // Verify user is member of conversation
          const conversation = await Conversation.findOne({
            _id: conversationId,
            members: socket.userId
          });

          if (!conversation) {
            socket.emit('error', { message: 'Conversation not found' });
            return;
          }

          // Create message - Fix the field name here
          const message = new Message({
            sender: socket.userId,
            conversationId: conversationId,  // ← Changed from 'conversation' to 'conversationId'
            content: content.trim(),
            type
          });

          await message.save();

          // Update conversation
          conversation.lastMessage = message._id;
          conversation.messages.push(message._id);
          await conversation.save();

          // Populate message
          const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username profile.name profile.profileImage');

          // Emit to conversation room
          io.to(conversationId).emit('new-message', populatedMessage);

          // Emit conversation update to all members
          const updatedConversation = await Conversation.findById(conversationId)
            .populate('members', 'username profile.name profile.profileImage')
            .populate('lastMessage');

          conversation.members.forEach(memberId => {
            const memberSocketId = connectedUsers.get(memberId.toString());
            if (memberSocketId) {
              io.to(memberSocketId).emit('conversation-updated', updatedConversation);
            }
          });

        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing-start', (conversationId) => {
        socket.to(conversationId).emit('user-typing', {
          userId: socket.userId,
          conversationId
        });
      });

      socket.on('typing-stop', (conversationId) => {
        socket.to(conversationId).emit('user-stop-typing', {
          userId: socket.userId,
          conversationId
        });
      });

      // Handle message read status
      socket.on('mark-as-read', async (data) => {
        try {
          const { messageId, conversationId } = data;

          await Message.findByIdAndUpdate(messageId, {
            $addToSet: {
              readBy: {
                user: socket.userId,
                readAt: new Date()
              }
            }
          });

          socket.to(conversationId).emit('message-read', {
            messageId,
            userId: socket.userId
          });
        } catch (error) {
          console.error('Error marking message as read:', error);
          socket.emit('error', { message: 'Failed to mark message as read' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        try {
          connectedUsers.delete(socket.userId);

          // Update user's offline status
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date()
          });

          console.log(`User ${socket.userId} disconnected`);
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      });

    } catch (error) {
      console.error('Socket connection error:', error);
      socket.disconnect();
    }
  });
};

export default setupSocketHandlers;