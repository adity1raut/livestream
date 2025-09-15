import React from "react";
import { Gamepad2 } from "lucide-react";

const WelcomeScreen = () => {
  return (
    <div className="flex-1 flex items-center justify-center text-gray-400 bg-gradient-to-b from-gray-900/50 to-black/50">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Gamepad2 className="w-12 h-12 text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          Welcome to Game Chat
        </h2>
        <p className="text-lg text-gray-400">
          Select a conversation or search for players to start your gaming
          adventure
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
