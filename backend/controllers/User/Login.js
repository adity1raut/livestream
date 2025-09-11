import express from 'express';
import User from "../../models/User.models.js";
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import cloudinary from '../../config/cloudinary.js';

dotenv.config();
const router = express.Router();

//Login
export async function loginUser(identifier, password) {
  try {
    if (!identifier || !password) throw new Error('Username/Email and password required');

    const user = await User.findOne({ 
      $or: [{ email: identifier }, { username: identifier }] 
    });

    if (!user) throw new Error('Invalid username/email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid username/email or password');

    return { 
      success: true, 
      message: 'Login successful', 
      username: user.username,
      user 
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

//Profile - Fixed: This should be a controller function, not middleware
export async function getProfile(req, res) {
  try {
    // The user should already be available from authenticateToken middleware
    const userId = req.user.id;
    
    const user = await User.findById(userId).select("-password").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const { name, bio, email, coverImage } = req.body;

    // Update profile fields
    if (name) user.profile.name = name;
    if (bio) user.profile.bio = bio;
    if (email) user.email = email;
    
    // Handle profile image upload from base64 string
    if (req.body.profileImage) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(req.body.profileImage, {
          folder: 'profile_pictures',
          public_id: `user_${userId}_profile`,
          overwrite: true
        });
        user.profile.profileImage = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload profile image'
        });
      }
    }

    // Handle cover image upload from base64 string
    if (req.body.coverImage) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(req.body.coverImage, {
          folder: 'cover_images',
          public_id: `user_${userId}_cover`,
          overwrite: true
        });
        user.profile.coverImage = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload cover image'
        });
      }
    }

    await user.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully', 
      data: user 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}