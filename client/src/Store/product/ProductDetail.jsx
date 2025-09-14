import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProduct } from '../../context/ProductContext';
import { useStore } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, ShoppingCart, Store, MessageCircle, Heart, Edit, Save, X, Plus, Trash2 } from 'lucide-react';

export default function ProductDetail() {
  const { productId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { getProductById, addProductRating, addToCart, toggleWishlist, updateProduct } = useProduct();
  const { userStore } = useStore();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    price: '',
    stock: ''
  });
  const [newImages, setNewImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [updating, setUpdating] = useState(false);

  // Check if current user owns this product
  const isProductOwner = isAuthenticated && 
    userStore && 
    product && 
    product.store._id === userStore._id;

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (product && isEditing) {
      setEditData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || ''
      });
    }
  }, [product, isEditing]);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const productData = await getProductById(productId);
      if (productData) {
        setProduct(productData);
        setError('');
      } else {
        setError('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Error fetching product details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset states
      setEditData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || ''
      });
      setNewImages([]);
      setImagesToRemove([]);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
  };

  const handleImageRemove = (imageUrl) => {
    setImagesToRemove(prev => [...prev, imageUrl]);
  };

  const handleNewImageRemove = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateProduct = async () => {
    if (!editData.name.trim() || !editData.price || !editData.stock) {
      setError('Please fill in all required fields');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('name', editData.name.trim());
      formData.append('description', editData.description.trim());
      formData.append('price', parseFloat(editData.price));
      formData.append('stock', parseInt(editData.stock));

      // Add new images
      newImages.forEach(image => {
        formData.append('images', image);
      });

      // Add images to remove
      if (imagesToRemove.length > 0) {
        formData.append('removeImages', JSON.stringify(imagesToRemove));
      }

      const result = await updateProduct(userStore._id, productId, formData);

      if (result.success) {
        setProduct(result.data);
        setIsEditing(false);
        setNewImages([]);
        setImagesToRemove([]);
        setSuccess('Product updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to update product');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      setError('Error updating product');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please login to add a rating');
      return;
    }

    setSubmittingRating(true);
    setError('');
    setSuccess('');

    try {
      const result = await addProductRating(productId, rating, review);
      
      if (result.success) {
        setProduct(result.data);
        setReview('');
        setRating(5);
        setSuccess('Rating submitted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Error submitting rating');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      setError('Error submitting rating');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (addingToCart) return;

    // Check if product has sufficient stock
    if (quantity > product.stock) {
      setError(`Only ${product.stock} items available in stock`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setAddingToCart(true);
    setError('');
    setSuccess('');

    try {
      // Pass the storeId which is required by your backend
      const result = await addToCart(product._id, quantity, product.store._id);
      
      if (result.success) {
        setSuccess(`${quantity} item(s) added to cart successfully!`);
        setTimeout(() => setSuccess(''), 3000);
        
        // Update cart icon count if the function exists
        if (window.updateCartCount && result.data?.items) {
          const totalItems = result.data.items.reduce((sum, item) => sum + item.quantity, 0);
          window.updateCartCount(totalItems);
        }
      } else {
        setError(result.message || 'Failed to add product to cart');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add product to cart');
      setTimeout(() => setError(''), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const result = await toggleWishlist(product._id);
      if (result.success) {
        setSuccess(result.inWishlist ? 'Added to wishlist!' : 'Removed from wishlist!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Error updating wishlist');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      setError('Error updating wishlist');
      setTimeout(() => setError(''), 3000);
    }
  };

  const calculateAverageRating = () => {
    if (!product?.ratings || product.ratings.length === 0) return 0;
    const sum = product.ratings.reduce((acc, r) => acc + r.rating, 0);
    return (sum / product.ratings.length).toFixed(1);
  };

  const renderStars = (rating, size = 20) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}
      />
    ));
  };

  const getDisplayImages = () => {
    if (!product?.images) return [];
    return product.images.filter(img => !imagesToRemove.includes(img));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl p-8 max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Product Not Found</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const displayImages = getDisplayImages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 p-4 pt-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          {isProductOwner && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleUpdateProduct}
                    disabled={updating}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save size={16} />
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditToggle}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  <Edit size={16} />
                  Edit Product
                </button>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div>
              <div className="mb-4">
                {displayImages.length > 0 ? (
                  <div className="relative">
                    <img
                      src={displayImages[selectedImage] || displayImages[0]}
                      alt={isEditing ? editData.name : product?.name}
                      className="w-full h-96 object-cover rounded-lg shadow-md"
                    />
                    {isEditing && (
                      <button
                        onClick={() => handleImageRemove(displayImages[selectedImage] || displayImages[0])}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-96 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-lg">No Image Available</span>
                  </div>
                )}
              </div>
              
              {/* Image thumbnails */}
              {displayImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto mb-4">
                  {displayImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-purple-500' : 'border-gray-600'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${isEditing ? editData.name : product?.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* New images preview and add button for editing */}
              {isEditing && (
                <>
                  {newImages.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">New Images:</h4>
                      <div className="flex gap-2 overflow-x-auto">
                        {newImages.map((image, index) => (
                          <div key={index} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-green-500">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`New ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => handleNewImageRemove(index)}
                              className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="flex items-center gap-2 bg-purple-900/40 text-purple-400 px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-800/50 w-fit border border-purple-700/50">
                      <Plus size={16} />
                      Add Images
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageAdd}
                        className="hidden"
                      />
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Product Details */}
            <div>
              {isEditing ? (
                // Edit mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Product Name *</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Stock *</label>
                      <input
                        type="number"
                        value={editData.stock}
                        onChange={(e) => handleInputChange('stock', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows="4"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
                      placeholder="Enter product description"
                    />
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <h1 className="text-3xl font-bold text-white mb-4">{product?.name}</h1>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl font-bold text-purple-400">${product?.price}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      product?.stock > 0 
                        ? 'bg-green-900/40 text-green-400 border border-green-700/50' 
                        : 'bg-red-900/40 text-red-400 border border-red-700/50'
                    }`}>
                      {product?.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {renderStars(Math.round(calculateAverageRating()))}
                    </div>
                    <span className="text-gray-400">
                      {calculateAverageRating()} ({product?.ratings?.length || 0} reviews)
                    </span>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-white">Description</h3>
                    <p className="text-gray-400 leading-relaxed">
                      {product?.description || 'No description available.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                    <Store size={24} className="text-purple-400" />
                    <div>
                      <p className="font-semibold text-white">{product?.store?.name}</p>
                      <p className="text-sm text-gray-400">Store Owner</p>
                    </div>
                  </div>

                  {/* Quantity Selector - only show if not product owner and stock available */}
                  {!isProductOwner && product?.stock > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Quantity
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors text-white"
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg min-w-[60px] text-center text-white">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors text-white"
                          disabled={quantity >= product.stock}
                        >
                          +
                        </button>
                        <span className="text-sm text-gray-400 ml-2">
                          Max: {product.stock}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons - only show if not product owner */}
                  {!isProductOwner && (
                    <div className="flex gap-4 mb-8">
                      <button
                        onClick={handleAddToCart}
                        disabled={product?.stock === 0 || addingToCart || quantity > product?.stock}
                        className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={20} />
                        {addingToCart ? 'Adding to Cart...' :
                         !isAuthenticated ? 'Login to Add to Cart' : 
                         product?.stock === 0 ? 'Out of Stock' :
                         quantity > product?.stock ? 'Insufficient Stock' :
                         'Add to Cart'}
                      </button>
                      
                      {isAuthenticated && (
                        <button
                          onClick={handleWishlistToggle}
                          className="px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Heart size={20} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Additional product info */}
                  {!isProductOwner && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Quick Actions</h4>
                      <div className="flex gap-2 text-sm">
                        <button
                          onClick={() => navigate('/cart')}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View Cart
                        </button>
                        <span className="text-gray-400">•</span>
                        <button
                          onClick={() => navigate('/wishlist')}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View Wishlist
                        </button>
                        <span className="text-gray-400">•</span>
                        <button
                          onClick={() => navigate('/products')}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {(error || success) && (
                <div className={`p-4 rounded-lg mb-4 ${
                  error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {error || success}
                </div>
              )}
            </div>
          </div>

          {/* Rating and Reviews Section - existing code */}
          {/* ...existing rating and reviews code... */}
        </div>
      </div>
    </div>
  );
}