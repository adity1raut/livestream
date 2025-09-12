import React from 'react';
import { Send } from 'lucide-react';

const MessageInput = ({
  messageInput,
  handleInputChange,
  handleKeyPress,
  handleTypingStop,
  sendMessage
}) => {
  return (
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
  );
};

export default MessageInput;
