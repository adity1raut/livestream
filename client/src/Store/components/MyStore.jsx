import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Store as StoreIcon, Package, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useProduct } from '../../context/ProductContext';
import StoreForm from './StoreForm';
import StoreCard from './StoreCard';

function MyStore() {
  const navigate = useNavigate();
  const { 
    userStore, 
    loading, 
    error, 
    getCurrentUserStore, 
    createStore, 
    updateStore, 
    deleteStore,
    getStoreProducts,
    clearError 
  } = useStore();
  const { isAuthenticated } = useAuth();
  const { deleteProduct } = useProduct();
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isAuthenticated) {
      getCurrentUserStore();
    }
  }, [isAuthenticated, getCurrentUserStore]);

  useEffect(() => {
    if (userStore?._id) {
      fetchStoreProducts();
    }
  }, [userStore?._id]);

  // Clear context errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const fetchStoreProducts = async () => {
    if (!userStore?._id) return;
    
    setLocalLoading(true);
    try {
      const result = await getStoreProducts(userStore._id);
      if (result?.success) {
        setStoreProducts(result.data.products || []);
      } else {
        showMessage('error', result?.message || 'Failed to fetch store products');
      }
    } catch (error) {
      showMessage('error', 'Failed to fetch store products');
    } finally {
      setLocalLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleCreateStore = async (storeData) => {
    try {
      const result = await createStore(storeData);
      if (result?.success) {
        setShowForm(false);
        showMessage('success', 'Store created successfully!');
        // Refresh user store data
        getCurrentUserStore();
      } else {
        showMessage('error', result?.message || 'Failed to create store');
      }
    } catch (error) {
      showMessage('error', 'Failed to create store');
    }
  };

  const handleUpdateStore = async (storeData) => {
    if (!editingStore) return;
    
    try {
      const result = await updateStore(editingStore._id, storeData);
      if (result?.success) {
        setShowForm(false);
        setEditingStore(null);
        showMessage('success', 'Store updated successfully!');
        // Refresh user store data
        getCurrentUserStore();
      } else {
        showMessage('error', result?.message || 'Failed to update store');
      }
    } catch (error) {
      showMessage('error', 'Failed to update store');
    }
  };

  const handleEditStore = (store) => {
    setEditingStore(store);
    setShowForm(true);
  };

  const handleDeleteStore = async (store) => {
    if (!window.confirm('Are you sure you want to delete your store? This action cannot be undone and will delete all associated products.')) {
      return;
    }

    try {
      const result = await deleteStore(store._id);
      if (result?.success) {
        showMessage('success', 'Store deleted successfully!');
        // Clear products since store is deleted
        setStoreProducts([]);
      } else {
        showMessage('error', result?.message || 'Failed to delete store');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete store');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStore(null);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setLocalLoading(true);
    try {
      const result = await deleteProduct(userStore._id, productId);
      if (result?.success) {
        showMessage('success', 'Product deleted successfully!');
        // Refresh store products and user store data
        await Promise.all([
          fetchStoreProducts(),
          getCurrentUserStore()
        ]);
      } else {
        showMessage('error', result?.message || 'Failed to delete product');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete product');
    } finally {
      setLocalLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <StoreIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-500">Please login to manage your store.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-40">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Store</h1>
          <p className="text-gray-500 mt-1">Manage your store and products</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* All Stores Button */}
          <button
            onClick={() => navigate('/stores')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <StoreIcon className="h-4 w-4" />
            <span>All Stores</span>
          </button>
          
          {!userStore && (
            <button
              onClick={() => setShowForm(true)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>Create Store</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {(message.text || error) && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800' 
            : 'bg-red-50 text-red-800'
        }`}>
          {message.text || error}
        </div>
      )}

      {/* Content */}
      {userStore ? (
        <div className="space-y-6">
          {/* Store Card */}
          <div className="max-w-md">
            <StoreCard
              store={userStore}
              showActions={true}
              onEdit={handleEditStore}
              onDelete={handleDeleteStore}
            />
          </div>

          {/* Store Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {storeProducts.length}
              </div>
              <div className="text-sm text-gray-500">Total Products</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {new Date(userStore.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500">Created Date</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-purple-600 mb-1">Active</div>
              <div className="text-sm text-gray-500">Store Status</div>
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Products</h2>
              <button 
                onClick={() => navigate('/add-product')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </button>
            </div>
            
            {(loading || localLoading) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : storeProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {storeProducts.map((product) => (
                  <div key={product._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">${product.price}</p>
                        <p className="text-xs text-gray-400">Stock: {product.stock}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => navigate(`/edit-product/${product._id}`)}
                        className="flex-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button 
                        onClick={() => navigate(`/products/${product._id}`)}
                        className="flex-1 px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product._id)}
                        disabled={localLoading}
                        className="flex-1 px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p>No products yet. Add your first product to get started!</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <StoreIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Store Found</h2>
          <p className="text-gray-500 mb-6">Create your first store to start selling!</p>
          <button
            onClick={() => setShowForm(true)}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
            <span>Create Your Store</span>
          </button>
        </div>
      )}

      {/* Store Form Modal */}
      <StoreForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={editingStore ? handleUpdateStore : handleCreateStore}
        store={editingStore}
        loading={loading}
      />
    </div>
  );
}

export default MyStore;