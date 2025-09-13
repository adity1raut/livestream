import React, { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function ProductCard({ product, onWishlistToggle }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { isAuthenticated } = useAuth();

  const averageRating = product.ratings?.length > 0 
    ? product.ratings.reduce((acc, rating) => acc + rating.rating, 0) / product.ratings.length 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={product.images?.[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={(e) => onWishlistToggle(product._id, e)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50"
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
        </button>
        {product.stock <= 5 && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
            Only {product.stock} left
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">
              {averageRating.toFixed(1)} ({product.ratings?.length || 0})
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
          <span className="text-sm text-gray-500">Stock: {product.stock}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>By: {product.store?.name}</span>
        </div>

        <button 
          onClick={async () => {
            if (!isAuthenticated) {
              window.location.href = '/login';
              return;
            }
            
            try {
              setIsAddingToCart(true);
              const res = await axios.post('/api/stores/cart/add', {
                productId: product._id,
                quantity: 1
              }, {
                withCredentials: true
              });
              
              // Update cart count if the global function exists
              if (window.updateCartCount && res.data.items) {
                const totalItems = res.data.items.reduce((sum, item) => sum + item.quantity, 0);
                window.updateCartCount(totalItems);
              }
              
              // Show success feedback
              alert('Product added to cart!');
            } catch (error) {
              console.error('Error adding to cart:', error);
              alert(error.response?.data?.error || 'Error adding to cart');
            } finally {
              setIsAddingToCart(false);
            }
          }}
          disabled={isAddingToCart || product.stock === 0}
          className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 
            ${product.stock === 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : isAddingToCart 
                ? 'bg-blue-400 cursor-wait' 
                : 'bg-blue-600 hover:bg-blue-700'} 
            text-white transition-colors`}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.stock === 0 
            ? 'Out of Stock' 
            : isAddingToCart 
              ? 'Adding...' 
              : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;