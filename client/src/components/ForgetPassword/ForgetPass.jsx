import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Timer,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Gamepad2,
} from "lucide-react";

const ForgetPassword = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    identifier: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const sendOTP = async () => {
    if (!formData.identifier.trim()) {
      setError("Please enter your email or username");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/auth/send-reset-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: formData.identifier }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("OTP sent successfully to your email");
        setStep(2);
        setCountdown(120); // 2 minutes countdown
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (error) {
      setError("Failed to send OTP. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/auth/resend-reset-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: formData.identifier }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("New OTP sent successfully");
        setCountdown(120);
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      setError("Failed to resend OTP. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!formData.otp.trim() || formData.otp.length !== 4) {
      setError("Please enter a valid 4-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/auth/verify-reset-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: formData.identifier,
          otp: formData.otp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("OTP verified successfully");
        setStep(3);
      } else {
        setError(data.message || "Invalid or expired OTP");
      }
    } catch (error) {
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!formData.newPassword) {
      setError("Please enter a new password");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: formData.identifier,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Password reset successfully");
        setStep(4);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (error) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Reset form data
    setFormData({
      identifier: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
    setStep(1);
    setError("");
    setSuccess("");
    setCountdown(0);
  };

  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") {
      action();
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-purple-900 rounded-full flex items-center justify-center mb-4 border border-purple-600">
          <Mail className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
        <p className="text-gray-400">
          No worries! Enter your email or username and we'll send you an OTP to
          reset your password.
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="identifier"
            value={formData.identifier}
            onChange={handleInputChange}
            onKeyPress={(e) => handleKeyPress(e, sendOTP)}
            placeholder="Email or Username"
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder-gray-500"
          />
        </div>

        <button
          onClick={sendOTP}
          disabled={loading || !formData.identifier.trim()}
          className="w-full bg-purple-700 text-white py-3 px-4 rounded-lg hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all font-medium tracking-wide"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Sending OTP...
            </>
          ) : (
            "Send OTP"
          )}
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-purple-900 rounded-full flex items-center justify-center mb-4 border border-purple-600">
          <Timer className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Enter OTP</h2>
        <p className="text-gray-400 mb-2">
          We've sent a 4-digit verification code to your email address
        </p>
        <p className="text-sm text-purple-400 font-medium">
          {formData.identifier}
        </p>

        {countdown > 0 && (
          <div className="flex items-center justify-center mt-3 bg-purple-900 rounded-full py-2 px-4 inline-flex border border-purple-700">
            <Timer className="w-4 h-4 mr-2 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">
              Code expires in {Math.floor(countdown / 60)}:
              {(countdown % 60).toString().padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            name="otp"
            value={formData.otp}
            onChange={(e) => {
              if (/^\d{0,4}$/.test(e.target.value)) {
                handleInputChange(e);
              }
            }}
            onKeyPress={(e) => handleKeyPress(e, verifyOTP)}
            placeholder="0000"
            maxLength="4"
            className="w-full text-center text-3xl font-mono py-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 tracking-widest transition-all text-white"
          />
        </div>

        <button
          onClick={verifyOTP}
          disabled={loading || formData.otp.length !== 4}
          className="w-full bg-purple-700 text-white py-3 px-4 rounded-lg hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all font-medium tracking-wide"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </button>

        <div className="text-center space-y-2">
          <p className="text-gray-400">Didn't receive the code?</p>
          <button
            onClick={resendOTP}
            disabled={loading || countdown > 0}
            className="text-purple-400 hover:text-purple-300 disabled:text-gray-600 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-purple-900 rounded-full flex items-center justify-center mb-4 border border-purple-600">
          <Lock className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Create New Password
        </h2>
        <p className="text-gray-400">
          Choose a strong password to secure your account
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type={showPassword ? "text" : "password"}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            placeholder="New Password"
            className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder-gray-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            onKeyPress={(e) => handleKeyPress(e, resetPassword)}
            placeholder="Confirm New Password"
            className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder-gray-500"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>Password must:</p>
          <ul className="ml-4 space-y-1">
            <li
              className={`flex items-center ${formData.newPassword.length >= 6 ? "text-green-400" : "text-gray-500"}`}
            >
              <div
                className={`w-1 h-1 rounded-full mr-2 ${formData.newPassword.length >= 6 ? "bg-green-400" : "bg-gray-500"}`}
              ></div>
              Be at least 6 characters long
            </li>
            <li
              className={`flex items-center ${formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? "text-green-400" : "text-gray-500"}`}
            >
              <div
                className={`w-1 h-1 rounded-full mr-2 ${formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? "bg-green-400" : "bg-gray-500"}`}
              ></div>
              Match the confirmation password
            </li>
          </ul>
        </div>

        <button
          onClick={resetPassword}
          disabled={
            loading || !formData.newPassword || !formData.confirmPassword
          }
          className="w-full bg-purple-700 text-white py-3 px-4 rounded-lg hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all font-medium tracking-wide"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Updating Password...
            </>
          ) : (
            "Update Password"
          )}
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-20 h-20 bg-purple-900 rounded-full flex items-center justify-center animate-pulse border border-purple-600">
        <CheckCircle className="w-10 h-10 text-green-400" />
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-white">Success!</h2>
        <p className="text-gray-400">
          Your password has been successfully reset. You can now login with your
          new password.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleBackToLogin}
          className="w-full bg-purple-700 text-white py-3 px-4 rounded-lg hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all font-medium tracking-wide"
        >
          Back to Login
        </button>
        <p className="text-sm text-gray-500">
          Redirecting you to the login page in a few seconds...
        </p>
      </div>
    </div>
  );

  // Auto redirect after success
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        handleBackToLogin();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Gaming-themed header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <Gamepad2 className="w-8 h-8 text-purple-500 mr-2" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              GAME PORTAL
            </h1>
          </div>
          <p className="text-xs text-gray-500 tracking-widest">
            POWER UP YOUR ACCOUNT
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full ${
                  s <= step ? "bg-purple-600" : "bg-gray-700"
                } transition-all`}
              />
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl p-8 relative overflow-hidden">
          {/* Subtle gaming pattern in background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-32 h-32 border-4 border-white rounded-full transform -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 border-4 border-white rounded-full translate-x-16 translate-y-16"></div>
          </div>

          {/* Back button - only show before success */}
          {step < 4 && step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center text-gray-400 hover:text-gray-200 mb-6 transition-colors z-10 relative"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900 bg-opacity-20 border-l-4 border-red-500 rounded-lg z-10 relative">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 bg-green-900 bg-opacity-20 border-l-4 border-green-500 rounded-lg z-10 relative">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-green-300 text-sm">{success}</span>
              </div>
            </div>
          )}

          {/* Step content */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
