import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Loader } from 'lucide-react';

const StreamPlayer = ({ stream, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Auto-hide controls
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      videoRef.current.muted = newMutedState;
      if (newMutedState) {
        videoRef.current.volume = 0;
      } else {
        videoRef.current.volume = volume;
      }
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleError = (e) => {
    setIsLoading(false);
    setError('Failed to load stream');
    console.error('Video error:', e);
  };

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => setShowControls(isPlaying ? false : true)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        poster="/stream-placeholder.jpg"
      >
        {/* For live streams, you would typically use HLS or WebRTC */}
        {stream.streamUrl && (
          <source src={stream.streamUrl} type="application/x-mpegURL" />
        )}
        Your browser does not support the video tag.
      </video>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center text-white">
            <Loader size={48} className="animate-spin mx-auto mb-2" />
            <p>Loading stream...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center text-white">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setIsLoading(true);
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Placeholder when no stream */}
      {!stream.streamUrl && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <Play size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-xl mb-2">Stream Player</p>
            <p className="text-sm opacity-70">
              {stream.isLive ? 'Waiting for stream to start...' : 'Stream is not live'}
            </p>
            {!stream.isLive && (
              <div className="mt-4 px-4 py-2 bg-gray-800 rounded inline-block">
                Stream ended at {new Date(stream.endedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Indicator */}
      {stream.isLive && (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
          🔴 LIVE
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              className="text-white hover:text-blue-400 transition-colors"
              disabled={!stream.streamUrl}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            {/* Volume Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Stream Info */}
            <div className="text-white text-sm">
              <span className="opacity-75">Quality: </span>
              <span>Auto</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Settings Button */}
            <button
              className="text-white hover:text-blue-400 transition-colors"
              onClick={() => {
                // Handle quality/settings menu
                console.log('Open settings');
              }}
            >
              <Settings size={20} />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="text-white hover:text-blue-400 transition-colors"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Center Play Button Overlay */}
      {!isPlaying && !isLoading && showControls && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handlePlayPause}
            className="bg-black bg-opacity-50 text-white p-4 rounded-full hover:bg-opacity-75 transition-all transform hover:scale-110"
            disabled={!stream.streamUrl}
          >
            <Play size={48} />
          </button>
        </div>
      )}
    </div>
  );
};

export default StreamPlayer;