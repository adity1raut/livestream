import React, { useState, useEffect } from 'react';
import { ArrowLeft, Store, User, Calendar, Package, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

function StoreDetail({ store, onBack }) {
  const { getStoreProducts } = useStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [store._id, currentPage, sortBy, sortOrder]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStoreProducts(store._id, {
        page: currentPage,
        limit: 12,
        sort: sortBy,
        order: sortOrder
      });
      
      if (result?.success) {
        setProducts(result.data.products || []);
        setTotalPages(result.data.totalPages || 1);
      } else {
        setError(result?.message || 'Failed to fetch products');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Stores</span>
      </button>

      {/* Store Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
        <div className="flex items-start space-x-6">
          {store.logo ? (
            <img
              src={store.logo}
              alt={store.name}
              className="w-24 h-24 rounded-xl object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-blue-100 rounded-xl flex items-center justify-center">
              <Store className="h-12 w-12 text-blue-600" />
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>
            <div className="flex items-center space-x-4 text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>by {store.owner?.profile?.name || store.owner?.username}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Since {new Date(store.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Package className="h-4 w-4" />
                <span>{products.length} products</span>
              </div>
            </div>
            {store.description && (
              <p className="text-gray-600 leading-relaxed">{store.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Products</h2>
          
          {/* Sort Controls */}
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Date Added</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <div 
                  key={product._id} 
                  className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleProductClick(product._id)}
                >
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 rounded-lg object-cover mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">{product.name}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-blue-600">${product.price}</span>
                    {product.ratings && product.ratings.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {renderStars(calculateAverageRating(product.ratings))}
                        </div>
                        <span className="text-sm text-gray-500">
                          ({product.ratings.length})
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {product.stock !== undefined && (
                    <div className="text-sm text-gray-500">
                      Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                    </div>
                  )}

                  {/* Click indicator */}
                  <div className="mt-3 text-center">
                    <span className="text-xs text-blue-600 font-medium">Click to view details</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loading}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No products available in this store yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StoreDetail;