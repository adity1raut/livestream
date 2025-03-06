import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Forget = () => {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateFields = () => {
    const { email, otp, newPassword, confirmPassword } = formData;

    if (step === 1 && !email) {
      toast.error("Email is required.");
      return false;
    }

    if (step === 2 && !otp) {
      toast.error("OTP is required.");
      return false;
    }

    if (step === 3) {
      if (!newPassword || newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return false;
      }
      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    setLoading(true);

    try {
      if (step === 1) {
        const response = await fetch("http://localhost:5000/api/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });

        const data = await response.json();
        if (response.ok) {
          setStep(2);
          toast.success("OTP sent to your email!");
        } else {
          throw new Error(data.message || "Failed to send OTP.");
        }
      } else if (step === 2) {
        const response = await fetch("http://localhost:5000/api/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            otp: formData.otp,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setStep(3);
          toast.success("OTP verified successfully!");
        } else {
          throw new Error(data.message || "Invalid OTP.");
        }
      } else if (step === 3) {
        const response = await fetch("http://localhost:5000/api/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            newPassword: formData.newPassword,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          toast.success("Password reset successfully!");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        } else {
          throw new Error(data.message || "Failed to reset password.");
        }
      }
    } catch (err) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-2xl transform transition-all duration-300 hover:scale-105">
        <h2 className="text-3xl font-bold text-center text-gray-800">Forgot Password</h2>
        <p className="text-center text-gray-500">
          {step === 1
            ? "Enter your email to receive an OTP."
            : step === 2
            ? "Enter the OTP sent to your email."
            : "Enter your new password."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={handleChange}
                maxLength="4"
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full mt-2 text-blue-600 hover:underline"
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
          )}

          {step === 3 && (
            <>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            {loading ? "Processing..." : step === 1 ? "Send OTP" : step === 2 ? "Verify OTP" : "Reset Password"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Forget;
