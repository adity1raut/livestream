import React from 'react';
import { Play, Users, Clock, BarChart3, Square } from 'lucide-react';

const StreamCard = ({ 
  stream, 
  onClick, 
  showAnalytics = false, 
  showEndButton = false,
  onEndStream 
}) => {
  const formatDuration = (start, end) => {
    const duration = end ? new Date(end) - new Date(start) : Date.now() - new Date(start);
    const minutes = Math.floor(duration / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatViewerCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleEndStream = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to end this stream?')) {
      onEndStream(stream._id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 group">
      {/* Thumbnail */}
      <div 
        className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative cursor-pointer"
        onClick={() => onClick(stream)}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Play size={48} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
        
        {/* Live indicator */}
        {stream.isLive && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium animate-pulse">
            LIVE
          </div>
        )}
        
        {/* End stream button */}
        {showEndButton && stream.isLive && (
          <button
            onClick={handleEndStream}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
            title="End Stream"
          >
            <Square size={16} />
          </button>
        )}
        
        {/* Duration overlay */}
        {stream.startedAt && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            {formatDuration(stream.startedAt, stream.endedAt)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="cursor-pointer" onClick={() => onClick(stream)}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {stream.title}
          </h3>
          
          {stream.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {stream.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <img 
              src={stream.host?.profile?.profileImage || '/default-avatar.png'} 
              alt={stream.host?.username || 'Host'}
              className="w-5 h-5 rounded-full"
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
            <span className="hover:text-gray-700 transition-colors">
              {stream.host?.profile?.name || stream.host?.username || 'Unknown'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1">
              <Users size={14} />
              {formatViewerCount(stream.viewers?.length || 0)}
            </span>
            
            {stream.startedAt && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatDuration(stream.startedAt, stream.endedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Analytics button */}
        {showAnalytics && (
          <button 
            className="mt-3 text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Handle analytics view - you can implement this
              console.log('View analytics for stream:', stream._id);
            }}
          >
            <BarChart3 size={14} />
            View Analytics
          </button>
        )}
      </div>
    </div>
  );
};

export default StreamCard;