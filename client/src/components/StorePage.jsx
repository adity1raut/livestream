import React, { useState, useEffect } from 'react';

const StorePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    rating: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartSuccess, setCartSuccess] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedFile]);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items');
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

    if (!selectedFile) {
      setFormError('Please select an image');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setFormError('User is not authenticated. Please log in.');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('image', selectedFile);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('rating', formData.rating);

      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const newItem = await response.json();
      setItems((prev) => [newItem, ...prev]);
      setFormSuccess(true);
      resetForm();
      setShowForm(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', price: '', rating: '' });
    setSelectedFile(null);
    setPreview(null);
    setFormError(null);
    setFormSuccess(false);
  };

  const handleAddToCart = (item) => {
    setCart((prev) => [...prev, item]);
    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => {
          setShowForm((prev) => !prev);
          if (!showForm) resetForm();
        }}
        className="mb-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        {showForm ? 'Close Form' : 'Add New Item'}
      </button>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Add New Item</h2>
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
            </div>

            {formError && <div className="text-red-600">{formError}</div>}
            {formSuccess && <div className="text-green-600">Item added successfully!</div>}

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Submit
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

      <h2 className="text-2xl font-bold mb-6">Store Items</h2>
      {loading && <p className="text-gray-600">Loading items...</p>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(({ _id, image, title, price, rating }) => (
          <div key={_id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={image}
                alt={title}
                className="object-cover w-full h-48"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-2xl font-bold mb-2">${price}</p>
              <p className="text-yellow-500">Rating: {rating}/5</p>
              <button
                onClick={() => handleAddToCart({ _id, image, title, price, rating })}
                className="mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {cartSuccess && <div className="text-green-600 mt-4">Item added to cart successfully!</div>}
    </div>
  );
};

export default StorePage;
