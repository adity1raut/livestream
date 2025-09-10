import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Loader, 
  UserCheck,
  Shield,
  Send,
  RefreshCw
} from 'lucide-react';

// Toast component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? <Check size={20} /> : type === 'error' ? <X size={20} /> : <Shield size={20} />;

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in`}>
      {icon}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X size={16} />
      </button>
    </div>
  );
};

// Toast hook
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
};

const RegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  
  const { toasts, addToast, removeToast } = useToast();

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear availability check when user types
    if (name === 'username' || name === 'email') {
      setAvailability(prev => ({ ...prev, [name]: null }));
    }
  };

  const checkAvailability = async (field) => {
    if (!formData[field]) return;
    
    try {
      setAvailability(prev => ({ ...prev, [field]: 'checking' }));
      await axios.post('/api/auth/check-availability', {
        identifier: formData[field]
      });
      setAvailability(prev => ({ ...prev, [field]: 'available' }));
    } catch (error) {
      setAvailability(prev => ({ ...prev, [field]: 'unavailable' }));
      const errorMessage = error.response?.data?.message || error.message || 'Availability check failed';
      addToast(errorMessage, 'error');
    }
  };

  const sendOTP = async () => {
    try {
      setLoading(true);
      await axios.post('/api/auth/send-otp', { email: formData.email });
      setOtpSent(true);
      setOtpTimer(300); // 5 minutes
      addToast('OTP sent to your email', 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      setLoading(true);
      await axios.post('/api/auth/resend-otp', { email: formData.email });
      setOtpTimer(300);
      addToast('New OTP sent to your email', 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend OTP';
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      setLoading(true);
      await axios.post('/api/auth/verify-otp', {
        email: formData.email,
        otp: formData.otp
      });
      addToast('OTP verified successfully', 'success');
      setCurrentStep(3);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'OTP verification failed';
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/register', formData);
      addToast('Account created successfully!', 'success');
      // Reset form or redirect
      setTimeout(() => {
        setCurrentStep(1);
        setFormData({
          username: '',
          email: '',
          name: '',
          password: '',
          confirmPassword: '',
          otp: ''
        });
        setOtpSent(false);
        setAvailability({});
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!formData.username || !formData.email || !formData.name) {
        addToast('Please fill all required fields', 'error');
        return;
      }
      if (availability.username !== 'available' || availability.email !== 'available') {
        addToast('Please check username and email availability', 'error');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2 && otpSent) {
      verifyOTP();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 3 && (
            <div className={`w-16 h-1 mx-2 ${
              currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h2>
      
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
            required
          />
        </div>
      </div>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
        <div className="relative">
          <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            onBlur={() => checkAvailability('username')}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Choose a username"
            required
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {availability.username === 'checking' && <Loader className="animate-spin text-gray-400" size={20} />}
            {availability.username === 'available' && <Check className="text-green-500" size={20} />}
            {availability.username === 'unavailable' && <X className="text-red-500" size={20} />}
          </div>
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={() => checkAvailability('email')}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
            required
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {availability.email === 'checking' && <Loader className="animate-spin text-gray-400" size={20} />}
            {availability.email === 'available' && <Check className="text-green-500" size={20} />}
            {availability.email === 'unavailable' && <X className="text-red-500" size={20} />}
          </div>
        </div>
      </div>

      <button
        onClick={nextStep}
        disabled={loading || availability.username !== 'available' || availability.email !== 'available'}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        Next Step
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Verify Email</h2>
      
      {!otpSent ? (
        <div className="text-center space-y-4">
          <p className="text-gray-600">We'll send a verification code to:</p>
          <p className="font-medium text-gray-800">{formData.email}</p>
          <button
            onClick={sendOTP}
            disabled={loading}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
            Send OTP
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-center text-gray-600">Enter the 6-digit code sent to your email</p>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-wider"
              placeholder="000000"
              maxLength="6"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {otpTimer > 0 ? `Resend in ${formatTime(otpTimer)}` : 'OTP expired'}
            </span>
            <button
              onClick={resendOTP}
              disabled={otpTimer > 0 || loading}
              className="text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw size={16} />
              Resend OTP
            </button>
          </div>

          <button
            onClick={nextStep}
            disabled={loading || formData.otp.length !== 6}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <Check size={20} />}
            Verify OTP
          </button>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Set Password</h2>
      
      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Create a password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirm your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {formData.password && formData.confirmPassword && (
        <div className="flex items-center gap-2">
          {formData.password === formData.confirmPassword ? (
            <>
              <Check className="text-green-500" size={16} />
              <span className="text-green-500 text-sm">Passwords match</span>
            </>
          ) : (
            <>
              <X className="text-red-500" size={16} />
              <span className="text-red-500 text-sm">Passwords don't match</span>
            </>
          )}
        </div>
      )}

      <button
        onClick={registerUser}
        disabled={loading || formData.password !== formData.confirmPassword || !formData.password}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? <Loader className="animate-spin" size={20} /> : <UserCheck size={20} />}
        Create Account
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {renderStepIndicator()}
        
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {currentStep > 1 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="mt-4 text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Toast notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RegistrationForm;