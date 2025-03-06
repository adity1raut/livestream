// components/ProfileDetails.js
const ProfileDetails = ({ userData }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
        {/* Username */}
        <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm border border-purple-500/10 transform transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg hover:-translate-y-1">
          <p className="text-sm font-medium text-purple-400 mb-2">Username</p>
          <p className="text-xl font-semibold text-white">{userData.username}</p>
        </div>
  
        {/* Email */}
        <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm border border-purple-500/10 transform transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg hover:-translate-y-1">
          <p className="text-sm font-medium text-purple-400 mb-2">Email</p>
          <p className="text-xl font-semibold text-white">{userData.email}</p>
        </div>
  
        {/* Full Name */}
        <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm border border-purple-500/10 transform transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg hover:-translate-y-1">
          <p className="text-sm font-medium text-purple-400 mb-2">Full Name</p>
          <p className="text-xl font-semibold text-white">
            {userData.firstName} {userData.lastName}
          </p>
        </div>
  
        {/* Joined On */}
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
      </div>
    );
  };
  
  export default ProfileDetails;