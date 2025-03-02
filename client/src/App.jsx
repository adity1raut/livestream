import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; 
import HomePage from "./components/HomePage";
import LoginPage from "./components/Login";
import ProfilePage from "./components/ProfilePage";
import PrivateRoute from "./utils/PrivateRoute";
import Navbar from "./pages/Navbar";
import SignUp from "./components/Signup";
import StorePage from "./components/StorePage"
import Forget from "./components/Forget";
import LivePage from "./components/Live";
import VideoUpload from "./components/videoUplode";
import LiveStream from "./components/LiveStream";
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
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
            <Route path="/live-stream" element={<LiveStream/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
