import Notification from '../../models/Notification.models.js';

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  async createNotification(userId, type, message, link = null, fromUserId = null) {
    try {
      const notification = new Notification({
        user: userId,
        type,
        message,
        link,
        fromUser: fromUserId
      });

      await notification.save();
      
      // Populate the notification with user details
      await notification.populate('fromUser', 'username profile.name profile.profileImage');

      // Send real-time notification to specific user
      this.io.to(`user_${userId}`).emit('newNotification', notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async sendLikeNotification(postOwnerId, likerUserId, likerUsername, postId) {
    if (postOwnerId.toString() === likerUserId.toString()) return; // Don't notify self
    
    const message = `${likerUsername} liked your post`;
    const link = `/post/${postId}`;
    
    await this.createNotification(postOwnerId, 'LIKE', message, link, likerUserId);
  }

  async sendCommentNotification(postOwnerId, commenterUserId, commenterUsername, postId) {
    if (postOwnerId.toString() === commenterUserId.toString()) return; // Don't notify self
    
    const message = `${commenterUsername} commented on your post`;
    const link = `/post/${postId}`;
    
    await this.createNotification(postOwnerId, 'COMMENT', message, link, commenterUserId);
  }

  async sendFollowNotification(followedUserId, followerUserId, followerUsername) {
    const message = `${followerUsername} started following you`;
    const link = `/profile/${followerUsername}`;
    
    await this.createNotification(followedUserId, 'FOLLOW', message, link, followerUserId);
  }
}

export default NotificationService;