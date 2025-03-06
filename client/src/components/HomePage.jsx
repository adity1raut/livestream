// src/components/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl">Welcome to the App</h1>
      <div className="mt-4 space-x-4">
        <Link 
          to="/login"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default HomePage;