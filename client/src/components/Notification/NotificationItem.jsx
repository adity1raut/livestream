import React, { useState } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { Check, Trash2, X } from "lucide-react";

function NotificationItem({ notification }) {
  const { markAsRead, deleteNotification } = useNotifications();
  const [showActions, setShowActions] = React.useState(false);

  const handleMarkAsRead = () => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };

  const handleDelete = () => {
    deleteNotification(notification._id);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInSeconds = Math.floor((now - notifDate) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return notifDate.toLocaleDateString();
  };

  return (
    <div
      className={`p-3 border-b border-gray-700 hover:bg-gray-750 relative transition-colors duration-150 ${
        !notification.isRead ? "bg-purple-900 bg-opacity-20" : "bg-gray-800"
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1" onClick={handleMarkAsRead}>
          <div className="flex items-center gap-2 mb-1">
            {!notification.isRead && (
              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
            )}
            <p className="text-sm font-medium text-gray-200 truncate">
              {notification.title || "Notification"}
            </p>
          </div>
          <p className="text-sm text-gray-400 line-clamp-2">
            {notification.message || notification.content || "New notification"}
          </p>
          <p className="text-xs text-purple-400 mt-1">
            {formatTimeAgo(notification.createdAt)}
          </p>
        </div>

        {showActions && (
          <div className="flex gap-1 ml-2">
            {!notification.isRead && (
              <button
                onClick={handleMarkAsRead}
                className="p-1 text-green-400 hover:text-green-300 rounded transition-colors"
                title="Mark as read"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-1 text-red-400 hover:text-red-300 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationItem;
