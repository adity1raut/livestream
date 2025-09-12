import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import EditProfileModal from './EditProfileModal';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import SuccessErrorToast from './SuccessErrorToast';
import axios from 'axios';

export default function ProfilePage() {
  const { username: paramUsername } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
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

      const endpoint = isOwnProfile ? '/api/auth/profile/' : `/api/auth/profile/${username}`;
      const response = await axios.get(endpoint, { withCredentials: true });

      if (response.data.success) {
        const userData = response.data.data;
        setProfileData(userData);
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

  if (loading) {
    return <LoadingState />;
  }

  if (error && !profileData) {
    return <ErrorState error={error} onRetry={fetchProfile} />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <SuccessErrorToast success={success} error={error} />
      
      <ProfileHeader 
        profileData={profileData}
        isOwnProfile={isOwnProfile}
        uploadingImage={uploadingImage}
        setUploadingImage={setUploadingImage}
        setSuccess={setSuccess}
        setError={setError}
        setProfileData={setProfileData}
        setIsEditing={setIsEditing}
      />
      
      <ProfileTabs 
        profileData={profileData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      {isEditing && (
        <EditProfileModal
          profileData={profileData}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          updating={updating}
          setUpdating={setUpdating}
          setSuccess={setSuccess}
          setError={setError}
          setProfileData={setProfileData}
        />
      )}
    </div>
  );
}