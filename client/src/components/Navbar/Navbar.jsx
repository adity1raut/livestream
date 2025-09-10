import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  BookOpen,
  ChevronDown,
  User,
  LogIn,
  Menu,
  X,
  Home,
  Settings,
  HelpCircle,
  FileText,
  Users,
  LogOut,
  UserCircle,
  GraduationCap,
} from "lucide-react";

const Navbar = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".dropdown-container")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleNavigation = (action) => {
    setIsMobileMenuOpen(false);
    setDropdownOpen(false);
    if (typeof action === 'function') {
      action();
    }
  };

  // User menu items
  const userMenuItems = [
    {
      icon: <Home size={16} />,
      name: "Dashboard",
      description: "Access your personalized dashboard",
      path: "/dashboard",
    },
    {
      icon: <UserCircle size={16} />,
      name: "Profile",
      description: "Manage your profile settings",
      path: "/profile",
    },
    {
      icon: <Settings size={16} />,
      name: "Settings",
      description: "Configure your preferences",
      path: "/settings",
    },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md py-2" : "bg-white py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center focus:outline-none">
                <div
                  className={`relative overflow-hidden transition-all duration-300 ${
                    scrolled ? "h-10 w-10" : "h-12 w-12"
                  }`}
                >
                  <BookOpen
                    className={`h-full w-full text-blue-600 transition-all duration-300 ${
                      scrolled ? "h-8 w-8" : "h-10 w-10"
                    }`}
                  />
                </div>
                <div className="ml-3">
                  <span
                    className={`font-bold transition-all duration-300 ${
                      scrolled
                        ? "text-xl text-gray-800"
                        : "text-2xl text-blue-600"
                    }`}
                  >
                    MyApp
                  </span>
                  <div
                    className={`text-xs text-gray-500 transition-opacity duration-300 ${
                      scrolled ? "opacity-0 h-0" : "opacity-100"
                    }`}
                  >
                    Modern Web Application
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              {loading && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-gray-500 text-sm">Loading...</span>
                </div>
              )}

              {!loading && !isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="flex items-center text-sm font-medium px-2 py-1 rounded-md transition-colors duration-200 text-gray-600 hover:text-blue-600"
                  >
                    <LogIn size={16} className="mr-1" />
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center text-sm font-medium px-2 py-1 rounded-md transition-colors duration-200 text-gray-600 hover:text-blue-600"
                  >
                    <User size={16} className="mr-1" />
                    Sign Up
                  </Link>
                </>
              )}

              {!loading && isAuthenticated && (
                <>
                  {/* Dashboard Link */}
                  <Link
                    to="/dashboard"
                    className="flex items-center text-sm font-medium px-2 py-1 rounded-md transition-colors duration-200 text-gray-600 hover:text-blue-600"
                  >
                    <Home size={16} className="mr-1" />
                    Dashboard
                  </Link>

                  {/* User Menu Dropdown */}
                  <div className="relative dropdown-container">
                    <button
                      onClick={toggleDropdown}
                      className={`flex items-center text-sm font-medium px-2 py-1 rounded-md transition-colors duration-200 ${
                        dropdownOpen
                          ? "text-blue-600"
                          : "text-gray-600 hover:text-blue-600"
                      }`}
                    >
                      <UserCircle size={16} className="mr-1" />
                      Menu
                      <ChevronDown
                        size={16}
                        className={`ml-1 transition-transform duration-200 ${
                          dropdownOpen ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-100 transform transition-all duration-200 origin-top-right">
                        <div className="p-2">
                          {userMenuItems.map((item, index) => (
                            <Link
                              key={index}
                              to={item.path}
                              onClick={() => setDropdownOpen(false)}
                              className="flex w-full p-3 hover:bg-blue-50 rounded-lg transition-colors duration-150 text-left"
                            >
                              <div className="text-blue-500">{item.icon}</div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {item.description}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => handleNavigation(logout)}
                    className="flex items-center text-sm font-medium px-2 py-1 rounded-md transition-colors duration-200 text-red-500 hover:text-red-700"
                  >
                    <LogOut size={16} className="mr-1" />
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* Right Actions */}
            {!loading && isAuthenticated && (
              <div className="hidden md:flex items-center">
                {/* User Profile */}
                <div className="border-l pl-4 border-gray-200">
                  <Link
                    to="/profile"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
                  >
                    <User size={16} className="mr-2" />
                    <span>
                      {user?.username || user?.firstName || user?.email || "Profile"}
                    </span>
                  </Link>
                </div>
              </div>
            )}

            {/* Login Button for non-authenticated users */}
            {!loading && !isAuthenticated && (
              <div className="hidden md:flex items-center">
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
                >
                  <LogIn size={16} className="mr-2" />
                  <span>Login</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-gray-800 bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="ml-2 font-bold text-lg">MyApp</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>

          <div className="py-2 px-4">
            {loading && (
              <div className="flex items-center space-x-2 px-4 py-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-gray-500 text-sm">Loading...</span>
              </div>
            )}

            {!loading && !isAuthenticated && (
              <>
                <Link
                  to="/login"
                  onClick={() => handleNavigation()}
                  className="flex items-center px-4 py-3 w-full text-left rounded-lg transition-colors duration-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                >
                  <LogIn size={18} className="mr-3" />
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => handleNavigation()}
                  className="flex items-center px-4 py-3 w-full text-left rounded-lg transition-colors duration-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                >
                  <User size={18} className="mr-3" />
                  Sign Up
                </Link>
              </>
            )}

            {!loading && isAuthenticated && (
              <>
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-gray-200 mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center font-semibold text-white">
                      {(user?.username || user?.firstName || user?.email || "U")[0].toUpperCase()}
                    </div>
                    <span className="text-gray-900 font-medium">
                      {user?.username || user?.firstName || user?.email || "User"}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                {userMenuItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={() => handleNavigation()}
                    className="flex items-center px-4 py-3 w-full text-left rounded-lg transition-colors duration-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {item.icon && <span className="mr-3">{item.icon}</span>}
                    {item.name}
                  </Link>
                ))}

                {/* Logout Button */}
                <button
                  onClick={() => handleNavigation(logout)}
                  className="flex items-center px-4 py-3 w-full text-left rounded-lg transition-colors duration-200 text-red-500 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut size={18} className="mr-3" />
                  Logout
                </button>
              </>
            )}
          </div>

          {!loading && !isAuthenticated && (
            <div className="border-t mt-2 pt-4 px-6">
              <Link
                to="/login"
                onClick={() => handleNavigation()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
              >
                <LogIn size={18} className="mr-2" />
                Login 
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;