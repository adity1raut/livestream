import React from 'react';
import { Shield } from 'lucide-react';

const ConversationsList = ({
  conversations,
  user,
  openConversation,
  getOtherUser,
  formatTime
}) => {
  return (
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
                {otherUser?.profile?.profileImage ? (
                  <img
                    src={otherUser.profile.profileImage}
                    alt={otherUser?.profile?.name || otherUser?.username}
                    className="w-12 h-12 rounded-full object-cover mr-4 shadow-lg border-2 border-purple-600 group-hover:shadow-purple-500/50"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-lg group-hover:shadow-purple-500/50">
                    {otherUser?.profile?.name
                      ? otherUser.profile.name.charAt(0).toUpperCase()
                      : otherUser?.username.charAt(0).toUpperCase()
                    }
                  </div>
                )}
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
  );
};

export default ConversationsList