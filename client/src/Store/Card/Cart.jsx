import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  Store,
  CreditCard
} from 'lucide-react';

export default function Cart() {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/stores/cart', {
        withCredentials: true
      });
      setCart(res.data);
    } catch (error) {
      setError('Error fetching cart');
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 0) return;

    setUpdating(prev => ({ ...prev, [productId]: true }));
    setError('');

    try {
      const res = await axios.put('/api/stores/cart/update', {
        productId,
        quantity: newQuantity
      }, {
        withCredentials: true
      });
      setCart(res.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Error updating cart');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeItem = async (productId) => {
    if (!window.confirm('Remove this item from cart?')) return;

    setUpdating(prev => ({ ...prev, [productId]: true }));
    setError('');

    try {
      const res = await axios.delete(`/api/stores/cart/remove/${productId}`, {
        withCredentials: true
      });
      setCart(res.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Error removing item');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Clear entire cart?')) return;

    setLoading(true);
    setError('');

    try {
      await axios.delete('/api/stores/cart/clear', {
        withCredentials: true
      });
      setCart({ items: [], totalAmount: 0 });
    } catch (error) {
      setError(error.response?.data?.error || 'Error clearing cart');
    } finally {
      setLoading(false);
    }
  };

  const calculateItemTotal = (price, quantity) => {
    return (price * quantity).toFixed(2);
  };

  const calculateTotalAmount = () => {
    return cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0).toFixed(2);
  };

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => window.location.href = '/products'}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart size={32} />
          Shopping Cart
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {cart.items && cart.items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Cart Items ({cart.items.length})</h2>
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
              >
                <Trash2 size={16} />
                Clear Cart
              </button>
            </div>

            {cart.items.map((item) => (
              <div key={item.product._id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 flex-shrink-0">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{item.product.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Store size={14} />
                          <span>{item.product.store.name}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.product._id)}
                        disabled={updating[item.product._id]}
                        className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.product.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-blue-600">
                          ${item.product.price}
                        </span>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            disabled={updating[item.product._id] || item.quantity <= 1}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-3 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                            {updating[item.product._id] ? '...' : item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            disabled={updating[item.product._id] || item.quantity >= item.product.stock}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold">
                          ${calculateItemTotal(item.product.price, item.quantity)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Stock: {item.product.stock}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>${calculateTotalAmount()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${calculateTotalAmount()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  // Navigate to checkout (implement according to your routing)
                  window.location.href = '/checkout';
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={20} />
                Proceed to Checkout
              </button>

              <button
                onClick={() => window.location.href = '/products'}
                className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>

              {/* Cart Stats */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-semibold mb-2">Cart Statistics</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Items:</span>
                    <span>{cart.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unique Products:</span>
                    <span>{cart.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stores:</span>
                    <span>{new Set(cart.items.map(item => item.product.store._id)).size}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-md p-12">
            <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <button
              onClick={() => window.location.href = '/products'}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}