import React, { useRef, useState } from "react";

const LiveStream = () => {
  const videoRef = useRef(null); // Reference to the video element
  const [stream, setStream] = useState(null); // State to store the media stream
  const [isRecording, setIsRecording] = useState(false); // State to track recording status

  // Function to start screen recording
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

  return (
    <div>
      <h1>Live Streaming</h1>
      <button onClick={isRecording ? stopScreenRecording : startScreenRecording}>
        {isRecording ? "Stop Streaming" : "Start Live Streaming"}
      </button>
      <video ref={videoRef} autoPlay muted style={{ width: "100%", maxWidth: "600px" }} />
    </div>
  );
};

export default LiveStream;