import React, { useState, useEffect, useRef } from 'react';
import { Camera, Edit2, MapPin, Calendar, Users, Grid, Mail, User, X, Check, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const { username: paramUsername } = useParams();
  const { user: currentUser, isAuthenticated, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    email: ''
  });
  const [activeTab, setActiveTab] = useState('posts');
  const profileImageRef = useRef(null);
  const coverImageRef = useRef(null);
  const navigate = useNavigate();

  // Get username from params or current user
  const username = paramUsername || currentUser?.username;
  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (username) {
      fetchProfile();
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [username, isAuthenticated, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // For own profile, use the authenticated endpoint
      const endpoint = isOwnProfile ? '/api/auth/profile' : `/api/auth/profile/${username}`;
      const response = await axios.get(endpoint, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const userData = response.data.data;
        setProfileData(userData);
        
        // Set edit form with available data
        setEditForm({
          name: userData.profile?.name || '',
          bio: userData.profile?.bio || '',
          email: userData.email || ''
        });
      } else {
        setError(response.data.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingImage(true);
    
    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      // Prepare update data with base64 image
      const updateData = {
        [type === 'profile' ? 'profileImage' : 'coverImage']: base64
      };
      
      const response = await axios.put('/api/auth/profile', updateData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // Update profile data with new image URL
        const updatedUser = response.data.data;
        setProfileData(updatedUser);
        setSuccess('Image uploaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Failed to upload image');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.response?.data?.message || 'Failed to upload image');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      setError('');
      
      const updateData = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        bio: editForm.bio.trim()
      };

      const response = await axios.put('/api/auth/profile', updateData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        const updatedUser = response.data.data;
        setProfileData(updatedUser);
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update failed:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error loading profile</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchProfile}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">User not found</h2>
          <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getDisplayName = () => {
    const profileName = profileData.profile?.name || '';
    return profileName || profileData.username;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Success/Error Messages */}
      {(success || error) && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg ${
            success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center gap-2">
              {success ? (
                <Check className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
              {success || error}
            </div>
          </div>
        </div>
      )}

      {/* Cover Image Section */}
      <div className="relative h-80 bg-gradient-to-r from-purple-600 to-pink-600 overflow-hidden">
        {profileData.profile?.coverImage ? (
          <img 
            src={profileData.profile.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-90"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-600"></div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        {isOwnProfile && (
          <>
            <button
              onClick={() => coverImageRef.current?.click()}
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-105"
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-gray-700" />
              )}
            </button>
            <input
              ref={coverImageRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'cover')}
              disabled={uploadingImage}
            />
          </>
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              {/* Profile Image */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-xl">
                  {profileData.profile?.profileImage ? (
                    <img 
                      src={profileData.profile.profileImage} 
                      alt={getDisplayName()}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                {isOwnProfile && (
                  <>
                    <button
                      onClick={() => profileImageRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-purple-600 p-2.5 rounded-full shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105"
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <input
                      ref={profileImageRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'profile')}
                      disabled={uploadingImage}
                    />
                  </>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {getDisplayName()}
                    </h1>
                    <p className="text-gray-500 mb-3">@{profileData.username}</p>
                    <p className="text-gray-700 max-w-lg">
                      {profileData.profile?.bio || 'No bio yet'}
                    </p>
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mt-6 justify-center sm:justify-start">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {profileData.posts?.length || 0}
                    </p>
                    <p className="text-gray-500 text-sm">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {profileData.followers?.length || 0}
                    </p>
                    <p className="text-gray-500 text-sm">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {profileData.following?.length || 0}
                    </p>
                    <p className="text-gray-500 text-sm">Following</p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 justify-center sm:justify-start">
                  {profileData.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {profileData.email}
                    </span>
                  )}
                  {profileData.createdAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {formatDate(profileData.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex">
                {['posts', 'followers', 'following'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 px-6 text-center font-medium transition-all relative ${
                      activeTab === tab
                        ? 'text-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="capitalize">{tab}</span>
                    <span className="ml-2 text-sm">
                      ({tab === 'posts' ? profileData.posts?.length || 0 :
                        tab === 'followers' ? profileData.followers?.length || 0 :
                        profileData.following?.length || 0})
                    </span>
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'posts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profileData.posts && profileData.posts.length > 0 ? (
                    profileData.posts.map((post, i) => (
                      <div key={post._id || i} className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl hover:shadow-lg transition-shadow cursor-pointer"></div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-12 text-gray-500">
                      <Grid className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No posts yet</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'followers' && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{(profileData.followers?.length || 0) > 0 ? 'Followers list coming soon' : 'No followers yet'}</p>
                </div>
              )}
              {activeTab === 'following' && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{(profileData.following?.length || 0) > 0 ? 'Following list coming soon' : 'Not following anyone yet'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={updating}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  disabled={updating}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  disabled={updating}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={4}
                  maxLength={200}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                  disabled={updating}
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editForm.bio.length}/200 characters
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                disabled={updating}
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}