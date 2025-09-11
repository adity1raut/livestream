import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';
import { Bell, X, CheckCircle } from 'lucide-react';

function NotificationDropdown({ onClose }) {
  const { notifications, unreadCount, markAllAsRead, loading } = useNotifications();

  return (
    <div className="max-h-96 overflow-hidden bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center bg-gradient-to-r from-purple-800 to-purple-900">
        <div className="flex items-center">
          <Bell className="w-5 h-5 text-purple-300 mr-2" />
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="ml-2 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-purple-300 hover:text-white font-medium flex items-center gap-1 transition-colors"
              title="Mark all as read"
            >
              <CheckCircle className="w-4 h-4" />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors ml-2"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-64 overflow-y-auto bg-gray-800">
        {loading ? (
          <div className="p-6 text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-3 text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-750 flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs mt-1 text-gray-600">We'll notify you when something arrives</p>
          </div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <NotificationItem key={notification._id} notification={notification} />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 5 && (
        <div className="px-4 py-3 border-t border-gray-700 bg-gray-850">
          <button
            onClick={() => {
              onClose();
              // Navigate to full notifications page
              window.location.href = '/notifications';
            }}
            className="w-full text-center text-purple-400 hover:text-purple-300 font-medium transition-colors text-sm"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;