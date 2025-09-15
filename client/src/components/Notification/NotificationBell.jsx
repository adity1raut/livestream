import React, { useState } from "react";
import { useNotifications } from "../../context/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";
import { Bell } from "lucide-react";

function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-300 hover:text-purple-400 focus:outline-none transition-colors duration-200"
      >
        <Bell className="w-6 h-6" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border border-gray-800 shadow-md">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 overflow-hidden">
          <NotificationDropdown onClose={() => setShowDropdown(false)} />
        </div>
      )}
    </div>
  );
}
export default NotificationBell;
