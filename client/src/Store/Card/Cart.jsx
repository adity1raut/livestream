import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProduct } from '../../context/ProductContext';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  Store,
  CreditCard,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function Cart() {
  const { user, isAuthenticated } = useAuth();
  const { 
    cart, 
    cartLoading, 
    fetchCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    getCartItemCount 
  } = useProduct();
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleRefreshCart = async () => {
    setRefreshing(true);
    setError('');
    try {
      await fetchCart();
      setSuccess('Cart refreshed successfully');
    } catch (error) {
      setError('Failed to refresh cart');
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 0) return;

    setUpdating(prev => ({ ...prev, [productId]: true }));
    setError('');
    setSuccess('');

    try {
      const result = await updateCartItem(productId, newQuantity);
      if (result.success) {
        setSuccess(result.message || 'Cart updated successfully');
      } else {
        setError(result.message || 'Failed to update cart');
      }
    } catch (error) {
      setError('Error updating cart item');
      console.error('Update cart error:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveItem = async (productId, productName) => {
    if (!window.confirm(`Remove "${productName}" from cart?`)) return;

    setUpdating(prev => ({ ...prev, [productId]: true }));
    setError('');
    setSuccess('');

    try {
      const result = await removeFromCart(productId);
      if (result.success) {
        setSuccess(result.message || 'Item removed from cart');
      } else {
        setError(result.message || 'Failed to remove item');
      }
    } catch (error) {
      setError('Error removing item from cart');
      console.error('Remove item error:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart? This action cannot be undone.')) return;

    setError('');
    setSuccess('');
    
    try {
      const result = await clearCart();
      if (result.success) {
        setSuccess(result.message || 'Cart cleared successfully');
      } else {
        setError(result.message || 'Failed to clear cart');
      }
    } catch (error) {
      setError('Error clearing cart');
      console.error('Clear cart error:', error);
    }
  };

  const calculateItemTotal = (price, quantity) => {
    if (typeof price !== 'number' || typeof quantity !== 'number') {
      return '0.00';
    }
    return (price * quantity).toFixed(2);
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return '0.00';
    }
    return price.toFixed(2);
  };

  const safeCart = cart || { items: [], totalAmount: 0 };
  const safeItems = Array.isArray(safeCart.items) ? safeCart.items.filter(item => item.product) : [];
  const totalItems = getCartItemCount();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your shopping cart.</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => window.location.href = '/products'}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartLoading && !cart.items?.length) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin mr-2" size={24} />
          <span>Loading cart...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 pt-40">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.location.href = '/products'}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart size={32} />
            Shopping Cart
            {totalItems > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
            )}
          </h1>
        </div>
        <button
          onClick={handleRefreshCart}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={16} />
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {safeItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Cart Items ({safeItems.length} product{safeItems.length !== 1 ? 's' : ''})
              </h2>
              {safeItems.length > 0 && (
                <button
                  onClick={handleClearCart}
                  disabled={cartLoading}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 disabled:opacity-50 transition-colors"
                >
                  <Trash2 size={16} />
                  Clear Cart
                </button>
              )}
            </div>

            {cartLoading && (
              <div className="text-center py-4">
                <Loader2 className="animate-spin mx-auto" size={24} />
                <p className="text-gray-600 mt-2">Updating cart...</p>
              </div>
            )}

            {safeItems.map((item) => {
              const product = item.product;
              const isUpdating = updating[product._id];
              const itemTotal = calculateItemTotal(product.price, item.quantity);
              
              return (
                <div key={product._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.name}</h3>
                          {product.store && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Store size={14} />
                              <span>{product.store.name}</span>
                            </div>
                          )}
                          {product.description && (
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(product._id, product.name)}
                          disabled={isUpdating}
                          className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50 transition-colors ml-4"
                          title="Remove from cart"
                        >
                          {isUpdating ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="text-lg font-bold text-blue-600">
                            ${formatPrice(product.price)}
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                            <button
                              onClick={() => handleUpdateQuantity(product._id, item.quantity - 1)}
                              disabled={isUpdating || item.quantity <= 1}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                              title="Decrease quantity"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center font-medium">
                              {isUpdating ? '...' : item.quantity || 0}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(product._id, item.quantity + 1)}
                              disabled={isUpdating || item.quantity >= (product.stock || 0)}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                              title="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            ${itemTotal}
                          </div>
                          <div className="text-sm text-gray-600">
                            Stock: {product.stock || 0} available
                          </div>
                          {item.quantity >= (product.stock || 0) && (
                            <div className="text-xs text-orange-600 font-medium">
                              Max quantity reached
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
                  <span className="font-medium">${formatPrice(safeCart.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${formatPrice(safeCart.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/checkout'}
                  disabled={cartLoading || safeItems.length === 0}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard size={20} />
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => window.location.href = '/products'}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Cart Stats */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-semibold mb-3 text-gray-900">Cart Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-medium">{totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unique Products:</span>
                    <span className="font-medium">{safeItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Different Stores:</span>
                    <span className="font-medium">
                      {new Set(safeItems.filter(item => item.product?.store?._id).map(item => item.product.store._id)).size}
                    </span>
                  </div>
                  {safeCart.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium text-xs">
                        {new Date(safeCart.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-md p-12 border border-gray-200">
            <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/products'}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </button>
              <div className="text-sm text-gray-500">
                Or <a href="/stores" className="text-blue-600 hover:underline">browse stores</a> to discover new products
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}