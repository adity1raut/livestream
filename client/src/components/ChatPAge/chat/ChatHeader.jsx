import React from 'react';
import { ArrowLeft } from 'lucide-react';

const ChatHeader = ({ currentConversation, setActiveView, getOtherUser }) => {
  return (
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
  );
};

export default ChatHeader;
