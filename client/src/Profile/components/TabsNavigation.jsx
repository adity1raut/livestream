
const TabsNavigation = ({ activeTab, setActiveTab }) => {
    return (
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
    );
  };
  
  export default TabsNavigation;