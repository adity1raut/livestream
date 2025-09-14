import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const CreateStreamModal = ({ isOpen, onClose, onStreamCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/stream/create', {
        title: title.trim(),
        description: description.trim()
      });

      if (response.status === 201) {
        onStreamCreated(response.data);
        setTitle('');
        setDescription('');
        onClose();
      }
    } catch (error) {
      console.error('Error creating stream:', error);
      alert('Failed to create stream. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Stream</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Stream Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter stream title"
              maxLength={100}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
              placeholder="Describe your stream"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length}/500 characters
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !title.trim()}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Stream'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStreamModal;