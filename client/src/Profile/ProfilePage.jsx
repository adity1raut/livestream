import React, { useRef, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfilePage = () => {
  const username = localStorage.getItem("username");
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profileImage: null,
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const startScreenRecording = async () => {
    try {
      toast.info("Setting up your stream...");
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      setStream(screenStream);

      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
      }

      setIsRecording(true);
      toast.success("You're now live streaming!");
    } catch (error) {
      console.error("Error accessing screen:", error);
      toast.error("Couldn't start streaming. Please check permissions.");
    }
  };

  const stopScreenRecording = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      setStream(null);
      setIsRecording(false);
      toast.info("Live stream ended");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You need to be logged in to view profiles.");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/profile/${username}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUserData(data.data);
          setFormData({
            firstName: data.data.firstName,
            lastName: data.data.lastName,
            email: data.data.email,
          });
          setImagePreview(data.data.profileImage || "");
        } else {
          toast.error(data.message || "Error fetching profile.");
        }
      } catch (error) {
        toast.error("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formDataToSend = new FormData();
    formDataToSend.append("firstName", formData.firstName);
    formDataToSend.append("lastName", formData.lastName);
    formDataToSend.append("email", formData.email);
    if (profileImage) {
      formDataToSend.append("profileImage", profileImage);
    }

    try {
      toast.info("Updating your profile...");
      const response = await fetch(`http://localhost:5000/api/profile/${username}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setUserData(data.data);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Error updating profile.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 bg-gray-700 rounded-full mb-4"></div>
          <div className="h-6 bg-gray-700 w-48 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 w-64 rounded"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white text-xl">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-purple-500"
              style={{
                width: `${Math.random() * 30 + 10}px`,
                height: `${Math.random() * 30 + 10}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto bg-gray-900 bg-opacity-90 rounded-2xl shadow-2xl p-8 relative z-10 backdrop-blur-sm border border-purple-600/20">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          {/* Profile Image */}
          <div className="relative group">
            <div className="w-40 h-40 rounded-full overflow-hidden shadow-lg border-4 border-purple-500 transition-all duration-300 group-hover:border-purple-400">
              <img
                src={imagePreview || userData.profileImage || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute -bottom-2 right-0 bg-purple-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white text-center md:text-left">
              {userData.firstName} {userData.lastName}
            </h1>
            <p className="text-purple-400 mt-2 text-center md:text-left">@{userData.username}</p>
            <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-gray-300">Member since {new Date(userData.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-300">{userData.email}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          {!isEditing && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Profile
              </button>
              <button
                className={`${isRecording ? 'bg-gradient-to-r from-red-600 to-red-800' : 'bg-gradient-to-r from-green-600 to-green-800'} text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center`}
                onClick={isRecording ? stopScreenRecording : startScreenRecording}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  {isRecording ? (
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" />
                  ) : (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  )}
                </svg>
                {isRecording ? "End Stream" : "Go Live"}
              </button>
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8 border-b border-gray-800">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-6 font-medium text-lg transition-all duration-300 ${
                activeTab === 'profile' 
                  ? 'text-purple-500 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`py-3 px-6 font-medium text-lg transition-all duration-300 ${
                activeTab === 'videos' 
                  ? 'text-purple-500 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              My Videos
            </button>
            <button
              onClick={() => setActiveTab('streaming')}
              className={`py-3 px-6 font-medium text-lg transition-all duration-300 ${
                activeTab === 'streaming' 
                  ? 'text-purple-500 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Streaming
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              {isEditing ? (
                // Edit Profile Form
                <form onSubmit={handleSubmit} className="animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm border border-purple-500/10 transform transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg">
                      <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                        placeholder="Your first name"
                      />
                    </div>
                    <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm border border-purple-500/10 transform transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                        placeholder="Your last name"
                      />
                    </div>
                    <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm border border-purple-500/10 transform transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm border border-purple-500/10 transform transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Profile Image</label>
                      <div className="flex items-center space-x-4">
                        <label className="flex-1 cursor-pointer bg-gray-700 text-white rounded-lg overflow-hidden relative">
                          <div className="p-3 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                            <span>Choose Image</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                          />
                        </label>
                        {imagePreview && (
                          <div className="h-12 w-12 rounded-full overflow-hidden">
                            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 shadow-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                // View Profile Details
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm border border-purple-500/10 transform transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg hover:-translate-y-1">
                    <p className="text-sm font-medium text-purple-400 mb-2">Username</p>
                    <p className="text-xl font-semibold text-white">{userData.username}</p>
                  </div>
                  <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm border border-purple-500/10 transform transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg hover:-translate-y-1">
                    <p className="text-sm font-medium text-purple-400 mb-2">Email</p>
                    <p className="text-xl font-semibold text-white">{userData.email}</p>
                  </div>
                  <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm border border-purple-500/10 transform transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg hover:-translate-y-1">
                    <p className="text-sm font-medium text-purple-400 mb-2">Full Name</p>
                    <p className="text-xl font-semibold text-white">
                      {userData.firstName} {userData.lastName}
                    </p>
                  </div>
                  <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm border border-purple-500/10 transform transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg hover:-translate-y-1">
                    <p className="text-sm font-medium text-purple-400 mb-2">Joined On</p>
                    <p className="text-xl font-semibold text-white">
                      {new Date(userData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  {/* Additional Information if present */}
                  {userData.extraFields && userData.extraFields.length > 0 && (
                    <>
                      {userData.extraFields.map((field, index) => (
                        <div 
                          key={index} 
                          className="bg-gray-800 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm border border-purple-500/10 transform transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg hover:-translate-y-1"
                        >
                          <p className="text-sm font-medium text-purple-400 mb-2">{field.label}</p>
                          <p className="text-xl font-semibold text-white">{field.value}</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div className="animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">My Videos</h2>
                <Link 
                  to="/upload-video" 
                  className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Upload New Video
                </Link>
              </div>
              
              {/* If no videos */}
              <div className="bg-gray-800 bg-opacity-50 p-8 rounded-lg text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-300 mb-2">No videos uploaded yet</h3>
                <p className="text-gray-400 mb-6">Start sharing your gaming moments with the community</p>
                <Link 
                  to="/upload-video" 
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all duration-300 inline-block"
                >
                  Upload Your First Video
                </Link>
              </div>
            </div>
          )}

          {/* Streaming Tab */}
          {activeTab === 'streaming' && (
            <div className="animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Live Streaming</h2>
                {!isRecording && (
                  <button
                    onClick={startScreenRecording}
                    className="bg-gradient-to-r from-green-600 to-green-800 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Start Streaming
                  </button>
                )}
              </div>
              
              {/* Stream Preview */}
              <div className={`bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden ${isRecording ? 'border-2 border-green-500' : ''}`}>
                {isRecording ? (
                  <div className="relative">
                    <div className="absolute top-4 right-4 z-10 flex items-center">
                      <div className="animate-pulse h-3 w-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-white font-medium text-sm bg-black bg-opacity-50 px-2 py-1 rounded">LIVE</span>
                    </div>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover rounded-lg"
                      style={{ minHeight: "400px" }}
                    />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                      <div className="bg-black bg-opacity-50 px-3 py-1 rounded-lg text-white">
                        <span>Viewers: 0</span>
                      </div>
                      <button
                        onClick={stopScreenRecording}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        </svg>
                        End Stream
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center" style={{ minHeight: "300px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-medium text-gray-300 mb-2">Start Streaming Your Gameplay</h3>
                    <p className="text-gray-400 mb-6">Share your gaming sessions with your followers in real-time</p>
                    <button
                       onClick={startScreenRecording}
                      className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 flex items-center justify-center" >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Start Streaming
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default ProfilePage;