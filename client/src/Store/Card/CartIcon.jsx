import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProduct } from '../../context/ProductContext';
import { ShoppingCart } from 'lucide-react';

export default function CartIcon() {
  const { isAuthenticated } = useAuth();
  const { cart } = useProduct();
  const [cartItemCount, setCartItemCount] = useState(0);

  // Calculate cart count from context
  useEffect(() => {
    if (isAuthenticated && cart && cart.items) {
      const totalItems = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartItemCount(totalItems);
    } else {
      setCartItemCount(0);
    }
  }, [isAuthenticated, cart]);

  // Function to update cart count (can be called from other components)
  const updateCartCount = (newCount) => {
    setCartItemCount(newCount);
  };

  // Expose updateCartCount function globally (optional)
  React.useEffect(() => {
    window.updateCartCount = updateCartCount;
    return () => {
      delete window.updateCartCount;
    };
  }, []);

  return (
    <button
      onClick={() => window.location.href = '/cart'}
      className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
      aria-label={`Shopping cart with ${cartItemCount} items`}
    >
      <ShoppingCart size={24} />
      {cartItemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
          {cartItemCount > 99 ? '99+' : cartItemCount}
        </span>
      )}
    </button>
  );
}