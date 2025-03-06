import React, { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AuthService from "../utils/AuthService";
import image from "../assets/images.jpg";

const Navbar = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleNavigation = (path) => {
    // Only navigate if not already on that page
    if (location.pathname !== path) {
      setMenuOpen(false);
      navigate(path);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    navigate("/login");
    window.dispatchEvent(new Event("authChange"));
  };

  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Get link classes based on active state
  const getLinkClasses = (path) => {
    if (isActive(path)) {
      return "text-blue-600 font-bold cursor-default text-lg pointer-events-none";
    }
    return "text-gray-700 hover:text-blue-500 font-medium transition-all hover:-translate-y-0.5 transform hover:scale-105 text-base";
  };

  // Get mobile link classes based on active state
  const getMobileLinkClasses = (path) => {
    if (isActive(path)) {
      return "text-blue-600 font-bold cursor-default text-lg pointer-events-none";
    }
    return "text-gray-700 hover:text-blue-500 font-medium w-full text-left transition-all hover:pl-2 text-base";
  };

  return (
    <div className="sticky top-0 z-50 shadow-md">
      <nav className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <div className="flex items-center">
          <button onClick={() => handleNavigation("/")} disabled={isActive("/")}>
            <img src={image} alt="Logo" className="h-12 transition-transform hover:scale-110" />
          </button>
        </div>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex space-x-6">
          <li>
            <button
              onClick={() => handleNavigation("/")}
              className={getLinkClasses("/")}
              disabled={isActive("/")}
            >
              HOME
            </button>
          </li>

          {!isAuthenticated ? (
            <>
              <li>
                <button
                  onClick={() => handleNavigation("/login")}
                  className={getLinkClasses("/login")}
                  disabled={isActive("/login")}
                >
                  LOGIN
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/signup")}
                  className={getLinkClasses("/signup")}
                  disabled={isActive("/signup")}
                >
                  SIGNUP
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/forgot_password")}
                  className={getLinkClasses("/forgot_password")}
                  disabled={isActive("/forgot_password")}
                >
                  FORGOT PASSWORD
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button
                  onClick={() => handleNavigation("/profile")}
                  className={getLinkClasses("/profile")}
                  disabled={isActive("/profile")}
                >
                  PROFILE
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/live")}
                  className={getLinkClasses("/live")}
                  disabled={isActive("/live")}
                >
                  LIVE
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/store")}
                  className={getLinkClasses("/store")}
                  disabled={isActive("/store")}
                >
                  STORE
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700 font-medium transition-all hover:-translate-y-0.5 transform hover:scale-105 text-base"
                >
                  LOGOUT
                </button>
              </li>
            </>
          )}
        </ul>

        <button className="md:hidden text-gray-700 focus:outline-none" onClick={toggleMenu}>
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* Mobile Menu */}
        <div
          className={`${
            menuOpen ? "block" : "hidden"
          } md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg p-4 transition-all duration-300 ease-in-out transform ${
            menuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => handleNavigation("/")}
                className={getMobileLinkClasses("/")}
                disabled={isActive("/")}
              >
                HOME
              </button>
            </li>

            {!isAuthenticated ? (
              <>
                <li>
                  <button
                    onClick={() => handleNavigation("/login")}
                    className={getMobileLinkClasses("/login")}
                    disabled={isActive("/login")}
                  >
                    LOGIN
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/signup")}
                    className={getMobileLinkClasses("/signup")}
                    disabled={isActive("/signup")}
                  >
                    SIGNUP
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/forgot_password")}
                    className={getMobileLinkClasses("/forgot_password")}
                    disabled={isActive("/forgot_password")}
                  >
                    FORGOT PASSWORD
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button
                    onClick={() => handleNavigation("/profile")}
                    className={getMobileLinkClasses("/profile")}
                    disabled={isActive("/profile")}
                  >
                    PROFILE
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/live")}
                    className={getMobileLinkClasses("/live")}
                    disabled={isActive("/live")}
                  >
                    LIVE
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/store")}
                    className={getMobileLinkClasses("/store")}
                    disabled={isActive("/store")}
                  >
                    STORE
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700 font-medium w-full text-left transition-all hover:pl-2 text-base"
                  >
                    LOGOUT
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;