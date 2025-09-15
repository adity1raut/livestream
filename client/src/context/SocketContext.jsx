import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import axios from "axios";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Fetch existing notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (isAuthenticated && user) {
        try {
          const res = await axios.get("/api/notifications", {
            withCredentials: true,
          });
          if (res.data.success) {
            setNotifications(res.data.notifications);
            setNotificationCount(res.data.unreadCount || 0);
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
    };

    fetchNotifications();
  }, [isAuthenticated, user]);

  // Socket connection management
  useEffect(() => {
    let newSocket;

    if (isAuthenticated && user) {
      try {
        // Get token from cookies
        const token = document.cookie
          .split(";")
          .find((c) => c.trim().startsWith("token="))
          ?.split("=")[1];

        newSocket = io("http://localhost:5000", {
          auth: { token },
          withCredentials: true,
        });

        newSocket.on("connect", () => {
          console.log("Connected to server");
          setIsConnected(true);
          setSocket(newSocket);

          // Join user room for notifications
          newSocket.emit("join-user-room", user._id);

          // Join feed for real-time updates
          newSocket.emit("join-feed");
        });

        newSocket.on("disconnect", () => {
          console.log("Disconnected from server");
          setIsConnected(false);
          setSocket(null);
        });

        newSocket.on("online-users", (users) => {
          const usersMap = new Map(users.map((user) => [user._id, user]));
          setOnlineUsers(usersMap);
        });

        // Handle notifications
        newSocket.on("new-notification", (notification) => {
          setNotifications((prev) => [notification, ...prev]);
          setNotificationCount((prev) => prev + 1);
        });

        newSocket.on("notification-count", ({ count }) => {
          setNotificationCount(count);
        });

        newSocket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          setIsConnected(false);
        });
      } catch (error) {
        console.error("Error initializing socket:", error);
      }
    }

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [isAuthenticated, user]);

  const joinPost = (postId) => {
    if (socket) {
      socket.emit("join-post", postId);
    }
  };

  const leavePost = (postId) => {
    if (socket) {
      socket.emit("leave-post", postId);
    }
  };

  const togglePostLike = (postId) => {
    if (socket) {
      socket.emit("toggle-post-like", { postId });
    }
  };

  const addComment = (postId, text) => {
    if (socket) {
      socket.emit("add-comment", { postId, text });
    }
  };

  const deleteComment = (postId, commentId) => {
    if (socket) {
      socket.emit("delete-comment", { postId, commentId });
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    if (socket) {
      socket.emit("mark-notification-read", { notificationId });
    }

    // Update local state immediately for better UX
    setNotifications((prev) =>
      prev.map((notif) =>
        notif._id === notificationId ? { ...notif, read: true } : notif,
      ),
    );

    setNotificationCount((prev) => Math.max(0, prev - 1));

    // Also update on server via API
    try {
      await axios.patch(
        `/api/notifications/${notificationId}/read`,
        {},
        {
          withCredentials: true,
        },
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setNotificationCount(0);

    try {
      await axios.patch(
        "/api/notifications/read-all",
        {},
        {
          withCredentials: true,
        },
      );

      if (socket) {
        socket.emit("mark-all-notifications-read");
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        notifications,
        notificationCount,
        joinPost,
        leavePost,
        togglePostLike,
        addComment,
        deleteComment,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        setNotifications,
        setNotificationCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
