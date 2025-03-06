
const StreamingTab = ({ isRecording, startScreenRecording, stopScreenRecording, videoRef }) => {
    return (
      <div className="animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Live Streaming</h2>
          {!isRecording && (
            <button
              onClick={startScreenRecording}
              className="bg-gradient-to-r from-green-600 to-green-800 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 flex items-center"
            >
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
                className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 flex items-center justify-center"
              >
                Start Streaming
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default StreamingTab;