import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

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
      const res = await axios.get("/api/stores/products", { params });
      setProducts(res.data.products || []);
      return res.data;
    } catch (error) {
      console.error("Error fetching products:", error);
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
      console.error("Error fetching product:", error);
      return null;
    }
  };

  const addProduct = async (storeId, formData) => {
    try {
      const res = await axios.post(
        `/api/stores/${storeId}/products`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return { success: true, data: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || error.message,
      };
    }
  };

  const updateProduct = async (storeId, productId, formData) => {
    try {
      const res = await axios.put(
        `/api/stores/${storeId}/products/${productId}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return { success: true, data: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || error.message,
      };
    }
  };

  const deleteProduct = async (storeId, productId) => {
    try {
      await axios.delete(`/api/stores/${storeId}/products/${productId}`, {
        withCredentials: true,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || error.message,
      };
    }
  };

  const getStoreProducts = async (storeId, params = {}) => {
    try {
      const res = await axios.get(`/api/stores/${storeId}/products`, {
        params,
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching store products:", error);
      return null;
    }
  };

  const addProductRating = async (productId, rating, review) => {
    try {
      const res = await axios.post(
        `/api/stores/products/${productId}/rating`,
        { rating, review },
        { withCredentials: true },
      );
      return { success: true, data: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || error.message,
      };
    }
  };

  // Search and Discovery
  const searchProducts = async (params = {}) => {
    setSearchLoading(true);
    try {
      const res = await axios.get("/api/stores/search/products", { params });
      setProducts(res.data.products || []);
      return res.data;
    } catch (error) {
      console.error("Error searching products:", error);
      return null;
    } finally {
      setSearchLoading(false);
    }
  };

  const getTrendingProducts = async (limit = 20) => {
    setLoading(true);
    try {
      const res = await axios.get("/api/stores/trending/products", {
        params: { limit },
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching trending products:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Wishlist Management
  const toggleWishlist = async (productId) => {
    try {
      const res = await axios.post(
        `/api/stores/wishlist/add/${productId}`,
        {},
        { withCredentials: true }
      );

      // The backend returns only a message and inWishlist, so we need to refetch the wishlist
      await getUserWishlist(); // Refresh wishlist after toggle

      return {
        success: true,
        message: res.data.message,
        inWishlist: res.data.inWishlist,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || error.message,
      };
    }
  };

  const getUserWishlist = async (page = 1, limit = 12) => {
    setLoading(true);
    try {
      const res = await axios.get("/api/stores/wishlist", {
        params: { page, limit },
        withCredentials: true,
      });
      setWishlist(res.data.products || []);
      return res.data;
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Order Management
  const createOrder = async (addressId) => {
    setOrderLoading(true);
    try {
      const res = await axios.post(
        "/api/stores/order/create",
        { addressId },
        { withCredentials: true },
      );
      return { success: true, data: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || error.message,
      };
    } finally {
      setOrderLoading(false);
    }
  };

  const verifyPayment = async (paymentData) => {
    setOrderLoading(true);
    try {
      const res = await axios.post("/api/stores/order/verify", paymentData, {
        withCredentials: true,
      });
      return { success: true, data: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || error.message,
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
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to update cart icon
  const updateCartIcon = (items) => {
    if (!Array.isArray(items)) return;

    const totalItems = items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      return sum + quantity;
    }, 0);

    // Update global cart count if function exists
    if (typeof window !== "undefined" && window.updateCartCount) {
      window.updateCartCount(totalItems);
    }

    // Also update document title or favicon if needed
    if (typeof document !== "undefined") {
      const title = document.title.replace(/\(\d+\)/, "");
      document.title = totalItems > 0 ? `(${totalItems}) ${title}` : title;
    }
  };

  // Cart Management
  const fetchCart = async () => {
    // Early return if user is not authenticated
    if (!isAuthenticated) {
      const emptyCart = { items: [], totalAmount: 0 };
      setCart(emptyCart);
      updateCartIcon([]);
      return emptyCart;
    }

    setCartLoading(true);
    try {
      const response = await axios.get("/api/stores/cart", {
        withCredentials: true,
        timeout: 10000, // Add timeout for better UX
      });

      // Backend already handles filtering null products and calculating totalAmount
      const cartData = response.data || { items: [], totalAmount: 0 };

      // Ensure totalAmount is properly formatted
      const formattedCart = {
        ...cartData,
        totalAmount: Number(cartData.totalAmount || 0),
        items: cartData.items || [],
      };

      setCart(formattedCart);
      updateCartIcon(formattedCart.items);

      console.log("Cart fetched successfully:", {
        itemCount: formattedCart.items.length,
        totalAmount: formattedCart.totalAmount,
      });

      return formattedCart;
    } catch (error) {
      console.error("Error fetching cart:", error);

      // Handle different error scenarios
      if (error.response?.status === 401) {
        console.log("User not authenticated, clearing cart");
        const emptyCart = { items: [], totalAmount: 0 };
        setCart(emptyCart);
        updateCartIcon([]);
        return emptyCart;
      }

      if (error.response?.status === 500) {
        console.error("Server error while fetching cart:", error.response.data);
        // Keep existing cart state on server error to avoid data loss
        return cart;
      }

      // For other errors, return empty cart but log for debugging
      const emptyCart = { items: [], totalAmount: 0 };
      setCart(emptyCart);
      updateCartIcon([]);
      return emptyCart;
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1, storeId) => {
    if (!isAuthenticated) {
      return {
        success: false,
        message: "Please login to add items to cart",
      };
    }

    if (!storeId) {
      return {
        success: false,
        message: "Store ID is required",
      };
    }

    setCartLoading(true);
    try {
      const response = await axios.post(
        `/api/stores/${storeId}/cart/add`,
        { productId, quantity },
        { withCredentials: true },
      );

      const cartData = response.data || { items: [], totalAmount: 0 };
      setCart(cartData);
      updateCartIcon(cartData.items);
      return {
        success: true,
        data: cartData,
        message: "Item added to cart successfully",
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to add to cart";
      console.error("Error adding to cart:", error);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setCartLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    if (!isAuthenticated) {
      return {
        success: false,
        message: "Please login to update cart",
      };
    }

    if (!productId) {
      return {
        success: false,
        message: "Product ID is required",
      };
    }

    setCartLoading(true);
    try {
      const response = await axios.put(
        "/api/stores/cart/update",
        { productId, quantity },
        { withCredentials: true },
      );

      const cartData = response.data || { items: [], totalAmount: 0 };
      setCart(cartData);
      updateCartIcon(cartData.items);
      return {
        success: true,
        data: cartData,
        message: "Cart updated successfully",
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to update cart";
      console.error("Error updating cart:", error);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      return {
        success: false,
        message: "Please login to remove items from cart",
      };
    }

    if (!productId) {
      return {
        success: false,
        message: "Product ID is required",
      };
    }

    setCartLoading(true);
    try {
      const response = await axios.delete(
        `/api/stores/cart/remove/${productId}`,
        {
          withCredentials: true,
        },
      );

      const cartData = response.data || { items: [], totalAmount: 0 };
      setCart(cartData);
      updateCartIcon(cartData.items);
      return {
        success: true,
        data: cartData,
        message: "Item removed from cart successfully",
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to remove from cart";
      console.error("Error removing from cart:", error);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setCartLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      return {
        success: false,
        message: "Please login to clear cart",
      };
    }

    setCartLoading(true);
    try {
      const response = await axios.delete("/api/stores/cart/clear", {
        withCredentials: true,
      });

      const emptyCart = { items: [], totalAmount: 0 };
      setCart(emptyCart);
      updateCartIcon([]);
      return { success: true, message: "Cart cleared successfully" };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to clear cart";
      console.error("Error clearing cart:", error);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setCartLoading(false);
    }
  };

  // Helper functions (consolidated and improved)
  const getCartItemCount = () => {
    if (!cart.items || !Array.isArray(cart.items)) return 0;
    return cart.items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      return total + quantity;
    }, 0);
  };

  const isInCart = (productId) => {
    if (!cart.items || !Array.isArray(cart.items) || !productId) return false;
    return cart.items.some(
      (item) =>
        item.product &&
        (item.product._id === productId || item.product === productId),
    );
  };

  const getCartItemQuantity = (productId) => {
    if (!cart.items || !Array.isArray(cart.items) || !productId) return 0;
    const item = cart.items.find(
      (item) =>
        item.product &&
        (item.product._id === productId || item.product === productId),
    );
    return Number(item?.quantity) || 0;
  };

  // Cart validation function
  const validateCartData = (cartData) => {
    if (!cartData || typeof cartData !== "object") {
      return { items: [], totalAmount: 0 };
    }

    return {
      items: Array.isArray(cartData.items) ? cartData.items : [],
      totalAmount: Number(cartData.totalAmount) || 0,
      user: cartData.user,
      _id: cartData._id,
      updatedAt: cartData.updatedAt,
    };
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, []);

  return (
    <ProductContext.Provider
      value={{
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
        getCartItemCount,
        isInCart,
        getCartItemQuantity,
        validateCartData,

        createOrder,
        verifyPayment,
        getStoreAnalytics,

        setProducts,
        setWishlist,
        setCart,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export const useProduct = () => useContext(ProductContext);
