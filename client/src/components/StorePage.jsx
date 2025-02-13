import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const StorePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    rating: '',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'my-items'
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [viewMode]);

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedFile]);

  const fetchItems = async () => {
    try {
      const endpoint = viewMode === 'my-items' ? '/api/items/my-items' : '/api/items';
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await fetch(endpoint, { headers });
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setFormError(null);
    } else {
      setFormError('Please select a valid image file');
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!selectedFile && !selectedItem) {
      setFormError('Please select an image');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setFormError('Please log in to add or edit items');
        return;
      }

      const formDataToSend = new FormData();
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }
      formDataToSend.append('title', formData.title);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('rating', formData.rating);
      formDataToSend.append('description', formData.description);

      const url = selectedItem 
        ? `/api/items/${selectedItem._id}`
        : '/api/items';
      
      const method = selectedItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const responseData = await response.json();
      
      if (selectedItem) {
        setItems(prev => prev.map(item => 
          item._id === selectedItem._id ? responseData : item
        ));
      } else {
        setItems(prev => [responseData, ...prev]);
      }

      setFormSuccess(true);
      resetForm();
      setShowForm(false);
      setSelectedItem(null);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setItems(prev => prev.filter(item => item._id !== itemId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      price: item.price,
      rating: item.rating,
      description: item.description || '',
    });
    setPreview(item.image); // Set preview to the current image
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ title: '', price: '', rating: '', description: '' });
    setSelectedFile(null);
    setPreview(null);
    setFormError(null);
    setFormSuccess(false);
    setSelectedItem(null);
  };

  const handleAddToCart = (item) => {
    setCart((prev) => [...prev, item]);
    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 2000);
  };

  const isItemOwner = (item) => {
    const username = localStorage.getItem('username');
    return username === item.owner;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {isAuthenticated && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setViewMode('all')}
            className={`py-2 px-4 rounded-md ${
              viewMode === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setViewMode('my-items')}
            className={`py-2 px-4 rounded-md ${
              viewMode === 'my-items' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            My Items
          </button>
          <button
            onClick={() => {
              setShowForm((prev) => !prev);
              if (!showForm) resetForm();
            }}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            {showForm ? 'Close Form' : 'Add New Item'}
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {selectedItem ? 'Edit Item' : 'Add New Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Title"
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              required
              placeholder="Price"
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.rating}
              onChange={handleInputChange}
              required
              placeholder="Rating"
              className="w-full px-4 py-2 border rounded-md"
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description"
              className="w-full px-4 py-2 border rounded-md"
              rows="4"
            />
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
              {preview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-xs rounded-md border"
                  />
                </div>
              )}
              {selectedItem && !preview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    className="max-w-xs rounded-md border"
                  />
                </div>
              )}
            </div>

            {formError && <div className="text-red-600">{formError}</div>}
            {formSuccess && (
              <div className="text-green-600">
                Item {selectedItem ? 'updated' : 'added'} successfully!
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                {selectedItem ? 'Update' : 'Submit'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">
        {viewMode === 'my-items' ? 'My Items' : 'Store Items'}
      </h2>
      {loading && <p className="text-gray-600">Loading items...</p>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={item.image}
                alt={item.title}
                className="object-cover w-full h-48"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-2xl font-bold mb-2">${item.price}</p>
              <p className="text-yellow-500 mb-2">Rating: {item.rating}/5</p>
              <p className="text-gray-600 mb-2">{item.description}</p>
              <p className="text-sm text-gray-500 mb-4">
                Posted by: {item.owner}
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToCart(item)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add to Cart
                </button>
                
                {isAuthenticated && isItemOwner(item) && (
                  <>
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {cartSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white py-2 px-4 rounded-md shadow-lg">
          Item added to cart successfully!
        </div>
      )}
    </div>
  );
};

export default StorePage;