import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Timer, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const ForgetPassword = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    identifier: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const sendOTP = async () => {
    if (!formData.identifier.trim()) {
      setError('Please enter your email or username');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/auth/send-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: formData.identifier })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('OTP sent successfully to your email');
        setStep(2);
        setCountdown(120); // 2 minutes countdown
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Failed to send OTP. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/auth/resend-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: formData.identifier })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('New OTP sent successfully');
        setCountdown(120);
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Failed to resend OTP. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!formData.otp.trim() || formData.otp.length !== 4) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/auth/verify-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          identifier: formData.identifier,
          otp: formData.otp 
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('OTP verified successfully');
        setStep(3);
      } else {
        setError(data.message || 'Invalid or expired OTP');
      }
    } catch (error) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!formData.newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          identifier: formData.identifier,
          newPassword: formData.newPassword 
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password reset successfully');
        setStep(4);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Reset form data
    setFormData({
      identifier: '',
      otp: '',
      newPassword: '',
      confirmPassword: ''
    });
    setStep(1);
    setError('');
    setSuccess('');
    setCountdown(0);
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
        <p className="text-gray-600">No worries! Enter your email or username and we'll send you an OTP to reset your password.</p>
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
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <button
          onClick={sendOTP}
          disabled={loading || !formData.identifier.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Sending OTP...
            </>
          ) : (
            'Send OTP'
          )}
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Timer className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Enter OTP</h2>
        <p className="text-gray-600 mb-2">We've sent a 4-digit verification code to your email address</p>
        <p className="text-sm text-blue-600 font-medium">{formData.identifier}</p>
        
        {countdown > 0 && (
          <div className="flex items-center justify-center mt-3 bg-blue-50 rounded-full py-2 px-4 inline-flex">
            <Timer className="w-4 h-4 mr-2 text-blue-600" />
            <span className="text-sm text-blue-600 font-medium">
              Code expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
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
            className="w-full text-center text-3xl font-mono py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tracking-widest transition-all"
          />
        </div>

        <button
          onClick={verifyOTP}
          disabled={loading || formData.otp.length !== 4}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </button>

        <div className="text-center space-y-2">
          <p className="text-gray-600">Didn't receive the code?</p>
          <button
            onClick={resendOTP}
            disabled={loading || countdown > 0}
            className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Password</h2>
        <p className="text-gray-600">Choose a strong password to secure your account</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            placeholder="New Password"
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            onKeyPress={(e) => handleKeyPress(e, resetPassword)}
            placeholder="Confirm New Password"
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>Password must:</p>
          <ul className="ml-4 space-y-1">
            <li className={`flex items-center ${formData.newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-1 h-1 rounded-full mr-2 ${formData.newPassword.length >= 6 ? 'bg-green-600' : 'bg-gray-400'}`}></div>
              Be at least 6 characters long
            </li>
            <li className={`flex items-center ${formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-1 h-1 rounded-full mr-2 ${formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'bg-green-600' : 'bg-gray-400'}`}></div>
              Match the confirmation password
            </li>
          </ul>
        </div>

        <button
          onClick={resetPassword}
          disabled={loading || !formData.newPassword || !formData.confirmPassword}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Updating Password...
            </>
          ) : (
            'Update Password'
          )}
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-gray-900">Success!</h2>
        <p className="text-gray-600">Your password has been successfully reset. You can now login with your new password.</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleBackToLogin}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-300'
                } transition-all`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Back button - only show before success */}
          {step < 4 && step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-green-700 text-sm">{success}</span>
              </div>
            </div>
          )}

          {/* Step content */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Need help? <a href="#" className="text-blue-600 hover:text-blue-700">Contact Support</a>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;