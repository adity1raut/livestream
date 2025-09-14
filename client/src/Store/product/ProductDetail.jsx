import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProduct } from '../../context/ProductContext';
import { useStore } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, ShoppingCart, Store, MessageCircle, Heart, Edit, Save, X, Plus, Trash2 } from 'lucide-react';

export default function ProductDetail({ productId }) {
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
      } else {
        setError('Product not found');
      }
    } catch (error) {
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

    setAddingToCart(true);
    setError('');
    setSuccess('');

    try {
      const result = await addToCart(product._id, quantity);
      
      if (result.success) {
        setSuccess(`${quantity} item(s) added to cart successfully!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to add product to cart');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
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
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  const getDisplayImages = () => {
    if (!product?.images) return [];
    return product.images.filter(img => !imagesToRemove.includes(img));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const displayImages = getDisplayImages();

  return (
    <div className="max-w-6xl mx-auto p-6 pt-20">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
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
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Edit size={16} />
                Edit Product
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
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
                    selectedImage === index ? 'border-blue-500' : 'border-gray-300'
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

          {/* New images preview */}
          {isEditing && newImages.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">New Images:</h4>
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

          {/* Add images button for editing */}
          {isEditing && (
            <div className="mb-4">
              <label className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-200 w-fit">
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
          )}
        </div>

        {/* Product Details */}
        <div>
          {isEditing ? (
            // Edit mode
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    value={editData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product description"
                />
              </div>
            </div>
          ) : (
            // View mode
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product?.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-blue-600">${product?.price}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  product?.stock > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product?.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {renderStars(Math.round(calculateAverageRating()))}
                </div>
                <span className="text-gray-600">
                  {calculateAverageRating()} ({product?.ratings?.length || 0} reviews)
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product?.description || 'No description available.'}
                </p>
              </div>

              <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                <Store size={24} className="text-gray-600" />
                <div>
                  <p className="font-semibold">{product?.store?.name}</p>
                  <p className="text-sm text-gray-600">Store Owner</p>
                </div>
              </div>

              {/* Quantity Selector - only show if not product owner */}
              {!isProductOwner && product?.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 border border-gray-300 rounded-md">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons - only show if not product owner */}
              {!isProductOwner && (
                <div className="flex gap-4 mb-8">
                  <button
                    onClick={handleAddToCart}
                    disabled={product?.stock === 0 || addingToCart}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    {addingToCart ? 'Adding to Cart...' :
                     !isAuthenticated ? 'Login to Add to Cart' : 
                     product?.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  
                  {isAuthenticated && (
                    <button
                      onClick={handleWishlistToggle}
                      className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Heart size={20} />
                    </button>
                  )}
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

      {/* Rating and Reviews Section - only show if not editing */}
      {!isEditing && (
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>
          
          {/* Add Rating Form - only show if not product owner */}
          {isAuthenticated && !isProductOwner && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle size={20} />
                Write a Review
              </h3>

              <form onSubmit={handleSubmitRating}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-2xl focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-gray-600">({rating} stars)</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your experience with this product..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingRating}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submittingRating ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {/* Display Reviews */}
          <div className="space-y-6">
            {product?.ratings && product.ratings.length > 0 ? (
              product.ratings.map((rating, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">
                        {rating.user?.profile?.name || rating.user?.username || 'Anonymous'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(rating.rating, 16)}
                        <span className="text-sm text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {rating.review && (
                    <p className="text-gray-700">{rating.review}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}