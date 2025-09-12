import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  
  const { user } = useAuth();

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Store the actual file for FormData
    setMediaFile(file);

    const fileType = file.type.startsWith('image/') ? 'image' : 'video';
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const url = event.target.result;
      setMediaPreview({ type: fileType, url });
    };
    
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('content', content.trim());
      
      // Only append media if file exists
      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      const response = await axios.post('/api/posts/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      if (response.data.success) {
        setContent('');
        setMediaFile(null);
        setMediaPreview(null);
        onPostCreated?.(response.data.post);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      // Optional: Show error message to user
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-4">
          <img
            src={user?.profile?.profileImage || '/default-avatar.png'}
            alt="Your avatar"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
            />
            
            {mediaPreview && (
              <div className="mt-4 relative">
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {mediaPreview.type === 'image' && (
                  <img
                    src={mediaPreview.url}
                    alt="Preview"
                    className="w-full rounded-lg max-h-64 object-cover"
                  />
                )}
                
                {mediaPreview.type === 'video' && (
                  <video
                    src={mediaPreview.url}
                    controls
                    className="w-full rounded-lg max-h-64"
                  />
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-gray-800">
                  <Camera className="w-5 h-5" />
                  <span>Photo/Video</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;