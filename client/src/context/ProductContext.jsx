import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // Product Management
  const getAllProducts = async (params = {}) => {
    setLoading(true);
    try {
      const res = await axios.get('/api/stores/products', { params });
      setProducts(res.data.products || []);
      return res.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getProductById = async (id) => {
    try {
      const res = await axios.get(`/api/stores/products/${id}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  };

  const addProduct = async (storeId, formData) => {
    try {
      const res = await axios.post(`/api/stores/${storeId}/products`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || error.message };
    }
  };

  const updateProduct = async (storeId, productId, formData) => {
    try {
      const res = await axios.put(`/api/stores/${storeId}/products/${productId}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || error.message };
    }
  };

  const deleteProduct = async (storeId, productId) => {
    try {
      await axios.delete(`/api/stores/${storeId}/products/${productId}`, {
        withCredentials: true
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || error.message };
    }
  };

  const getStoreProducts = async (storeId, params = {}) => {
    try {
      const res = await axios.get(`/api/stores/${storeId}/products`, { params });
      return res.data;
    } catch (error) {
      console.error('Error fetching store products:', error);
      return null;
    }
  };

  const addProductRating = async (productId, rating, review) => {
    try {
      const res = await axios.post(
        `/api/stores/products/${productId}/rating`,
        { rating, review },
        { withCredentials: true }
      );
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || error.message };
    }
  };

  // Search and Discovery
  const searchProducts = async (params = {}) => {
    setSearchLoading(true);
    try {
      const res = await axios.get('/api/stores/search/products', { params });
      setProducts(res.data.products || []);
      return res.data;
    } catch (error) {
      console.error('Error searching products:', error);
      return null;
    } finally {
      setSearchLoading(false);
    }
  };

  const getTrendingProducts = async (limit = 20) => {
    setLoading(true);
    try {
      const res = await axios.get('/api/stores/trending/products', {
        params: { limit }
      });
      return res.data;
    } catch (error) {
      console.error('Error fetching trending products:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Wishlist Management
  const toggleWishlist = async (productId) => {
    try {
      const res = await axios.post(`/api/stores/wishlist/add/${productId}`, {}, {
        withCredentials: true
      });
      
      if (res.data.inWishlist) {
        setWishlist(prev => [...prev, res.data.product]);
        return { success: true, message: res.data.message, inWishlist: true };
      } else {
        setWishlist(prev => prev.filter(item => item._id !== productId));
        return { success: true, message: res.data.message, inWishlist: false };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || error.message 
      };
    }
  };

  const getUserWishlist = async (page = 1, limit = 12) => {
    setLoading(true);
    try {
      const res = await axios.get('/api/stores/wishlist', {
        params: { page, limit },
        withCredentials: true
      });
      setWishlist(res.data.products || []);
      return res.data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Order Management
  const createOrder = async (addressId) => {
    setOrderLoading(true);
    try {
      const res = await axios.post('/api/stores/order/create', 
        { addressId }, 
        { withCredentials: true }
      );
      return { success: true, data: res.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || error.message 
      };
    } finally {
      setOrderLoading(false);
    }
  };

  const verifyPayment = async (paymentData) => {
    setOrderLoading(true);
    try {
      const res = await axios.post('/api/stores/order/verify', paymentData, {
        withCredentials: true
      });
      return { success: true, data: res.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || error.message 
      };
    } finally {
      setOrderLoading(false);
    }
  };

  // Store Analytics
  const getStoreAnalytics = async (storeId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/stores/${storeId}/analytics`, {
        withCredentials: true
      });
      return res.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cart Management
  const fetchCart = async () => {
    if (!isAuthenticated) return;
    setCartLoading(true);
    try {
      const response = await axios.get('/api/stores/cart', {
        withCredentials: true
      });
      setCart(response.data);
      updateCartIcon(response.data.items);
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return null;
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1, storeId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }
    setCartLoading(true);
    try {
      const response = await axios.post(
        `/api/stores/${storeId}/cart/add`, // Use storeId in URL
        { productId, quantity },
        { withCredentials: true }
      );
      setCart(response.data);
      updateCartIcon(response.data.items);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Failed to add to cart'
      };
    } finally {
      setCartLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    if (!isAuthenticated) return;
    setCartLoading(true);
    try {
      const response = await axios.put(
        '/api/stores/cart/update',
        { productId, quantity },
        { withCredentials: true }
      );
      setCart(response.data);
      updateCartIcon(response.data.items);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Failed to update cart'
      };
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return;
    setCartLoading(true);
    try {
      const response = await axios.delete(`/api/stores/cart/remove/${productId}`, {
        withCredentials: true
      });
      setCart(response.data);
      updateCartIcon(response.data.items);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Failed to remove from cart'
      };
    } finally {
      setCartLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    setCartLoading(true);
    try {
      await axios.delete('/api/stores/cart/clear', {
        withCredentials: true
      });
      setCart({ items: [], totalAmount: 0 });
      updateCartIcon([]);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Failed to clear cart'
      };
    } finally {
      setCartLoading(false);
    }
  };

  // Helper function to update cart icon
  const updateCartIcon = (items) => {
    const totalItems = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    if (window.updateCartCount) {
      window.updateCartCount(totalItems);
    }
  };

  // Effect to fetch cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart({ items: [], totalAmount: 0 });
    }
  }, [isAuthenticated]);

  return (
    <ProductContext.Provider value={{
      // State
      products,
      wishlist,
      cart,
      loading,
      searchLoading,
      orderLoading,
      cartLoading,

      // Product Management
      getAllProducts,
      getProductById,
      addProduct,
      updateProduct,
      deleteProduct,
      getStoreProducts,
      addProductRating,

      // Search and Discovery
      searchProducts,
      getTrendingProducts,

      // Wishlist Management
      toggleWishlist,
      getUserWishlist,

      // Cart Management
      fetchCart,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,

      // Order Management
      createOrder,
      verifyPayment,

      // Store Analytics
      getStoreAnalytics,

      // State Setters
      setProducts,
      setWishlist,
      setCart
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProduct = () => useContext(ProductContext);