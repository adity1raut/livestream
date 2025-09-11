import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';

function NotificationItem({ notification }) {
  const { markAsRead, deleteNotification } = useNotifications();
  const [showActions, setShowActions] = useState(false);

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
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return notifDate.toLocaleDateString();
  };

  return (
    <div
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 relative ${!notification.isRead ? 'bg-blue-50' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1" onClick={handleMarkAsRead}>
          <div className="flex items-center gap-2 mb-1">
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            )}
            <p className="text-sm font-medium text-gray-800 truncate">
              {notification.title || 'Notification'}
            </p>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {notification.message || notification.content || 'New notification'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatTimeAgo(notification.createdAt)}
          </p>
        </div>

        {showActions && (
          <div className="flex gap-1 ml-2">
            {!notification.isRead && (
              <button
                onClick={handleMarkAsRead}
                className="p-1 text-blue-600 hover:text-blue-800 rounded"
                title="Mark as read"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-1 text-red-600 hover:text-red-800 rounded"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationItem;