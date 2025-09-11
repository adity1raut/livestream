import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Gamepad2, Sword, Shield, Crown, Search, Send, ArrowLeft, Users, MessageCircle } from 'lucide-react';

const ChatApplication = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('conversations'); // 'conversations', 'chat', 'search'
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('username');
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

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
    if (!messageInput.trim() || !currentConversation) return;

    try {
      const response = await axios.post('/api/chat/messages', 
        {
          conversationId: currentConversation._id,
          content: messageInput.trim(),
          type: 'text'
        },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setMessages(prev => [...prev, response.data.message]);
        setMessageInput('');
        fetchConversations(); // Refresh to update last message
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

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

  // Generate random level for gaming theme
  const getRandomLevel = () => Math.floor(Math.random() * 100) + 1;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-purple-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-purple-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Gamepad2 className="w-6 h-6 mr-2 text-purple-400" />
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Game Chat
              </h1>
            </div>
            <button
              onClick={() => setActiveView('search')}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-purple-400"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('conversations')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                activeView === 'conversations' 
                  ? 'bg-purple-700 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Chats
            </button>
            <button
              onClick={() => setActiveView('search')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                activeView === 'search' 
                  ? 'bg-purple-700 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Users className="w-4 h-4 mr-1" />
              Find Players
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeView === 'conversations' && (
            <div className="p-2">
              {conversations.length === 0 ? (
                <div className="text-center p-6 text-gray-400">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-purple-500 opacity-50" />
                  <p className="mb-1">No conversations yet</p>
                  <p className="text-sm">Start a new chat to begin messaging</p>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const otherUser = getOtherUser(conversation);
                  return (
                    <div
                      key={conversation._id}
                      onClick={() => openConversation(conversation)}
                      className="flex items-center p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-700 mb-1"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {otherUser?.profile?.name
                            ? otherUser.profile.name.charAt(0).toUpperCase()
                            : otherUser?.username.charAt(0).toUpperCase()
                          }
                        </div>
                        <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
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
              {/* Search Input */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search by ${searchType}...`}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-purple-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setSearchType('username')}
                    className={`flex-1 py-1 px-2 rounded text-xs ${
                      searchType === 'username' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    } transition-colors`}
                  >
                    Username
                  </button>
                  <button
                    onClick={() => setSearchType('name')}
                    className={`flex-1 py-1 px-2 rounded text-xs ${
                      searchType === 'name' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    } transition-colors`}
                  >
                    Name
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {loading ? (
                <div className="text-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => startConversation(user._id)}
                    className="flex items-center p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-700 mb-2"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {user.profile?.name
                          ? user.profile.name.charAt(0).toUpperCase()
                          : user.username.charAt(0).toUpperCase()
                        }
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {user.profile?.name || user.username}
                      </div>
                      <div className="text-sm text-gray-400">@{user.username}</div>
                    </div>
                    <div className="flex items-center text-xs text-yellow-400">
                      <Crown className="w-3 h-3 mr-1" />
                      <span>Lvl {getRandomLevel()}</span>
                    </div>
                  </div>
                ))
              ) : searchQuery.length >= 2 ? (
                <div className="text-center p-6 text-gray-400">
                  <Sword className="w-12 h-12 mx-auto mb-3 text-purple-500 opacity-50" />
                  <p>No players found</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeView === 'chat' && currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-gray-800 border-b border-purple-700 p-4 flex items-center">
              <button
                onClick={() => setActiveView('conversations')}
                className="p-2 rounded-lg mr-3 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {getOtherUser(currentConversation)?.profile?.name
                    ? getOtherUser(currentConversation).profile.name.charAt(0).toUpperCase()
                    : getOtherUser(currentConversation)?.username.charAt(0).toUpperCase()
                  }
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
              </div>
              <div>
                <h2 className="font-bold text-white">
                  {getOtherUser(currentConversation)?.profile?.name || 
                   getOtherUser(currentConversation)?.username}
                </h2>
                <p className="text-sm text-green-400 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Online • In Game
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
              {messages.map((message) => {
                const isOwnMessage = message.sender._id === user._id;
                return (
                  <div
                    key={message._id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-sm'
                          : 'bg-gray-700 text-gray-200 border border-purple-900 rounded-bl-sm'
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-purple-200' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-gray-800 border-t border-purple-700 p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 p-3 bg-gray-700 border border-purple-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-900">
            <div className="text-center">
              <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-purple-500 opacity-50" />
              <h2 className="text-xl font-bold text-white mb-2">Welcome to Game Chat</h2>
              <p>Select a conversation or search for players to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApplication;