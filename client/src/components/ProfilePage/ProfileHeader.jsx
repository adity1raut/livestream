import React, { useRef } from 'react';
import { Camera, Edit2, Mail, Calendar, User } from 'lucide-react';
import axios from 'axios';

const ProfileHeader = ({
  profileData,
  isOwnProfile,
  uploadingImage,
  setUploadingImage,
  setSuccess,
  setError,
  setProfileData,
  setIsEditing
}) => {
  const profileImageRef = useRef(null);
  const coverImageRef = useRef(null);

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

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingImage(true);

    try {
      const base64 = await fileToBase64(file);
      const updateData = {
        [type === 'profile' ? 'profileImage' : 'coverImage']: base64
      };

      const response = await axios.put('/api/auth/profile', updateData, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
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
    <>
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
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;