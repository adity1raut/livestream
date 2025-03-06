// pages/ProfilePage.js
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProfileHeader from "./components/ProfileHeader";
import ProfileForm from "./components/ProfileForm";
import ProfileDetails from "./components/ProfileDetails";
import VideosTab from "./components/VideosTab";
import StreamingTab from "./components/StreamingTab";
import TabsNavigation from "./components/TabsNavigation";

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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image changes
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
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

  // Start/stop screen recording
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
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
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
        <ProfileHeader
          userData={userData}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          isRecording={isRecording}
          startScreenRecording={startScreenRecording}
          stopScreenRecording={stopScreenRecording}
          imagePreview={imagePreview}
        />

        {/* Tabs Navigation */}
        <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'profile' && (
            <>
              {isEditing ? (
                <ProfileForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleImageChange={handleImageChange}
                  handleSubmit={handleSubmit}
                  imagePreview={imagePreview}
                  setIsEditing={setIsEditing}
                />
              ) : (
                <ProfileDetails userData={userData} />
              )}
            </>
          )}

          {activeTab === 'videos' && <VideosTab />}
          {activeTab === 'streaming' && (
            <StreamingTab
              isRecording={isRecording}
              startScreenRecording={startScreenRecording}
              stopScreenRecording={stopScreenRecording}
              videoRef={videoRef}
            />
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