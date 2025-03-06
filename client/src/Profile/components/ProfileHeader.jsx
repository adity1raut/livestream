
import { motion } from 'framer-motion';

const ProfileHeader = ({ userData, isEditing, setIsEditing, isRecording, startScreenRecording, stopScreenRecording, imagePreview }) => {
  return (
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
  );
};

export default ProfileHeader;