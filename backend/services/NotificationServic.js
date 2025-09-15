import Notification from "../models/Notification.models.js";

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  async createNotification(
    userId,
    type,
    message,
    link = null,
    fromUserId = null,
  ) {
    try {
      const notification = new Notification({
        user: userId,
        type,
        message,
        link,
        fromUser: fromUserId,
      });

      await notification.save();

      // Populate the notification with user details if fromUserId exists
      let populatedNotification = notification;
      if (fromUserId) {
        try {
          populatedNotification = await notification.populate(
            "fromUser",
            "username profile.name profile.profileImage",
          );
        } catch (populateError) {
          console.warn(
            "Failed to populate fromUser, sending notification without user details:",
            populateError,
          );
          populatedNotification = notification;
        }
      }

      // Send real-time notification to specific user (updated event name)
      this.io.to(`user_${userId}`).emit("new-notification", {
        id: populatedNotification._id,
        type: populatedNotification.type,
        message: populatedNotification.message,
        link: populatedNotification.link,
        isRead: populatedNotification.isRead,
        createdAt: populatedNotification.createdAt,
        fromUser: populatedNotification.fromUser || null,
      });

      return populatedNotification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  async sendLikeNotification(postOwnerId, likerUserId, likerUsername, postId) {
    if (postOwnerId.toString() === likerUserId.toString()) return; // Don't notify self

    const message = `${likerUsername} liked your post`;
    const link = `/post/${postId}`;

    await this.createNotification(
      postOwnerId,
      "LIKE",
      message,
      link,
      likerUserId,
    );
  }

  async sendCommentNotification(
    postOwnerId,
    commenterUserId,
    commenterUsername,
    postId,
  ) {
    if (postOwnerId.toString() === commenterUserId.toString()) return; // Don't notify self

    const message = `${commenterUsername} commented on your post`;
    const link = `/post/${postId}`;

    await this.createNotification(
      postOwnerId,
      "COMMENT",
      message,
      link,
      commenterUserId,
    );
  }

  async sendFollowNotification(
    followedUserId,
    followerUserId,
    followerUsername,
  ) {
    const message = `${followerUsername} started following you`;
    const link = `/profile/${followerUsername}`;

    await this.createNotification(
      followedUserId,
      "FOLLOW",
      message,
      link,
      followerUserId,
    );
  }

  // New method to send message notifications
  async sendMessageNotification(
    receiverUserId,
    senderUserId,
    senderUsername,
    messageContent,
    conversationId,
  ) {
    if (receiverUserId.toString() === senderUserId.toString()) return; // Don't notify self

    const truncatedMessage =
      messageContent.length > 50
        ? messageContent.substring(0, 50) + "..."
        : messageContent;

    const message = `${senderUsername} sent you a message: ${truncatedMessage}`;
    const link = `/chat/${conversationId}`;

    await this.createNotification(
      receiverUserId,
      "MESSAGE",
      message,
      link,
      senderUserId,
    );
  }

  // Method to get unread count for a user
  async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({
        user: userId,
        isRead: false,
      });
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  // Method to mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true },
      );

      return await this.getUnreadCount(userId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Method to mark all notifications as read
  async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { user: userId, isRead: false },
        { isRead: true },
      );

      return 0; // All notifications are now read
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // Method to delete notification
  async deleteNotification(notificationId, userId) {
    try {
      await Notification.findOneAndDelete({
        _id: notificationId,
        user: userId,
      });

      return await this.getUnreadCount(userId);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  // Method to get notifications with pagination
  async getNotifications(userId, page = 1, limit = 20, type = null) {
    try {
      const query = { user: userId };
      if (type) {
        query.type = type;
      }

      const notifications = await Notification.find(query)
        .populate("fromUser", "username profile.name profile.profileImage")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);

      const totalCount = await Notification.countDocuments(query);
      const unreadCount = await this.getUnreadCount(userId);

      return {
        notifications,
        unreadCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
      };
    } catch (error) {
      console.error("Error getting notifications:", error);
      throw error;
    }
  }
}

export default NotificationService;
