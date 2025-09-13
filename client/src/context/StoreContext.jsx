import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from './AuthContext';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [stores, setStores] = useState([]);
  const [userStore, setUserStore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [followedStores, setFollowedStores] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      getCurrentUserStore();
      getFollowingStores();
    } else {
      setUserStore(null);
      setFollowedStores([]);
    }
  }, [isAuthenticated]);

  const getAllStores = async (params = {}) => {
    setLoading(true);
    try {
      const res = await axios.get('/api/stores', { params });
      setStores(res.data.stores || []);
      return res.data;
    } catch (error) {
      console.error('Error fetching stores:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getStoreById = async (id) => {
    try {
      const res = await axios.get(`/api/stores/${id}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching store:', error);
      return null;
    }
  };

  const createStore = async (formData) => {
    try {
      const res = await axios.post('/api/stores', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUserStore(res.data);
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || error.message };
    }
  };

  const updateStore = async (id, formData) => {
    try {
      const res = await axios.put(`/api/stores/${id}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUserStore(res.data);
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || error.message };
    }
  };

  const deleteStore = async (id) => {
    try {
      await axios.delete(`/api/stores/${id}`, { withCredentials: true });
      setUserStore(null);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || error.message };
    }
  };

  const getCurrentUserStore = async () => {
    try {
      const res = await axios.get('/api/stores/my/store', { withCredentials: true });
      setUserStore(res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching user store:', error);
      setUserStore(null);
      return null;
    }
  };

  const getStoreProducts = async (id, params = {}) => {
    try {
      const res = await axios.get(`/api/stores/${id}/products`, { params });
      return { success: true, data: res.data };
    } catch (error) {
      setError(error.response?.data?.error || 'Error fetching store products');
      return { success: false, message: error.response?.data?.error };
    }
  };

  // Store Analytics
  const getStoreAnalytics = async (storeId) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Authentication required' };
    }
    setLoading(true);
    try {
      const res = await axios.get(`/api/stores/${storeId}/analytics`, {
        withCredentials: true
      });
      return { success: true, data: res.data };
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch analytics');
      return { success: false, message: error.response?.data?.error };
    } finally {
      setLoading(false);
    }
  };

  // Store Social Features
  const followStore = async (storeId) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Authentication required' };
    }
    try {
      const res = await axios.post(`/api/stores/${storeId}/follow`, {}, {
        withCredentials: true
      });
      if (res.data.following) {
        setFollowedStores(prev => [...prev, storeId]);
      } else {
        setFollowedStores(prev => prev.filter(id => id !== storeId));
      }
      return { success: true, data: res.data };
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to follow/unfollow store');
      return { success: false, message: error.response?.data?.error };
    }
  };

  const getFollowStatus = async (storeId) => {
    if (!isAuthenticated) return { following: false };
    try {
      const res = await axios.get(`/api/stores/${storeId}/follow-status`, {
        withCredentials: true
      });
      return { success: true, data: res.data };
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to get follow status');
      return { success: false, message: error.response?.data?.error };
    }
  };

  const getFollowingStores = async () => {
    if (!isAuthenticated) return { success: true, data: [] };
    try {
      const res = await axios.get('/api/stores/following/stores', {
        withCredentials: true
      });
      setFollowedStores(res.data.map(store => store._id));
      return { success: true, data: res.data };
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch following stores');
      return { success: false, message: error.response?.data?.error };
    }
  };

  // Error Management
  const clearError = () => setError(null);

  return (
    <StoreContext.Provider value={{
      // State
      stores,
      userStore,
      loading,
      error,
      followedStores,

      // Store Management
      getAllStores,
      getStoreById,
      createStore,
      updateStore,
      deleteStore,
      getCurrentUserStore,
      getStoreProducts,

      // Store Analytics
      getStoreAnalytics,

      // Store Social Features
      followStore,
      getFollowStatus,
      getFollowingStores,

      // Error Management
      clearError,

      // State Setters
      setStores,
      setUserStore
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};