import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Get token from cookies
      const token = document.cookie
        .split(';')
        .find(c => c.trim().startsWith('token='))
        ?.split('=')[1];

      const newSocket = io('http://localhost:5000', {
        auth: { token },
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setSocket(newSocket);
        
        // Join feed for real-time updates
        newSocket.emit('join-feed');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setSocket(null);
      });

      // Handle notifications
      newSocket.on('new-notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      newSocket.on('notification-count', ({ count }) => {
        setNotificationCount(count);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const joinPost = (postId) => {
    if (socket) {
      socket.emit('join-post', postId);
    }
  };

  const leavePost = (postId) => {
    if (socket) {
      socket.emit('leave-post', postId);
    }
  };

  const togglePostLike = (postId) => {
    if (socket) {
      socket.emit('toggle-post-like', { postId });
    }
  };

  const addComment = (postId, text) => {
    if (socket) {
      socket.emit('add-comment', { postId, text });
    }
  };

  const deleteComment = (postId, commentId) => {
    if (socket) {
      socket.emit('delete-comment', { postId, commentId });
    }
  };

  const markNotificationAsRead = (notificationId) => {
    if (socket) {
      socket.emit('mark-notification-read', { notificationId });
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      notifications,
      notificationCount,
      joinPost,
      leavePost,
      togglePostLike,
      addComment,
      deleteComment,
      markNotificationAsRead
    }}>
      {children}
    </SocketContext.Provider>
  );
};