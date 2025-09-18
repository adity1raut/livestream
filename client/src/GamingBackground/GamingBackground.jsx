import React from 'react';
import { Gamepad2, Zap, Shield, Sword } from 'lucide-react';

const GamingBackground = () => {
  return (
    <>
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
        {[...Array(24)].map((_, i) => (
          <div
            key={`icon-${i}`}
            className="absolute text-purple-400/30 animate-float"
            style={{
              left: `${Math.random() * 90}%`,
              top: `${Math.random() * 90}%`,
              fontSize: `${10 + Math.random() * 12}px`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 3}s`
            }}
          >
            {i % 4 === 0 && <Gamepad2 />}
            {i % 4 === 1 && <Zap />}
            {i % 4 === 2 && <Shield />}
            {i % 4 === 3 && <Sword />}
          </div>
        ))}

        {/* Twinkling Stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
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

      {/* Gaming Background Styles */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        
        @keyframes arrow-flow {
          0% {
            transform: translateY(100px);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px);
            opacity: 0;
          }
        }
        .animate-arrow-flow {
          animation: arrow-flow 2s linear infinite;
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
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(2deg); }
          66% { transform: translateY(5px) rotate(-2deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default GamingBackground;