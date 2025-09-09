import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../../models/User.models.js';
import transporter from "../../config/nodeMailer.js";
import dotenv from 'dotenv';

dotenv.config();
const otpStore = new Map();

export async function checkAvailability(identifier) {
  try {
    if (!identifier) throw new Error('Username or Email required');

    const existingUser = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (existingUser) {
      throw new Error('Email or Username already exists');
    }

    return { success: true, message: 'Available' };
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}

// Send OTP (Registration)
export async function sendRegistrationOTP(email) {
  try {
    if (!email) throw new Error('Email required');

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(email, {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      verified: false
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    console.log('Registration OTP sent:', otp);
    return { success: true, message: 'OTP sent to email' };
  } catch (error) {
    console.error('Error sending registration OTP:', error);
    throw error;
  }
}

// Resend OTP (Registration)
export async function resendRegistrationOTP(email) {
  try {
    if (!email) throw new Error('Email required');

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(email, {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      verified: false
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your New OTP Code",
      text: `Your new OTP is ${otp}. It will expire in 5 minutes.`,
    });

    console.log('Registration OTP resent:', otp);
    return { success: true, message: 'New OTP sent to email' };
  } catch (error) {
    console.error('Error resending registration OTP:', error);
    throw error;
  }
}

// Verify Registration OTP
export async function verifyRegistrationOTP(email, otp) {
  try {
    if (!email || !otp) throw new Error('Email and OTP required');

    const storedOtp = otpStore.get(email);
    if (!storedOtp) {
      throw new Error('OTP not requested');
    }

    if (storedOtp.expiresAt < Date.now()) {
      throw new Error('OTP expired, please request a new one');
    }

    if (storedOtp.code !== otp) {
      throw new Error('Invalid OTP');
    }

    // Mark OTP as verified
    storedOtp.verified = true;
    otpStore.set(email, storedOtp);

    return { success: true, message: 'OTP verified successfully' };
  } catch (error) {
    console.error('Error verifying registration OTP:', error);
    throw error;
  }
}

// Register User
export async function registerUser(userData) {
  try {
    const { username, email, name, otp, password, confirmPassword } = userData;

    // Verify OTP first
    const otpVerification = await verifyRegistrationOTP(email, otp);
    if (!otpVerification.success) {
      throw new Error(otpVerification.message);
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      throw new Error('Email or Username already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profile: { name },
    });
    await newUser.save();

    otpStore.delete(email); // cleanup

    return {
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profile: newUser.profile,
      },
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}