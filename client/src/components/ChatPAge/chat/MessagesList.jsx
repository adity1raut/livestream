import React from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const MessagesList = ({
  messages,
  user,
  isUserTyping,
  messagesEndRef,
  formatTime,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-900/50 to-black/50 custom-scrollbar">
      {messages.map((message) => (
        <MessageBubble
          key={message._id}
          message={message}
          user={user}
          formatTime={formatTime}
        />
      ))}

      {isUserTyping && <TypingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
