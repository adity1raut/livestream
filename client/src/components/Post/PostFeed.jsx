import React, { useState, useEffect } from "react";
import CreatePost from "./CreatePost";
import Post from "./PostCard";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { MessageCircle } from "lucide-react";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { user } = useAuth();

  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      if (pageNum > 1) setLoadingMore(true);

      const res = await axios.get(`/api/posts/feed?page=${pageNum}&limit=10`, {
        withCredentials: true,
      });

      if (res.data.success) {
        if (append) {
          setPosts((prev) => [...prev, ...res.data.posts]);
        } else {
          setPosts(res.data.posts);
        }
        setHasMore(res.data.hasMore);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const handleNewPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPosts(page + 1, true);
    }
  };

  const refreshFeed = () => {
    setLoading(true);
    setPage(1);
    fetchPosts(1, false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Filter out current user's posts
  const filteredPosts = posts.filter(
    (post) => post.author !== user?._id && post.author?._id !== user?._id,
  );

  return (
    <div className="max-w-2xl mx-auto pt-40 p-4">
      {/* Feed Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Feed</h2>
        <button
          onClick={refreshFeed}
          className="px-4 py-2 text-blue-500 hover:text-blue-600 font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Create Post */}
      <CreatePost onPostCreated={handleNewPost} />

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Post key={post._id} post={post} onDelete={handleDeletePost} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && filteredPosts.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Loading...</span>
              </div>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredPosts.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <MessageCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No posts yet
          </h3>
          <p className="text-gray-500">
            Be the first to share something with your friends!
          </p>
        </div>
      )}
    </div>
  );
};

export default Feed;
