import React from "react";
import { Search, Sword, Crown } from "lucide-react";

const SearchSection = ({
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
  searchResults,
  loading,
  startConversation,
}) => {
  const getRandomLevel = () => Math.floor(Math.random() * 100) + 1;

  return (
    <div className="p-4">
      {/* Search Input */}
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
            onClick={() => setSearchType("username")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
              searchType === "username"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-gray-600/60 text-gray-300 hover:bg-gray-500/60"
            }`}
          >
            Username
          </button>
          <button
            onClick={() => setSearchType("name")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
              searchType === "name"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-gray-600/60 text-gray-300 hover:bg-gray-500/60"
            }`}
          >
            Name
          </button>
        </div>
      </div>

      {/* Search Results */}
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
                  : user.username.charAt(0).toUpperCase()}
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
  );
};

export default SearchSection;
