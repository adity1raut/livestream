import React, { useState, useEffect } from 'react';
import { Gamepad2, Zap, Trophy, Target, Cpu, Shield, Sword } from 'lucide-react';

const Loader = () => {
  const [loadingText, setLoadingText] = useState("INITIALIZING GAME");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const texts = [
      "INITIALIZING GAME", 
      "LOADING TEXTURES", 
      "COMPILING SHADERS",
      "CONNECTING TO SERVER", 
      "OPTIMIZING PERFORMANCE",
      "READY TO PLAY"
    ];
    let textIndex = 0;
    
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % texts.length;
      setLoadingText(texts[textIndex]);
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 1.5;
      });
    }, 80);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center z-50 overflow-hidden">
      {/* Gaming Background Effects */}
      <div className="absolute inset-0">
        {/* Circuit Pattern Background */}
        <div className="absolute inset-0 opacity-20">
          {/* Horizontal lines */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`h-line-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse"
              style={{
                top: `${15 + i * 10}%`,
                left: '10%',
                right: '10%',
                animationDelay: `${i * 0.3}s`,
                animationDuration: '2s'
              }}
            />
          ))}
          
          {/* Vertical lines */}
          {[...Array(6)].map((_, i) => (
            <div
              key={`v-line-${i}`}
              className="absolute w-px bg-gradient-to-b from-transparent via-gray-400 to-transparent animate-pulse"
              style={{
                left: `${20 + i * 12}%`,
                top: '10%',
                bottom: '10%',
                animationDelay: `${i * 0.4}s`,
                animationDuration: '2.5s'
              }}
            />
          ))}
        </div>

        {/* Floating Gaming Icons */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`icon-${i}`}
            className="absolute text-purple-400/30 animate-float"
            style={{
              left: `${Math.random() * 90}%`,
              top: `${Math.random() * 90}%`,
              fontSize: `${12 + Math.random() * 8}px`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}
          >
            {i % 4 === 0 && <Gamepad2 />}
            {i % 4 === 1 && <Zap />}
            {i % 4 === 2 && <Shield />}
            {i % 4 === 3 && <Sword />}
          </div>
        ))}

        {/* Hexagon Pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={`hex-${i}`}
              className="absolute w-8 h-8 border border-purple-400 transform rotate-45 animate-spin-slow"
              style={{
                left: `${Math.random() * 90}%`,
                top: `${Math.random() * 90}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${8 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        {/* Data Stream Effect */}
        <div className="absolute right-4 top-0 bottom-0 w-1 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={`stream-${i}`}
              className="absolute w-full h-8 bg-gradient-to-b from-purple-400 to-transparent animate-data-stream"
              style={{
                animationDelay: `${i * 0.5}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
      </div>

      <div className="text-center space-y-8 relative z-10">
        {/* Gaming Logo */}
        <div className="relative">
          <div className="w-28 h-28 mx-auto bg-gradient-to-r from-purple-800 to-purple-900 rounded-xl flex items-center justify-center transform animate-pulse-glow shadow-2xl shadow-purple-500/50 border border-gray-700">
            <div className="relative">
              <Gamepad2 className="w-14 h-14 text-white drop-shadow-lg" />
              {/* Power indicator */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>
            </div>
          </div>
          
          {/* Orbital Gaming Elements */}
          <div className="absolute inset-0 w-36 h-36 -m-4">
            <div className="absolute top-0 left-1/2 w-4 h-4 bg-purple-400 rounded-lg flex items-center justify-center transform -translate-x-1/2 animate-orbit shadow-lg shadow-purple-400/50">
              <Zap className="w-3 h-3 text-purple-900" />
            </div>
            <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-gray-400 rounded-lg flex items-center justify-center transform -translate-x-1/2 animate-orbit-reverse shadow-lg shadow-gray-400/50">
              <Trophy className="w-3 h-3 text-gray-900" />
            </div>
            <div className="absolute left-0 top-1/2 w-4 h-4 bg-indigo-400 rounded-lg flex items-center justify-center transform -translate-y-1/2 animate-orbit-horizontal shadow-lg shadow-indigo-400/50">
              <Target className="w-3 h-3 text-indigo-900" />
            </div>
            <div className="absolute right-0 top-1/2 w-4 h-4 bg-pink-400 rounded-lg flex items-center justify-center transform -translate-y-1/2 animate-orbit-horizontal-reverse shadow-lg shadow-pink-400/50">
              <Cpu className="w-3 h-3 text-pink-900" />
            </div>
          </div>
        </div>

        {/* Game Title */}
        <div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-gray-200 to-purple-400 animate-text-glow drop-shadow-2xl font-mono">
            ADITYA
          </h1>
          <p className="text-2xl text-gray-200 mt-2 tracking-wider font-light drop-shadow-lg">
            LOADING
          </p>
        </div>

        {/* Loading Progress */}
        <div className="space-y-6 w-96">
          <div className="text-center">
            <p className="text-purple-200 font-mono text-lg tracking-widest animate-pulse drop-shadow-lg">
              {loadingText}...
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full h-3 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-purple-500/30 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-800 transition-all duration-300 ease-out relative shadow-lg animate-progress-glow"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/50 blur-sm animate-scan"></div>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-300 mt-2 drop-shadow font-mono">
              <span>0%</span>
              <span className="text-purple-400 font-bold">{Math.floor(progress)}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* System Status */}
          <div className="text-xs font-mono text-gray-400 space-y-1 bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between">
              <span>CPU:</span>
              <span className="text-purple-400">OPTIMAL</span>
            </div>
            <div className="flex justify-between">
              <span>GPU:</span>
              <span className="text-purple-400">READY</span>
            </div>
            <div className="flex justify-between">
              <span>RAM:</span>
              <span className="text-gray-300">{Math.floor(progress * 0.8)}%</span>
            </div>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-purple-400 rounded-full animate-bounce shadow-lg shadow-purple-400/50"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.8);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        @keyframes text-glow {
          0%, 100% { 
            text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
          }
          50% { 
            text-shadow: 0 0 40px rgba(168, 85, 247, 1);
          }
        }
        .animate-text-glow {
          animation: text-glow 2s ease-in-out infinite;
        }
        
        @keyframes progress-glow {
          0%, 100% { 
            box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
          }
          50% { 
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.8);
          }
        }
        .animate-progress-glow {
          animation: progress-glow 1.5s ease-in-out infinite;
        }
        
        @keyframes scan {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
        
        @keyframes glitch {
          0%, 98%, 100% { opacity: 0; }
          99% { opacity: 1; }
        }
        .animate-glitch {
          animation: glitch 4s infinite;
        }
        
        @keyframes data-stream {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        .animate-data-stream {
          animation: data-stream 3s linear infinite;
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(70px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(70px) rotate(-360deg); }
        }
        .animate-orbit {
          animation: orbit 3s linear infinite;
        }
        
        @keyframes orbit-reverse {
          from { transform: rotate(0deg) translateX(70px) rotate(0deg); }
          to { transform: rotate(-360deg) translateX(70px) rotate(360deg); }
        }
        .animate-orbit-reverse {
          animation: orbit-reverse 4s linear infinite;
        }
        
        @keyframes orbit-horizontal {
          from { transform: rotate(0deg) translateY(70px) rotate(0deg); }
          to { transform: rotate(360deg) translateY(70px) rotate(-360deg); }
        }
        .animate-orbit-horizontal {
          animation: orbit-horizontal 3.5s linear infinite;
        }
        
        @keyframes orbit-horizontal-reverse {
          from { transform: rotate(0deg) translateY(70px) rotate(0deg); }
          to { transform: rotate(-360deg) translateY(70px) rotate(360deg); }
        }
        .animate-orbit-horizontal-reverse {
          animation: orbit-horizontal-reverse 2.8s linear infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(2deg); }
          66% { transform: translateY(5px) rotate(-2deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;