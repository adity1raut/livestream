import React from 'react';

const MessageBubble = ({ message, user, formatTime }) => {
    const isOwnMessage = message.sender._id === user._id;

    return (
        <div
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
}

export default MessageBubble;