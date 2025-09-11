import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Gamepad2, Sword, Shield, Crown, Search, Send, ArrowLeft, Users, MessageCircle } from 'lucide-react';
import io from 'socket.io-client';

const ChatApplication = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('conversations');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('username');
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      withCredentials: true,
      auth: {
        token: document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1]
      }
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle new messages
    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);

      // Update conversations list with new last message
      setConversations(prev => prev.map(conv =>
        conv._id === message.conversation
          ? { ...conv, lastMessage: message }
          : conv
      ));
    });

    // Handle conversation updates
    socket.on('conversation-updated', (updatedConversation) => {
      setConversations(prev => prev.map(conv =>
        conv._id === updatedConversation._id
          ? updatedConversation
          : conv
      ));
    });

    // Handle typing indicators
    socket.on('user-typing', (data) => {
      setTypingUsers(prev => ({
        ...prev,
        [data.conversationId]: [...(prev[data.conversationId] || []).filter(id => id !== data.userId), data.userId]
      }));
    });

    socket.on('user-stop-typing', (data) => {
      setTypingUsers(prev => ({
        ...prev,
        [data.conversationId]: (prev[data.conversationId] || []).filter(id => id !== data.userId)
      }));
    });

    // Handle message read events
    socket.on('message-read', (data) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data.messageId
          ? {
            ...msg,
            readBy: [...(msg.readBy || []), { user: data.userId, readAt: new Date() }]
          }
          : msg
      ));
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.off('new-message');
      socket.off('conversation-updated');
      socket.off('user-typing');
      socket.off('user-stop-typing');
      socket.off('message-read');
      socket.off('error');
    };
  }, [socket]);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Join conversation rooms when socket is ready
  useEffect(() => {
    if (socket && conversations.length > 0) {
      conversations.forEach(conv => {
        socket.emit('join-conversation', conv._id);
      });
    }
  }, [socket, conversations]);

  // Join current conversation room when it changes
  useEffect(() => {
    if (socket && currentConversation) {
      socket.emit('join-conversation', currentConversation._id);
    }

    return () => {
      if (socket && currentConversation) {
        socket.emit('leave-conversation', currentConversation._id);
      }
    };
  }, [socket, currentConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/chat/conversations', {
        withCredentials: true
      });
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Search users
  const searchUsers = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('/api/chat/search', {
        params: { query, type: searchType },
        withCredentials: true
      });
      if (response.data.success) {
        setSearchResults(response.data.users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
    setLoading(false);
  };

  // Handle search input change with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (activeView === 'search') {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchType, activeView]);

  // Create or get conversation with a user
  const startConversation = async (userId) => {
    try {
      const response = await axios.post('/api/chat/conversations',
        { userId },
        { withCredentials: true }
      );
      if (response.data.success) {
        const conversation = response.data.conversation;
        setCurrentConversation(conversation);
        fetchMessages(conversation._id);
        setActiveView('chat');
        fetchConversations(); // Refresh conversations list
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`/api/chat/conversations/${conversationId}/messages`, {
        withCredentials: true
      });
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!messageInput.trim() || !currentConversation || !socket) return;

    try {
      // Emit message via socket
      socket.emit('send-message', {
        conversationId: currentConversation._id,
        content: messageInput.trim(),
        type: 'text'
      });

      setMessageInput('');

      // Stop typing indicator
      socket.emit('typing-stop', currentConversation._id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle typing indicators
  const handleTypingStart = () => {
    if (socket && currentConversation) {
      socket.emit('typing-start', currentConversation._id);
    }
  };

  const handleTypingStop = () => {
    if (socket && currentConversation) {
      socket.emit('typing-stop', currentConversation._id);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = () => {
    if (socket && currentConversation && messages.length > 0) {
      const unreadMessages = messages.filter(msg =>
        msg.sender._id !== user._id &&
        !msg.readBy?.some(read => read.user === user._id)
      );

      unreadMessages.forEach(msg => {
        socket.emit('mark-as-read', {
          messageId: msg._id,
          conversationId: currentConversation._id
        });
      });
    }
  };

  // Mark messages as read when opening conversation
  useEffect(() => {
    if (currentConversation) {
      markMessagesAsRead();
    }
  }, [currentConversation, messages]);

  // Open conversation from list
  const openConversation = (conversation) => {
    setCurrentConversation(conversation);
    fetchMessages(conversation._id);
    setActiveView('chat');
  };

  // Get other user in conversation
  const getOtherUser = (conversation) => {
    return conversation.members.find(member => member._id !== user._id);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle input change with typing indicators
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (e.target.value.trim() && socket && currentConversation) {
      handleTypingStart();
    } else {
      handleTypingStop();
    }
  };

  // Generate random level for gaming theme
  const getRandomLevel = () => Math.floor(Math.random() * 100) + 1;

  // Check if user is typing in current conversation
  const isUserTyping = currentConversation &&
    typingUsers[currentConversation._id] &&
    typingUsers[currentConversation._id].length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white flex items-center justify-center pt-24 pb-4">
      {/* Enhanced container with 90% screen coverage */}
      <div className="w-[90vw] h-[90vh] bg-gradient-to-br from-gray-900/95 via-black/90 to-purple-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/20 overflow-hidden relative">

        {/* Animated background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-pink-600/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-pulse"></div>

        <div className="flex h-full relative z-10 text-white">
          {/* Enhanced Sidebar */}
          <div className="w-80 bg-gray-800/80 backdrop-blur-sm border-r border-purple-500/30 flex flex-col shadow-lg">
            <div className="p-6 border-b border-purple-500/30">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl mr-3 shadow-lg">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
                    Game Chat
                  </h1>
                </div>
                <button
                  onClick={() => setActiveView('search')}
                  className="p-3 rounded-xl bg-gray-700/80 hover:bg-gray-600/80 transition-all duration-300 text-purple-400 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Enhanced Navigation Tabs */}
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveView('conversations')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center shadow-lg ${activeView === 'conversations'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/50 scale-105'
                      : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 hover:scale-102'
                    }`}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chats
                </button>
                <button
                  onClick={() => setActiveView('search')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center shadow-lg ${activeView === 'search'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/50 scale-105'
                      : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 hover:scale-102'
                    }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Find Players
                </button>
              </div>
            </div>

            {/* Enhanced Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeView === 'conversations' && (
                <div className="p-4">
                  {conversations.length === 0 ? (
                    <div className="text-center p-8 text-gray-400">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-purple-400" />
                      </div>
                      <p className="mb-2 text-lg font-medium">No conversations yet</p>
                      <p className="text-sm text-gray-500">Start a new chat to begin your gaming journey</p>
                    </div>
                  ) : (
                    conversations.map((conversation) => {
                      const otherUser = getOtherUser(conversation);
                      return (
                        <div
                          key={conversation._id}
                          onClick={() => openConversation(conversation)}
                          className="flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 hover:bg-gray-700/50 mb-3 hover:scale-102 hover:shadow-lg group"
                        >
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-lg group-hover:shadow-purple-500/50">
                              {otherUser?.profile?.name
                                ? otherUser.profile.name.charAt(0).toUpperCase()
                                : otherUser?.username.charAt(0).toUpperCase()
                              }
                            </div>
                            <div className="absolute bottom-0 right-2 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full shadow-lg"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-white truncate">
                                {otherUser?.profile?.name || otherUser?.username}
                              </span>
                              {conversation.lastMessage && (
                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                  {formatTime(conversation.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            {conversation.lastMessage && (
                              <p className="text-sm text-gray-400 truncate">
                                {conversation.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeView === 'search' && (
                <div className="p-4">
                  {/* Enhanced Search Input */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search by ${searchType}...`}
                        className="w-full pl-12 pr-4 py-4 bg-gray-700/60 backdrop-blur-sm border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-lg transition-all duration-300"
                      />
                    </div>
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => setSearchType('username')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${searchType === 'username'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                            : 'bg-gray-600/60 text-gray-300 hover:bg-gray-500/60'
                          }`}
                      >
                        Username
                      </button>
                      <button
                        onClick={() => setSearchType('name')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${searchType === 'name'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                            : 'bg-gray-600/60 text-gray-300 hover:bg-gray-500/60'
                          }`}
                      >
                        Name
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Search Results */}
                  {loading ? (
                    <div className="text-center p-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => startConversation(user._id)}
                        className="flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 hover:bg-gray-700/50 mb-3 hover:scale-102 hover:shadow-lg group"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-lg group-hover:shadow-purple-500/50">
                            {user.profile?.name
                              ? user.profile.name.charAt(0).toUpperCase()
                              : user.username.charAt(0).toUpperCase()
                            }
                          </div>
                          <div className="absolute bottom-0 right-2 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full shadow-lg"></div>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-white">
                            {user.profile?.name || user.username}
                          </div>
                          <div className="text-sm text-gray-400">@{user.username}</div>
                        </div>
                        <div className="flex items-center text-sm bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 rounded-full text-white font-medium shadow-lg">
                          <Crown className="w-4 h-4 mr-1" />
                          <span>Lvl {getRandomLevel()}</span>
                        </div>
                      </div>
                    ))
                  ) : searchQuery.length >= 2 ? (
                    <div className="text-center p-8 text-gray-400">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center">
                        <Sword className="w-8 h-8 text-purple-400" />
                      </div>
                      <p className="text-lg font-medium">No players found</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeView === 'chat' && currentConversation ? (
              <>
                {/* Enhanced Chat Header */}
                <div className="bg-gray-800/80 backdrop-blur-sm border-b border-purple-500/30 p-6 flex items-center shadow-lg">
                  <button
                    onClick={() => setActiveView('conversations')}
                    className="p-3 rounded-xl mr-4 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-300 hover:scale-105"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-lg">
                      {getOtherUser(currentConversation)?.profile?.name
                        ? getOtherUser(currentConversation).profile.name.charAt(0).toUpperCase()
                        : getOtherUser(currentConversation)?.username.charAt(0).toUpperCase()
                      }
                    </div>
                    <div className="absolute bottom-0 right-2 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full shadow-lg"></div>
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg">
                      {getOtherUser(currentConversation)?.profile?.name ||
                        getOtherUser(currentConversation)?.username}
                    </h2>
                    <p className="text-sm text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      Online • In Game
                    </p>
                  </div>
                </div>

                {/* Enhanced Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-900/50 to-black/50 custom-scrollbar">
                  {messages.map((message) => {
                    const isOwnMessage = message.sender._id === user._id;
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-6`}
                      >
                        <div
                          className={`max-w-md px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-102 ${isOwnMessage
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md shadow-purple-500/30'
                              : 'bg-gray-700/80 text-gray-100 border border-purple-500/20 rounded-bl-md shadow-gray-900/50'
                            }`}
                        >
                          <p className="break-words leading-relaxed">{message.content}</p>
                          <p
                            className={`text-xs mt-2 ${isOwnMessage ? 'text-purple-200' : 'text-gray-400'
                              }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                          {isOwnMessage && message.readBy && message.readBy.length > 0 && (
                            <p className="text-xs text-purple-200 mt-1">
                              Read {formatTime(message.readBy[0].readAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Enhanced Typing indicator */}
                  {isUserTyping && (
                    <div className="flex justify-start mb-6">
                      <div className="bg-gray-700/80 backdrop-blur-sm px-6 py-4 rounded-2xl rounded-bl-md shadow-lg">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Enhanced Message Input */}
                <div className="bg-gray-800/80 backdrop-blur-sm border-t border-purple-500/30 p-6">
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyPress}
                      onBlur={handleTypingStop}
                      placeholder="Type your message..."
                      className="flex-1 p-4 bg-gray-700/60 backdrop-blur-sm border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-lg transition-all duration-300"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!messageInput.trim()}
                      className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-700/60 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-purple-500/50"
                    >
                      <Send className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 bg-gradient-to-b from-gray-900/50 to-black/50">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Gamepad2 className="w-12 h-12 text-purple-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Welcome to Game Chat</h2>
                  <p className="text-lg text-gray-400">Select a conversation or search for players to start your gaming adventure</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333ea, #ec4899);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #db2777);
        }
      `}</style>
    </div>
  );
};

export default ChatApplication;