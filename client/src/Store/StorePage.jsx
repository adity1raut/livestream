// pages/StorePage.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Header from './components/Header';
import ItemForm from './components/ItemForm';
import ItemDetails from './components/ItemDetails';
import ItemGallery from './components/ItemGallery';
import SuccessToast from './components/SuccessToast';

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
  const [viewMode, setViewMode] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsView, setDetailsView] = useState(null);

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
      setShowForm(false); // Ensure this line is present
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
      if (detailsView && detailsView._id === itemId) {
        setDetailsView(null);
      }
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
    setPreview(item.image);
    setShowForm(true);
    setDetailsView(null);
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

  const showItemDetails = (item) => {
    setDetailsView(item);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <Header
        isAuthenticated={isAuthenticated}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showForm={showForm}
        setShowForm={setShowForm}
        resetForm={resetForm}
        setDetailsView={setDetailsView}
        cart={cart}
      />

      {showForm && (
        <ItemForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
          handleSubmit={handleSubmit}
          selectedFile={selectedFile}
          preview={preview}
          selectedItem={selectedItem}
          formError={formError}
          formSuccess={formSuccess}
          resetForm={resetForm}
        />
      )}

      {detailsView && (
        <ItemDetails
          detailsView={detailsView}
          setDetailsView={setDetailsView}
          handleAddToCart={handleAddToCart}
          isAuthenticated={isAuthenticated}
          isItemOwner={isItemOwner}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      )}

      <h2 className="text-2xl font-bold mb-6 text-indigo-700">
        {viewMode === 'my-items' ? 'My Items' : 'Store Gallery'}
      </h2>

      <ItemGallery
        items={items}
        showItemDetails={showItemDetails}
        loading={loading}
        error={error}
      />

      <SuccessToast cartSuccess={cartSuccess} />
    </div>
  );
};

export default StorePage;