import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
    extraFields: [],
  });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e, index) => {
    if (index !== undefined) {
      const updatedFields = [...formData.extraFields];
      updatedFields[index].value = e.target.value;
      setFormData({ ...formData, extraFields: updatedFields });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const addField = () => {
    setFormData({
      ...formData,
      extraFields: [...formData.extraFields, { label: "", value: "" }],
    });
  };

  const validateFields = () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;
    if (!firstName || !lastName || !email) {
      toast.error("First Name, Last Name, and Email are required.");
      return false;
    }
    if (otpSent) {
      if (!password || password.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return false;
      }
      if (password !== confirmPassword) {
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
      if (!otpSent) {
        const response = await fetch("http://localhost:5000/api/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, fname: formData.firstName, lname: formData.lastName }),
        });
        if (response.ok) {
          setOtpSent(true);
          toast.success("OTP sent to your email!");
        }
      } else {
        const signupResponse = await fetch("http://localhost:5000/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            fname: formData.firstName,
            lname: formData.lastName,
            extraFields: formData.extraFields,
          }),
        });
        if (signupResponse.ok) {
          toast.success("Account created successfully!");
          setTimeout(() => { window.location.href = "/login"; }, 2000);
        }
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {otpSent && (
            <div>
              <label className="block text-sm font-medium text-gray-700">OTP</label>
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {otpSent && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {formData.extraFields.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700">Custom Field</label>
              <input
                type="text"
                placeholder="Custom Field"
                value={field.value}
                onChange={(e) => handleChange(e, index)}
                className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}


          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading ? "Processing..." : otpSent ? "Create Account" : "Send OTP"}
          </button>
        </form>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default SignUp;