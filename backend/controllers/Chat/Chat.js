import Conversation from '../../models/Chat.models.js';
import Message from '../../models/Messege.model.js';
import User from '../../models/User.models.js';

export async function getConversations (req, res) {
  try {
    const conversations = await Conversation.find({
      members: req.userId
    })
      .populate('members', 'username profile.name profile.profileImage')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export async function createOrGetConversation (req, res) {
  try {
    const { userId } = req.body;

    if (userId === req.userId) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    let conversation = await Conversation.findOne({
      members: { $all: [req.userId, userId], $size: 2 }
    })
      .populate('members', 'username profile.name profile.profileImage')
      .populate('lastMessage');

    if (conversation) {
      return res.json({ conversation });
    }

    conversation = new Conversation({
      members: [req.userId, userId]
    });

    await conversation.save();

    await User.updateMany(
      { _id: { $in: [req.userId, userId] } },
      { $push: { conversations: conversation._id } }
    );

    conversation = await Conversation.findById(conversation._id)
      .populate('members', 'username profile.name profile.profileImage');

    res.status(201).json({ conversation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export async function getMessages (req, res) {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: req.userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'username profile.name profile.profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({ messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export async function  sendMessage (req, res) {
  try {
    const { conversationId, content, type = 'text' } = req.body;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: req.userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const message = new Message({
      sender: req.userId,
      conversation: conversationId,
      content,
      type
    });

    await message.save();

    conversation.lastMessage = message._id;
    conversation.messages.push(message._id);
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username profile.name profile.profileImage');

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


