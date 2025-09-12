import React from 'react';
import { Gamepad2, Search, MessageCircle, Users } from 'lucide-react';
import ConversationsList from './ConversationsList';
import SearchSection from './SearchSection';

const Sidebar = ({
  activeView,
  setActiveView,
  conversations,
  searchResults,
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
  loading,
  user,
  openConversation,
  startConversation,
  getOtherUser,
  formatTime
}) => {
  return (
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

        {/* Navigation Tabs */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveView('conversations')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center shadow-lg ${
              activeView === 'conversations'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/50 scale-105'
                : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 hover:scale-102'
            }`}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chats
          </button>
          <button
            onClick={() => setActiveView('search')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center shadow-lg ${
              activeView === 'search'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/50 scale-105'
                : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 hover:scale-102'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Find Players
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeView === 'conversations' ? (
          <ConversationsList
            conversations={conversations}
            user={user}
            openConversation={openConversation}
            getOtherUser={getOtherUser}
            formatTime={formatTime}
          />
        ) : (
          <SearchSection
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchType={searchType}
            setSearchType={setSearchType}
            searchResults={searchResults}
            loading={loading}
            startConversation={startConversation}
          />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
