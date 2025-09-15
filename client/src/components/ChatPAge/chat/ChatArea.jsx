import React from "react";
import { ArrowLeft } from "lucide-react";
import ChatHeader from "./ChatHeader";
import MessagesList from "./MessagesList";
import MessageInput from "./MessageInput";

const ChatArea = ({
  currentConversation,
  messages,
  messageInput,
  user,
  isUserTyping,
  messagesEndRef,
  setActiveView,
  getOtherUser,
  formatTime,
  handleInputChange,
  handleKeyPress,
  handleTypingStop,
  sendMessage,
}) => {
  return (
    <>
      <ChatHeader
        currentConversation={currentConversation}
        setActiveView={setActiveView}
        getOtherUser={getOtherUser}
      />

      <MessagesList
        messages={messages}
        user={user}
        isUserTyping={isUserTyping}
        messagesEndRef={messagesEndRef}
        formatTime={formatTime}
      />

      <MessageInput
        messageInput={messageInput}
        handleInputChange={handleInputChange}
        handleKeyPress={handleKeyPress}
        handleTypingStop={handleTypingStop}
        sendMessage={sendMessage}
      />
    </>
  );
};

export default ChatArea;
