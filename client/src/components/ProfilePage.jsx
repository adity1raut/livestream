import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

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
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUserData(data.data); 
        } else {
          setError(data.message || "Error fetching profile.");
          toast.error(data.message || "Error fetching profile.");
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message || "An error occurred.");
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username, navigate ]);

  if (error) {
    return <p className="text-red-500 text-center mt-8">You  Lasdaa {error}</p>;
  }

  if (!userData) {
    return <p className="text-center mt-8">Loading profile...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Profile of {userData.firstName} {userData.lastName}
        </h1>

        <div className="space-y-4">
          {/* Username */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Username</p>
            <p className="text-lg font-semibold text-gray-800">{userData.username}</p>
          </div>

          {/* Email */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-lg font-semibold text-gray-800">{userData.email}</p>
          </div>

          {/* Location */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Joined On</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date(userData.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

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