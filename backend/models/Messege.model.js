import mongoose from "mongoose";

const MessageSchema = mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video'],
    default: 'text'
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ conversationId: 1, deleted: 1, createdAt: -1 });

// Virtual to check if message is read by a specific user
MessageSchema.virtual('isReadBy').get(function() {
  return (userId) => {
    return this.readBy.some(read => read.user.toString() === userId.toString());
  };
});

// Pre-save middleware to handle edited messages
MessageSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.edited = true;
    this.editedAt = new Date();
  }
  next();
});

// Static method to mark message as read
MessageSchema.statics.markAsRead = async function(messageId, userId) {
  const message = await this.findById(messageId);
  if (!message) return null;
  
  const alreadyRead = message.readBy.some(read => read.user.toString() === userId.toString());
  if (!alreadyRead) {
    message.readBy.push({ user: userId, readAt: new Date() });
    await message.save();
  }
  return message;
};

// Static method to get unread messages count
MessageSchema.statics.getUnreadCount = async function(conversationId, userId) {
  return await this.countDocuments({
    conversationId,
    sender: { $ne: userId },
    'readBy.user': { $ne: userId },
    deleted: false
  });
};

// Instance method to add reaction
MessageSchema.methods.addReaction = function(userId, emoji) {
  const existingReaction = this.reactions.find(
    r => r.user.toString() === userId.toString() && r.emoji === emoji
  );
  
  if (existingReaction) {
    // Remove reaction if it already exists (toggle)
    this.reactions = this.reactions.filter(
      r => !(r.user.toString() === userId.toString() && r.emoji === emoji)
    );
  } else {
    // Remove any existing reaction from this user with different emoji
    this.reactions = this.reactions.filter(
      r => r.user.toString() !== userId.toString()
    );
    // Add new reaction
    this.reactions.push({ user: userId, emoji });
  }
  
  return this.save();
};

// Instance method to soft delete message
MessageSchema.methods.softDelete = function(userId) {
  this.deleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

const Message = mongoose.model("Message", MessageSchema);

export default Message;