import Conversation from '../../models/Chat.models.js';
import Message from '../../models/Messege.model.js';
import User from '../../models/User.models.js';
import Notification from '../../models/Notification.models.js';

export async function searchUsers (req, res) {
  try {
    const { query, type = 'username' } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    let searchQuery;
    if (type === 'username') {
      // Search by username
      searchQuery = {
        username: { $regex: query, $options: 'i' },
        _id: { $ne: req.user.id } // Exclude current user
      };
    } else {
      // Search by name
      searchQuery = {
        $or: [
          { 'profile.firstName': { $regex: query, $options: 'i' } },
          { 'profile.lastName': { $regex: query, $options: 'i' } },
          { 
            $expr: { 
              $regexMatch: { 
                input: { $concat: ['$profile.firstName', ' ', '$profile.lastName'] }, 
                regex: query, 
                options: 'i' 
              } 
            } 
          }
        ],
        _id: { $ne: req.user.id } // Exclude current user
      };
    }

    const users = await User.find(searchQuery)
      .select('username profile firstName lastName')
      .limit(10);

    res.json({
      success: true,
      users: users.map(user => ({
        _id: user._id,
        username: user.username,
        profile: {
          name: user.profile?.firstName || user.profile?.lastName 
            ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim()
            : null,
          profileImage: user.profile?.profileImage
        }
      }))
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during search'
    });
  }
};

// Get all conversations for the authenticated user
export async function getConversations (req, res) {
  try {
    const conversations = await Conversation.find({
      members: req.user.id
    })
    .populate('members', 'username profile firstName lastName')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get messages for a specific conversation
export async function getMessages  (req, res) {
  try {
    const { conversationId } = req.params;
    
    // Verify user is a member of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'username profile firstName lastName')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create a new conversation or get existing one
export async function createOrGetConversation (req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      members: { $all: [req.user.id, userId] }
    }).populate('members', 'username profile firstName lastName');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        members: [req.user.id, userId]
      });
      await conversation.save();
      
      // Populate the members field
      conversation = await Conversation.findById(conversation._id)
        .populate('members', 'username profile firstName lastName');
    }

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Send a message
export async function sendMessage (req, res)  {
  try {
    const { conversationId, content, type = 'text' } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID and content are required'
      });
    }

    // Verify user is a member of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: req.user.id
    }).populate('members', 'username profile firstName lastName');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Create new message
    const message = new Message({
      conversationId,
      sender: req.user.id,
      content,
      type
    });
    await message.save();

    // Update conversation's last message and timestamp
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Populate sender info
    await message.populate('sender', 'username profile firstName lastName');

    // Create notifications for other members
    const otherMembers = conversation.members.filter(member => 
      member._id.toString() !== req.user.id
    );

    const senderName = req.user.profile?.firstName 
      ? `${req.user.profile.firstName} ${req.user.profile.lastName || ''}`.trim()
      : req.user.username;

    const notifications = otherMembers.map(member => ({
      user: member._id,
      type: 'MESSAGE',
      message: `${senderName} sent you a message: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
      link: `/chat/${conversationId}`,
      isRead: false
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json({
      success: true,
      message,
      notifications: notifications.length
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
