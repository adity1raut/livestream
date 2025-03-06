
import { Link } from 'react-router-dom';

const VideosTab = () => {
  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">My Videos</h2>
        <Link 
          to="/uplode-video" 
          className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 flex items-center"
        >
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
          to="/uplode-video" 
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all duration-300 inline-block"
        >
          Upload Your First Video
        </Link>
      </div>
    </div>
  );
};

export default VideosTab;