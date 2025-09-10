import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ChatApp = () => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        console.error('Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const tempMessage = {
      _id: Date.now().toString(),
      sender: user,
      content: newMessage,
      createdAt: new Date().toISOString(),
      type: 'text'
    };

    // Optimistically add message to UI
    setMessages(prev => [...prev, tempMessage]);
    const messageContent = newMessage;
    setNewMessage('');

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          content: messageContent,
          type: 'text'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const message = data.message;
        
        // Replace temp message with real message
        setMessages(prev => 
          prev.map(msg => msg._id === tempMessage._id ? message : msg)
        );

        // Update conversation last message
        setConversations(prev => prev.map(conv => 
          conv._id === selectedConversation._id 
            ? { ...conv, lastMessage: message, updatedAt: new Date().toISOString() }
            : conv
        ));
      } else {
        // Remove temp message on error
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
        setNewMessage(messageContent);
        console.error('Failed to send message');
      }
    } catch (error) {
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      setNewMessage(messageContent);
      console.error('Error sending message:', error);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/chat/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      } else {
        console.error('Failed to search users');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    }
  };

  const createOrGetConversation = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        const conversation = data.conversation;
        
        // Add to conversations if new
        setConversations(prev => {
          const exists = prev.some(conv => conv._id === conversation._id);
          return exists ? prev : [conversation, ...prev];
        });

        setSelectedConversation(conversation);
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
        fetchMessages(conversation._id);
      } else {
        console.error('Failed to create/get conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation._id);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getOtherUser = (conversation) => {
    return conversation.members?.find(member => member._id !== user?._id);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to access the chat application.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Conversations */}
      <div className={`w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col ${
        selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="p-4 bg-blue-600 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Messages</h1>
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-full hover:bg-blue-700 transition-colors"
              title="Search users"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search Section */}
        {showSearch && (
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users by name or username..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                {searchResults.map((searchUser) => (
                  <div
                    key={searchUser._id}
                    onClick={() => createOrGetConversation(searchUser._id)}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <img
                      src={searchUser.profile?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(searchUser.profile?.name || searchUser.username)}&background=random`}
                      alt={searchUser.profile?.name || searchUser.username}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {searchUser.profile?.name || searchUser.username}
                      </p>
                      <p className="text-sm text-gray-500">@{searchUser.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <div className="mt-2 text-center text-gray-500 text-sm">
                No users found
              </div>
            )}
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="mb-2">No conversations yet</p>
                <p className="text-sm">Search for users to start chatting</p>
              </div>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              if (!otherUser) return null;
              
              return (
                <div
                  key={conversation._id}
                  onClick={() => handleConversationClick(conversation)}
                  className={`flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedConversation?._id === conversation._id 
                      ? 'bg-blue-50 border-l-4 border-l-blue-600' 
                      : ''
                  }`}
                >
                  <div className="relative">
                    <img
                      src={otherUser.profile?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.profile?.name || otherUser.username)}&background=random`}
                      alt={otherUser.profile?.name || otherUser.username}
                      className="w-12 h-12 rounded-full mr-3 object-cover"
                    />
                    <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-medium text-gray-800 truncate">
                        {otherUser.profile?.name || otherUser.username}
                      </p>
                      {conversation.lastMessage && (
                        <p className="text-xs text-gray-500 flex-shrink-0">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage?.content || 'Start a conversation'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${
        selectedConversation ? 'flex' : 'hidden md:flex'
      }`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center flex-shrink-0">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 rounded-full hover:bg-gray-100 mr-2 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              <div className="relative mr-3">
                <img
                  src={getOtherUser(selectedConversation)?.profile?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(getOtherUser(selectedConversation)?.profile?.name || getOtherUser(selectedConversation)?.username)}&background=random`}
                  alt={getOtherUser(selectedConversation)?.profile?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {getOtherUser(selectedConversation)?.profile?.name || getOtherUser(selectedConversation)?.username}
                </p>
                <p className="text-sm text-green-500">Online</p>
              </div>
              
              <div className="flex space-x-2">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Voice call">
                  <Phone className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Video call">
                  <Video className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" title="More options">
                  <MoreVertical className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <p className="text-lg mb-2">No messages yet</p>
                    <p className="text-sm">Send a message to start the conversation</p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isCurrentUser = message.sender._id === user._id;
                  const showAvatar = !isCurrentUser && (index === 0 || messages[index - 1].sender._id !== message.sender._id);
                  
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${
                        showAvatar ? 'mt-4' : 'mt-1'
                      }`}
                    >
                      {!isCurrentUser && showAvatar && (
                        <img
                          src={message.sender.profile?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender.profile?.name || message.sender.username)}&background=random`}
                          alt={message.sender.profile?.name}
                          className="w-8 h-8 rounded-full mr-2 mt-auto object-cover"
                        />
                      )}
                      
                      {!isCurrentUser && !showAvatar && (
                        <div className="w-8 mr-2"></div>
                      )}
                      
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        isCurrentUser
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                      }`}>
                        <p className="break-words">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    style={{
                      minHeight: '44px',
                      maxHeight: '120px',
                    }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  {sendingMessage ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <div className="w-32 h-32 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                <Search className="h-16 w-16 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-700">Welcome to Chat</h2>
              <p className="text-lg">Select a conversation to start messaging</p>
              <p className="text-sm mt-2">or search for users to begin a new conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;