import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PublicRoute from "./context/PublicRoute";
import ProtectedRoute from "./context/ProtectedRoute";
import ProfilePage from "./components/ProfilePage/ProfilePage";
import Login from "./components/LoginForm/Login";
import RegistrationForm from "./components/RegistrationForm/RegistrationForm";
import GamingDashboard from "./components/Home";
import Navbar from "./components/Navbar/Navbar";
import { AuthProvider } from "./context/AuthContext";
import ForgetPassword from "./components/ForgetPassword/ForgetPass"
import ChatApp from "./components/ChatPAge/ChatApp";
import NotificationPage from "./components/Notification/NotificationsPage"
import { NotificationProvider } from './context/NotificationContext';
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider >
        <Router>
          <Navbar />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<GamingDashboard />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <RegistrationForm />
                </PublicRoute>
              }
            />

            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgetPassword />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatApp />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notification"
              element={
                <ProtectedRoute>
                  <NotificationPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Footer />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
