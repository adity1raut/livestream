import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';

const PostCard = ({ post: initialPost, onPostUpdate, onPostDelete }) => {
  const [post, setPost] = useState(initialPost);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  
  const { user } = useAuth();
  const { socket, joinPost, leavePost } = useSocket();

  const isOwner = user && post.author._id === user._id;

  useEffect(() => {
    setIsLiked(post.likes.some(like => like._id === user?._id));
  }, [post.likes, user]);

  useEffect(() => {
    if (socket) {
      joinPost(post._id);

      // Listen for real-time updates
      const handlePostLikeUpdate = (data) => {
        if (data.postId === post._id) {
          setPost(prev => ({
            ...prev,
            likes: data.isLiked 
              ? [...prev.likes, { _id: data.userId }]
              : prev.likes.filter(like => like._id !== data.userId)
          }));
          
          if (data.userId === user?._id) {
            setIsLiked(data.isLiked);
          }
        }
      };

      const handleNewComment = (data) => {
        if (data.postId === post._id) {
          setPost(prev => ({
            ...prev,
            comments: [...prev.comments, data.comment]
          }));
        }
      };

      const handleCommentDeleted = (data) => {
        if (data.postId === post._id) {
          setPost(prev => ({
            ...prev,
            comments: prev.comments.filter(comment => comment._id !== data.commentId)
          }));
        }
      };

      socket.on('post-like-updated', handlePostLikeUpdate);
      socket.on('new-comment-added', handleNewComment);
      socket.on('comment-deleted', handleCommentDeleted);

      return () => {
        socket.off('post-like-updated', handlePostLikeUpdate);
        socket.off('new-comment-added', handleNewComment);
        socket.off('comment-deleted', handleCommentDeleted);
        leavePost(post._id);
      };
    }
  }, [socket, post._id, user]);

  const handleLike = async () => {
    try {
      const response = await axios.post(`/api/posts/${post._id}/like`, {}, { withCredentials: true });
      // Real-time update will be handled by socket
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await axios.post(`/api/posts/${post._id}/comment`, 
        { text: commentText }, 
        { withCredentials: true }
      );
      setCommentText('');
      // Real-time update will be handled by socket
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/posts/${post._id}/comment/${commentId}`, { withCredentials: true });
      // Real-time update will be handled by socket
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      const response = await axios.put(`/api/posts/${post._id}`, 
        { content: editContent }, 
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setPost(response.data.post);
        setIsEditing(false);
        onPostUpdate?.(response.data.post);
      }
    } catch (error) {
      console.error('Error editing post:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`/api/posts/${post._id}`, { withCredentials: true });
        onPostDelete?.(post._id);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.author.profile?.profileImage || '/default-avatar.png'}
            alt={post.author.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">
              {post.author.profile?.name || post.author.username}
            </h3>
            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Post
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              placeholder="What's on your mind?"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post.content);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        )}
        
        {post.media && post.media.type !== 'none' && post.media.url && (
          <div className="mt-4">
            {post.media.type === 'image' && (
              <img
                src={post.media.url}
                alt="Post media"
                className="w-full rounded-lg max-h-96 object-cover"
              />
            )}
            {post.media.type === 'video' && (
              <video
                src={post.media.url}
                controls
                className="w-full rounded-lg max-h-96"
              />
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{post.likes.length}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments.length}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500">
            <Share className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          {/* Add Comment Form */}
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex space-x-3">
              <img
                src={user?.profile?.profileImage || '/default-avatar.png'}
                alt="Your avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment._id} className="flex space-x-3">
                <img
                  src={comment.user.profile?.profileImage || '/default-avatar.png'}
                  alt={comment.user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm">
                        {comment.user.profile?.name || comment.user.username}
                      </h4>
                      {(comment.user._id === user?._id || isOwner) && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-800">{comment.text}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
