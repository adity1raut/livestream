import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Heart, Share2, Flag, Settings, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StreamPlayer from './StreamPlayer';
import StreamChat from './StreamChat';
import axios from 'axios';

const StreamViewer = ({ stream: initialStream, onBack }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stream, setStream] = useState(initialStream || null);
  const [hasJoined, setHasJoined] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [loading, setLoading] = useState(!initialStream);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Fetch stream data if not provided as prop
  const fetchStream = async (streamId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/stream/${streamId}`, {
        headers: isAuthenticated ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}
      });
      
      if (response.status === 200) {
        setStream(response.data);
        setViewerCount(response.data.viewers?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching stream:', error);
      setError('Failed to load stream');
    } finally {
      setLoading(false);
    }
  };

  // Initialize stream data
  useEffect(() => {
    if (initialStream) {
      setStream(initialStream);
      setViewerCount(initialStream.viewers?.length || 0);
      setLoading(false);
    } else if (id) {
      fetchStream(id);
    }
  }, [id, initialStream, isAuthenticated]);

  // Join stream on component mount if live
  const handleJoinStream = async () => {
    if (!stream?.isLive || hasJoined || !isAuthenticated) return;

    try {
      const response = await axios.post(`/api/stream/${stream._id}/join`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.status === 200) {
        setHasJoined(true);
        setViewerCount(response.data.viewers);
      }
    } catch (error) {
      console.error('Error joining stream:', error);
    }
  };

  // Leave stream
  const handleLeaveStream = async () => {
    if (!hasJoined || !stream) return;

    try {
      const response = await axios.post(`/api/stream/${stream._id}/leave`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.status === 200) {
        setHasJoined(false);
        setViewerCount(response.data.viewers);
      }
    } catch (error) {
      console.error('Error leaving stream:', error);
    }
  };

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      alert('Please log in to follow streamers');
      return;
    }

    setLoading(true);
    try {
      // This would be your follow/unfollow API endpoint
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const response = await axios.post(`/api/users/${stream.host._id}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.status === 200) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  // Share stream
  const handleShare = async (platform) => {
    const streamUrl = `${window.location.origin}/stream/${stream._id}`;
    const shareText = `Check out "${stream.title}" by ${stream.host?.username}`;

    switch (platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(streamUrl);
          alert('Link copied to clipboard!');
        } catch (error) {
          console.error('Failed to copy:', error);
        }
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(streamUrl)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(streamUrl)}`);
        break;
      default:
        break;
    }
    setShowShareMenu(false);
  };

  // Report stream
  const handleReport = () => {
    if (!isAuthenticated) {
      alert('Please log in to report content');
      return;
    }
    // Implement report functionality
    alert('Report functionality would be implemented here');
  };

  // Format duration
  const formatDuration = (start, end) => {
    if (!start) return '0m';
    const duration = end ? new Date(end) - new Date(start) : Date.now() - new Date(start);
    const minutes = Math.floor(duration / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/streams');
    }
  };

  // Auto-join on mount
  useEffect(() => {
    if (isAuthenticated && stream?.isLive) {
      handleJoinStream();
    }

    // Cleanup: leave stream on unmount
    return () => {
      if (hasJoined) {
        handleLeaveStream();
      }
    };
  }, [stream, isAuthenticated]);

  // Refresh stream data periodically
  useEffect(() => {
    if (!stream?.isLive) return;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/stream/${stream._id}`, {
          headers: isAuthenticated ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}
        });
        if (response.status === 200) {
          setStream(response.data);
          setViewerCount(response.data.viewers?.length || 0);
        }
      } catch (error) {
        console.error('Error refreshing stream:', error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [stream?._id, stream?.isLive, isAuthenticated]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stream...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !stream) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Stream Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || 'The stream you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <button
            onClick={handleBack}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Streams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} className="mr-1" />
                Back
              </button>
              
              <div className="border-l pl-4">
                <h1 className="text-xl font-bold text-gray-900 truncate max-w-md">
                  {stream.title}
                </h1>
                <div className="flex items-center text-sm text-gray-600 space-x-3">
                  <span>{stream.host?.username}</span>
                  <span className="flex items-center">
                    <Users size={14} className="mr-1" />
                    {viewerCount} viewers
                  </span>
                  {stream.startedAt && (
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {formatDuration(stream.startedAt, stream.endedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Live Status */}
              {stream.isLive && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                  🔴 LIVE
                </span>
              )}

              {/* Follow Button */}
              {isAuthenticated && stream.host?._id !== user?._id && (
                <button
                  onClick={handleFollowToggle}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  } disabled:opacity-50`}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Heart size={16} className={`inline mr-1 ${isFollowing ? 'fill-current' : ''}`} />
                      {isFollowing ? 'Following' : 'Follow'}
                    </>
                  )}
                </button>
              )}

              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Share2 size={20} />
                </button>
                
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <div className="py-1">
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        Share on Twitter
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        Share on Facebook
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Report Button */}
              <button
                onClick={handleReport}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Report Stream"
              >
                <Flag size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player - Takes 3 columns on large screens */}
          <div className="lg:col-span-3 space-y-6">
            <StreamPlayer stream={stream} className="aspect-video" />
            
            {/* Stream Info */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={stream.host?.profile?.profileImage || '/default-avatar.png'}
                    alt={stream.host?.username}
                    className="w-12 h-12 rounded-full"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-lg">
                      {stream.host?.profile?.name || stream.host?.username}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      @{stream.host?.username}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {viewerCount}
                  </div>
                  <div className="text-sm text-gray-500">
                    {viewerCount === 1 ? 'viewer' : 'viewers'}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">About this stream</h4>
                <p className="text-gray-700 leading-relaxed">
                  {stream.description || 'No description provided for this stream.'}
                </p>
                
                {stream.startedAt && (
                  <div className="mt-4 text-sm text-gray-500">
                    Started {new Date(stream.startedAt).toLocaleString()}
                    {stream.endedAt && (
                      <> • Ended {new Date(stream.endedAt).toLocaleString()}</>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Sidebar - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <StreamChat
              streamId={stream._id}
              messages={stream.liveChat || []}
              isLive={stream.isLive}
            />
          </div>
        </div>
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
};

export default StreamViewer;