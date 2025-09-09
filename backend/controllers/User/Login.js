import express from 'express';
import User from "../../models/User.models.js";
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import cloudinary from '../../config/cloudinary.js';

dotenv.config();
const router = express.Router();

//Login
export async function loginUser(email, password) {
  try {
    if (!email || !password) throw new Error('Email and password required');

    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid email or password');

    return { 
      success: true, 
      message: 'Login successful', 
      username: user.username,
      user: user 
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// LogOut
export function logoutUser() {
  return { success: true, message: 'Logged out successfully' };
}

//Profile
export async function getProfile(username) {
  try {
    if (!username) throw new Error('Username required');

    const user = await User.findOne({ username }).select('-password').lean();
    if (!user) throw new Error('User not found');

    return { success: true, data: user };
  } catch (error) {
    console.error('Profile error:', error);
    throw error;
  }
}

// Update Profle
export async function updateProfile(username, updateData, profileImage) {
  try {
    if (!username) throw new Error('Username required');

    const user = await User.findOne({ username });
    if (!user) throw new Error('User not found');

    const { firstName, lastName, email } = updateData;
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;

    if (profileImage) {
      const uploadResponse = await cloudinary.uploader.upload(profileImage.path, {
        folder: 'profile_pictures',
        use_filename: true,
        unique_filename: false,
      });
      user.profileImage = uploadResponse.secure_url;
    }

    await user.save();
    return { success: true, message: 'Profile updated', data: user };
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}

