import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; 
import HomePage from "./components/HomePage";
import LoginPage from "./Forms/Login";
import ProfilePage from "./Profile/ProfilePage";
import PrivateRoute from "./utils/PrivateRoute";
import Navbar from "./pages/Navbar";
import SignUp from "./Forms/SignUp";
import StorePage from "./Store/StorePage";
import Forget from "./Forms/Forget";
import LivePage from "./components/Live";
import VideoUpload from "./components/videoUplode";
import LiveStream from "./components/LiveStream";
import "./styles.css"; // Import the CSS file

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="background"></div> {/* Background image */}
        <div className="content"> {/* Main content */}
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/forgot_password" element={<Forget />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/uplode-video" element={<VideoUpload />} />
              <Route path="/store" element={<StorePage />} />
              <Route path="/live" element={<LivePage />} />
              <Route path="/live-stream" element={<LiveStream />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;