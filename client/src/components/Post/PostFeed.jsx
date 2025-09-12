import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import axios from 'axios';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const { socket } = useSocket();

  useEffect(() => {
    fetchFeed();
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for real-time post events
      const handleNewPost = (data) => {
        if (data.type === 'new_post') {
          setPosts(prev => [data.post, ...prev]);
        }
      };

      const handlePostUpdated = (data) => {
        if (data.type === 'post_updated') {
          setPosts(prev => prev.map(post => 
            post._id === data.post._id ? data.post : post
          ));
        }
      };

      const handlePostDeleted = (data) => {
        if (data.type === 'post_deleted') {
          setPosts(prev => prev.filter(post => post._id !== data.postId));
        }
      };

      socket.on('new-post', handleNewPost);
      socket.on('post-updated', handlePostUpdated);
      socket.on('post-deleted', handlePostDeleted);

      return () => {
        socket.off('new-post', handleNewPost);
        socket.off('post-updated', handlePostUpdated);
        socket.off('post-deleted', handlePostDeleted);
      };
    }
  }, [socket]);

  const fetchFeed = async (pageNum = 1) => {
    try {
      const response = await axios.get(`/api/posts/feed?page=${pageNum}&limit=10`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        if (pageNum === 1) {
          setPosts(response.data.posts);
        } else {
          setPosts(prev => [...prev, ...response.data.posts]);
        }
        setHasMore(response.data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchFeed(nextPage);
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  const handlePostDelete = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pt-52">
      <CreatePost onPostCreated={handlePostCreated} />
      
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard 
            key={post._id} 
            post={post}
            onPostUpdate={handlePostUpdate}
            onPostDelete={handlePostDelete}
          />
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center mt-8 text-gray-500">
          You've reached the end of your feed
        </div>
      )}

      {posts.length === 0 && !loading && (
        <div className="text-center mt-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">Follow some users or create your first post to get started!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostFeed;
