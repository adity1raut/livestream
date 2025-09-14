import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Smile } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const StreamChat = ({ streamId, messages = [], onSendMessage, isLive = true }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState(messages);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    setChatMessages(messages);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || loading || !isLive) return;

    const tempMessage = {
      _id: 'temp-' + Date.now(),
      message: message.trim(),
      sender: user,
      createdAt: new Date().toISOString(),
      isTemp: true
    };

    // Optimistically add message
    setChatMessages(prev => [...prev, tempMessage]);
    const currentMessage = message.trim();
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(`/api/stream/${streamId}/chat`, {
        message: currentMessage
      });

      if (response.status === 201) {
        // Replace temp message with real one
        setChatMessages(prev => 
          prev.map(msg => 
            msg._id === tempMessage._id ? response.data : msg
          )
        );
        if (onSendMessage) onSendMessage(response.data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setChatMessages(prev => 
        prev.filter(msg => msg._id !== tempMessage._id)
      );
      setMessage(currentMessage); // Restore message
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserDisplayName = (sender) => {
    if (!sender) return 'Anonymous';
    return sender.profile?.name || sender.username || 'Anonymous';
  };

  const getUserAvatar = (sender) => {
    return sender?.profile?.profileImage || '/default-avatar.png';
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-96 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageCircle size={20} />
            Live Chat
          </span>
          <span className="text-sm text-gray-500 font-normal">
            {chatMessages.length} messages
          </span>
        </h3>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Be the first to say something!</p>
          </div>
        ) : (
          chatMessages.map((msg, index) => (
            <div 
              key={msg._id || index} 
              className={`flex gap-2 ${msg.isTemp ? 'opacity-70' : ''}`}
            >
              <img 
                src={getUserAvatar(msg.sender)}
                alt="Avatar"
                className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-blue-600 truncate">
                    {getUserDisplayName(msg.sender)}
                  </span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-800 break-words">
                  {msg.message}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-gray-50 rounded-b-lg">
        {isLive ? (
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                maxLength={500}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  // You could add emoji picker here
                  inputRef.current?.focus();
                }}
              >
                <Smile size={16} />
              </button>
            </div>
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!message.trim() || loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-2">
            <p className="text-sm">Stream has ended. Chat is disabled.</p>
          </div>
        )}
        
        {message.length > 450 && (
          <div className="text-xs text-gray-500 mt-1">
            {message.length}/500 characters
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamChat;