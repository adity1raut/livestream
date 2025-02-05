import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AuthService from "../utils/AuthService";
import '../styles/Navbar.css'; // Import the CSS file
import image from "../assets/images.jpg"

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
    <div className="navbar-container">
      <nav className="navbar">
        <div className="logo">
          <button onClick={() => handleNavigation("/")}>
            <img src={image} alt="Logo" className="logo-img" />
          </button>
        </div>

        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li>
            <button onClick={() => handleNavigation("/")} className="nav-item">
              HOME
            </button>
          </li>

          {!isAuthenticated ? (
            <>
              <li>
                <button onClick={() => handleNavigation("/login")} className="nav-item">
                  LOGIN
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/signup")} className="nav-item">
                  SIGNUP
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/forgot_password")} className="nav-item">
                  FORGOT PASSWORD
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button onClick={() => handleNavigation("/profile")} className="nav-item">
                  PROFILE
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/live")} className="nav-item">
                  LIVE
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/store")} className="nav-item">
                  STORE
                </button>
              </li>
              <li>
                <button onClick={handleLogout} className="nav-item logout">
                  LOGOUT
                </button>
              </li>
            </>
          )}
        </ul>

        <button className="hamburger" onClick={toggleMenu}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <ul className="mobile-links">
          <li>
            <button onClick={() => handleNavigation("/")} className="mobile-item">
              HOME
            </button>
          </li>

          {!isAuthenticated ? (
            <>
              <li>
                <button onClick={() => handleNavigation("/login")} className="mobile-item">
                  LOGIN
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/signup")} className="mobile-item">
                  SIGNUP
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/forgot_password")} className="nav-item">
                  FORGOT PASSWORD
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button onClick={() => handleNavigation("/profile")} className="mobile-item">
                  PROFILE
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/live")} className="mobile-item">
                  LIVE
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/store")} className="mobile-item">
                  STORE
                </button>
              </li>
              <li>
                <button onClick={handleLogout} className="mobile-item logout">
                  LOGOUT
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;