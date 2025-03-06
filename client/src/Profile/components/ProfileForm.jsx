
import { motion } from 'framer-motion';

const ProfileForm = ({ formData, handleInputChange, handleImageChange, handleSubmit, imagePreview, setIsEditing }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md p-6 mb-8"
    >
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Name */}
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

        {/* Last Name */}
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

        {/* Email */}
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

        {/* Profile Image */}
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

        {/* Form Actions */}
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
    </motion.div>
  );
};

export default ProfileForm;