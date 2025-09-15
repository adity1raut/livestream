import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../../models/User.models.js";
import transporter from "../../config/nodeMailer.js";
import dotenv from "dotenv";

dotenv.config();
const otpStore = new Map();

// Send OTP (Forgot Password)
export async function sendOTP(identifier) {
  try {
    if (!identifier) throw new Error("Email or Username required");

    // find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) throw new Error("No user found with this email or username");

    const otp = crypto.randomInt(1000, 9999).toString();
    otpStore.set(user.email, {
      otp,
      expiresAt: Date.now() + 2 * 60 * 1000,
      verified: false,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It is valid for 2 minutes.`,
    });

    console.log("OTP sent successfully:", otp);
    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
}

// Resend OTP
export async function resendOTP(identifier) {
  try {
    if (!identifier) throw new Error("Email or Username required");

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) throw new Error("No user found with this email or username");

    const otp = crypto.randomInt(1000, 9999).toString();
    otpStore.set(user.email, {
      otp,
      expiresAt: Date.now() + 2 * 60 * 1000,
      verified: false,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset OTP (Resent)",
      text: `Your new OTP for password reset is ${otp}. It is valid for 2 minutes.`,
    });

    console.log("Resent OTP:", otp);
    return { success: true, message: "New OTP sent successfully" };
  } catch (error) {
    console.error("Error resending OTP:", error);
    throw error;
  }
}

// Verify OTP
export async function verifyOTP(identifier, otp) {
  try {
    if (!identifier || !otp) throw new Error("Identifier and OTP required");

    // get user to map identifier -> email
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) throw new Error("No user found with this email or username");

    const storedOtp = otpStore.get(user.email);
    if (
      !storedOtp ||
      storedOtp.otp !== otp ||
      storedOtp.expiresAt < Date.now()
    ) {
      throw new Error("Invalid or expired OTP");
    }

    storedOtp.verified = true; // mark OTP verified
    otpStore.set(user.email, storedOtp);

    return { success: true, message: "OTP verified successfully" };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
}

// Reset Password
export async function resetPassword(identifier, newPassword) {
  try {
    if (!identifier || !newPassword)
      throw new Error("Identifier and new password required");

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) throw new Error("No user found with this email or username");

    const storedOtp = otpStore.get(user.email);
    if (!storedOtp || !storedOtp.verified) {
      throw new Error("OTP not verified. Please verify OTP first.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    otpStore.delete(user.email); // cleanup OTP

    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
}
