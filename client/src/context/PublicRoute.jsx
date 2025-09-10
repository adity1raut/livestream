import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const PublicRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default PublicRoute;
