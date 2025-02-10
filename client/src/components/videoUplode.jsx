import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function VideoUpload() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('videoFile', videoFile);
        formData.append('uploadedBy', 'user_id'); // Replace with actual user ID

        try {
            const response = await axios.post('http://localhost:5000/api/videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Video uploaded successfully!');
            setUploadStatus('Video uploaded successfully!');
        } catch (error) {
            toast.error('Error uploading video: ' + error.message);
            setUploadStatus('Error uploading video: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">Upload Video</h1>
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded shadow-md">
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Title:</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        className="w-full px-3 py-2 border rounded" 
                        required 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Description:</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        className="w-full px-3 py-2 border rounded" 
                        required 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Video File:</label>
                    <input 
                        type="file" 
                        accept="video/*" 
                        onChange={(e) => setVideoFile(e.target.files[0])} 
                        className="w-full px-3 py-2 border rounded" 
                        required 
                    />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700">Upload</button>
            </form>
            <ToastContainer />
            {uploadStatus && <p className="mt-4 font-bold">{uploadStatus}</p>}
        </div>
    );
}

export default VideoUpload;
