import React, { useRef, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const ProfilePage = () => {
  const username = localStorage.getItem("username");
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const videoRef = useRef(null); // Reference to the video element
  const [stream, setStream] = useState(null); // State to store the media stream
  const [isRecording, setIsRecording] = useState(false); // State to track recording status
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
      // Request screen recording permission
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true, // Include audio if needed
      });

      // Set the stream to state
      setStream(screenStream);

      // Display the screen recording in the video element
      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
      }

      setIsRecording(true);

      // Optional: Send the stream to a server for live streaming
      // You can use WebRTC, WebSocket, or a third-party service here
    } catch (error) {
      console.error("Error accessing screen:", error);
    }
  };

  // Function to stop screen recording
  const stopScreenRecording = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop()); // Stop all tracks
      setStream(null);
      setIsRecording(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
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

  if (!userData) {
    return <p className="text-center mt-8">Loading profile...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Profile of {userData.firstName} {userData.lastName}
        </h1>

        {/* Profile Image */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg">
            <img
              src={imagePreview || userData.profileImage || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {isEditing ? (
          // Edit Profile Form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-medium text-gray-500">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-medium text-gray-500">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-medium text-gray-500">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-medium text-gray-500">Upload Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 text-sm text-gray-500"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Username</p>
              <p className="text-lg font-semibold text-gray-800">{userData.username}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg font-semibold text-gray-800">{userData.email}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Joined On</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(userData.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all flex-1"
              >
                Edit Profile
              </button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all flex-1">
                <Link to="/upload-video" className="block w-full">
                  Upload Video
                </Link>
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all flex-1"
                onClick={isRecording ? stopScreenRecording : startScreenRecording}
              >
                {isRecording ? "Stop Streaming" : "Start Live Streaming"}
              </button>
            </div>

            <div className="mt-6">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full rounded-lg shadow-lg"
                style={{ maxWidth: "600px" }}
              />
            </div>
          </div>
        )}

        {userData.extraFields && userData.extraFields.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Additional Information</h2>
            <div className="space-y-4">
              {userData.extraFields.map((field, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">{field.label}</p>
                  <p className="text-lg font-semibold text-gray-800">{field.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ProfilePage;
