import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AuthService from "../utils/AuthService";
import image from "../assets/images.jpg";

const Navbar = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleNavigation = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    navigate("/login");
    window.dispatchEvent(new Event("authChange"));
  };

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <div className="flex items-center">
          <button onClick={() => handleNavigation("/")}>
            <img src={image} alt="Logo" className="h-12 transition-transform hover:scale-110" />
          </button>
        </div>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex space-x-6">
          <li>
            <button
              onClick={() => handleNavigation("/")}
              className="text-gray-700 hover:text-blue-500 font-medium transition-all hover:-translate-y-0.5"
            >
              HOME
            </button>
          </li>

          {!isAuthenticated ? (
            <>
              <li>
                <button
                  onClick={() => handleNavigation("/login")}
                  className="text-gray-700 hover:text-blue-500 font-medium transition-all hover:-translate-y-0.5"
                >
                  LOGIN
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/signup")}
                  className="text-gray-700 hover:text-blue-500 font-medium transition-all hover:-translate-y-0.5"
                >
                  SIGNUP
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/forgot_password")}
                  className="text-gray-700 hover:text-blue-500 font-medium transition-all hover:-translate-y-0.5"
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
                  className="text-gray-700 hover:text-blue-500 font-medium transition-all hover:-translate-y-0.5"
                >
                  PROFILE
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/live")}
                  className="text-gray-700 hover:text-blue-500 font-medium transition-all hover:-translate-y-0.5"
                >
                  LIVE
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/store")}
                  className="text-gray-700 hover:text-blue-500 font-medium transition-all hover:-translate-y-0.5"
                >
                  STORE
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700 font-medium transition-all hover:-translate-y-0.5"
                >
                  LOGOUT
                </button>
              </li>
            </>
          )}
        </ul>

        {/* Hamburger Menu (Mobile) */}
        <button className="md:hidden text-gray-700 focus:outline-none" onClick={toggleMenu}>
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* Mobile Menu */}
        <div
          className={`${
            menuOpen ? "block" : "hidden"
          } md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg p-4`}
        >
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => handleNavigation("/")}
                className="text-gray-700 hover:text-blue-500 font-medium w-full text-left"
              >
                HOME
              </button>
            </li>

            {!isAuthenticated ? (
              <>
                <li>
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="text-gray-700 hover:text-blue-500 font-medium w-full text-left"
                  >
                    LOGIN
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/signup")}
                    className="text-gray-700 hover:text-blue-500 font-medium w-full text-left"
                  >
                    SIGNUP
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/forgot_password")}
                    className="text-gray-700 hover:text-blue-500 font-medium w-full text-left"
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
                    className="text-gray-700 hover:text-blue-500 font-medium w-full text-left"
                  >
                    PROFILE
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/live")}
                    className="text-gray-700 hover:text-blue-500 font-medium w-full text-left"
                  >
                    LIVE
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/store")}
                    className="text-gray-700 hover:text-blue-500 font-medium w-full text-left"
                  >
                    STORE
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700 font-medium w-full text-left"
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