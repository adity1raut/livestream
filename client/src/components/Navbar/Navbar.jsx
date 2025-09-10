import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link to="/">MyApp</Link>
      </div>

      <div className="flex gap-4 items-center">
        {loading && (
          <span className="text-gray-400">Checking authentication...</span>
        )}

        {!loading && !isAuthenticated && (
          <>
            <Link
              to="/login"
              className="hover:text-gray-400 transition duration-200"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="hover:text-gray-400 transition duration-200"
            >
              Signup
            </Link>
          </>
        )}

        {!loading && isAuthenticated && (
          <>
            <Link
              to="/profile"
              className="hover:text-gray-400 transition duration-200"
            >
              Profile
            </Link>
            <span className="font-medium">
              Welcome, {user?.username || user?.firstName || user?.email || "User"}
            </span>
            <button
              onClick={logout}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition duration-200"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
