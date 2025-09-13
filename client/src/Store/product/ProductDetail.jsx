import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, ArrowLeft, ShoppingCart, Store, MessageCircle } from 'lucide-react';

export default function ProductDetail({ productId }) {
  const { user, isAuthenticated } = useAuth();
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

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/api/stores/products/${productId}`);
      setProduct(res.data);
    } catch (error) {
      setError('Product not found');
    } finally {
      setLoading(false);
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
      const res = await axios.post(
        `/api/stores/products/${productId}/rating`,
        { rating, review },
        { withCredentials: true }
      );
      
      setProduct(res.data);
      setReview('');
      setSuccess('Rating submitted successfully!');
    } catch (error) {
      setError(error.response?.data?.error || 'Error submitting rating');
    } finally {
      setSubmittingRating(false);
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="mb-4">
            {product?.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-lg">No Image Available</span>
              </div>
            )}
          </div>
          
          {product?.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
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

          <div className="flex gap-4 mb-8">
            <button
              onClick={async () => {
                if (!isAuthenticated) {
                  navigate('/login');
                  return;
                }
                if (addingToCart) return;

                setAddingToCart(true);
                setError('');
                setSuccess('');

                try {
                  const res = await axios.post('/api/stores/cart/add', {
                    productId: product._id,
                    quantity: 1
                  }, {
                    withCredentials: true
                  });

                  setSuccess('Product added to cart successfully!');
                  
                  // Update cart count in CartIcon
                  const cartRes = await axios.get('/api/stores/cart', {
                    withCredentials: true
                  });
                  const totalItems = cartRes.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                  if (window.updateCartCount) {
                    window.updateCartCount(totalItems);
                  }

                  setTimeout(() => setSuccess(''), 3000);
                } catch (err) {
                  setError(err.response?.data?.error || 'Failed to add product to cart');
                  setTimeout(() => setError(''), 3000);
                } finally {
                  setAddingToCart(false);
                }
              }}
              disabled={product?.stock === 0 || addingToCart}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              {addingToCart ? 'Adding to Cart...' :
               !isAuthenticated ? 'Login to Add to Cart' : 
               product?.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
          
          {(error || success) && (
            <div className={`p-4 rounded-lg mb-4 ${
              error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {error || success}
            </div>
          )}
        </div>
      </div>

      {/* Rating and Reviews Section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>
        
        {/* Add Rating Form */}
        {isAuthenticated && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle size={20} />
              Write a Review
            </h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}

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
    </div>
  );
}