import React from 'react';
const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-6">
      <div className="bg-gray-700/80 backdrop-blur-sm px-6 py-4 rounded-2xl rounded-bl-md shadow-lg">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;